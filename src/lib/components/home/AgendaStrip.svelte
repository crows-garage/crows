<script>
	import { MapPin } from '@lucide/svelte'

	let { events = [] } = $props()

	function formatEventDate(date) {
		if (!date) return { day: '--', month: '---' }
		const d = new Date(date)
		return {
			day: String(d.getDate()).padStart(2, '0'),
			month: d.toLocaleDateString('es-AR', { month: 'short' }).toUpperCase().replace('.', '')
		}
	}

	const upcoming = $derived(
		events
			.filter((e) => e.status === 'PUBLISHED' && new Date(e.eventDate) >= new Date())
			.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
			.slice(0, 4)
	)
</script>

{#if upcoming.length}
	<section class="py-16 sm:py-20 border-t border-line">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="mb-8">
				<p class="eyebrow mb-2">06 · Agenda · Oportunidades para participar</p>
				<h2 class="font-display font-semibold text-2xl sm:text-3xl tracking-tight text-fg">Eventos, concursos y encuentros</h2>
			</div>
			<div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{#each upcoming as event}
					{@const { day, month } = formatEventDate(event.eventDate)}
					<div class="border border-line bg-surface p-5 flex flex-col min-w-[260px] sm:min-w-0 transition-colors hover:border-signal">
						<div class="flex items-start justify-between gap-3">
							<div class="flex items-center gap-3">
								<div class="text-center border border-line px-2.5 py-1.5">
									<p class="font-mono text-xl font-semibold tel text-fg leading-none">{day}</p>
									<p class="font-mono text-[9px] uppercase tracking-[0.2em] text-mute mt-1">{month}</p>
								</div>
								<div>
									<h3 class="font-display font-semibold text-base tracking-tight text-fg leading-snug line-clamp-2">{event.title}</h3>
									{#if event.location}
										<p class="mt-1.5 flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-mute">
											<MapPin class="w-3 h-3" />
											{event.location}
										</p>
									{/if}
								</div>
							</div>
						</div>
						{#if event.description}
							<p class="mt-3 text-sm text-mute leading-relaxed line-clamp-2">{event.description}</p>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</section>
{/if}
