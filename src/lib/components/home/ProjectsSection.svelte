<script>
	import { Search, Users, X } from '@lucide/svelte'
	import { imgUrl } from '#lib/utils.js'

	let { projects = [] } = $props()
	let query = $state('')
	let selectedCategory = $state('')
	let selectedStatus = $state('')

	const categories = $derived(
		[...new Set((projects || []).map((project) => project.category).filter(Boolean))].sort()
	)

	const filteredProjects = $derived(
		(projects || []).filter((project) => {
			const haystack = `${project.name || ''} ${project.description || ''}`.toLowerCase()
			const matchesQuery = !query.trim() || haystack.includes(query.trim().toLowerCase())
			const matchesCategory = !selectedCategory || project.category === selectedCategory
			const matchesStatus = !selectedStatus || project.status === selectedStatus
			return matchesQuery && matchesCategory && matchesStatus
		})
	)

	const statusLabels = {
		ACTIVE: 'En curso',
		COMPLETED: 'Completado',
		CANCELLED: 'Cancelado'
	}

	function clearFilters() {
		query = ''
		selectedCategory = ''
		selectedStatus = ''
	}
</script>

<section id="proyectos" class="py-10 sm:py-16 lg:py-20 border-t border-line">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div>
			<p class="eyebrow !text-signal mb-3 flex items-center gap-2">
				<Users class="w-4 h-4" /> 02 · PROYECTOS DE LA COMUNIDAD
			</p>
			<h2 class="font-display font-semibold text-2xl sm:text-3xl lg:text-4xl leading-tight tracking-tight text-fg">
				Las ideas nos conectan. Los equipos las hacen realidad
			</h2>
			<p class="mt-3 text-base sm:text-lg leading-relaxed text-mute">
				Un proyecto no siempre necesita más ideas. A veces solo necesita una conexión y un impulso. Encontrá personas que compartan tus intereses, descubrí proyectos en los que participar y sumate a construir algo juntos.
			</p>
			<div class="flex flex-wrap gap-3 mt-5">
				<a href="/proyectos/nuevo" class="btn btn-primary">Crear un proyecto</a>
				<a href="/proyectos" class="btn">Explorar proyectos</a>
			</div>
		</div>

		{#if Array.isArray(projects) && projects.length > 0}
			<div class="mt-8 border border-line rounded-xs bg-panel p-3 sm:p-4">
				<div class="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
					<label class="relative block min-w-0 sm:col-span-2 lg:col-span-1">
						<span class="sr-only">Buscar proyectos</span>
						<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
						<input bind:value={query} type="search" placeholder="Buscar proyectos..." class="input min-w-0 w-full pl-9" />
					</label>
					<select bind:value={selectedCategory} class="input min-w-0 w-full" aria-label="Filtrar por categoría">
						<option value="">Todas las categorías</option>
						{#each categories as category}
							<option value={category}>{category}</option>
						{/each}
					</select>
					<select bind:value={selectedStatus} class="input min-w-0 w-full" aria-label="Filtrar por estado">
						<option value="">Todos los estados</option>
						<option value="ACTIVE">En curso</option>
						<option value="COMPLETED">Completados</option>
						<option value="CANCELLED">Cancelados</option>
					</select>
					<button type="button" onclick={clearFilters} class="btn min-h-[44px] w-full px-3 sm:w-auto" aria-label="Limpiar filtros" title="Limpiar filtros">
						<X class="w-4 h-4" />
						<span class="sm:hidden">Limpiar filtros</span>
					</button>
				</div>
				<p class="mt-3 text-[10px] uppercase tracking-[0.18em] text-mute">{filteredProjects.length} de {projects.length} proyectos</p>
			</div>

			{#if filteredProjects.length > 0}
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">
					{#each filteredProjects as project (project.id)}
						<article class="border rounded-xs border-line bg-surface overflow-hidden">
							<div class="block">
								{#if project.coverImage}
									<img src={imgUrl(project.coverImage)} alt={project.name} loading="lazy" class="h-40 w-full object-cover hover:opacity-90 transition-opacity" />
								{/if}
								<div class="p-4">
									<div class="flex items-center justify-between gap-2">
										<h3 class="font-display font-semibold text-base text-fg hover:text-signal transition-colors"><a href={`/proyecto/${project.slug || project.id}`}>{project.name}</a></h3>
										{#if project.status}<span class="shrink-0 text-[9px] uppercase tracking-[0.12em] text-signal">{statusLabels[project.status] || project.status}</span>{/if}
									</div>
									{#if project.category}<p class="mt-1 text-[10px] uppercase tracking-[0.15em] text-mute">{project.category}</p>{/if}
									{#if project.description}<p class="mt-2 text-xs text-mute leading-relaxed line-clamp-3">{project.description}</p>{/if}
									<a href={`/proyecto/${project.slug || project.id}`} class="inline-flex mt-4 text-xs uppercase tracking-[0.14em] text-signal hover:text-fg transition-colors">Participar en este proyecto →</a>
								</div>
							</div>
						</article>
					{/each}
				</div>
			{:else}
				<div class="mt-5 border border-line rounded-xs bg-panel p-8 text-center text-sm text-mute">No encontramos proyectos con esos filtros.</div>
			{/if}
		{/if}
	</div>
</section>
