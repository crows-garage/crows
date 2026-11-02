<script>
	import { FolderKanban, Flag, MapPin } from '@lucide/svelte'
	import { imgUrl } from '#lib/utils.js'

	let { data } = $props()

	const MILESTONE_STYLES = {
		PLANNED: 'border-line text-mute',
		IN_PROGRESS: 'border-signal text-signal',
		DONE: 'border-signal bg-signal/10 text-fg',
		DELAYED: 'border-rec/30 text-rec'
	}

	const MILESTONE_LABELS = {
		PLANNED: 'Planificado',
		IN_PROGRESS: 'En progreso',
		DONE: 'Completado',
		DELAYED: 'Demorado'
	}

	const STATUS_LABELS = {
		ACTIVE: 'En curso',
		COMPLETED: 'Completado',
		CANCELLED: 'Cancelado'
	}

	function formatDate(iso) {
		if (!iso) return ''
		try {
			return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
		} catch {
			return ''
		}
	}
</script>

<svelte:head>
	<title>Proyectos — CursoX</title>
	<meta name="description" content="Proyectos futuros y en curso de la institución, con su hoja de ruta." />
</svelte:head>

<div class="min-h-screen pt-20 pb-16 bg-base">
	<div class="max-w-5xl mx-auto px-4">
		<div class="text-center mb-10">
			<p class="text-[10px] uppercase tracking-[0.3em] mb-2 text-mute">Colaboracion</p>
			<h1 class="text-2xl sm:text-3xl font-light tracking-tight text-fg">Proyectos</h1>
			<p class="text-sm text-mute mt-2">Ideas y proyectos que pueden crecer con las personas correctas.</p>
		</div>

		{#if data.projects.length === 0}
			<div class="text-center py-16">
				<FolderKanban size={36} class="mx-auto text-mute/50 mb-3" />
				<p class="text-sm text-mute">Todavia no hay proyectos publicados</p>
			</div>
		{:else}
			<div class="space-y-8">
				{#each data.projects as project (project.id)}
					{@const milestones = project.milestones || []}
					<article class="bg-panel border border-line overflow-hidden">
						{#if project.coverImage}
							<img src={imgUrl(project.coverImage) || project.coverImage} alt={project.name} loading="lazy" class="w-full h-40 object-cover" />
						{/if}
						<div class="p-5 sm:p-6">
							<div class="flex items-start justify-between gap-3 flex-wrap">
								<div class="min-w-0">
									<h2 class="text-lg font-medium text-fg leading-snug">{project.name}</h2>
									{#if project.category}
										<p class="text-[11px] text-mute mt-1 flex items-center gap-1 uppercase tracking-[0.15em]">
											<MapPin size={10} /> {project.category}
										</p>
									{/if}
								</div>
								<div class="flex items-center gap-2 flex-shrink-0">
									<span class={`text-[9px] font-semibold uppercase tracking-[0.2em] px-2 py-0.5 ${
										project.status === 'COMPLETED'
											? 'bg-signal/15 text-signal'
											: project.status === 'ACTIVE'
												? 'bg-fg text-base'
												: 'bg-line text-mute'
									}`}>
										{STATUS_LABELS[project.status] || project.status}
									</span>
								</div>
							</div>

							{#if project.description}
								<p class="text-sm text-fg/80 leading-relaxed mt-3 whitespace-pre-wrap line-clamp-4">{project.description}</p>
							{/if}

							<!-- Progreso -->
							<div class="flex items-center gap-3 mt-4">
								<div class="flex-1 h-1.5 bg-line/40 overflow-hidden">
									<div class={`h-full ${project.status === 'COMPLETED' ? 'bg-signal' : 'bg-fg'}`} style={`width: ${project.progress || 0}%`}></div>
								</div>
								<span class="text-[10px] font-mono text-mute">{project.progress || 0}%</span>
							</div>

							<div class="flex items-center gap-4 mt-2 text-[11px] text-mute">
								{#if project.startDate}<span>Inicio: {formatDate(project.startDate)}</span>{/if}
								{#if project.endDate}<span>Cierre estimado: {formatDate(project.endDate)}</span>{/if}
							</div>

							<!-- Roadmap -->
							{#if milestones.length > 0}
								<div class="mt-6 border-t border-line pt-4">
									<p class="text-[10px] uppercase tracking-[0.3em] text-mute mb-3 flex items-center gap-1.5">
										<Flag size={11} /> Hoja de ruta
									</p>
									<div class="space-y-3">
										{#each milestones as m, idx}
											<div class="flex items-start gap-3">
												<span class="w-6 h-6 rounded-full border bg-base flex items-center justify-center text-[10px] font-mono text-mute flex-shrink-0">
													{idx + 1}
												</span>
												<div class="min-w-0 flex-1">
													<div class="flex items-center gap-2 flex-wrap">
														<p class={`text-sm ${m.status === 'DONE' ? 'text-mute line-through' : 'text-fg'}`}>{m.title}</p>
														<span class={`text-[9px] font-semibold uppercase tracking-[0.15em] border px-1.5 py-0.5 ${MILESTONE_STYLES[m.status] || MILESTONE_STYLES.PLANNED}`}>
															{MILESTONE_LABELS[m.status] || m.status}
														</span>
													</div>
													<p class="text-[11px] text-mute mt-0.5">
														{m.dueDate ? formatDate(m.dueDate) : 'Sin fecha'}
														{m.description ? ` — ${m.description}` : ''}
													</p>
												</div>
											</div>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					</article>
				{/each}
			</div>
		{/if}
	</div>
</div>
