<script>
	import { goto } from '$app/navigation'
	import { auth } from '#lib/stores/auth.svelte.js'
	import { CheckCircle2, Bell, X } from '@lucide/svelte'
	import { notificationsApi } from '#lib/api/client.js'
	import { organizationApi } from '#lib/api/organization.js'

	let form = $state({ firstName: '', username: '', phone: '' })
	let loading = $state(true)
	let saving = $state(false)
	let uploading = $state(false)
	let message = $state('')
	let error = $state('')
	let notifications = $state([])
	let notificationsLoading = $state(false)
	let notificationsLoaded = $state(false)
	let reviewing = $state(null)

	$effect(() => {
		if (!auth.loading) {
			if (!auth.user) goto('/login?redirect=/perfil')
			else if (loading) {
				form = { firstName: auth.user.firstName || '', username: auth.user.username || '', phone: auth.user.phone || '' }
				loading = false
			}
			if (auth.user && !notificationsLoading && !notificationsLoaded) loadNotifications()
		}
	})

	async function loadNotifications() {
		notificationsLoading = true
		try {
			const result = await notificationsApi.list()
			notifications = result?.data || []
		} catch {
			notifications = []
		} finally {
			notificationsLoading = false
			notificationsLoaded = true
		}
	}

	function applicationFrom(notification) {
		const match = notification.type?.match(/^PROJECT_APPLICATION:(\d+):(\d+)$/)
		return match ? { projectId: Number(match[1]), applicationId: Number(match[2]) } : null
	}

	function isProjectNotification(notification) {
		return Boolean(applicationFrom(notification) || notification.type?.startsWith('PROJECT_APPLICATION_REVIEWED:'))
	}

	async function review(notification, status) {
		const application = applicationFrom(notification)
		if (!application) return
		reviewing = `${notification.id}:${status}`
		try {
			await organizationApi.reviewProjectApplication(application.projectId, application.applicationId, { status })
			await notificationsApi.markRead(notification.id)
			notifications = notifications.map((item) => item.id === notification.id ? { ...item, read: true, title: status === 'ACCEPTED' ? 'Solicitud aceptada' : 'Solicitud rechazada' } : item)
		} catch (err) {
			error = err?.response?.data?.message || err?.response?.data?.error || 'No se pudo actualizar la solicitud.'
		} finally {
			reviewing = null
		}
	}

	async function markNotificationRead(notification) {
		if (notification.read) return
		await notificationsApi.markRead(notification.id).catch(() => {})
		notifications = notifications.map((item) => item.id === notification.id ? { ...item, read: true } : item)
	}

	async function save() {
		saving = true
		message = ''
		error = ''
		const result = await auth.updateProfile(form)
		if (result.success) message = 'Perfil actualizado.'
		else error = result.error || 'No se pudo actualizar el perfil.'
		saving = false
	}

	async function uploadAvatar(event) {
		const file = event.currentTarget.files?.[0]
		if (!file) return
		if (!file.type.startsWith('image/')) {
			error = 'Elegí una imagen válida.'
			return
		}
		uploading = true
		message = ''
		error = ''
		const result = await auth.updateAvatar(file)
		if (result.success) message = 'Avatar actualizado.'
		else error = result.error || 'No se pudo actualizar el avatar.'
		uploading = false
	}

	function initials() {
		return (auth.user?.firstName || 'C').slice(0, 1).toUpperCase()
	}
</script>

<svelte:head><title>Mi perfil — Crow Projects</title></svelte:head>

<div class="min-h-screen bg-base pt-20 pb-16">
	<div class="max-w-xl mx-auto px-4">
		<p class="eyebrow text-signal">Cuenta</p>
		<h1 class="text-3xl font-display text-fg mt-2">Mi perfil</h1>
		<p class="text-sm text-mute mt-2 mb-8">Tu información visible para la comunidad y los proyectos.</p>
		<section id="notificaciones" class="mb-6 scroll-mt-24 space-y-3">
			<div class="flex items-center justify-between"><h2 class="eyebrow flex items-center gap-2"><Bell size={14} /> Notificaciones</h2>{#if notifications.length}<button type="button" onclick={() => notificationsApi.markAllRead().then(() => (notifications = notifications.map((item) => ({ ...item, read: true }))))} class="text-[10px] uppercase tracking-[0.12em] text-mute hover:text-signal">Marcar todas como leídas</button>{/if}</div>
			{#if notificationsLoading}<p class="text-sm text-mute">Cargando notificaciones...</p>
			{:else if notifications.filter(isProjectNotification).length === 0}<div class="border border-line bg-panel p-4 text-sm text-mute">No tenés notificaciones nuevas.</div>
			{:else}
				{#each notifications.filter(isProjectNotification) as notification}
					{@const application = applicationFrom(notification)}
					<div class={`border p-4 ${notification.read ? 'border-line bg-panel/60' : 'border-brand/40 bg-brand/10'}`}>
						<div class="flex items-start gap-3"><CheckCircle2 size={18} class="mt-0.5 shrink-0 text-brand" /><div class="min-w-0 flex-1"><p class="text-sm font-semibold text-fg">{notification.title}</p><p class="mt-1 text-xs leading-relaxed text-mute">{notification.message}</p>
							{#if application && notification.type.startsWith('PROJECT_APPLICATION:') && !notification.read}<div class="mt-3 flex gap-2"><button type="button" disabled={reviewing !== null} onclick={(event) => { event.stopPropagation(); review(notification, 'ACCEPTED') }} class="btn btn-primary text-xs">{reviewing === `${notification.id}:ACCEPTED` ? 'Aceptando...' : 'Aceptar'}</button><button type="button" disabled={reviewing !== null} onclick={(event) => { event.stopPropagation(); review(notification, 'REJECTED') }} class="btn text-xs"><X size={13} /> Rechazar</button></div>{/if}
						</div></div>
					</div>
				{/each}
			{/if}
		</section>
		<form onsubmit={(event) => { event.preventDefault(); save() }} class="glass-card space-y-5 p-5 sm:p-7">
			<div class="flex items-center gap-4">
				<div class="h-20 w-20 shrink-0 overflow-hidden rounded-full border border-line bg-signal/20 grid place-items-center text-2xl font-display text-signal">
					{#if auth.user?.avatarUrl}<img src={auth.user.avatarUrl} alt="Avatar de {auth.user.firstName}" class="h-full w-full object-cover" />{:else}{initials()}{/if}
				</div>
				<div><label class="btn btn-secondary cursor-pointer" for="profile-avatar">{uploading ? 'Subiendo...' : 'Cambiar avatar'}</label><input id="profile-avatar" type="file" accept="image/*" class="sr-only" onchange={uploadAvatar} disabled={uploading} /><p class="text-xs text-mute mt-2">JPG, PNG o WebP.</p></div>
			</div>
			<div><label class="label" for="profile-username">Nombre de usuario</label><input id="profile-username" bind:value={form.username} class="input w-full" pattern="[A-Za-z0-9_-]+" minlength="3" required /></div>
			<div><label class="label" for="profile-first">Nombre</label><input id="profile-first" bind:value={form.firstName} class="input w-full" required /></div>
			<div><label class="label" for="profile-phone">Teléfono</label><input id="profile-phone" bind:value={form.phone} class="input w-full" /></div>
			{#if message}<p class="text-xs text-signal">{message}</p>{/if}{#if error}<p class="text-xs text-rec">{error}</p>{/if}
			<button class="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Guardar perfil'}</button>
		</form>
	</div>
</div>
