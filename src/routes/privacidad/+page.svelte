// ≙ src/app/privacidad/page.jsx: markdown → HTML (marked + DOMPurify en
// cliente; crudo en SSR, mismo perfil que react-markdown).
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
	<title>Política de Privacidad — CursoX</title>
</svelte:head>

<div class="min-h-screen bg-night pt-32 pb-16">
	<div class="max-w-3xl mx-auto px-4">
		<h1 class="text-3xl font-light tracking-tight text-white mb-8">Política de Privacidad</h1>
		{#if data.content}
			<article class="article max-w-none !text-white/80">
				{@html renderMarkdown(data.content)}
			</article>
		{:else}
			<div class="flex flex-col items-center justify-center py-16 text-white/40">
				<p class="text-lg">Página no disponible</p>
				<p class="text-sm mt-2">El contenido de Política de Privacidad aún no ha sido configurado.</p>
			</div>
		{/if}
	</div>
</div>
