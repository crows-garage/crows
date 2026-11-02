<script>
	import { CalendarDays, Clock, MapPin, Users, Loader2, CalendarCheck, Ban, ChevronDown, ChevronRight } from '@lucide/svelte'
	import { communityApi } from '#lib/api/community.js'
	import { auth } from '#lib/stores/auth.svelte.js'

	const TYPE_LABELS = {
		APPOINTMENT: 'Turnos',
		CLASS: 'Clases',
		EVENT: 'Eventos'
	}

	const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

	const addDays = (date, days) => {
		const d = new Date(date)
		d.setDate(d.getDate() + days)
		return d
	}
	const toISO = (date) => date.toISOString().slice(0, 10)

	function formatSlotDate(slot) {
		try {
			return new Date(slot.date).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })
		} catch {
			return ''
		}
	}

	let turneros = $state([])
	let loading = $state(true)
	let error = $state('')

	let expandedId = $state(null)
	let slots = $state([])
	let slotsLoading = $state(false)
	let weekStart = $state(toISO(new Date()))

	let mine = $state(null)
	let mineLoading = $state(false)
	let busySlotId = $state(null)
	let actionError = $state('')

	const user = $derived(auth.user)

	async function loadTurneros() {
		try {
			const list = await communityApi.getTurneros()
			turneros = list || []
		} catch (err) {
			error = 'No se pudo cargar la agenda de cupos.'
		} finally {
			loading = false
		}
	}

	async function loadMine() {
		if (!user) {
			mine = null
			return
		}
		mineLoading = true
		try {
			const data = await communityApi.myReservations()
			mine = data
		} catch {
			mine = null
		} finally {
			mineLoading = false
		}
	}

	// ≙ useEffect([user]) en loadMine
	$effect(() => {
		void user
		loadMine()
	})

	// ≙ useEffect on mount
	$effect(() => {
		loadTurneros()
	})

	async function loadSlots(turneroId) {
		slotsLoading = true
		try {
			const from = weekStart
			const to = toISO(addDays(new Date(weekStart), 6))
			const data = await communityApi.getSlots(turneroId, from, to)
			slots = data || []
			actionError = ''
		} catch (err) {
			actionError = 'No se pudieron cargar los cupos de esta semana.'
		} finally {
			slotsLoading = false
		}
	}

	function toggleExpand(turneroId) {
		if (expandedId === turneroId) {
			expandedId = null
			return
		}
		expandedId = turneroId
		slots = []
		setTimeout(() => loadSlots(turneroId), 0)
	}

	function changeWeek(dir) {
		const base = new Date(weekStart)
		const next = toISO(addDays(base, dir * 7))
		weekStart = next
		if (expandedId) setTimeout(() => loadSlots(expandedId), 0)
	}

	async function handleReserve(turneroId, slot) {
		if (!user) return
		busySlotId = slot.id
		actionError = ''
		try {
			await communityApi.reserve(turneroId, slot.id)
			await Promise.all([loadSlots(turneroId), loadMine()])
		} catch (err) {
			const msg = err.response?.data?.message || err.response?.data?.error
			if (err.response?.status === 403 && /asociado/i.test(msg || '')) {
				actionError = msg
			} else {
				actionError = msg || 'No se pudo reservar el cupo.'
			}
		} finally {
			busySlotId = null
		}
	}

	async function handleCancel(reservation) {
		if (!window.confirm('¿Cancelar esta reserva?')) return
		actionError = ''
		try {
			await communityApi.cancel(reservation.turneroId, reservation.id)
			if (expandedId) await loadSlots(expandedId)
			await loadMine()
		} catch (err) {
			actionError = err.response?.data?.message || 'No se pudo cancelar la reserva.'
		}
	}

	// Slots agrupados por día
	const slotsByDay = $derived.by(() => {
		const byDay = {}
		slots.forEach((slot) => {
			const key = toISO(new Date(slot.date))
			if (!byDay[key]) byDay[key] = []
			byDay[key].push(slot)
		})
		return byDay
	})

	const upcoming = $derived(mine?.upcoming || [])
</script>

<svelte:head>
	<title>Turnos y Cupos — CursoX</title>
	<meta name="description" content="Reservá tu lugar en clases, jornadas y atenciones de la institución." />
</svelte:head>

<div class="min-h-screen pt-20 pb-16 bg-base">
	<div class="max-w-5xl mx-auto px-4">
		<div class="text-center mb-8">
			<p class="text-[10px] uppercase tracking-[0.3em] mb-2 text-mute">Agenda</p>
			<h1 class="text-2xl sm:text-3xl font-light tracking-tight text-fg">Turnos y Cupos</h1>
			<p class="text-sm text-mute mt-2">Reservá tu lugar en clases, jornadas y atenciones de la institución.</p>
		</div>

		<!-- Mis reservas -->
		{#if user}
			<div class="bg-panel border border-line p-5 mb-6">
				<p class="text-[10px] uppercase tracking-[0.3em] text-mute mb-3">Mis reservas</p>
				{#if mineLoading}
					<div class="flex justify-center py-3">
						<Loader2 size={16} class="animate-spin text-mute" />
					</div>
				{:else if upcoming.length === 0}
					<p class="text-sm text-mute">No tenés reservas próximas.</p>
				{:else}
					<div class="space-y-2">
						{#each upcoming as r (r.id)}
							<div class="flex items-center gap-3 border border-line bg-base px-3 py-2.5">
								<CalendarCheck size={16} class="text-signal flex-shrink-0" />
								<div class="flex-1 min-w-0">
									<p class="text-sm text-fg truncate">
										{r.turnero?.name || 'Reserva'}
										<span class="text-mute font-mono text-xs ml-2">{formatSlotDate(r.slot)} · {r.slot?.startTime}</span>
									</p>
									{#if r.turnero?.location}
										<p class="text-[11px] text-mute flex items-center gap-1">
											<MapPin size={10} /> {r.turnero.location}
										</p>
									{/if}
								</div>
								<button
									type="button"
									onclick={() => handleCancel(r)}
									class="flex items-center gap-1 text-[11px] text-mute hover:text-rec transition-colors flex-shrink-0"
								>
									<Ban size={11} /> Cancelar
								</button>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/if}

		{#if actionError}
			<div class="mb-6 border border-rec/30 bg-rec/10 text-rec px-3 py-2 text-xs">{actionError}</div>
		{/if}

		{#if loading}
			<div class="flex justify-center py-16">
				<Loader2 size={24} class="animate-spin text-mute" />
			</div>
		{:else if error}
			<div class="text-center py-16 text-sm text-mute">{error}</div>
		{:else if turneros.length === 0}
			<div class="text-center py-16">
				<CalendarDays size={36} class="mx-auto text-mute/50 mb-3" />
				<p class="text-sm text-mute">Todavía no hay agendas de cupos publicadas</p>
			</div>
		{:else}
			<div class="space-y-4">
				{#each turneros as turnero (turnero.id)}
					{@const isExpanded = expandedId === turnero.id}
					{@const typeLabel = TYPE_LABELS[turnero.type] || 'Cupos'}
					<article class="bg-panel border border-line">
						<button
							type="button"
							onclick={() => toggleExpand(turnero.id)}
							class="w-full text-left p-5 flex items-start justify-between gap-3"
						>
							<div class="flex items-start gap-3 min-w-0">
								<span class="text-[9px] font-semibold uppercase tracking-[0.2em] bg-fg text-base px-2 py-0.5 flex-shrink-0 mt-1">
									{typeLabel}
								</span>
								<div class="min-w-0">
									<h2 class="text-base font-medium text-fg leading-snug">{turnero.name}</h2>
									{#if turnero.description}
										<p class="text-xs text-mute mt-1 line-clamp-2">{turnero.description}</p>
									{/if}
									<p class="text-[11px] text-mute mt-1.5 flex items-center gap-3 flex-wrap">
										<span class="flex items-center gap-1"><Clock size={10} /> {turnero.slotDuration} min</span>
										<span class="flex items-center gap-1"><Users size={10} /> cupos: {turnero.maxPerSlot}</span>
										{#if turnero.location}
											<span class="flex items-center gap-1"><MapPin size={10} /> {turnero.location}</span>
										{/if}
									</p>
								</div>
							</div>
							<span class="text-mute flex-shrink-0 mt-1">
								{#if isExpanded}<ChevronDown size={18} />{:else}<ChevronRight size={18} />{/if}
							</span>
						</button>

						{#if isExpanded}
							<div class="border-t border-line p-5">
								<!-- Navegación de semanas -->
								<div class="flex items-center justify-between mb-4">
									<button
										type="button"
										onclick={() => changeWeek(-1)}
										class="px-3 py-1.5 border border-line text-xs text-fg hover:bg-base transition-colors"
									>
										← Semana anterior
									</button>
									<p class="text-[10px] uppercase tracking-[0.2em] text-mute">
										{new Date(weekStart).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
										{' — '}
										{addDays(new Date(weekStart), 6).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
									</p>
									<button
										type="button"
										onclick={() => changeWeek(1)}
										class="px-3 py-1.5 border border-line text-xs text-fg hover:bg-base transition-colors"
									>
										Semana siguiente →
									</button>
								</div>

								{#if slotsLoading}
									<div class="flex justify-center py-8">
										<Loader2 size={20} class="animate-spin text-mute" />
									</div>
								{:else if Object.keys(slotsByDay).length === 0}
									<p class="text-sm text-mute text-center py-6">No hay cupos en esta semana. Probá con la siguiente.</p>
								{:else}
									<div class="space-y-4">
										{#each Object.entries(slotsByDay) as [day, daySlots] (day)}
											<div>
												<p class="text-[10px] uppercase tracking-[0.2em] text-mute mb-2">
													{DAY_NAMES[new Date(day).getDay()]} {new Date(day).getDate()}
												</p>
												<div class="flex flex-wrap gap-2">
													{#each daySlots as slot (slot.id)}
														{@const free = !slot.isPast && slot.isAvailable && slot.availableSpots > 0}
														{@const full = !slot.isPast && slot.isAvailable && slot.availableSpots === 0}
														<button
															type="button"
															disabled={!free || !user || busySlotId === slot.id}
															onclick={() => handleReserve(turnero.id, slot)}
															class={`px-3 py-2 border text-xs font-mono transition-colors ${
																slot.isPast
																	? 'border-line text-mute/40 cursor-default'
																	: full
																		? 'border-line text-mute/50 cursor-default'
																		: free
																			? user
																				? 'border-signal/60 text-fg hover:bg-signal hover:text-base'
																				: 'border-line text-fg/70 cursor-default'
																			: 'border-line text-mute/40 cursor-default'
															}`}
															title={slot.isPast ? 'Pasado' : full ? 'Completo' : user ? `Reservar ${slot.startTime}–${slot.endTime} (${slot.availableSpots} disponibles)` : 'Iniciá sesión para reservar'}
														>
															{slot.startTime}
															<span class="ml-1.5 font-sans text-[10px]">
																{slot.isPast ? '·' : full ? '✓' : `(${slot.availableSpots})`}
															</span>
														</button>
													{/each}
												</div>
											</div>
										{/each}
									</div>
								{/if}

								{#if !user}
									<p class="text-xs text-mute mt-4 border-t border-line pt-3">
										<a href="/login?redirect=/turnos" class="text-fg underline">Iniciá sesión</a>
										o <a href="/register?redirect=/turnos" class="text-fg underline">solicitá tu afiliación</a>
										para reservar un cupo.
									</p>
								{/if}
							</div>
						{/if}
					</article>
				{/each}
			</div>
		{/if}
	</div>
</div>
