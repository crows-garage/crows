<script>
	import { FolderKanban, Flag, Search, X } from '@lucide/svelte'
	import { PROJECT_CATEGORIES } from '#lib/projectCategories.js'
	import ProjectCard from '#lib/components/projects/ProjectCard.svelte'

	let { data } = $props()
	let query = $state('')
	let selectedCategory = $state('')
	let selectedStatus = $state('')

	const projects = $derived(data.projects || [])
	const categories = $derived([...new Set([...PROJECT_CATEGORIES, ...projects.map((project) => project.category).filter(Boolean)])].sort())
	const filteredProjects = $derived(
		projects.filter((project) => {
			const haystack = `${project.name || ''} ${project.description || ''}`.toLowerCase()
			return (
				(!query.trim() || haystack.includes(query.trim().toLowerCase())) &&
				(!selectedCategory || project.category === selectedCategory) &&
				(!selectedStatus || project.status === selectedStatus)
			)
		})
	)

	function clearFilters() {
		query = ''
		selectedCategory = ''
		selectedStatus = ''
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
		<div class="text-center mb-10">
			<p class="text-[10px] uppercase tracking-[0.3em] mb-2 text-mute">Colaboracion</p>
			<h1 class="text-2xl sm:text-3xl font-display font-semibold tracking-tight text-fg">Proyectos</h1>
			<p class="text-sm text-mute mt-2">Ideas y proyectos que pueden crecer con las personas correctas.</p>
			<div class="flex flex-wrap items-center justify-center gap-3 mt-5">
				<a href="/proyectos/nuevo" class="btn btn-primary">Crear proyecto</a>
				<a href="/comunidad#proyectos-comunidad" class="btn">Ver proyectos de la comunidad</a>
			</div>
		</div>

		<div class="border border-line rounded-xs bg-panel p-3 sm:p-4 mb-8">
			<div class="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_auto_auto] gap-2">
				<label class="relative block">
					<span class="sr-only">Buscar proyectos</span>
					<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
					<input bind:value={query} type="search" placeholder="Buscar proyectos..." class="input w-full pl-9" />
				</label>
				<select bind:value={selectedCategory} class="input" aria-label="Filtrar por categoría">
					<option value="">Todas las categorías</option>
					{#each categories as category}<option value={category}>{category}</option>{/each}
				</select>
				<select bind:value={selectedStatus} class="input" aria-label="Filtrar por estado">
					<option value="">Todos los estados</option>
					<option value="ACTIVE">En curso</option>
					<option value="COMPLETED">Completados</option>
					<option value="CANCELLED">Cancelados</option>
				</select>
				<button type="button" onclick={clearFilters} class="btn px-3" aria-label="Limpiar filtros" title="Limpiar filtros"><X class="w-4 h-4" /></button>
			</div>
			<p class="mt-3 text-[10px] uppercase tracking-[0.18em] text-mute">{filteredProjects.length} de {projects.length} proyectos</p>
		</div>

		{#if projects.length === 0}
			<div class="text-center py-16">
				<FolderKanban size={36} class="mx-auto text-mute/50 mb-3" />
				<p class="text-sm text-mute">Todavia no hay proyectos publicados</p>
			</div>
		{:else if filteredProjects.length === 0}
			<div class="text-center py-16 border border-line rounded-xs bg-panel">
				<p class="text-sm text-mute">No encontramos proyectos con esos filtros.</p>
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
	</div>
</div>
