<script>
	import { goto } from '$app/navigation'
	import { page } from '$app/state'
	import { CheckCircle2, Eye, EyeOff, Loader2 } from '@lucide/svelte'
	import { auth } from '#lib/stores/auth.svelte.js'
	import { ORG_SLUG, STORE_SLUG } from '#lib/api/client.js'

	let username = $state('')
	let email = $state('')
	let password = $state('')
	let showPassword = $state(false)
	let loading = $state(false)
	let error = $state('')
	let done = $state(false)
	const redirectTo = $derived(page.url.searchParams.get('redirect') || '/comunidad')

	async function handleSubmit(event) {
		event.preventDefault()
		error = ''
		const normalizedUsername = username.trim().toLowerCase()
		const normalizedEmail = email.trim().toLowerCase()
		if (!/^[a-z0-9_-]{3,80}$/.test(normalizedUsername)) return (error = 'El usuario debe tener entre 3 y 80 caracteres y solo puede usar letras, números, guion y guion bajo.')
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return (error = 'Ingresá un email válido.')
		if (password.length < 8) return (error = 'La contraseña debe tener al menos 8 caracteres.')
		loading = true
		const result = await auth.register({ firstName: normalizedUsername, lastName: '', username: normalizedUsername, email: normalizedEmail, password, organizationSlug: ORG_SLUG || STORE_SLUG })
		loading = false
		if (!result.success) return (error = result.error || 'No se pudo crear la cuenta.')
		if (result.application) done = true
		else goto(redirectTo)
	}
</script>

<svelte:head><title>Crear cuenta — Crow Projects</title></svelte:head>

<main class="grid min-h-screen bg-surface text-fg lg:grid-cols-[1.08fr_0.92fr]">
	<section class="relative isolate hidden overflow-hidden bg-night p-8 text-white sm:p-12 lg:flex lg:min-h-screen lg:flex-col lg:justify-between lg:p-[clamp(2rem,5vw,5.5rem)]">
		<div class="absolute inset-0 -z-10 graticule opacity-20"></div>
		<div class="absolute left-1/2 top-1/2 -z-10 h-[min(30vw,360px)] w-[min(30vw,360px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand/40 shadow-[0_0_80px_rgba(44,167,152,0.18)]"></div>
		<div class="absolute left-1/2 top-1/2 -z-10 h-[min(18vw,220px)] w-[min(18vw,220px)] -translate-x-1/2 -translate-y-1/2 rotate-45 border border-brand/50"></div>
		<div><img src="/ligth.svg" alt="Crow Projects" class="h-24 w-24 object-contain drop-shadow-[0_0_28px_rgba(44,167,152,0.28)]" /><p class="mt-6 font-mono text-[10px] uppercase tracking-[0.28em] text-brand">Crow Projects</p></div>
		<div class="relative max-w-xl"><p class="font-mono text-[10px] uppercase tracking-[0.28em] text-brand">Tu próxima colaboración empieza acá</p><h1 class="mt-5 max-w-lg font-display text-5xl font-semibold leading-[0.98] tracking-tight xl:text-6xl">Hacé lugar para una idea nueva.</h1><p class="mt-6 max-w-md text-lg leading-relaxed text-white/65">Creá tu cuenta, descubrí proyectos y encontrá personas con quienes hacerlos realidad.</p></div>
		<div class="font-mono text-[10px] uppercase tracking-[0.16em] text-white/50">Una comunidad para aprender, conectar y hacer.</div>
	</section>

	<section class="flex min-h-screen items-center justify-center p-5 sm:p-8 lg:p-14">
		<div class="w-full max-w-md">
			<div class="mb-10 lg:hidden"><img src="/dark.svg" alt="Crow Projects" class="h-12 w-12 object-contain" /><p class="mt-4 font-mono text-[10px] uppercase tracking-[0.28em] text-signal">Crow Projects</p></div>
			{#if done}
				<div class="border border-brand/40 bg-brand/10 p-7 text-center sm:p-9"><CheckCircle2 size={42} class="mx-auto text-brand" /><p class="mt-5 font-mono text-[10px] uppercase tracking-[0.28em] text-brand">Cuenta creada</p><h2 class="mt-3 font-display text-3xl font-semibold">Solicitud enviada</h2><p class="mt-4 text-sm leading-relaxed text-mute">Tu solicitud para participar en la comunidad quedó pendiente de aprobación. Mientras tanto, podés recorrer Crow Projects.</p><a href="/comunidad" class="btn btn-primary mt-7 inline-flex">Ir a la comunidad</a></div>
			{:else}
				<div class="mb-8"><p class="font-mono text-[10px] uppercase tracking-[0.28em] text-signal">Registro</p><h2 class="mt-3 font-display text-4xl font-semibold tracking-tight">Crear cuenta</h2><p class="mt-3 text-sm leading-relaxed text-mute">Registrate para participar en Crow Projects.</p></div>
				<form onsubmit={handleSubmit} class="space-y-5" novalidate>
					{#if error}<p class="border border-rec/30 bg-rec/10 px-3 py-2 text-xs text-rec" role="alert">{error}</p>{/if}
					<label class="block"><span class="mb-2 block text-xs font-medium text-fg/70">Nombre de usuario</span><input bind:value={username} type="text" autocomplete="username" placeholder="tu_usuario" required class="input w-full" /></label>
					<label class="block"><span class="mb-2 block text-xs font-medium text-fg/70">Email</span><input bind:value={email} type="email" autocomplete="email" placeholder="tu@email.com" required class="input w-full" /></label>
					<label class="block"><span class="mb-2 block text-xs font-medium text-fg/70">Contraseña</span><span class="relative block"><input bind:value={password} type={showPassword ? 'text' : 'password'} autocomplete="new-password" placeholder="Mínimo 8 caracteres" required class="input w-full pr-10" /><button type="button" onclick={() => (showPassword = !showPassword)} class="absolute right-3 top-1/2 -translate-y-1/2 text-mute hover:text-fg" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{#if showPassword}<EyeOff size={16} />{:else}<Eye size={16} />{/if}</button></span></label>
					<button type="submit" disabled={loading} class="btn btn-primary flex w-full items-center justify-center gap-2">{#if loading}<Loader2 size={16} class="animate-spin" />Creando cuenta...{:else}Crear cuenta{/if}</button>
				</form>
			{/if}
			{#if !done}<p class="mt-8 text-center text-xs text-mute">¿Ya tenés cuenta? <a href={`/login?redirect=${encodeURIComponent(redirectTo)}`} class="font-medium text-fg underline underline-offset-4 hover:text-signal">Ingresar</a></p>{/if}
		</div>
	</section>
</main>
