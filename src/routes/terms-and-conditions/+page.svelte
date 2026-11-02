// ≙ src/app/terms-and-conditions/page.jsx: markdown → HTML (marked +
// DOMPurify en cliente; crudo en SSR, mismo perfil que react-markdown).
<script>
	import { marked } from 'marked'
	import DOMPurify from 'dompurify'

	let { data } = $props()

	function renderMarkdown(content) {
		const html = marked.parse(content ?? '')
		return DOMPurify.isSupported ? DOMPurify.sanitize(html) : html
	}
</script>

<svelte:head>
	<title>Términos y Condiciones — CursoX</title>
</svelte:head>

<div class="min-h-screen bg-base pt-32 pb-16">
	<div class="max-w-3xl mx-auto px-4">
		<div class="mb-10">
			<p class="text-[10px] uppercase tracking-[0.3em] text-mute mb-2">Legal</p>
			<h1 class="text-3xl sm:text-4xl font-light tracking-tight text-fg">Términos y Condiciones</h1>
		</div>

		{#if data.content}
			<article class="article max-w-none">
				{@html renderMarkdown(data.content)}
			</article>
		{:else}
			<div class="flex flex-col items-center justify-center py-16">
				<p class="text-mute text-lg">Página no disponible</p>
				<p class="text-sm text-mute mt-2">El contenido aún no ha sido configurado.</p>
			</div>
		{/if}
	</div>
</div>
