// ≙ src/app/blog/page.jsx: listado de publicaciones con destacada.
<script>
	import { ArrowRight } from '@lucide/svelte'
	import { imgUrl } from '#lib/utils.js'

	let { data } = $props()

	function readTime(content) {
		const words = (content || '').trim().split(/\s+/).length
		return Math.max(2, Math.round(words / 200))
	}

	function formatDate(date) {
		if (!date) return ''
		return new Date(date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
	}

	const published = $derived(data.posts.filter((p) => p.published !== false))
	const featured = $derived(published.find((p) => p.featured) || published[0] || null)
	const rest = $derived(published.filter((p) => p.id !== featured?.id))
</script>

{#snippet meta(post)}
	<div class="flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-mute">
		<span class="tel">{formatDate(post.createdAt)}</span>
		<span>·</span>
		<span>{post.authorName || post.author || 'Equipo editorial'}</span>
		<span>·</span>
		<span class="tel">{readTime(post.content)} min de lectura</span>
	</div>
{/snippet}

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

<svelte:head>
	<title>Publicaciones — CursoX</title>
	<meta name="description" content="Ideas, experiencias y conocimiento compartido por la comunidad de CursoX." />
</svelte:head>

<div class="min-h-screen bg-base pb-16">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-4">
		<p class="eyebrow mb-2">Conocimiento compartido · Publicaciones</p>
		<h1 class="font-display font-semibold text-4xl sm:text-5xl tracking-tight text-fg">Ideas y experiencias</h1>
		{#if published.length > 0}
			<p class="font-mono text-[10px] uppercase tracking-[0.2em] text-mute mt-3 tel">{published.length} publicaciones</p>
		{/if}
	</div>

	{#if published.length === 0}
		<div class="max-w-7xl mx-auto px-4 py-16">
			<div class="border border-line bg-surface p-10 text-center rounded-2xl">
				<p class="font-mono text-xs uppercase tracking-[0.2em] text-mute">Aún no hay noticias publicadas</p>
				<p class="text-sm text-mute mt-2">Volvé pronto para leer las últimas novedades de CursoX.</p>
			</div>
		</div>
	{:else}
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			{#if featured}
				<a href={`/blog/${featured.slug}`} class="group grid md:grid-cols-2 border border-line bg-surface transition-colors hover:border-signal">
					<div class="relative aspect-[16/10] md:aspect-auto md:min-h-[360px] overflow-hidden bg-panel">
						{#if imgUrl(featured.coverImage)}
							<img src={imgUrl(featured.coverImage)} alt={featured.title} loading="lazy" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
						{:else}
							<div class="absolute inset-0 graticule flex items-center justify-center">
								<span class="font-mono text-[10px] uppercase tracking-[0.28em] text-mute">Sin imagen</span>
							</div>
						{/if}
						<span class="absolute top-3 left-3 font-mono text-[9px] uppercase tracking-[0.22em] bg-signal text-base px-2 py-1 rounded-full">★ Nota destacada</span>
					</div>
					<div class="p-6 sm:p-10 flex flex-col justify-center">
						{@render meta(featured)}
						<h2 class="mt-4 font-display font-semibold text-2xl sm:text-3xl lg:text-4xl tracking-tight text-fg leading-tight group-hover:text-signal transition-colors">
							{featured.title}
						</h2>
						{#if featured.excerpt}
							<p class="mt-4 text-sm sm:text-base leading-relaxed text-mute line-clamp-3">{featured.excerpt}</p>
						{/if}
						<div class="mt-5">{@render tags(featured.tags)}</div>
						<span class="mt-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-fg group-hover:text-signal transition-colors">
							Leer nota
							<ArrowRight class="w-3.5 h-3.5" />
						</span>
					</div>
				</a>
			{/if}

			{#if rest.length > 0}
				<div class="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each rest as post (post.id)}
						<a href={`/blog/${post.slug}`} class="group border border-line bg-surface flex flex-col transition-colors hover:border-signal">
							<div class="relative aspect-[16/10] overflow-hidden bg-panel">
								{#if imgUrl(post.coverImage)}
									<img src={imgUrl(post.coverImage)} alt={post.title} loading="lazy" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
								{:else}
									<div class="absolute inset-0 graticule"></div>
								{/if}
								{#if post.featured}
									<span class="absolute top-2.5 left-2.5 font-mono text-[9px] uppercase tracking-[0.2em] bg-signal text-base px-2 py-0.5 rounded-full">★ Destacado</span>
								{/if}
							</div>
							<div class="p-5 flex flex-col flex-1">
								{@render meta(post)}
								<h2 class="mt-3 font-display font-semibold text-lg tracking-tight text-fg leading-snug line-clamp-2 group-hover:text-signal transition-colors">{post.title}</h2>
								{#if post.excerpt}
									<p class="mt-2 text-sm text-mute leading-relaxed line-clamp-2 flex-1">{post.excerpt}</p>
								{/if}
								<div class="mt-4">{@render tags(post.tags)}</div>
							</div>
						</a>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>
