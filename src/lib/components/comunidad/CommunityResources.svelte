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
			<div class="mt-5 divide-y divide-line">
				{#each latestPosts as post}
					<a href={`/blog/${post.slug}`} class="group flex gap-3 py-3 first:pt-0 last:pb-0">
						<div class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-base text-signal"><FileText size={15} /></div>
						<div class="min-w-0"><p class="text-[10px] uppercase tracking-[0.14em] text-mute">{formatDate(post.createdAt)}</p><h3 class="mt-1 line-clamp-2 text-sm font-medium text-fg group-hover:text-signal">{post.title}</h3></div>
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
			<div class="mt-5 space-y-3">
				{#each upcoming as event}
					<div class="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-3"><div class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand text-center text-[9px] font-semibold uppercase leading-tight text-night">{formatDate(event.eventDate)}</div><div class="min-w-0"><h3 class="line-clamp-2 text-sm font-medium">{event.title}</h3>{#if event.location}<p class="mt-1 flex items-center gap-1 text-[10px] text-white/60"><MapPin size={11} /> {event.location}</p>{/if}</div></div>
				{/each}
			</div>
		{:else}<p class="mt-5 text-sm text-white/60">No hay eventos próximos publicados.</p>{/if}
	</div>
</section>
