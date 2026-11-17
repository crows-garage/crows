<script>
	import { goto } from '$app/navigation'
	import { auth } from '#lib/stores/auth.svelte.js'

	let form = $state({ firstName: '', lastName: '', username: '', phone: '' })
	let loading = $state(true)
	let saving = $state(false)
	let message = $state('')
	let error = $state('')

	$effect(() => {
		if (!auth.loading) {
			if (!auth.user) goto('/login?redirect=/perfil')
			else if (loading) {
				form = { firstName: auth.user.firstName || '', lastName: auth.user.lastName || '', username: auth.user.username || '', phone: auth.user.phone || '' }
				loading = false
			}
		}
	})

	async function save() {
		saving = true
		message = ''
		error = ''
		const result = await auth.updateProfile(form)
		if (result.success) {
			message = 'Perfil actualizado.'
		} else {
			error = result.error || 'No se pudo actualizar el perfil.'
		}
		saving = false
	}
</script>

<svelte:head><title>Mi perfil — Crow Projects</title></svelte:head>

<div class="min-h-screen bg-base pt-20 pb-16">
	<div class="max-w-xl mx-auto px-4">
		<p class="eyebrow text-signal">Cuenta</p>
		<h1 class="text-3xl font-display text-fg mt-2">Mi perfil</h1>
		<p class="text-sm text-mute mt-2 mb-8">Tu información visible para la comunidad y los proyectos.</p>
		<form onsubmit={(event) => { event.preventDefault(); save() }} class="space-y-4 bg-panel border border-line p-5 sm:p-7">
			<div><label class="label" for="profile-username">Nombre de usuario</label><input id="profile-username" bind:value={form.username} class="input w-full" pattern="[A-Za-z0-9_-]+" minlength="3" required /></div>
			<div class="grid gap-4 sm:grid-cols-2"><div><label class="label" for="profile-first">Nombre</label><input id="profile-first" bind:value={form.firstName} class="input w-full" required /></div><div><label class="label" for="profile-last">Apellido</label><input id="profile-last" bind:value={form.lastName} class="input w-full" /></div></div>
			<div><label class="label" for="profile-phone">Teléfono</label><input id="profile-phone" bind:value={form.phone} class="input w-full" /></div>
			{#if message}<p class="text-xs text-signal">{message}</p>{/if}{#if error}<p class="text-xs text-rec">{error}</p>{/if}
			<button class="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar perfil'}</button>
		</form>
	</div>
</div>
