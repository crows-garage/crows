<script>
	import { goto } from '$app/navigation'
	import { auth } from '#lib/stores/auth.svelte.js'

	let email = $state('')
	let password = $state('')
	let error = $state('')
	let loading = $state(false)

	async function handleSubmit(e) {
		e.preventDefault()
		loading = true
		error = ''

		try {
			await auth.login(email, password)
			goto('/')
		} catch (err) {
			error = err.message || 'Error al iniciar sesión'
		} finally {
			loading = false
		}
	}
</script>

<svelte:head>
	<title>Iniciar sesión — CursoX</title>
</svelte:head>

<div class="min-h-screen pt-20 pb-16 bg-base">
	<div class="max-w-md mx-auto px-4">
		<div class="text-center mb-8">
			<p class="text-[10px] uppercase tracking-[0.3em] mb-2 text-mute">Acceso</p>
			<h1 class="text-2xl sm:text-3xl font-light tracking-tight text-fg">Iniciar sesión</h1>
		</div>

		<form onsubmit={handleSubmit} class="space-y-4">
			<div>
				<label class="block text-xs font-medium text-black/70 mb-1" for="login-email">Email</label>
				<input
					id="login-email"
					type="email"
					bind:value={email}
					class="w-full px-3 py-2 border border-line bg-base text-fg text-sm focus:outline-none focus:border-signal transition-colors"
					placeholder="tu@email.com"
					required
				/>
			</div>

			<div>
				<label class="block text-xs font-medium text-black/70 mb-1" for="login-password">Contraseña</label>
				<input
					id="login-password"
					type="password"
					bind:value={password}
					class="w-full px-3 py-2 border border-line bg-base text-fg text-sm focus:outline-none focus:border-signal transition-colors"
					placeholder="••••••••"
					required
				/>
			</div>

			{#if error}
				<p class="text-mute text-xs">{error}</p>
			{/if}

			<button
				type="submit"
				disabled={loading}
				class="w-full py-2.5 bg-fg text-base text-sm font-medium hover:bg-black/80 transition-colors disabled:opacity-50"
			>
				{loading ? 'Cargando...' : 'Ingresar'}
			</button>
		</form>

		<p class="text-center text-xs text-mute mt-6">
			¿No tienes cuenta?
			<a href="/register" class="text-fg underline hover:no-underline transition-colors">Regístrate</a>
		</p>
	</div>
</div>
