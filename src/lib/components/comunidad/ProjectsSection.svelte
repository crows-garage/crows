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

<section id="proyectos-comunidad" class="section-mint py-16 sm:py-20 lg:py-24 border-t border-line">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="relative p-0 sm:p-2">
			<div class="relative">
				<h2 class="eyebrow !text-brand mb-6">Proyectos de la Comunidad</h2>
				{#if loading}
					<div class="flex justify-center py-12">
						<Loader2 size={24} class="animate-spin text-mute" />
					</div>
				{:else if error}
					<div class="text-center py-12 text-mute">{error}</div>
				{:else if projects.length === 0}
					<div class="text-center py-12">
						<MessageSquare size={36} class="mx-auto text-mute/50 mb-3" />
						<p class="text-sm text-mute">Aún no hay proyectos publicados</p>
					</div>
				{:else}
					<div class="space-y-4 lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0">
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
