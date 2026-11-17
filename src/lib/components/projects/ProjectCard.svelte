<script>
	import { ArrowLeft, ArrowRight, Users } from '@lucide/svelte'
	import { imgUrl } from '#lib/utils.js'

	let { project, compact = false } = $props()
	let activeImage = $state(0)

	const images = $derived.by(() => [
		...(project?.coverImage ? [{ src: project.coverImage, position: project.coverImagePosition || 'center' }] : []),
		...(project?.images || [])
			.slice()
			.sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
			.filter((image) => image?.url)
			.map((image) => ({ src: image.url, position: image.objectPosition || 'center' }))
	])

	const slug = $derived(project?.slug || project?.id)
	const statusLabels = {
		ACTIVE: 'En curso',
		COMPLETED: 'Completado',
		CANCELLED: 'Cancelado'
	}

	function moveImage(direction) {
		activeImage = (activeImage + direction + images.length) % images.length
	}
</script>

<article class={`group overflow-hidden rounded-2xl border border-line bg-surface transition-all hover:-translate-y-0.5 hover:border-signal hover:shadow-lg hover:shadow-night/5 ${compact ? '' : 'lg:grid lg:grid-cols-[1.05fr_0.95fr]'}`}>
	<div class="relative aspect-[16/10] overflow-hidden bg-panel lg:aspect-auto lg:min-h-[250px]">
		{#if images.length}
			<img src={imgUrl(images[activeImage].src)} alt={project.name || 'Proyecto'} loading="lazy" class="absolute inset-0 h-full w-full object-cover transition-opacity duration-300" style={`object-position: ${images[activeImage].position}`} />
			{#if images.length > 1}
				<div class="absolute inset-x-3 bottom-3 flex items-center justify-between">
					<button type="button" onclick={() => moveImage(-1)} class="grid h-8 w-8 place-items-center rounded-full bg-night/75 text-white backdrop-blur hover:bg-signal hover:text-base" aria-label="Imagen anterior"><ArrowLeft size={14} /></button>
					<div class="flex gap-1.5" aria-label={`${images.length} imágenes`}>
						{#each images as _, index}
							<button type="button" onclick={() => (activeImage = index)} class={`h-1.5 rounded-full transition-all ${activeImage === index ? 'w-6 bg-signal' : 'w-1.5 bg-white/70'}`} aria-label={`Mostrar imagen ${index + 1}`}></button>
						{/each}
					</div>
					<button type="button" onclick={() => moveImage(1)} class="grid h-8 w-8 place-items-center rounded-full bg-night/75 text-white backdrop-blur hover:bg-signal hover:text-base" aria-label="Imagen siguiente"><ArrowRight size={14} /></button>
				</div>
			{/if}
		{:else}
			<div class="absolute inset-0 grid place-items-center graticule text-[10px] uppercase tracking-[0.2em] text-mute">Sin imágenes</div>
		{/if}
	</div>

	<div class="flex flex-col p-5 sm:p-6">
		<div class="flex items-start justify-between gap-3">
			<div>
				{#if project?.category}<p class="text-[10px] uppercase tracking-[0.18em] text-signal">{project.category}</p>{/if}
				<h3 class="mt-1 font-display text-xl font-semibold leading-tight text-fg"><a href={`/proyecto/${slug}`} class="hover:text-signal">{project?.name || 'Proyecto sin título'}</a></h3>
			</div>
			{#if project?.status}<span class="shrink-0 rounded-full bg-base px-2.5 py-1 text-[9px] uppercase tracking-[0.12em] text-mute">{statusLabels[project.status] || project.status}</span>{/if}
		</div>
		{#if project?.description}<p class="mt-3 line-clamp-3 text-sm leading-relaxed text-mute">{project.description}</p>{/if}
		<div class="mt-auto flex flex-wrap items-center gap-3 pt-5">
			<a href={`/proyecto/${slug}#participacion`} class="inline-flex items-center gap-2 rounded-full bg-signal px-4 py-2.5 text-xs font-semibold text-base transition-colors hover:bg-brand"><Users size={14} /> Participar</a>
			<a href={`/proyecto/${slug}`} class="text-xs uppercase tracking-[0.15em] text-mute hover:text-fg">Ver proyecto</a>
		</div>
	</div>
</article>
