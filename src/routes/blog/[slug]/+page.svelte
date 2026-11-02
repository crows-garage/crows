// ≙ src/app/blog/[slug]/page.jsx: nota con markdown (marked + DOMPurify
// en cliente; en server pasa crudo, mismo comportamiento que rehype-raw).
<script>
	import { marked } from 'marked'
	import DOMPurify from 'dompurify'
	import { imgUrl } from '#lib/utils.js'

	let { data } = $props()

	function readTime(content) {
		const words = (content || '').trim().split(/\s+/).length
		return Math.max(2, Math.round(words / 200))
	}

	function formatDate(date) {
		if (!date) return ''
		return new Date(date).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
	}

	// Sanitiza solo donde hay DOM (browser); SSR pasa crudo como el original
	function renderMarkdown(content) {
		const html = marked.parse(content ?? '')
		return DOMPurify.isSupported ? DOMPurify.sanitize(html) : html
	}

	const tags = $derived(
		data.post.tags ? data.post.tags.split(',').map((t) => t.trim()).filter(Boolean) : []
	)
</script>

<svelte:head>
	<title>{data.post.title} — CursoX</title>
	<meta name="description" content={data.post.excerpt || data.post.title} />
</svelte:head>

<div class="min-h-screen bg-base pt-10 pb-20">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex flex-col lg:flex-row gap-12">
			<article class="flex-1 min-w-0">
				<!-- Cabecera de nota -->
				<header class="border border-line bg-surface p-5 sm:p-8 mb-8">
					<div class="flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-mute mb-5">
						<span class="tel">Publicado: {formatDate(data.post.createdAt)}</span>
						<span>·</span>
						<span>{data.post.authorName || data.post.author || 'Equipo editorial'}</span>
						<span>·</span>
						<span class="tel">{readTime(data.post.content)} min de lectura</span>
					</div>

					<h1 class="font-display font-semibold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-fg leading-[1.05]">
						{data.post.title}
					</h1>

					{#if tags.length > 0}
						<div class="mt-5 flex flex-wrap gap-2">
							{#each tags as tag}
								<span class="chip cursor-default !min-h-0 px-2.5 py-1 text-[10px]">{tag}</span>
							{/each}
						</div>
					{/if}
				</header>

				{#if data.post.coverImage}
					<div class="relative aspect-[16/9] overflow-hidden border border-line bg-panel mb-8">
						<img src={imgUrl(data.post.coverImage)} alt={data.post.title} loading="lazy" class="w-full h-full object-cover" />
					</div>
				{/if}

				<div class="article max-w-3xl">
					{@html renderMarkdown(data.post.content)}
				</div>

				<div class="mt-16 pt-8 border-t border-line">
					<a href="/blog" class="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-mute hover:text-signal transition-colors">
						← Volver a noticias
					</a>
				</div>
			</article>

			{#if data.otherPosts.length > 0}
				<aside class="lg:w-80 xl:w-96 flex-shrink-0">
					<div class="border border-line bg-surface p-6 lg:sticky lg:top-40">
						<h3 class="eyebrow mb-6">Más noticias</h3>
						<div class="space-y-5">
							{#each data.otherPosts.slice(0, 6) as p (p.id)}
								<a href={`/blog/${p.slug}`} class="group flex gap-4">
									<div class="w-16 h-16 flex-shrink-0 overflow-hidden border border-line bg-panel">
										{#if imgUrl(p.coverImage)}
											<img src={imgUrl(p.coverImage)} alt={p.title} loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
										{:else}
											<div class="w-full h-full graticule"></div>
										{/if}
									</div>
									<div class="flex-1 min-w-0">
										{#if p.featured}
											<span class="font-mono text-[9px] uppercase tracking-[0.18em] text-signal">★ Destacado</span>
										{/if}
										<h4 class="font-display font-semibold text-sm text-fg group-hover:text-signal transition-colors line-clamp-2 leading-snug mt-0.5">{p.title}</h4>
										<p class="font-mono text-[10px] uppercase tracking-[0.14em] text-mute mt-1.5 tel">{formatDate(p.createdAt)}</p>
									</div>
								</a>
							{/each}
						</div>
						{#if data.otherPosts.length > 6}
							<a href="/blog" class="mt-6 inline-block font-mono text-[10px] uppercase tracking-[0.18em] text-mute hover:text-signal transition-colors">
								Ver todas las noticias →
							</a>
						{/if}
					</div>
				</aside>
			{/if}
		</div>
	</div>
</div>
