<script>
	import { goto } from '$app/navigation'
	import { page } from '$app/state'
	import { ArrowRight, Eye, EyeOff, Loader2, Shield } from '@lucide/svelte'
	import { auth } from '#lib/stores/auth.svelte.js'

	let email = $state('')
	let password = $state('')
	let showPassword = $state(false)
	let error = $state('')
	let loading = $state(false)
	const redirectTo = $derived(page.url.searchParams.get('redirect') || '/comunidad')

	async function handleSubmit(event) {
		event.preventDefault()
		loading = true
		error = ''
		const result = await auth.login(email.trim(), password)
		if (result.success) goto(redirectTo)
		else error = result.error || 'Email o contraseña incorrectos.'
		loading = false
	}
</script>

<svelte:head><title>Ingresar — Crow Projects</title></svelte:head>

<main class="grid min-h-screen bg-surface text-fg lg:grid-cols-[1.08fr_0.92fr]">
	<section class="relative isolate hidden overflow-hidden bg-night p-8 text-white sm:p-12 lg:flex lg:min-h-screen lg:flex-col lg:justify-between lg:p-[clamp(2rem,5vw,5.5rem)]">
		<div class="absolute inset-0 -z-10 graticule opacity-20"></div>
		<div class="absolute left-1/2 top-1/2 -z-10 h-[min(30vw,360px)] w-[min(30vw,360px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand/40 shadow-[0_0_80px_rgba(44,167,152,0.18)]"></div>
		<div class="absolute left-1/2 top-1/2 -z-10 h-[min(18vw,220px)] w-[min(18vw,220px)] -translate-x-1/2 -translate-y-1/2 rotate-45 border border-brand/50"></div>
		<div><img src="/ligth.svg" alt="Crow Projects" class="h-24 w-24 object-contain drop-shadow-[0_0_28px_rgba(44,167,152,0.28)]" /><p class="mt-6 font-mono text-[10px] uppercase tracking-[0.28em] text-brand">Crow Projects</p></div>
		<div class="relative max-w-xl"><p class="font-mono text-[10px] uppercase tracking-[0.28em] text-brand">Comunidad · proyectos · colaboración</p><h1 class="mt-5 max-w-lg font-display text-5xl font-semibold leading-[0.98] tracking-tight xl:text-6xl">Las ideas encuentran a su gente.</h1><p class="mt-6 max-w-md text-lg leading-relaxed text-white/65">Ingresá para participar en proyectos, compartir conocimiento y construir algo nuevo con la comunidad.</p></div>
		<div class="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/50"><span class="h-2 w-2 rounded-full bg-brand shadow-[0_0_14px_var(--c-brand)]"></span> Espacio activo de colaboración</div>
	</section>

	<section class="flex min-h-screen items-center justify-center p-5 sm:p-8 lg:p-14">
		<div class="w-full max-w-md">
			<div class="mb-10 lg:hidden"><img src="/dark.svg" alt="Crow Projects" class="h-12 w-12 object-contain" /><p class="mt-4 font-mono text-[10px] uppercase tracking-[0.28em] text-signal">Crow Projects</p></div>
			<div class="mb-8"><p class="font-mono text-[10px] uppercase tracking-[0.28em] text-signal">Acceso</p><h2 class="mt-3 font-display text-4xl font-semibold tracking-tight">Ingresá</h2><p class="mt-3 text-sm leading-relaxed text-mute">Volvé a la comunidad y continuá tus proyectos.</p></div>
			<form onsubmit={handleSubmit} class="space-y-5" novalidate>
				{#if error}<p class="border border-rec/30 bg-rec/10 px-3 py-2 text-xs text-rec" role="alert">{error}</p>{/if}
				<label class="block"><span class="mb-2 block text-xs font-medium text-fg/70">Email</span><input type="email" bind:value={email} autocomplete="email" placeholder="tu@email.com" required class="input w-full" /></label>
				<label class="block"><span class="mb-2 block text-xs font-medium text-fg/70">Contraseña</span><span class="relative block"><input type={showPassword ? 'text' : 'password'} bind:value={password} autocomplete="current-password" placeholder="••••••••" required class="input w-full pr-10" /><button type="button" onclick={() => (showPassword = !showPassword)} class="absolute right-3 top-1/2 -translate-y-1/2 text-mute hover:text-fg" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{#if showPassword}<EyeOff size={16} />{:else}<Eye size={16} />{/if}</button></span></label>
				<button type="submit" disabled={loading} class="btn btn-primary flex w-full items-center justify-center gap-2">{#if loading}<Loader2 size={16} class="animate-spin" />Ingresando...{:else}Ingresar<ArrowRight size={16} />{/if}</button>
			</form>
			<div class="mt-8 flex items-center gap-2 border-t border-line pt-5 text-[11px] text-mute"><Shield size={14} class="shrink-0" /> Acceso seguro a tu espacio de Crow Projects.</div>
			<p class="mt-8 text-center text-xs text-mute">¿No tenés cuenta? <a href={`/register?redirect=${encodeURIComponent(redirectTo)}`} class="font-medium text-fg underline underline-offset-4 hover:text-signal">Crear cuenta</a></p>
		</div>
	</section>
</main>
