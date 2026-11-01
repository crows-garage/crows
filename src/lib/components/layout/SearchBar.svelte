// ≙ SearchBar (local en Navbar.jsx): búsqueda con sugerencias y tracking.
<script>
	import { goto } from '$app/navigation'
	import { Search } from '@lucide/svelte'
	import { trackSearch } from '#lib/api/analytics.js'

	let { categories = [], products = [], onClose = null, compact = false } = $props()

	let query = $state('')
	let showSuggestions = $state(false)
	let suggestionTimeout = null

	const suggestions = $derived.by(() => {
		if (!query || query.length < 2) return []
		const q = query.toLowerCase()
		const matchedProducts = products
			.filter((p) => p.name?.toLowerCase().includes(q))
			.slice(0, 5)
			.map((p) => ({ type: 'product', name: p.name, slug: p.slug }))
		const matchedCategories = categories
			.filter((c) => c.name?.toLowerCase().includes(q))
			.slice(0, 3)
			.map((c) => ({ type: 'category', name: c.name, slug: c.slug }))
		return [...matchedCategories, ...matchedProducts]
	})

	function handleSubmit(e) {
		e.preventDefault()
		if (query.trim()) {
			trackSearch(query.trim())
			goto(`/productos?search=${encodeURIComponent(query.trim())}`)
			onClose?.()
		}
	}

	function handleSuggestionClick(suggestion) {
		trackSearch(query.trim(), suggestion.name, suggestion.type)

		if (suggestion.type === 'category') {
			goto(`/productos?categoria=${suggestion.slug}`)
		} else {
			goto(`/producto/${suggestion.slug}`)
		}
		showSuggestions = false
		query = ''
		onClose?.()
	}
</script>

<div class="relative w-full">
	<form onsubmit={handleSubmit} class="relative">
		<Search class="absolute left-3 top-1/2 -translate-y-1/2 text-mute w-4 h-4" />
		<input
			bind:value={query}
			onfocus={() => query.length >= 2 && (showSuggestions = true)}
			onblur={() => {
				suggestionTimeout = setTimeout(() => {
					showSuggestions = false
				}, 200)
			}}
			onkeydown={() => {
				if (suggestionTimeout) clearTimeout(suggestionTimeout)
			}}
			placeholder="Buscar recursos..."
			class={`input bg-white pl-9 ${compact ? 'py-2' : ''}`}
		/>
	</form>

	{#if showSuggestions && suggestions.length > 0}
		<div class="absolute top-full left-0 right-0 mt-1 bg-surface border border-line z-50 max-h-64 overflow-y-auto shadow-lg rounded-lg">
			{#each suggestions as suggestion, i}
				<button
					type="button"
					onmousedown={() => handleSuggestionClick(suggestion)}
					class="w-full text-left px-4 py-2.5 text-sm text-fg hover:bg-gold/10 transition-colors"
				>
					{suggestion.name}
					<span class="ml-2 text-xs text-mute">
						{suggestion.type === 'category' ? 'RUBRO' : 'CURSO'}
					</span>
				</button>
			{/each}
		</div>
	{/if}
</div>
