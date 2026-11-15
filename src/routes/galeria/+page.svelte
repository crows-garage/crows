// ≙ src/app/galeria/page.jsx: galería de actividades.
<script>
	import { Search, X } from '@lucide/svelte'
	import GalleryGroup from '#lib/components/home/GalleryGroup.svelte'

	let { data } = $props()

	const active = $derived(data.galleries.filter((g) => g.status === 'ACTIVE'))
	let query = $state('')
	let selectedType = $state('')

	function mediaFor(gallery) {
		return (gallery.media || [])
			.filter((media) => !selectedType || media.type === selectedType)
			.sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
	}

	const filtered = $derived(
		active.filter((gallery) => {
			const haystack = `${gallery.name || ''} ${gallery.description || ''}`.toLowerCase()
			return (!query.trim() || haystack.includes(query.trim().toLowerCase())) && mediaFor(gallery).length > 0
		})
	)
	const totalMedia = $derived(filtered.reduce((n, g) => n + mediaFor(g).length, 0))

	function clearFilters() {
		query = ''
		selectedType = ''
	}
</script>

<svelte:head>
	<title>Actividad — Crow Projects</title>
	<meta name="description" content="Proyectos y registros de la comunidad de Crow Projects." />
</svelte:head>

<div class="min-h-screen bg-base pb-16">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-4">
		<p class="eyebrow mb-2">Galería · Actividades</p>
		<h1 class="font-display font-semibold text-4xl sm:text-5xl tracking-tight text-fg">Galería</h1>
		{#if filtered.length > 0}
			<p class="font-mono text-[10px] uppercase tracking-[0.2em] text-mute mt-3 tel">
				{filtered.length} grupo{filtered.length !== 1 ? 's' : ''} · {totalMedia} elemento{totalMedia !== 1 ? 's' : ''}
			</p>
		{/if}
	</div>

	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
		<div class="border border-line rounded-xs bg-panel p-3 sm:p-4">
			<div class="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto_auto] gap-2">
				<label class="relative block">
					<span class="sr-only">Buscar en la galería</span>
					<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
					<input bind:value={query} type="search" placeholder="Buscar actividades..." class="input w-full pl-9" />
				</label>
				<select bind:value={selectedType} class="input" aria-label="Filtrar tipo de contenido">
					<option value="">Todos los tipos</option>
					<option value="image">Imágenes</option>
					<option value="video">Videos</option>
					<option value="document">Documentos</option>
				</select>
				<button type="button" onclick={clearFilters} class="btn px-3" aria-label="Limpiar filtros" title="Limpiar filtros"><X class="w-4 h-4" /></button>
			</div>
		</div>
	</div>

	{#if filtered.length === 0}
		<div class="max-w-7xl mx-auto px-4 py-16">
			<div class="border rounded-xs border-line bg-surface p-10 text-center">
				<p class="font-mono text-xs uppercase tracking-[0.2em] text-mute">No hay contenido para mostrar</p>
				<p class="text-sm text-mute mt-2">Probá con otros términos o filtros.</p>
			</div>
		</div>
	{:else}
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="space-y-10">
				{#each filtered as gallery, i (gallery.id)}
					<GalleryGroup {gallery} mediaOverride={mediaFor(gallery)} index={i} />
				{/each}
			</div>
		</div>
	{/if}
</div>
