<script>
	import { untrack } from 'svelte'
	import { Search, X, ChevronDown, ChevronUp } from '@lucide/svelte'
	import ProductCard from './ProductCard.svelte'

	let { initialProducts, categories, labels, storeConfig, urlParams } = $props()

	const products = $derived(initialProducts)

	let search = $state(urlParams?.get('search') || '')
	let selectedCategorySlug = $state(urlParams?.get('categoria') || '')
	let selectedLabelId = $state(urlParams?.get('etiqueta') || '')
	let priceRange = $state({ min: '', max: '' })
	let sortBy = $state('order')
	let mobileFiltersOpen = $state(false)
	let openSections = $state({ categories: true, labels: false, price: true })

	// ≙ useEffect([searchParams]): sincroniza solo cuando cambia la URL
	// (untrack evita reaccionar a los estados locales).
	$effect(() => {
		const params = urlParams
		untrack(() => {
			const categoria = params?.get('categoria') || ''
			const etiqueta = params?.get('etiqueta') || ''
			const busqueda = params?.get('search') || ''

			if (categoria !== selectedCategorySlug) selectedCategorySlug = categoria
			if (etiqueta !== selectedLabelId) selectedLabelId = etiqueta
			if (busqueda !== search) search = busqueda
		})
	})

	// ≙ useEffect([selectedCategorySlug]): resetea precio/orden al cambiar rubro
	$effect(() => {
		void selectedCategorySlug
		priceRange = { min: '', max: '' }
		sortBy = 'order'
	})

	const selectedCategory = $derived(
		selectedCategorySlug ? categories.find((c) => c.slug === selectedCategorySlug) : null
	)

	const filteredProducts = $derived.by(() => {
		let result = [...products]

		if (search.trim()) {
			const lower = search.toLowerCase()
			result = result.filter(
				(p) => p.name?.toLowerCase().includes(lower) || p.description?.toLowerCase().includes(lower)
			)
		}

		if (selectedCategory) {
			result = result.filter((p) => p.categoryId === selectedCategory.id)
		}

		if (selectedLabelId) {
			result = result.filter((p) => p.labels?.some((l) => l.id === parseInt(selectedLabelId)))
		}

		if (priceRange.min) {
			result = result.filter((p) => (p.finalPrice || p.price) >= parseFloat(priceRange.min))
		}
		if (priceRange.max) {
			result = result.filter((p) => (p.finalPrice || p.price) <= parseFloat(priceRange.max))
		}

		switch (sortBy) {
			case 'price-asc':
				result.sort((a, b) => (a.finalPrice || a.price) - (b.finalPrice || b.price))
				break
			case 'price-desc':
				result.sort((a, b) => (b.finalPrice || b.price) - (a.finalPrice || a.price))
				break
			case 'name':
				result.sort((a, b) => a.name.localeCompare(b.name))
				break
			default:
				result.sort((a, b) => a.order - b.order)
		}

		return result
	})

	const hasActiveFilters = $derived(
		!!(search || selectedCategorySlug || selectedLabelId || priceRange.min || priceRange.max)
	)

	function clearFilters() {
		search = ''
		selectedCategorySlug = ''
		selectedLabelId = ''
		priceRange = { min: '', max: '' }
		sortBy = 'order'
	}

	function toggleSection(section) {
		openSections = { ...openSections, [section]: !openSections[section] }
	}

	const sectionHeaderClass = 'flex items-center justify-between w-full py-2.5'
	const sectionLabelClass = 'eyebrow'
	const optionClass = (active) =>
		`w-full text-left px-3 py-2 font-mono text-xs transition-colors ${active ? 'bg-signal text-base' : 'text-mute hover:bg-panel hover:text-fg'}`
</script>

{#snippet filterContent()}
	<div class="space-y-6">
		<div class="relative">
			<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
			<input type="text" bind:value={search} placeholder="Buscar cursos..." class="input pl-9 pr-8" />
			{#if search}
				<button type="button" onclick={() => (search = '')} class="absolute right-3 top-1/2 -translate-y-1/2" aria-label="Limpiar búsqueda">
					<X class="w-4 h-4 text-mute hover:text-fg" />
				</button>
			{/if}
		</div>

		<div>
			<label class="eyebrow block mb-2">Ordenar por</label>
			<select bind:value={sortBy} class="input">
				<option value="order">Destacados</option>
				<option value="price-asc">Menor precio</option>
				<option value="price-desc">Mayor precio</option>
				<option value="name">Nombre A-Z</option>
			</select>
		</div>

		<div>
			<button type="button" onclick={() => toggleSection('categories')} class={sectionHeaderClass}>
				<span class={sectionLabelClass}>Sectores</span>
				{#if openSections.categories}<ChevronUp class="w-4 h-4 text-mute" />{:else}<ChevronDown class="w-4 h-4 text-mute" />{/if}
			</button>
			{#if openSections.categories}
				<div class="mt-2 space-y-1">
					<button type="button" onclick={() => (selectedCategorySlug = '')} class={optionClass(!selectedCategorySlug)}>Todos</button>
					{#each categories as cat (cat.id)}
						<button
							type="button"
							onclick={() => (selectedCategorySlug = selectedCategorySlug === cat.slug ? '' : cat.slug)}
							class={optionClass(selectedCategorySlug === cat.slug)}
						>
							{cat.name}
						</button>
					{/each}
				</div>
			{/if}
		</div>

		{#if labels.length > 0}
			<div>
				<button type="button" onclick={() => toggleSection('labels')} class={sectionHeaderClass}>
					<span class={sectionLabelClass}>Clasificación</span>
					{#if openSections.labels}<ChevronUp class="w-4 h-4 text-mute" />{:else}<ChevronDown class="w-4 h-4 text-mute" />{/if}
				</button>
				{#if openSections.labels}
					<div class="mt-2 space-y-1">
						<button type="button" onclick={() => (selectedLabelId = '')} class={optionClass(!selectedLabelId)}>Todas</button>
						{#each labels as label (label.id)}
							<button
								type="button"
								onclick={() => (selectedLabelId = selectedLabelId === String(label.id) ? '' : String(label.id))}
								class={optionClass(selectedLabelId === String(label.id))}
							>
								{label.emoji} {label.name}
							</button>
						{/each}
					</div>
				{/if}
			</div>
		{/if}

		<div>
			<button type="button" onclick={() => toggleSection('price')} class={sectionHeaderClass}>
				<span class={sectionLabelClass}>Precio</span>
				{#if openSections.price}<ChevronUp class="w-4 h-4 text-mute" />{:else}<ChevronDown class="w-4 h-4 text-mute" />{/if}
			</button>
			{#if openSections.price}
				<div class="mt-2 flex gap-2">
					<input type="number" bind:value={priceRange.min} placeholder="Mín" class="input w-1/2" />
					<input type="number" bind:value={priceRange.max} placeholder="Máx" class="input w-1/2" />
				</div>
			{/if}
		</div>

		{#if hasActiveFilters}
			<button type="button" onclick={clearFilters} class="btn w-full !py-2.5 text-[10px]">Limpiar filtros</button>
		{/if}
	</div>
{/snippet}

<div class="min-h-screen bg-base">
	<div class="max-w-7xl mx-auto px-4 py-10">
		<div class="flex items-end justify-between mb-8 gap-4">
			<div>
				<p class="eyebrow mb-2">Catálogo · Cursos y actividades</p>
				<h1 class="font-display font-semibold text-3xl sm:text-4xl tracking-tight text-fg">
					{search ? `"${search}"` : 'Cursos y actividades'}
				</h1>
				<p class="font-mono text-[10px] uppercase tracking-[0.2em] text-mute mt-2 tel">
					{filteredProducts.length} resultados encontrados
				</p>
			</div>
			<button type="button" onclick={() => (mobileFiltersOpen = true)} class="btn lg:hidden whitespace-nowrap !py-2.5 text-[10px]">
				Filtros
			</button>
		</div>

		<div class="flex gap-8">
			<aside class="hidden lg:block w-64 flex-shrink-0">
				<div class="sticky top-40">{@render filterContent()}</div>
			</aside>

			{#if mobileFiltersOpen}
				<div class="fixed inset-0 z-50 lg:hidden">
					<div class="absolute inset-0 bg-black/50" onclick={() => (mobileFiltersOpen = false)}></div>
					<div class="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-base p-6 overflow-y-auto shadow-xl border-l border-line">
						<div class="flex items-center justify-between mb-6">
							<h2 class="font-display font-semibold text-lg text-fg">Filtros</h2>
							<button type="button" onclick={() => (mobileFiltersOpen = false)} class="p-2 hover:bg-panel" aria-label="Cerrar filtros">
								<X class="w-5 h-5 text-mute" />
							</button>
						</div>
						{@render filterContent()}
					</div>
				</div>
			{/if}

			<main class="flex-1 min-w-0">
				{#if filteredProducts.length === 0}
					<div class="text-center py-20 border rounded-xs border-line bg-surface">
						<p class="font-mono text-xs uppercase tracking-[0.2em] text-mute mb-4">Sin resultados para esta búsqueda</p>
						<button type="button" onclick={clearFilters} class="btn text-[10px]">Limpiar filtros</button>
					</div>
				{:else}
					<div class="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
						{#each filteredProducts as product (product.id)}
							<ProductCard {product} {storeConfig} />
						{/each}
					</div>
				{/if}
			</main>
		</div>
	</div>
</div>
