// ≙ src/app/galeria/page.jsx: galería de actividades.
<script>
	import GalleryGroup from '#lib/components/home/GalleryGroup.svelte'

	let { data } = $props()

	const active = $derived(data.galleries.filter((g) => g.status === 'ACTIVE'))
	const totalMedia = $derived(active.reduce((n, g) => n + (g.media?.length || 0), 0))
</script>

<svelte:head>
	<title>Actividad — CursoX</title>
	<meta name="description" content="Proyectos y registros de la comunidad de CursoX." />
</svelte:head>

<div class="min-h-screen bg-base pb-16">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-4">
		<p class="eyebrow mb-2">Galería · Actividades</p>
		<h1 class="font-display font-semibold text-4xl sm:text-5xl tracking-tight text-fg">Galería</h1>
		{#if active.length > 0}
			<p class="font-mono text-[10px] uppercase tracking-[0.2em] text-mute mt-3 tel">
				{active.length} grupo{active.length !== 1 ? 's' : ''} · {totalMedia} imagen{totalMedia !== 1 ? 'es' : ''}
			</p>
		{/if}
	</div>

	{#if active.length === 0}
		<div class="max-w-7xl mx-auto px-4 py-16">
			<div class="border border-line bg-surface p-10 text-center">
				<p class="font-mono text-xs uppercase tracking-[0.2em] text-mute">Todavía no hay imágenes publicadas</p>
				<p class="text-sm text-mute mt-2">Volvé pronto para ver las primeras actividades.</p>
			</div>
		</div>
	{:else}
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="space-y-10">
				{#each active as gallery, i (gallery.id)}
					<GalleryGroup {gallery} index={i} />
				{/each}
			</div>
		</div>
	{/if}
</div>
