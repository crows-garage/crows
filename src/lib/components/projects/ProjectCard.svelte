<script>
	import { ArrowLeft, ArrowRight, CalendarDays, Flag, Heart, Users } from '@lucide/svelte'
	import { imgUrl } from '#lib/utils.js'
	import { auth } from '#lib/stores/auth.svelte.js'
	import { organizationApi } from '#lib/api/organization.js'

	let { project, compact = false, saved = false } = $props()
	let activeImage = $state(0)
	let isSaved = $state(saved)
	let saveLoading = $state(false)

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

	function formatDate(value) {
		if (!value) return ''
		return new Date(value).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' }).replace('.', '')
	}

	async function toggleSaved(event) {
		event.preventDefault()
		event.stopPropagation()
		if (!auth.user) return (window.location.href = `/login?redirect=/proyecto/${slug}`)
		if (saveLoading) return
		saveLoading = true
		try {
			if (isSaved) await organizationApi.removeSavedProject(project.id)
			else await organizationApi.saveProject(project.id)
			isSaved = !isSaved
		} finally {
			saveLoading = false
		}
	}
</script>

<article class={`project-card group overflow-hidden rounded-xl border transition-colors hover:border-signal ${compact ? '' : 'lg:grid lg:grid-cols-[1.12fr_0.88fr]'}`}>
	<div class="relative aspect-[16/9] overflow-hidden bg-panel lg:aspect-auto lg:min-h-[360px]">
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

		<div class="flex flex-col p-5 sm:p-7 lg:p-8">
		<div class="flex items-start justify-between gap-3">
			<div>
				{#if project?.category}<p class="text-[10px] uppercase tracking-[0.18em] text-signal">{project.category}</p>{/if}
				<h3 class="mt-1 font-display text-xl font-semibold leading-tight text-fg"><a href={`/proyecto/${slug}`} class="hover:text-signal">{project?.name || 'Proyecto sin título'}</a></h3>
			</div>
			<div class="flex items-center gap-2">
				<button type="button" onclick={toggleSaved} disabled={saveLoading} class={`grid h-9 w-9 place-items-center rounded-full border transition-colors ${isSaved ? 'border-signal bg-signal text-base' : 'border-line text-mute hover:border-signal hover:text-signal'}`} aria-label={isSaved ? 'Quitar de proyectos guardados' : 'Guardar proyecto'} title={isSaved ? 'Quitar de proyectos guardados' : 'Guardar proyecto'}><Heart size={16} class={isSaved ? 'fill-current' : ''} /></button>
				{#if project?.status}<span class="shrink-0 rounded-full bg-base px-2.5 py-1 text-[9px] uppercase tracking-[0.12em] text-mute">{statusLabels[project.status] || project.status}</span>{/if}
			</div>
		</div>
		{#if project?.description}<p class="mt-3 line-clamp-3 text-sm leading-relaxed text-mute">{project.description}</p>{/if}
		{#if project?.progress !== undefined || project?.startDate || project?.endDate || project?.creator?.firstName || project?.milestones?.length || project?.links?.length}
			<div class="mt-5 hidden flex-wrap gap-x-4 gap-y-2 border-t border-line/70 pt-4 text-[10px] uppercase tracking-[0.12em] text-mute lg:flex">
				{#if project?.progress !== undefined}<span class="min-w-[120px] flex-1">Progreso <strong class="text-signal">{project.progress}%</strong><span class="mt-1 block h-1 bg-line/40"><span class="block h-full bg-signal" style={`width: ${Math.min(100, Math.max(0, project.progress || 0))}%`}></span></span></span>{/if}
				{#if project?.startDate || project?.endDate}<span class="inline-flex items-center gap-1"><CalendarDays size={12} /> {formatDate(project.startDate) || 'Sin fecha'}{project.endDate ? ` → ${formatDate(project.endDate)}` : ''}</span>{/if}
				{#if project?.creator?.firstName}<span>Creado por <strong class="text-fg">{project.creator.firstName}</strong></span>{/if}
				{#if project?.milestones?.length}<span class="inline-flex items-center gap-1"><Flag size={12} /> {project.milestones.length} hitos</span>{/if}
				{#if project?.links?.length}<span>{project.links.length} recursos</span>{/if}
			</div>
		{/if}
		<div class="mt-auto flex flex-wrap items-center gap-3 pt-5">
			<a href={`/proyecto/${slug}#participacion`} class="inline-flex items-center gap-2 rounded-full bg-signal px-4 py-2.5 text-xs font-semibold text-base transition-colors hover:bg-brand"><Users size={14} /> Participar</a>
			<a href={`/proyecto/${slug}`} class="inline-flex items-center gap-2 rounded-full border border-signal px-4 py-2.5 text-xs font-semibold text-signal transition-colors hover:bg-signal hover:text-base">Ver proyecto</a>
		</div>
	</div>
</article>
