<script>
	import { FolderKanban, Flag, Users, X } from '@lucide/svelte'
	import { auth } from '#lib/stores/auth.svelte.js'
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
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="mb-10 max-w-4xl">
			<p class="eyebrow !text-signal mb-3 flex items-center gap-2"><Users class="w-4 h-4" /> 02 · PROYECTOS DE LA COMUNIDAD</p>
			<h1 class="font-display font-semibold text-3xl sm:text-4xl lg:text-6xl leading-[0.98] tracking-tight text-fg">Las ideas nos conectan.<br />Los equipos las hacen realidad.</h1>
			<p class="mt-4 max-w-2xl text-base leading-relaxed text-mute">Explorá proyectos que buscan crecer con nuevas personas, conocimientos y ganas de construir en conjunto.</p>
		</div>

		<div class="mt-8 flex flex-wrap items-center gap-3 border-y border-line py-2.5">
			<label class="sr-only" for="project-category-filter">Filtrar por categoría</label>
			<select id="project-category-filter" bind:value={selectedCategory} class="input min-w-[210px] max-w-xs border-0 bg-transparent px-0 text-sm focus:ring-0" aria-label="Filtrar por categoría">
					<option value="">Todas las categorías</option>
					{#each categories as category}<option value={category}>{category}</option>{/each}
			</select>
			<span class="text-[10px] uppercase tracking-[0.18em] text-mute">{filteredProjects.length} de {projects.length} proyectos</span>
		</div>
		{#if selectedCategory}
			<div class="flex justify-end pt-1"><button type="button" onclick={clearFilters} class="inline-flex items-center gap-1.5 px-1 py-1 text-[10px] uppercase tracking-[0.16em] text-mute transition-colors hover:text-signal" aria-label="Limpiar filtros" title="Limpiar filtros"><X class="w-3.5 h-3.5" /> Limpiar filtros</button></div>
		{/if}

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
				{#if auth.user}
					<a href="/proyectos/nuevo" class="btn btn-primary">Crear mi proyecto</a>
				{:else}
					<a href="/register?redirect=/proyectos/nuevo" class="btn btn-primary">Registrarme y crear proyecto</a>
					<a href="/login?redirect=/proyectos/nuevo" class="btn">Ya tengo una cuenta</a>
				{/if}
				<a href="/comunidad#proyectos-comunidad" class="btn">Ver proyectos de la comunidad</a>
			</div>
		</div>
	</div>
</div>
