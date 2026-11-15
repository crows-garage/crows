<script>
	import { ArrowLeft, Flag, MapPin } from '@lucide/svelte'
	import { imgUrl } from '#lib/utils.js'

	let { data } = $props()
	const project = $derived(data.project)

	const gallery = $derived.by(() => [
		...(project.coverImage ? [{ src: imgUrl(project.coverImage), alt: project.name }] : []),
		...(project.images || [])
			.slice()
			.sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
			.filter((image) => image?.url)
			.map((image) => ({ src: imgUrl(image.url), alt: image.alt || project.name }))
	])

	let active = $state(0)

	const STATUS_LABELS = {
		ACTIVE: 'En curso',
		COMPLETED: 'Completado',
		CANCELLED: 'Cancelado'
	}

	const MILESTONE_LABELS = {
		PLANNED: 'Planificado',
		IN_PROGRESS: 'En progreso',
		DONE: 'Completado',
		DELAYED: 'Demorado'
	}

	function formatDate(value) {
		if (!value) return ''
		return new Date(value).toLocaleDateString('es-AR', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		})
	}
</script>

<svelte:head>
	<title>{project.name || 'Proyecto'} — Crow Projects</title>
	<meta name="description" content={project.description?.slice(0, 160) || 'Detalle del proyecto'} />
</svelte:head>

<div class="min-h-screen bg-base pt-20 pb-16">
	<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
		<a href="/proyectos" class="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-mute hover:text-fg transition-colors">
			<ArrowLeft size={14} /> Volver a proyectos
		</a>

		<div class="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-12 mt-8">
			<section>
				{#if gallery.length > 0}
					<div class="relative aspect-[4/3] overflow-hidden rounded-xs border border-line bg-panel">
						<img src={gallery[active].src} alt={gallery[active].alt} class="absolute inset-0 h-full w-full object-cover" />
					</div>
					{#if gallery.length > 1}
						<div class="grid grid-cols-5 gap-2 mt-3">
							{#each gallery as image, index}
								<button
									type="button"
									onclick={() => (active = index)}
									class={`relative aspect-square overflow-hidden rounded-xs border ${active === index ? 'border-signal' : 'border-line hover:border-mute'}`}
									aria-label={`Mostrar imagen ${index + 1}`}
								>
									<img src={image.src} alt={image.alt} loading="lazy" class="absolute inset-0 h-full w-full object-cover" />
								</button>
							{/each}
						</div>
					{/if}
				{:else}
					<div class="aspect-[4/3] border border-line rounded-xs bg-panel flex items-center justify-center text-xs uppercase tracking-[0.2em] text-mute">
						Sin imágenes
					</div>
				{/if}
			</section>

			<section class="space-y-6">
				<div>
					<div class="flex flex-wrap items-center gap-2 mb-3">
						<span class="text-[10px] uppercase tracking-[0.2em] text-signal">Proyecto</span>
						{#if project.status}
							<span class="text-[10px] uppercase tracking-[0.15em] border border-line rounded-xs px-2 py-1 text-mute">
								{STATUS_LABELS[project.status] || project.status}
							</span>
						{/if}
					</div>
					<h1 class="font-display font-semibold text-3xl sm:text-5xl leading-tight tracking-tight text-fg">{project.name}</h1>
					{#if project.category}
						<p class="mt-3 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-mute"><MapPin size={13} /> {project.category}</p>
					{/if}
				</div>

				{#if project.description}
					<p class="text-base leading-relaxed text-fg/80 whitespace-pre-line">{project.description}</p>
				{/if}

				<div class="border-t border-line pt-5 space-y-3">
					<div class="flex items-center justify-between text-xs uppercase tracking-[0.14em] text-mute">
						<span>Progreso</span>
						<span>{project.progress || 0}%</span>
					</div>
					<div class="h-2 bg-line/40 overflow-hidden">
						<div class="h-full bg-signal" style={`width: ${project.progress || 0}%`}></div>
					</div>
					<div class="flex flex-wrap gap-x-5 gap-y-1 text-xs text-mute">
						{#if project.startDate}<span>Inicio: {formatDate(project.startDate)}</span>{/if}
						{#if project.endDate}<span>Cierre estimado: {formatDate(project.endDate)}</span>{/if}
					</div>
				</div>
			</section>
		</div>

		{#if project.milestones?.length}
			<section class="mt-12 border-t border-line pt-8">
				<h2 class="eyebrow mb-5 flex items-center gap-2"><Flag size={13} /> Hoja de ruta</h2>
				<div class="grid gap-4 md:grid-cols-2">
					{#each project.milestones as milestone, index}
						<div class="border border-line rounded-xs p-4 bg-panel">
							<div class="flex items-start gap-3">
								<span class="w-6 h-6 shrink-0 border border-line rounded-xs flex items-center justify-center text-xs text-mute">{index + 1}</span>
								<div>
									<h3 class="text-sm text-fg">{milestone.title}</h3>
									<p class="mt-1 text-[10px] uppercase tracking-[0.12em] text-signal">{MILESTONE_LABELS[milestone.status] || milestone.status}</p>
									{#if milestone.description || milestone.dueDate}
										<p class="mt-2 text-xs text-mute">{milestone.description || ''}{milestone.dueDate ? ` · ${formatDate(milestone.dueDate)}` : ''}</p>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/if}
	</div>
</div>
