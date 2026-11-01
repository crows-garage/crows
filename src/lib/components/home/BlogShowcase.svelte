// ≙ src/components/home/BlogShowcase.jsx: noticias destacadas + tarjetas.
<script>
	import { ArrowRight } from '@lucide/svelte'
	import { imgUrl } from '#lib/utils.js'

	let { posts = [] } = $props()

	function readTime(content) {
		const words = (content || '').trim().split(/\s+/).length
		return Math.max(2, Math.round(words / 200))
	}

	function formatDate(date) {
		if (!date) return ''
		return new Date(date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
	}

	const featured = $derived(posts.find((p) => p.featured) || posts[0])
	const rest = $derived(posts.filter((p) => p.id !== featured?.id).slice(0, 3))
</script>

{#snippet tags(tags)}
	{#if tags}
		{@const list = tags.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 3)}
		{#if list.length}
			<div class="flex flex-wrap gap-1.5">
				{#each list as tag}
					<span class="chip cursor-default !min-h-0 px-2 py-0.5 text-[9px]">{tag}</span>
				{/each}
			</div>
		{/if}
	{/if}
{/snippet}

{#if posts.length}
	<section id="noticias-section" class="py-16 sm:py-20 lg:py-24 border-t border-line">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
				<div>
					<p class="eyebrow mb-2">Conocimiento compartido · Publicaciones</p>
					<h2 class="font-display font-semibold text-2xl sm:text-3xl lg:text-4xl tracking-tight text-fg">Ideas, experiencias y recursos</h2>
				</div>
				<a href="/blog" class="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-mute hover:text-signal transition-colors">
					Ver todas las publicaciones
					<ArrowRight class="w-3.5 h-3.5" />
				</a>
			</div>

			<!-- Destacado -->
			<a href={`/blog/${featured.slug}`} class="group grid md:grid-cols-2 border border-line bg-surface transition-colors hover:border-signal">
				<div class="relative aspect-[16/10] md:aspect-auto md:min-h-[320px] overflow-hidden bg-panel">
					{#if imgUrl(featured.coverImage)}
						<img src={imgUrl(featured.coverImage)} alt={featured.title} class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
					{:else}
						<div class="absolute inset-0 graticule flex items-center justify-center">
							<span class="font-mono text-[10px] uppercase tracking-[0.28em] text-mute">Sin imagen</span>
						</div>
					{/if}
					<span class="absolute top-3 left-3 font-mono text-[9px] uppercase tracking-[0.22em] bg-signal text-night px-2 py-1">★ Destacado</span>
				</div>

				<div class="p-6 sm:p-8 flex flex-col justify-center">
					<p class="eyebrow mb-3">Noticias · Novedades de la asociación</p>
					<h3 class="font-display font-semibold text-2xl sm:text-3xl tracking-tight text-fg leading-tight group-hover:text-signal transition-colors">{featured.title}</h3>
					{#if featured.excerpt}
						<p class="mt-3 text-sm sm:text-base leading-relaxed text-mute line-clamp-3">{featured.excerpt}</p>
					{/if}
					<div class="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[10px] uppercase tracking-[0.18em] text-mute">
						<span class="tel">{formatDate(featured.createdAt)}</span>
						<span>·</span>
						<span>{featured.authorName || featured.author || 'Equipo editorial'}</span>
						<span>·</span>
						<span class="tel">{readTime(featured.content)} min de lectura</span>
					</div>
					<div class="mt-4">{@render tags(featured.tags)}</div>
					<span class="mt-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-fg group-hover:text-signal transition-colors">
						Leer nota
						<ArrowRight class="w-3.5 h-3.5" />
					</span>
				</div>
			</a>

			{#if rest.length > 0}
				<div class="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each rest as post}
						<a href={`/blog/${post.slug}`} class="group border border-line bg-surface flex flex-col transition-colors hover:border-signal">
							<div class="relative aspect-[16/10] overflow-hidden bg-panel">
								{#if imgUrl(post.coverImage)}
									<img src={imgUrl(post.coverImage)} alt={post.title} class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
								{:else}
									<div class="absolute inset-0 graticule"></div>
								{/if}
							</div>
							<div class="p-5 flex flex-col flex-1">
								<div class="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-mute">
									<span class="tel">{formatDate(post.createdAt)}</span>
									<span>·</span>
									<span>{post.authorName || post.author || 'Equipo editorial'}</span>
								</div>
								<h3 class="mt-2.5 font-display font-semibold text-lg tracking-tight text-fg leading-snug line-clamp-2 group-hover:text-signal transition-colors">{post.title}</h3>
								{#if post.excerpt}
									<p class="mt-2 text-sm text-mute leading-relaxed line-clamp-2 flex-1">{post.excerpt}</p>
								{/if}
								<div class="mt-4 flex items-center justify-between gap-2">
									{@render tags(post.tags)}
									<span class="font-mono text-[9px] uppercase tracking-[0.18em] text-mute tel shrink-0">{readTime(post.content)} min</span>
								</div>
							</div>
						</a>
					{/each}
				</div>
			{/if}
		</div>
	</section>
{/if}
