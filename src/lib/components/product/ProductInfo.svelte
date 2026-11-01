// ≙ src/components/product/ProductInfo.jsx: breadcrumb, precio, variantes,
// cantidad y acciones de carrito.
<script>
	import { goto } from '$app/navigation'
	import { formatPrice, getCategoryPath } from '#lib/utils.js'
	import { cart } from '#lib/stores/cart.svelte.js'

	let { product, categories, store } = $props()

	const activeVariants = $derived(product.variants?.filter((v) => v.active) || [])
	let selectedVariant = $state(null)
	let qty = $state(1)
	let added = $state(false)

	// ≙ useState(activeVariants[0] || null) inicial
	const effectiveVariant = $derived(selectedVariant ?? activeVariants[0] ?? null)

	const categoryPath = $derived(getCategoryPath(categories, product.categoryId))
	const isAvailable = $derived(
		product.available !== false && (effectiveVariant ? effectiveVariant.stock > 0 : product.stock > 0)
	)
	const stock = $derived(effectiveVariant ? effectiveVariant.stock : product.stock)
	const price = $derived(
		effectiveVariant ? parseFloat(effectiveVariant.finalPrice || effectiveVariant.price) : parseFloat(product.price)
	)
	const originalPrice = $derived(effectiveVariant?.discount > 0 ? parseFloat(effectiveVariant.price) : null)
	const discount = $derived(effectiveVariant?.discount || null)
	const outOfStock = $derived(stock === 0)
	const lowStock = $derived(stock > 0 && stock <= 5)

	const storeConfig = $derived(
		typeof store?.config === 'string' ? JSON.parse(store.config) : store?.config || {}
	)
	const freeShippingMin = $derived(storeConfig.shipping?.freeShippingMin ?? 15000)
	const shippingCost = $derived(storeConfig.shipping?.shippingCost ?? 1500)
	const whatsappNumber = $derived(store?.contact?.whatsapp?.replace(/\D/g, '') || '2612528276')

	function handleAddToCart() {
		if (!isAvailable) return
		cart.addItem(product, effectiveVariant, qty)
		added = true
		setTimeout(() => (added = false), 2000)
	}

	function handleBuyNow() {
		if (!isAvailable) return
		cart.addItem(product, effectiveVariant, qty)
		goto('/cart')
	}

	const ofertaLabel = $derived(product.labels?.find((l) => l.name?.toLowerCase() === 'oferta'))
	const otherLabels = $derived(product.labels?.filter((l) => l.id !== ofertaLabel?.id) || [])
</script>

<div class="space-y-6">
	<!-- Breadcrumb -->
	<nav class="flex flex-wrap items-center gap-1 font-mono text-[10px] uppercase tracking-[0.16em] text-mute">
		<a href="/" class="hover:text-fg transition-colors">Inicio</a>
		{#each categoryPath as cat (cat.id)}
			<span class="flex items-center gap-1">
				<span class="text-line">/</span>
				<a href={`/productos?categoria=${cat.slug}`} class="hover:text-fg transition-colors">{cat.name}</a>
			</span>
		{/each}
	</nav>

	<!-- Clasificación -->
	<div class="flex flex-wrap gap-2">
		<span class="font-mono text-[9px] uppercase tracking-[0.18em] text-mute">Ref:</span>
		<span class="font-mono text-[9px] uppercase tracking-[0.18em] text-fg tel">REF-{product.id}</span>
		{#if ofertaLabel || otherLabels.length > 0}
			<span class="text-line">|</span>
		{/if}
		{#if ofertaLabel}
			<span class="chip chip-active cursor-default !min-h-0 px-2 py-0.5 text-[9px]">{ofertaLabel.emoji} {ofertaLabel.name}</span>
		{/if}
		{#each otherLabels as label (label.id)}
			<span class="chip cursor-default !min-h-0 px-2 py-0.5 text-[9px]">{label.emoji} {label.name}</span>
		{/each}
	</div>

	<!-- Title -->
	<h1 class="font-display font-semibold text-3xl sm:text-4xl tracking-tight text-fg leading-[1.05]">{product.name}</h1>

	<!-- Price -->
	<div class="border-t border-line pt-5">
		<div class="flex items-baseline gap-3 flex-wrap">
			<span class="font-mono font-semibold text-3xl tel text-fg">{formatPrice(price)}</span>
			{#if originalPrice}
				<span class="font-mono text-sm text-mute line-through tel">{formatPrice(originalPrice)}</span>
			{/if}
			{#if discount}
				<span class="font-mono text-xs text-signal">-{discount}%</span>
			{/if}
		</div>

		<div class="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 font-mono text-[10px] uppercase tracking-[0.14em]">
			{#if price >= freeShippingMin}
				<span class="text-fg">Envío sin cargo</span>
			{:else}
				<span class="text-mute">Envío: {formatPrice(shippingCost)} · Sin cargo desde {formatPrice(freeShippingMin)}</span>
			{/if}
			<span class="flex items-center gap-1.5">
				{#if outOfStock}
					<span class="status-dot bg-rec"></span><span class="text-rec">Sin stock</span>
				{:else if lowStock}
					<span class="status-dot bg-amber"></span><span class="text-amber">Últimas {stock} unidades</span>
				{:else}
					<span class="status-dot bg-signal"></span><span class="text-mute">Disponible</span>
				{/if}
			</span>
		</div>
	</div>

	<!-- Variantes -->
	{#if activeVariants.length > 0}
		<div>
			<p class="eyebrow mb-2.5">Variantes</p>
			<div class="flex flex-wrap gap-2">
				{#each activeVariants as variant (variant.id)}
					<button
						type="button"
						onclick={() => (selectedVariant = variant)}
						class={`chip ${effectiveVariant?.id === variant.id ? 'chip-active' : ''} ${variant.stock === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
						disabled={variant.stock === 0}
					>
						{variant.name}
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Quantity & Actions -->
	<div class="space-y-4">
		<div class="flex items-center gap-4">
			<span class="eyebrow">Cantidad</span>
			<div class="flex items-center border border-line bg-surface">
				<button
					type="button"
					onclick={() => (qty = Math.max(1, qty - 1))}
					class="w-10 h-10 flex items-center justify-center text-fg hover:bg-panel transition-colors"
					disabled={!isAvailable}
					aria-label="Disminuir cantidad"
				>
					−
				</button>
				<span class="w-12 text-center font-mono text-sm tel text-fg">{qty}</span>
				<button
					type="button"
					onclick={() => (qty = Math.min(stock || 99, qty + 1))}
					class="w-10 h-10 flex items-center justify-center text-fg hover:bg-panel transition-colors"
					disabled={!isAvailable || qty >= stock}
					aria-label="Aumentar cantidad"
				>
					+
				</button>
			</div>
		</div>

		{#if isAvailable}
			<div class="flex flex-col sm:flex-row gap-3">
				<button type="button" onclick={handleAddToCart} class={`btn flex-1 ${added ? '!bg-signal !border-signal !text-night' : ''}`}>
					{added ? '✓ Agregado' : 'Agregar al carrito'}
				</button>
				<button type="button" onclick={handleBuyNow} class="btn btn-primary flex-1">Comprar ahora</button>
			</div>
		{:else}
			<div class="border border-rec/40 bg-panel p-4 text-center">
				<p class="font-mono text-xs uppercase tracking-[0.18em] text-rec mb-2">Sin stock registrado</p>
				<a
					href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hola! Consulto disponibilidad de: ${product.name}`)}`}
					target="_blank"
					rel="noopener noreferrer"
					class="font-mono text-[11px] uppercase tracking-[0.18em] text-fg hover:text-signal underline underline-offset-4 transition-colors"
				>
					Consultar disponibilidad
				</a>
			</div>
		{/if}
	</div>
</div>
