<script>
	import { Heart, ShoppingCart, Check, Truck } from '@lucide/svelte'
	import { formatPrice, getFirstImage, imgUrl } from '#lib/utils.js'
	import { cart } from '#lib/stores/cart.svelte.js'
	import { auth } from '#lib/stores/auth.svelte.js'
	import { authApi } from '#lib/api/auth.js'
	import { trackAddToCart } from '#lib/api/analytics.js'

	let { product, storeConfig = {}, isFavorited = false } = $props()

	const image = $derived(getFirstImage(product))
	const imageUrl = $derived(imgUrl(image))

	const activeVariants = $derived(product.variants?.filter((v) => v.active) || [])
	const hasVariants = $derived(activeVariants.length > 0)
	let selectedVariant = $state(null)
	const currentVariant = $derived(selectedVariant || (hasVariants ? activeVariants[0] : null))

	
	const variantPrice = $derived(currentVariant ? parseFloat(currentVariant.price) : null)
	const variantFinalPrice = $derived(currentVariant ? parseFloat(currentVariant.finalPrice) : null)
	const sellingPrice = $derived(variantFinalPrice || variantPrice || parseFloat(product.price))
	const hasRealDiscount = $derived(variantFinalPrice && variantPrice && variantFinalPrice < variantPrice)
	const originalDisplayPrice = $derived(hasRealDiscount ? variantPrice : null)
	const showFrom = $derived(hasVariants && !selectedVariant && activeVariants.length > 1)

	
	const shipping = $derived(storeConfig?.shipping || {})
	const freeShippingMin = $derived(shipping.freeShippingMin || 15000)
	const SHIPPING_COST = $derived(shipping.shippingCost || 500)
	const deliveryEnabled = $derived(shipping.deliveryEnabled !== false)
	const hasFreeShipping = $derived(deliveryEnabled && sellingPrice >= freeShippingMin)

	
	let added = $state(false)

	function handleAddToCart(e) {
		e.preventDefault()
		e.stopPropagation()

		trackAddToCart(product.id, 1, sellingPrice, currentVariant?.id || null)

		cart.addItem(
			{
				id: product.id,
				name: product.name,
				price: sellingPrice,
				image: imageUrl,
				variant: currentVariant ? { id: currentVariant.id, name: currentVariant.name } : undefined,
				quantity: 1
			},
			null,
			1
		)
		added = true
		setTimeout(() => (added = false), 1200)
	}

	
	let isFavorite = $state(isFavorited)
	let favoriteLoading = $state(false)

	$effect(() => {
		isFavorite = isFavorited
	})

	async function handleToggleFavorite(e) {
		e.preventDefault()
		e.stopPropagation()
		if (!auth.user) {
			window.location.href = '/login?redirect=' + window.location.pathname
			return
		}
		if (favoriteLoading) return
		favoriteLoading = true
		try {
			if (isFavorite) {
				await authApi.removeFromWishlist(product.id)
				isFavorite = false
			} else {
				await authApi.addToWishlist(product.id)
				isFavorite = true
			}
		} catch (err) {
			console.error('Error al actualizar favoritos:', err)
		} finally {
			favoriteLoading = false
		}
	}

	const stock = $derived(currentVariant?.stock ?? product.stock)
	const outOfStock = $derived(stock === 0)
	const lowStock = $derived(stock > 0 && stock <= 5)
</script>

<div class="group bg-surface border rounded-xs border-line transition-colors duration-200 flex flex-col overflow-hidden h-full hover:border-signal">
	<!-- Imagen -->
	<a href={`/producto/${product.slug}`} class="relative aspect-square bg-panel overflow-hidden">
		{#if imageUrl}
			<img src={imageUrl} alt={product.name} loading="lazy" class="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105" />
		{:else}
			<div class="w-full h-full flex items-center justify-center">
				<div class="absolute inset-0 graticule"></div>
				<span class="relative font-mono text-[9px] uppercase tracking-[0.22em] text-mute">Sin imagen</span>
			</div>
		{/if}

		<!-- Botón favoritos -->
		<button
			type="button"
			onclick={handleToggleFavorite}
			disabled={favoriteLoading}
			class={`absolute top-2 right-2 z-10 w-9 h-9 flex items-center justify-center border rounded-xs transition-all ${isFavorite ? 'bg-signal border-signal text-base' : 'bg-surface/90 border-line text-mute hover:border-signal hover:text-fg'}`}
			title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
			aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
		>
			{#if favoriteLoading}
				<svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
				</svg>
			{:else}
				<Heart class={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
			{/if}
		</button>

		<!-- Clasificación (etiquetas) -->
		{#if product.labels?.length > 0}
			<div class="absolute top-2 left-2 flex flex-col gap-1">
				{#each product.labels.slice(0, 2) as label}
					<span class="inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] bg-signal text-base border rounded-xs border-signal">
						{label.emoji} {label.name}
					</span>
				{/each}
			</div>
		{/if}

		{#if outOfStock}
			<div class="absolute inset-0 bg-base/85 flex items-center justify-center backdrop-blur-sm">
				<span class="px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] bg-surface border rounded-xs border-rec text-rec">Sin stock</span>
			</div>
		{/if}
	</a>

	<!-- Contenido -->
	<div class="flex-1 flex flex-col p-3.5">
		<!-- Fuente -->
		{#if product.brand}
			<div class="flex items-center gap-1.5 mb-1.5">
				{#if product.brand.logo}
					<img src={imgUrl(product.brand.logo)} alt={product.brand.name} loading="lazy" class="object-contain" width="14" height="14" />
				{/if}
				<span class="font-mono text-[9px] uppercase tracking-[0.18em] text-mute">{product.brand.name}</span>
			</div>
		{/if}

		<!-- Nombre -->
		<a href={`/producto/${product.slug}`}>
			<p class="font-display font-semibold text-sm text-fg line-clamp-2 leading-snug group-hover:text-signal transition-colors">{product.name}</p>
		</a>

		<!-- Envío -->
		{#if deliveryEnabled}
			<div class="mt-1.5 flex items-center gap-1.5">
				<Truck class="w-3 h-3 text-mute" />
				<p class={`font-mono text-[9px] uppercase tracking-[0.14em] ${hasFreeShipping ? 'text-fg' : 'text-mute'}`}>
					{hasFreeShipping ? 'Envío sin cargo' : `Desde ${formatPrice(SHIPPING_COST)}`}
				</p>
			</div>
		{/if}

		<!-- Variantes -->
		{#if hasVariants && activeVariants.length > 1}
			<div class="mt-2.5 flex flex-wrap gap-1.5">
				{#each activeVariants as variant (variant.id)}
					<button
						type="button"
						onclick={(e) => {
							e.preventDefault()
							e.stopPropagation()
							selectedVariant = selectedVariant?.id === variant.id ? null : variant
						}}
						class={`chip px-2.5 py-1.5 text-[9px] ${selectedVariant?.id === variant.id ? 'chip-active' : ''}`}
					>
						{variant.name}
					</button>
				{/each}
			</div>
		{/if}

		{#if hasVariants && activeVariants.length === 1}
			<p class="mt-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-mute">{activeVariants[0].name}</p>
		{/if}

		<!-- Precio y stock -->
		<div class="mt-auto pt-3">
			<div class="flex items-baseline gap-2 flex-wrap">
				{#if showFrom}<span class="font-mono text-[9px] text-mute uppercase">Desde</span>{/if}
				<span class="font-mono font-semibold text-base tel text-fg">{formatPrice(sellingPrice)}</span>
				{#if originalDisplayPrice}
					<span class="font-mono text-xs text-mute line-through tel">{formatPrice(originalDisplayPrice)}</span>
				{/if}
			</div>

			<div class="mt-2">
				{#if outOfStock}
					<span class="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-rec">
						<span class="status-dot bg-rec"></span> Sin stock
					</span>
				{:else if lowStock}
					<span class="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-amber">
						<span class="status-dot bg-amber"></span> Últimas {stock}
					</span>
				{:else}
					<span class="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-mute">
						<span class="status-dot bg-signal"></span> {hasVariants ? `${stock} disp.` : 'Disponible'}
					</span>
				{/if}
			</div>
		</div>

		<!-- Acción -->
		<button
			type="button"
			onclick={handleAddToCart}
			disabled={outOfStock}
			class={`btn btn-primary mt-3 w-full !py-2.5 text-[10px] ${added ? '!bg-signal !border-signal !text-base' : ''}`}
		>
			{#if outOfStock}
				Sin stock
			{:else if added}
				<Check class="w-3.5 h-3.5" /> Agregado
			{:else}
				<ShoppingCart class="w-3.5 h-3.5" /> Agregar al carrito
			{/if}
		</button>
	</div>
</div>
