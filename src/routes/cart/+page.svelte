// ≙ src/app/cart/page.jsx: carrito con sync de stock y barra de envío gratis.
<script>
	import { cart, cartItems, cartHydrated, selectTotal, selectCount, selectStoreSlug } from '#lib/stores/cart.svelte.js'
	import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, AlertTriangle, Loader2, Truck } from '@lucide/svelte'
	import { imgUrl } from '#lib/utils.js'
	import { checkoutApi } from '#lib/api/checkout.js'

	const items = $derived($cartItems)
	const total = $derived($selectTotal)
	const count = $derived($selectCount)
	const storeSlug = $derived($selectStoreSlug)
	let syncing = $state(false)
	let stockWarnings = $state([])
	let productStocks = $state({})
	let shippingConfig = $state({
		deliveryCost: 1500,
		freeShippingMin: 15000,
		deliveryEnabled: true
	})

	// ≙ useEffect([storeSlug]): config de envío
	$effect(() => {
		if (!storeSlug) return
		checkoutApi
			.getConfig(storeSlug)
			.then((config) => {
				if (config) {
					shippingConfig = {
						deliveryCost: config.deliveryCost ?? 1500,
						freeShippingMin: config.freeShippingMinTotal ?? 15000,
						deliveryEnabled: config.delivery !== false
					}
				}
			})
			.catch(() => {})
	})

	// ≙ useEffect([items.length, storeSlug]): sync de stock de todos los items.
	// La firma evita el re-disparo: syncItem() reemplaza el array de items y
	// en Svelte eso vuelve a disparar el efecto (en React no, porque la dep
	// era items.length).
	let lastSyncedSignature = ''

	const itemsSignature = (list) => list.map((i) => `${i.key}:${i.quantity}`).join('|')

	$effect(() => {
		if (items.length === 0 || !storeSlug) return

		const signature = itemsSignature(items)
		if (signature === lastSyncedSignature) return
		lastSyncedSignature = signature

		const syncAll = async () => {
			syncing = true
			try {
				const products = await checkoutApi.getProducts(storeSlug)
				const freshProducts = Array.isArray(products) ? products : []

				const warnings = []
				const stocks = {}

				items.forEach((item) => {
					const fresh = freshProducts.find((p) => p.id === item.productId)
					if (fresh) {
						stocks[item.key] = { stock: fresh.stock || 0, name: fresh.name }
						if (!fresh.available) warnings.push(`${fresh.name} ya no está disponible`)
						const maxStock = fresh.stock || 0
						if (maxStock > 0 && item.quantity > maxStock) {
							warnings.push(`${fresh.name}: solo hay ${maxStock} disponibles`)
						}
						cart.syncItem(item.key, fresh)
					} else {
						stocks[item.key] = { stock: 0, name: item.product.name }
						warnings.push(`${item.product.name} ya no existe`)
					}
				})

				productStocks = stocks
				stockWarnings = warnings
			} catch (err) {
				console.error('Error sincronizando carrito:', err)
			} finally {
				syncing = false
			}
		}

		syncAll()
	})

	const deliveryCost = $derived(shippingConfig.deliveryCost)
	const freeShippingMin = $derived(shippingConfig.freeShippingMin)
	const deliveryEnabled = $derived(shippingConfig.deliveryEnabled)
	const isFreeShipping = $derived(total >= freeShippingMin)
	const missingForFreeShipping = $derived(Math.max(0, freeShippingMin - total))
	const progressPercent = $derived(Math.min(100, (total / freeShippingMin) * 100))
	const estimatedTotal = $derived(deliveryEnabled && !isFreeShipping ? total + deliveryCost : total)
</script>

{#if !$cartHydrated}
	<!-- Esqueleto hasta hidratar el carrito persistido (R4) -->
	<div class="max-w-3xl mx-auto px-4 py-10 bg-base pt-10">
		<div class="border border-line bg-surface p-4 animate-pulse h-32"></div>
	</div>
{:else if items.length === 0}
	<div class="min-h-[60vh] flex flex-col items-center justify-center px-4 bg-base pt-20">
		<div class="w-16 h-16 border border-line flex items-center justify-center mb-4">
			<ShoppingBag size={32} class="text-mute" />
		</div>
		<h1 class="font-display font-semibold text-2xl text-fg mb-2">Carrito en vacío</h1>
		<p class="font-mono text-xs uppercase tracking-[0.2em] text-mute mb-8">No hay elementos en el carrito</p>
		<a href="/productos" class="btn btn-primary">Ir al catálogo</a>
	</div>
{:else}
	<div class="max-w-3xl mx-auto px-4 py-10 bg-base pt-10">
		<div class="mb-6">
			<p class="eyebrow mb-2">Carrito · Artículos seleccionados</p>
			<div class="flex items-center justify-between">
				<h1 class="font-display font-semibold text-3xl tracking-tight text-fg">Tu carrito</h1>
				<button type="button" onclick={() => cart.clearCart()} class="font-mono text-[10px] uppercase tracking-[0.18em] text-mute hover:text-rec transition-colors">
					Vaciar
				</button>
			</div>
			<p class="font-mono text-[10px] uppercase tracking-[0.2em] text-mute mt-2 tel">
				{count} {count === 1 ? 'artículo' : 'artículos'}
			</p>
		</div>

		{#if syncing}
			<div class="flex items-center gap-2 font-mono text-xs text-mute mb-4">
				<Loader2 size={12} class="animate-spin" /> Actualizando stock...
			</div>
		{/if}

		{#if stockWarnings.length > 0}
			<div class="border border-amber/40 bg-panel p-4 mb-4">
				<div class="flex items-start gap-2">
					<AlertTriangle size={14} class="text-amber shrink-0 mt-0.5" />
					<div>
						<p class="font-mono text-xs font-medium text-fg mb-1">Atención</p>
						{#each stockWarnings as w, i}
							<p class="text-xs text-mute">{w}</p>
						{/each}
					</div>
				</div>
			</div>
		{/if}

		{#if deliveryEnabled && !isFreeShipping}
			<div class="border border-line bg-surface p-4 mb-4">
				<div class="flex items-center gap-2 mb-2">
					<Truck size={14} class="text-mute" />
					<p class="font-mono text-xs font-medium text-fg">Faltan ${missingForFreeShipping.toLocaleString('es-AR')} para envío sin cargo</p>
				</div>
				<div class="w-full bg-line h-1">
					<div class="bg-signal h-1 transition-all" style={`width: ${progressPercent}%`}></div>
				</div>
			</div>
		{/if}

		{#if deliveryEnabled && isFreeShipping}
			<div class="border border-signal/50 bg-panel p-4 mb-4">
				<div class="flex items-center gap-2">
					<Truck size={14} class="text-signal" />
					<p class="font-mono text-xs font-medium text-fg">Envío sin cargo activado</p>
				</div>
			</div>
		{/if}

		<div class="space-y-3 mb-6">
			{#each items as item (item.key)}
				{@const stockInfo = productStocks[item.key]}
				{@const currentStock = stockInfo?.stock ?? null}
				<div class="flex gap-3 p-3 bg-surface border border-line">
					<div class="relative w-20 h-20 overflow-hidden bg-panel border border-line shrink-0">
						{#if item.image}
							<img src={imgUrl(item.image)} alt={item.product.name} loading="lazy" class="absolute inset-0 w-full h-full object-cover" />
						{:else}
							<div class="w-full h-full flex items-center justify-center">
								<span class="font-mono text-[9px] uppercase tracking-[0.18em] text-mute">Sin imagen</span>
							</div>
						{/if}
					</div>

					<div class="flex-1 min-w-0">
						<h3 class="font-display font-semibold text-sm text-fg truncate">{item.product.name}</h3>
						{#if item.variant}
							<p class="font-mono text-[10px] uppercase tracking-[0.14em] text-mute mt-1">{item.variant.name}</p>
						{/if}
						<p class="font-mono text-sm tel text-fg mt-1.5">${item.price.toLocaleString('es-AR')}</p>

						{#if currentStock !== null}
							<span class={`inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] mt-1.5 ${currentStock === 0 ? 'text-rec' : currentStock <= 5 ? 'text-amber' : 'text-mute'}`}>
								<span class={`status-dot ${currentStock === 0 ? 'bg-rec' : currentStock <= 5 ? 'bg-amber' : 'bg-signal'}`}></span>
								{currentStock === 0 ? 'Sin stock' : `${currentStock} disponibles`}
							</span>
						{/if}

						<div class="flex items-center gap-3 mt-2.5">
							<div class="flex items-center border border-line bg-base">
								<button
									type="button"
									onclick={() => cart.updateQuantity(item.key, item.quantity - 1)}
									disabled={item.quantity <= 1}
									class="w-8 h-8 flex items-center justify-center text-mute hover:text-fg hover:bg-panel disabled:opacity-30 transition-colors"
									aria-label="Disminuir cantidad"
								>
									<Minus size={12} />
								</button>
								<span class="w-8 text-center font-mono text-xs tel text-fg">{item.quantity}</span>
								<button
									type="button"
									onclick={() => cart.updateQuantity(item.key, item.quantity + 1)}
									disabled={currentStock !== null && item.quantity >= currentStock}
									class="w-8 h-8 flex items-center justify-center text-mute hover:text-fg hover:bg-panel disabled:opacity-30 transition-colors"
									aria-label="Aumentar cantidad"
								>
									<Plus size={12} />
								</button>
							</div>
							<button type="button" onclick={() => cart.removeItem(item.key)} class="text-mute hover:text-rec transition-colors" aria-label="Quitar artículo">
								<Trash2 size={14} />
							</button>
						</div>
					</div>

					<div class="text-right shrink-0">
						<p class="font-mono font-semibold text-sm tel text-fg">${(item.price * item.quantity).toLocaleString('es-AR')}</p>
					</div>
				</div>
			{/each}
		</div>

		<div class="sticky bottom-0 bg-base border-t border-line pt-4">
			<div class="bg-surface border border-line p-4">
				<div class="flex justify-between font-mono text-sm mb-2">
					<span class="text-mute uppercase tracking-[0.14em] text-[11px]">Subtotal</span>
					<span class="text-fg tel">${total.toLocaleString('es-AR')}</span>
				</div>

				{#if deliveryEnabled}
					<div class="flex justify-between font-mono text-sm mb-2">
						<span class="text-mute uppercase tracking-[0.14em] text-[11px]">Envío</span>
						{#if isFreeShipping}
							<span class="text-signal text-xs">Sin cargo</span>
						{:else}
							<span class="text-fg tel">+ ${deliveryCost.toLocaleString('es-AR')}</span>
						{/if}
					</div>
				{/if}

				<div class="flex justify-between font-mono text-base border-t border-line pt-3 mt-2">
					<span class="text-fg uppercase tracking-[0.14em]">Total</span>
					<span class="text-fg font-semibold tel">${estimatedTotal.toLocaleString('es-AR')}</span>
				</div>
			</div>

			<a href="/checkout" class="btn btn-primary mt-4 w-full">
				Finalizar compra <ArrowRight size={16} />
			</a>

			<a href="/productos" class="mt-3 w-full text-center block font-mono text-[10px] uppercase tracking-[0.18em] text-mute hover:text-fg transition-colors">
				Seguir explorando
			</a>
		</div>
	</div>
{/if}
