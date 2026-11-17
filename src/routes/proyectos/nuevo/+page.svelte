<script>
	import { goto } from '$app/navigation'
	import { auth } from '#lib/stores/auth.svelte.js'
	import { organizationApi } from '#lib/api/organization.js'
	import { PROJECT_CATEGORIES } from '#lib/projectCategories.js'

	let form = $state({ name: '', description: '', category: '', customCategory: '', slug: '', linkTitle: '', linkUrl: '' })
	let cover = $state(null)
	let gallery = $state([])
	let loading = $state(false)
	let error = $state('')

	$effect(() => {
		if (!auth.loading && !auth.user) goto('/login?redirect=/proyectos/nuevo')
	})

	async function submit() {
		if (!form.name.trim()) return
		loading = true
		error = ''
		try {
			const project = await organizationApi.createProject({
				name: form.name.trim(),
				slug: form.slug.trim() || undefined,
				description: form.description.trim(),
				category: (form.category === '__custom' ? form.customCategory : form.category).trim() || undefined,
				published: false
			})
			if (form.linkUrl.trim()) await organizationApi.addProjectLink(project.id, { title: form.linkTitle.trim() || 'Enlace del proyecto', url: form.linkUrl.trim(), type: 'PROJECT' })
			if (cover) await organizationApi.uploadProjectFile(project.id, cover)
			for (const image of gallery) await organizationApi.uploadProjectFile(project.id, image, true)
			goto(`/proyecto/${project.slug || project.id}`)
		} catch (err) {
			error = err?.response?.data?.message || err?.response?.data?.error || err.message || 'No se pudo crear el proyecto'
		} finally {
			loading = false
		}
	}
</script>

<svelte:head><title>Crear proyecto — Crow Projects</title></svelte:head>

<div class="min-h-screen bg-base pt-20 pb-16">
	<div class="max-w-2xl mx-auto px-4">
		<div class="mb-8">
			<p class="eyebrow text-signal">Comunidad</p>
			<h1 class="text-3xl font-display text-fg mt-2">Crear un proyecto</h1>
			<p class="text-sm text-mute mt-2">Presentá una idea y encontrá personas para hacerla realidad.</p>
		</div>

		<form onsubmit={(event) => { event.preventDefault(); submit() }} class="space-y-4 bg-panel border border-line p-5 sm:p-7">
			<div><label class="label" for="project-name">Nombre</label><input id="project-name" bind:value={form.name} required class="input w-full" placeholder="Nombre del proyecto" /></div>
			<div><label class="label" for="project-description">Descripción</label><textarea id="project-description" bind:value={form.description} class="input w-full min-h-36" placeholder="Qué problema resuelve, cuál es la idea y qué necesitás"></textarea></div>
			<div class="grid gap-4 sm:grid-cols-2">
				<div><label class="label" for="project-category">Tipo</label><select id="project-category" bind:value={form.category} class="input w-full"><option value="">Seleccionar tipo</option>{#each PROJECT_CATEGORIES as category}<option value={category}>{category}</option>{/each}<option value="__custom">Otro</option></select></div>
				{#if form.category === '__custom'}<div><label class="label" for="custom-category">Tipo personalizado</label><input id="custom-category" bind:value={form.customCategory} class="input w-full" placeholder="Ej.: Biotecnología" /></div>{/if}
			</div>
			<div class="grid gap-4 sm:grid-cols-2">
				<div><label class="label" for="link-title">Enlace</label><input id="link-title" bind:value={form.linkTitle} class="input w-full" placeholder="Repositorio, demo, documentación" /></div>
				<div><label class="label" for="link-url">URL</label><input id="link-url" bind:value={form.linkUrl} type="url" class="input w-full" placeholder="https://..." /></div>
			</div>
			<div><label class="label" for="cover">Imagen de portada</label><input id="cover" type="file" accept="image/*" onchange={(event) => (cover = event.currentTarget.files?.[0] || null)} class="input w-full" /></div>
			<div><label class="label" for="gallery">Galería</label><input id="gallery" type="file" accept="image/*" multiple onchange={(event) => (gallery = [...(event.currentTarget.files || [])])} class="input w-full" /></div>
			{#if error}<p class="border border-rec/30 bg-rec/10 text-rec px-3 py-2 text-xs">{error}</p>{/if}
			<div class="flex items-center justify-between gap-3"><a href="/proyectos" class="text-xs text-mute underline">Cancelar</a><button class="btn btn-primary" disabled={loading}>{loading ? 'Creando...' : 'Crear proyecto'}</button></div>
		</form>
	</div>
</div>
