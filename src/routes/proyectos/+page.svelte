<script>
	import { FolderKanban, Flag, Users, X } from '@lucide/svelte'
	import ProjectCard from '#lib/components/projects/ProjectCard.svelte'

	let { data } = $props()
	let selectedCategory = $state('')

	const projects = $derived(data.projects || [])
	const categories = $derived([...new Set(projects.map((project) => project.category).filter(Boolean))].sort())
	const filteredProjects = $derived(projects.filter((project) => !selectedCategory || project.category === selectedCategory))

	function clearFilters() {
		selectedCategory = ''
	}

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
	<title>Proyectos — Crow Projects</title>
	<meta name="description" content="Proyectos futuros y en curso de la institución, con su hoja de ruta." />
</svelte:head>

<div class="min-h-screen pt-20 pb-16 bg-base">
	<div class="max-w-5xl mx-auto px-4">
		<div class="mb-10">
			<p class="eyebrow !text-signal mb-3 flex items-center gap-2"><Users class="w-4 h-4" /> 02 · PROYECTOS DE LA COMUNIDAD</p>
			<h1 class="font-display font-semibold text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight text-fg">Las ideas nos conectan. Los equipos las hacen realidad.</h1>
			<p class="mt-4 max-w-2xl text-base leading-relaxed text-mute">Explorá proyectos que buscan crecer con nuevas personas, conocimientos y ganas de construir en conjunto.</p>
		</div>

		<div class="mt-8 flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-panel p-3 sm:p-4">
			<label class="sr-only" for="project-category-filter">Filtrar por categoría</label>
			<select id="project-category-filter" bind:value={selectedCategory} class="input min-w-[220px] flex-1 rounded-xl border-line bg-base/60" aria-label="Filtrar por categoría">
					<option value="">Todas las categorías</option>
					{#each categories as category}<option value={category}>{category}</option>{/each}
			</select>
			<button type="button" onclick={clearFilters} class="btn min-h-[44px] rounded-xl border-line px-4 hover:border-signal hover:text-signal" aria-label="Limpiar filtros" title="Limpiar filtros"><X class="w-4 h-4" /><span>Limpiar filtros</span></button>
			<p class="w-full text-[10px] uppercase tracking-[0.18em] text-mute">{filteredProjects.length} de {projects.length} proyectos</p>
		</div>

		{#if projects.length === 0}
			<div class="text-center py-16">
				<FolderKanban size={36} class="mx-auto text-mute/50 mb-3" />
				<p class="text-sm text-mute">Todavia no hay proyectos publicados</p>
			</div>
		{:else if filteredProjects.length === 0}
			<div class="text-center py-16 border border-line rounded-2xl bg-panel">
				<FolderKanban size={32} class="mx-auto text-mute/50 mb-3" />
				<p class="text-sm text-mute">No encontramos proyectos con esos filtros.</p>
				<button type="button" onclick={clearFilters} class="btn mt-5">Mostrar todos</button>
			</div>
		{:else}
			<div class="space-y-8">
				{#each filteredProjects as project (project.id)}
					{@const milestones = project.milestones || []}
					<div>
						<ProjectCard {project} />
						<div class="border-x border-b border-line bg-panel px-5 pb-5 sm:px-6 sm:pb-6">
							{#if milestones.length > 0}
								<div class="mt-6 border-t border-line pt-4">
									<p class="text-[10px] uppercase tracking-[0.3em] text-mute mb-3 flex items-center gap-1.5">
										<Flag size={11} /> Hoja de ruta
									</p>
									<div class="space-y-3">
										{#each milestones as m, idx}
											<div class="flex items-start gap-3">
												<span class="w-6 h-6 border rounded-xs bg-base flex items-center justify-center text-[10px] font-mono text-mute flex-shrink-0">
													{idx + 1}
												</span>
												<div class="min-w-0 flex-1">
													<div class="flex items-center gap-2 flex-wrap">
														<p class={`text-sm ${m.status === 'DONE' ? 'text-mute line-through' : 'text-fg'}`}>{m.title}</p>
														<span class={`text-[9px] font-semibold uppercase tracking-[0.15em] border rounded-xs px-1.5 py-0.5 ${MILESTONE_STYLES[m.status] || MILESTONE_STYLES.PLANNED}`}>
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
					</div>
				{/each}
			</div>
		{/if}

		<div class="mt-12 border-t border-line pt-8">
			<p class="eyebrow !text-signal">¿Tenés una idea?</p>
			<h2 class="mt-2 font-display text-2xl sm:text-3xl font-semibold text-fg">Convertirla en proyecto empieza por registrarte.</h2>
			<p class="mt-2 max-w-xl text-sm leading-relaxed text-mute">Creá tu cuenta para presentar una propuesta, sumar imágenes y encontrar personas que quieran participar.</p>
			<div class="mt-5 flex flex-wrap gap-3">
				<a href="/register?redirect=/proyectos/nuevo" class="btn btn-primary">Registrarme y crear proyecto</a>
				<a href="/login?redirect=/proyectos/nuevo" class="btn">Ya tengo una cuenta</a>
				<a href="/comunidad#proyectos-comunidad" class="btn">Ver proyectos de la comunidad</a>
			</div>
		</div>
	</div>
</div>
