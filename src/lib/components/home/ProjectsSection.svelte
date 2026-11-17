<script>
	import { Users, X } from '@lucide/svelte'
	import ProjectCard from '#lib/components/projects/ProjectCard.svelte'

	let { projects = [] } = $props()
	let selectedCategory = $state('')

	const categories = $derived(
		[...new Set((projects || []).map((project) => project.category).filter(Boolean))].sort()
	)

	const filteredProjects = $derived(
		(projects || []).filter((project) => !selectedCategory || project.category === selectedCategory)
	)

	function clearFilters() {
		selectedCategory = ''
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
			<div class="flex flex-wrap gap-3 mt-5">
				<a href="/proyectos/nuevo" class="btn btn-primary">Crear un proyecto</a>
				<a href="/proyectos" class="btn">Explorar proyectos</a>
			</div>
		</div>

		{#if Array.isArray(projects) && projects.length > 0}
			<div class="mt-8 flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-panel p-3 sm:p-4">
				<label class="sr-only" for="home-project-category">Filtrar por categoría</label>
				<select id="home-project-category" bind:value={selectedCategory} class="input min-w-[220px] flex-1 rounded-xl border-line bg-base/60" aria-label="Filtrar por categoría">
						<option value="">Todas las categorías</option>
						{#each categories as category}
							<option value={category}>{category}</option>
						{/each}
					</select>
				<button type="button" onclick={clearFilters} class="btn min-h-[44px] rounded-xl border-line px-4 hover:border-signal hover:text-signal" aria-label="Limpiar filtros" title="Limpiar filtros">
						<X class="w-4 h-4" />
						<span>Limpiar filtros</span>
					</button>
				<p class="mt-3 text-[10px] uppercase tracking-[0.18em] text-mute">{filteredProjects.length} de {projects.length} proyectos</p>
			</div>

			{#if filteredProjects.length > 0}
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">
					{#each filteredProjects as project (project.id)}
						<ProjectCard {project} compact />
					{/each}
				</div>
			{:else}
				<div class="mt-5 border border-line rounded-xs bg-panel p-8 text-center text-sm text-mute">No encontramos proyectos con esos filtros.</div>
			{/if}
		{/if}
	</div>
</section>
