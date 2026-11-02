// ≙ src/app/auth/callback.js: callback de Google OAuth. El original
// redirige a /dashboard tras éxito (ruta que no existe en el sitio, mismo
// comportamiento acá — ver R5 del plan).
<script>
	import { page } from '$app/state'
	import { onMount } from 'svelte'

	const success = $derived(page.url.searchParams.get('login_success'))
	const error = $derived(page.url.searchParams.get('error'))

	onMount(() => {
		if (success === 'true') {
			// Pequeña pausa para que las cookies se establezcan
			setTimeout(() => {
				window.location.href = '/dashboard'
			}, 1500)
		} else if (error) {
			window.location.href = `/login?error=${error}`
		} else {
			window.location.href = '/login?error=unknown'
		}
	})
</script>

<div class="min-h-screen flex items-center justify-center bg-panel">
	<div class="text-center">
		{#if success === 'true'}
			<div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-signal/10">
				<svg class="h-6 w-6 text-signal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
				</svg>
			</div>
			<h3 class="mt-3 text-lg font-medium text-fg">¡Inicio de sesión exitoso!</h3>
			<p class="mt-2 text-sm text-mute">Redirigiendo...</p>
		{:else}
			<div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rec/10">
				<svg class="h-6 w-6 text-rec" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</div>
			<h3 class="mt-3 text-lg font-medium text-fg">Error de autenticación</h3>
			<p class="mt-2 text-sm text-mute">Redirigiendo al login...</p>
		{/if}
	</div>
</div>
