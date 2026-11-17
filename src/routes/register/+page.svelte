<script>
	import { goto } from '$app/navigation'
	import { page } from '$app/state'
	import { Eye, EyeOff, CheckCircle2 } from '@lucide/svelte'
	import { auth } from '#lib/stores/auth.svelte.js'
	import { ORG_SLUG, STORE_SLUG } from '#lib/api/client.js'

	let username = $state('')
	let email = $state('')
	let password = $state('')
	let showPassword = $state(false)
	let loading = $state(false)
	let error = $state('')
	let done = $state(false)
	const redirectTo = $derived(page.url.searchParams.get('redirect') || '/')

	async function handleSubmit(event) {
		event.preventDefault()
		error = ''

		const normalizedUsername = username.trim().toLowerCase()
		const normalizedEmail = email.trim().toLowerCase()
		if (!/^[a-z0-9_-]{3,80}$/.test(normalizedUsername)) {
			error = 'El nombre de usuario debe tener entre 3 y 80 caracteres y solo puede usar letras, números, guion y guion bajo.'
			return
		}
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
			error = 'Ingresá un email válido.'
			return
		}
		if (password.length < 8) {
			error = 'La contraseña debe tener al menos 8 caracteres.'
			return
		}

		loading = true
		const result = await auth.register({
			firstName: normalizedUsername,
			lastName: '',
			username: normalizedUsername,
			email: normalizedEmail,
			password,
			organizationSlug: ORG_SLUG || STORE_SLUG
		})
		loading = false

		if (!result.success) {
			error = result.error || 'No se pudo crear la cuenta.'
			return
		}

		if (result.application) {
			done = true
			return
		}
		goto(page.url.searchParams.get('redirect') || '/')
	}
</script>

<svelte:head>
	<title>Crear cuenta — Crow Projects</title>
</svelte:head>

<div class="min-h-screen pt-20 pb-16 bg-base">
	<div class="max-w-md mx-auto px-4">
		<div class="text-center mb-8">
			<p class="text-[10px] uppercase tracking-[0.3em] mb-2 text-mute">Comunidad</p>
			<h1 class="text-2xl sm:text-3xl font-display font-semibold tracking-tight text-fg">Crear cuenta</h1>
			<p class="text-sm text-mute mt-2">Registrate para participar en Crow Projects.</p>
		</div>

		{#if done}
			<div class="bg-panel border border-line rounded-xs p-6 text-center">
				<CheckCircle2 size={32} class="mx-auto text-signal mb-3" />
				<h2 class="text-lg font-medium text-fg">Cuenta creada</h2>
				<p class="text-sm text-mute mt-2">Tu solicitud para participar en la comunidad quedó pendiente de aprobación.</p>
		<a href={`/login?redirect=${encodeURIComponent(redirectTo)}`} class="inline-block mt-5 px-4 py-2 bg-signal text-base text-sm font-medium hover:bg-brand">Iniciar sesión</a>
			</div>
		{:else}
			<form onsubmit={handleSubmit} class="space-y-4">
				<div>
					<label class="block text-xs font-medium text-fg/70 mb-1" for="register-username">Nombre de usuario</label>
					<input id="register-username" bind:value={username} type="text" autocomplete="username" class="w-full px-3 py-2 border rounded-xs border-line bg-base text-fg text-sm focus:outline-none focus:border-signal transition-colors" placeholder="tu_usuario" required minlength="3" maxlength="80" />
				</div>

				<div>
					<label class="block text-xs font-medium text-fg/70 mb-1" for="register-email">Email</label>
					<input id="register-email" bind:value={email} type="email" autocomplete="email" class="w-full px-3 py-2 border rounded-xs border-line bg-base text-fg text-sm focus:outline-none focus:border-signal transition-colors" placeholder="tu@email.com" required />
				</div>

				<div>
					<label class="block text-xs font-medium text-fg/70 mb-1" for="register-password">Contraseña</label>
					<div class="relative">
						<input id="register-password" bind:value={password} type={showPassword ? 'text' : 'password'} autocomplete="new-password" class="w-full px-3 py-2 pr-10 border rounded-xs border-line bg-base text-fg text-sm focus:outline-none focus:border-signal transition-colors" placeholder="Mínimo 8 caracteres" required minlength="8" />
						<button type="button" onclick={() => (showPassword = !showPassword)} class="absolute right-2 top-1/2 -translate-y-1/2 text-mute hover:text-fg" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
							{#if showPassword}<EyeOff size={16} />{:else}<Eye size={16} />{/if}
						</button>
					</div>
				</div>

				{#if error}<p class="border border-rec/30 bg-rec/10 text-rec px-3 py-2 text-xs">{error}</p>{/if}
				<button type="submit" disabled={loading} class="w-full py-2.5 bg-signal text-base text-sm font-medium hover:bg-brand transition-colors disabled:opacity-50">{loading ? 'Creando cuenta...' : 'Crear cuenta'}</button>
			</form>

			<p class="text-center text-xs text-mute mt-6">¿Ya tenés cuenta? <a href={`/login?redirect=${encodeURIComponent(redirectTo)}`} class="text-fg underline hover:no-underline">Iniciá sesión</a></p>
		{/if}
	</div>
</div>
