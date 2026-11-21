<script>
	import { ArrowRight, CalendarDays, FileText, MapPin } from '@lucide/svelte'

	let { posts = [], events = [] } = $props()

	const upcoming = $derived(
		events
			.filter((event) => event.status === 'PUBLISHED' && new Date(event.eventDate) >= new Date())
			.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
			.slice(0, 3)
	)

	const latestPosts = $derived(posts.slice(0, 3))

	function formatDate(value) {
		if (!value) return ''
		return new Date(value).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }).replace('.', '')
	}
</script>

<section class="mt-16 grid gap-6 border-t border-line pt-10 lg:grid-cols-2">
	<div class="rounded-2xl border border-line bg-panel p-5 sm:p-6">
		<div class="flex items-start justify-between gap-4">
			<div>
				<p class="eyebrow !text-signal">Lecturas</p>
				<h2 class="mt-2 font-display text-2xl font-semibold tracking-tight text-fg">Blog de la comunidad</h2>
			</div>
			<a href="/blog" class="mt-1 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-mute hover:text-signal">Ver todo <ArrowRight size={13} /></a>
		</div>
		{#if latestPosts.length}
			<div class="mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 [scrollbar-width:thin] lg:grid lg:grid-cols-3 lg:overflow-visible">
				{#each latestPosts as post}
					<a href={`/blog/${post.slug}`} class="group min-w-[220px] snap-start rounded-xl border border-line bg-base/50 p-3 lg:min-w-0">
						<div class="grid h-9 w-9 place-items-center rounded-xl bg-panel text-signal"><FileText size={15} /></div>
						<p class="mt-4 text-[10px] uppercase tracking-[0.14em] text-mute">{formatDate(post.createdAt)}</p><h3 class="mt-1 line-clamp-2 text-sm font-medium text-fg group-hover:text-signal">{post.title}</h3>{#if post.excerpt || post.description}<p class="mt-2 line-clamp-3 text-xs leading-relaxed text-mute">{post.excerpt || post.description}</p>{/if}
					</a>
				{/each}
			</div>
		{:else}<p class="mt-5 text-sm text-mute">Todavía no hay publicaciones.</p>{/if}
	</div>

	<div class="rounded-2xl border border-line bg-night p-5 text-white sm:p-6">
		<div class="flex items-start justify-between gap-4">
			<div><p class="eyebrow !text-brand">Agenda</p><h2 class="mt-2 font-display text-2xl font-semibold tracking-tight">Próximos eventos</h2></div>
			<a href="/turnos" class="mt-1 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-white/60 hover:text-brand">Ver agenda <ArrowRight size={13} /></a>
		</div>
		{#if upcoming.length}
			<div class="mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 [scrollbar-width:thin] lg:grid lg:grid-cols-3 lg:overflow-visible">
				{#each upcoming as event}
					<div class="min-w-[220px] snap-start rounded-xl border border-white/10 bg-white/5 p-3 lg:min-w-0"><div class="grid h-10 w-10 place-items-center rounded-xl bg-brand text-center text-[9px] font-semibold uppercase leading-tight text-night">{formatDate(event.eventDate)}</div><h3 class="mt-4 line-clamp-2 text-sm font-medium">{event.title}</h3>{#if event.location}<p class="mt-1 flex items-center gap-1 text-[10px] text-white/60"><MapPin size={11} /> {event.location}</p>{/if}{#if event.description}<p class="mt-2 line-clamp-3 text-xs leading-relaxed text-white/60">{event.description}</p>{/if}</div>
				{/each}
			</div>
		{:else}<p class="mt-5 text-sm text-white/60">No hay eventos próximos publicados.</p>{/if}
	</div>
</section>
