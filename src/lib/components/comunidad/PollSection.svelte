// ≙ PollSection (local en comunidad/page.jsx): votar (miembros) o ver
// resultados (visitantes / post-voto).
<script>
	import { Loader2, BarChart3 } from '@lucide/svelte'
	import { communityApi } from '#lib/api/community.js'

	let { post, canVote, onVoted = null } = $props()

	let selected = $state([])
	let voting = $state(false)
	let pollError = $state('')
	let results = $state(null)

	const poll = $derived(post.poll)

	// Reiniciar estado al cambiar de post
	$effect(() => {
		void post.id
		selected = []
		voting = false
		pollError = ''
		results = null
	})

	const closed = $derived(poll?.closesAt ? new Date(poll.closesAt) <= new Date() : false)
	const totalVotes = $derived(results?.totalVotes ?? poll?._count?.votes ?? 0)
	const options = $derived(results?.options ?? (poll?.options || []).map((o) => ({ ...o, votes: o._count?.votes ?? 0 })))
	const showResults = $derived(results !== null || !canVote || closed)

	function toggleOption(optionId) {
		if (poll.allowMultiple) {
			selected = selected.includes(optionId) ? selected.filter((id) => id !== optionId) : [...selected, optionId]
		} else {
			selected = [optionId]
		}
	}

	async function handleVote() {
		if (selected.length === 0) return
		voting = true
		pollError = ''
		try {
			const res = await communityApi.votePoll(post.id, selected)
			results = res
			onVoted?.()
		} catch (err) {
			const status = err?.response?.status
			const msg = err?.response?.data?.message || err?.response?.data?.error
			if (status === 409) {
				// Ya votó: mostrarle los resultados
				try {
					const res = await communityApi.getPoll(post.id)
					results = res
				} catch {
					/* noop */
				}
			} else {
				pollError = msg || 'No se pudo registrar tu voto'
			}
		} finally {
			voting = false
		}
	}
</script>

{#if poll}
	<div class="mt-4 border border-line bg-base p-4">
		<p class="text-sm font-medium text-fg flex items-center gap-2">
			<BarChart3 size={15} class="text-signal flex-shrink-0" />
			{poll.question}
		</p>
		<p class="text-[10px] uppercase tracking-[0.2em] text-mute mt-1">
			{poll.allowMultiple ? 'elegí una o más opciones' : 'elegí una opción'}
			{closed ? ' · encuesta cerrada' : ''}
		</p>

		{#if showResults}
			<div class="mt-3 space-y-2">
				{#each options as option (option.id)}
					{@const pct = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0}
					<div>
						<div class="flex items-center justify-between text-xs">
							<span class="text-fg/90">{option.text}</span>
							<span class="text-mute font-mono">{option.votes} · {pct}%</span>
						</div>
						<div class="h-1.5 bg-line/40 mt-1 overflow-hidden">
							<div class="h-full bg-signal" style={`width: ${pct}%`}></div>
						</div>
					</div>
				{/each}
				<p class="text-[10px] text-mute pt-1">{totalVotes} voto{totalVotes === 1 ? '' : 's'} totales</p>
			</div>
		{:else}
			<div class="mt-3 space-y-2">
				{#each options as option (option.id)}
					<button
						type="button"
						onclick={() => toggleOption(option.id)}
						class={`w-full text-left px-3 py-2 border text-sm transition-colors ${
							selected.includes(option.id)
								? 'border-signal bg-signal/10 text-fg'
								: 'border-line text-fg/80 hover:border-fg/40'
						}`}
					>
						{option.text}
					</button>
				{/each}
				<button
					type="button"
					onclick={handleVote}
					disabled={voting || selected.length === 0}
					class="w-full px-4 py-2 bg-fg text-base text-xs font-medium hover:opacity-90 transition-colors disabled:opacity-50"
				>
					{#if voting}<Loader2 size={14} class="animate-spin mx-auto" />{:else}Votar{/if}
				</button>
				{#if pollError}<p class="text-xs text-rec">{pollError}</p>{/if}
			</div>
		{/if}
	</div>
{/if}
