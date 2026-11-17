<script>
	import { FolderKanban, Flag, MapPin, Search, X } from '@lucide/svelte'
	import { imgUrl } from '#lib/utils.js'
	import { PROJECT_CATEGORIES } from '#lib/projectCategories.js'

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
					{@const imageUrls = [project.coverImage, ...(project.images || []).map((image) => image?.url)].filter(Boolean)}
					<article class="bg-panel border rounded-xs border-line overflow-hidden">
						{#if imageUrls.length > 0}
							<a href={`/proyecto/${project.slug || project.id}`} class="block">
								<img src={imgUrl(imageUrls[0])} alt={project.name} loading="lazy" class="w-full h-40 object-cover hover:opacity-90 transition-opacity" />
								{#if imageUrls.length > 1}
									<div class="grid grid-cols-4 gap-1 p-1 bg-base">
										{#each imageUrls.slice(1, 5) as image, index}
											<img src={imgUrl(image)} alt={`${project.name} imagen ${index + 2}`} loading="lazy" class="h-16 w-full object-cover" />
										{/each}
									</div>
								{/if}
							</a>
						{/if}
						<div class="p-5 sm:p-6">
							<div class="flex items-start justify-between gap-3 flex-wrap">
								<div class="min-w-0">
									<h2 class="text-lg font-medium text-fg leading-snug"><a href={`/proyecto/${project.slug || project.id}`} class="hover:text-signal transition-colors">{project.name}</a></h2>
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
							<a href={`/proyecto/${project.slug || project.id}`} class="inline-block mt-4 text-xs uppercase tracking-[0.16em] text-signal hover:text-fg transition-colors">Ver proyecto →</a>

							<!-- Roadmap -->
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
					</article>
				{/each}
			</div>
		{/if}
	</div>
</div>
