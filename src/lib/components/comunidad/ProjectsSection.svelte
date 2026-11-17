<script>
	import { onMount } from 'svelte'
	import { Loader2, MessageSquare } from '@lucide/svelte'
	import { organizationApi } from '#lib/api/organization.js'
	import ProjectCard from '#lib/components/projects/ProjectCard.svelte'

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
					<div class="space-y-4">
						{#each projects as project (project.id)}
							<div>
								<ProjectCard {project} compact />
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
</section>
