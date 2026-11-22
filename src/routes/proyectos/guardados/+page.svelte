<script>
	import { goto } from '$app/navigation'
	import { Bookmark, Loader2 } from '@lucide/svelte'
	import { auth } from '#lib/stores/auth.svelte.js'
	import { organizationApi } from '#lib/api/organization.js'
	import ProjectCard from '#lib/components/projects/ProjectCard.svelte'

	let projects = $state([])
	let loading = $state(true)

	$effect(() => {
		if (!auth.loading && !auth.user) goto('/login?redirect=/proyectos/guardados')
		if (auth.user) organizationApi.savedProjects().then((data) => (projects = data || [])).finally(() => (loading = false))
	})
</script>

<svelte:head><title>Proyectos guardados — Crow Projects</title></svelte:head>

{#if auth.loading || loading}
	<div class="flex justify-center py-24"><Loader2 class="animate-spin text-signal" size={32} /></div>
{:else if auth.user}
	<div class="mx-auto max-w-7xl px-4 py-10 sm:px-8">
		<div class="mb-8 flex items-center gap-3"><Bookmark class="text-signal" size={26} /><div><p class="eyebrow">TU SELECCIÓN</p><h1 class="mt-1 font-display text-3xl font-semibold text-fg">Proyectos guardados</h1></div></div>
		{#if projects.length === 0}
			<div class="panel p-10 text-center"><Bookmark size={42} class="mx-auto mb-3 text-mute/50" /><p class="text-mute">Todavía no guardaste proyectos.</p><a href="/proyectos" class="btn btn-primary mt-5 inline-flex">Explorar proyectos</a></div>
		{:else}
			<div class="space-y-6">{#each projects as project (project.id)}<ProjectCard {project} saved />{/each}</div>
		{/if}
	</div>
{/if}
