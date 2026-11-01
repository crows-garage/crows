// ≙ src/app/not-found.jsx: página 404.
<script>
	import { SearchX } from '@lucide/svelte'
	import { page } from '$app/state'

	const is404 = $derived(page.status === 404)
</script>

<svelte:head>
	<title>404 — CursoX</title>
</svelte:head>

<div class="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center bg-base">
	<div class="border border-line bg-surface p-8 sm:p-12 max-md:w-full max-w-md w-full rounded-2xl shadow-sm">
		<div class="w-14 h-14 rounded-full bg-signal/10 text-signal flex items-center justify-center mx-auto mb-5">
			<SearchX class="w-7 h-7" />
		</div>
		<p class="eyebrow mb-3">Página no encontrada · Error {page.status}</p>
		<h1 class="font-display font-semibold text-6xl sm:text-7xl tracking-tight text-fg">
			{page.status}
		</h1>
		<p class="text-sm text-mute leading-relaxed mt-3">
			{#if is404}
				La página que buscás no existe o fue retirada.
			{:else}
				Ocurrió un error inesperado.
			{/if}
		</p>

		<div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
			<a href="/" class="btn btn-primary">Volver al inicio</a>
			<a href="/productos" class="btn">Ver cursos</a>
		</div>
	</div>
</div>
