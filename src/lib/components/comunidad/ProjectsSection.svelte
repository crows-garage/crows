<script>
	import { onMount } from 'svelte'
	import { ExternalLink, Loader2, MessageSquare, Users } from '@lucide/svelte'
	import { organizationApi } from '#lib/api/organization.js'
	import { imgUrl } from '#lib/utils.js'

	let projects = $state([])
	let loading = $state(true)
	let error = $state('')

	onMount(async () => {
		try {
			const data = await organizationApi.projects()
			projects = data || []
		} catch (err) {
			error = 'No se pudieron cargar los proyectos'
		} finally {
			loading = false
		}
	})
</script>

<section id="proyectos-comunidad" class="py-16 sm:py-20 lg:py-24 border-t border-line">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="relative overflow-hidden bg-night p-6 sm:p-8 text-white">
			<div class="absolute inset-0 graticule opacity-20" aria-hidden="true"></div>
			<div class="relative">
				<h2 class="eyebrow !text-brand mb-6">Proyectos de la Comunidad</h2>
				{#if loading}
					<div class="flex justify-center py-12">
						<Loader2 size={24} class="animate-spin text-muted-foreground" />
					</div>
				{:else if error}
					<div class="text-center py-12 text-muted-foreground">{error}</div>
				{:else if projects.length === 0}
					<div class="text-center py-12">
						<MessageSquare size={36} class="mx-auto text-muted-foreground/50 mb-3" />
						<p class="text-sm text-muted-foreground">Aún no hay proyectos publicados</p>
					</div>
				{:else}
					<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
						{#each projects as project (project.id)}
							<article class="border rounded-xs border-line bg-surface overflow-hidden hover:bg-surface/80 transition-colors">
								{#if project.coverImage}
									<a href={`/proyecto/${project.slug || project.id}`} class="block aspect-[4/3] overflow-hidden">
										<img
											src={imgUrl(project.coverImage)}
											alt={project.name || 'Proyecto'}
											loading="lazy"
											class="w-full h-full object-cover hover:scale-105 transition-transform"
										/>
									</a>
								{/if}
								<div class="p-3">
									<h3 class="text-sm font-medium text-fg line-clamp-2"><a href={`/proyecto/${project.slug || project.id}`} class="hover:text-signal">{project.name || 'Sin título'}</a></h3>
									<p class="text-[9px] text-muted-foreground line-clamp-1 mt-1">{project.description || 'Descripción breve'}</p>
									<div class="mt-2 flex gap-2">
										{#if project.links?.[0]}
											<a href={project.links[0].url} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-xs font-medium text-brand underline hover:text-signal">
												<ExternalLink class="w-4 h-4" /> {project.links[0].title}
											</a>
										{:else}
											<a href={`/proyecto/${project.slug || project.id}`} class="text-xs font-medium text-brand underline hover:text-signal">Ver proyecto</a>
										{/if}
										<a href={`/proyecto/${project.slug || project.id}`} class="flex items-center gap-1 text-xs font-medium text-signal hover:underline">
											<Users size={14} /> Colaborar
										</a>
									</div>
								</div>
							</article>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
</section>
