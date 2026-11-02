// ≙ src/app/pedido/success/page.jsx: confirmación de pedido/pago.
// Lee orderId|external_reference, collection_status|status, payment_id|collection_id.
<script>
	import { page } from '$app/state'
	import { CheckCircle2, Loader2, ArrowRight, AlertCircle } from '@lucide/svelte'
	import { BASE } from '#lib/api/client.js'

	let order = $state(null)
	let loading = $state(true)

	const orderId = $derived(page.url.searchParams.get('orderId') || page.url.searchParams.get('external_reference'))
	const paymentStatus = $derived(page.url.searchParams.get('collection_status') || page.url.searchParams.get('status'))
	const paymentId = $derived(page.url.searchParams.get('payment_id') || page.url.searchParams.get('collection_id'))

	$effect(() => {
		if (!orderId) {
			const timer = setTimeout(() => (window.location.href = '/'), 3000)
			loading = false
			return () => clearTimeout(timer)
		}

		loading = true
		fetch(`${BASE}/payments/status/${orderId}`)
			.then((response) => (response.ok ? response.json() : null))
			.then((data) => {
				if (data) order = data
			})
			.catch((err) => console.error('Error fetching order:', err))
			.finally(() => (loading = false))
	})

	const isPaid = $derived(order?.paymentStatus === 'paid' || paymentStatus === 'approved')
</script>

{#if loading}
	<div class="max-w-xl mx-auto px-4 py-20 text-center">
		<Loader2 size={40} class="animate-spin mx-auto text-mute" />
		<p class="text-xs text-mute mt-3">Cargando...</p>
	</div>
{:else}
	<div class="max-w-xl mx-auto px-4 py-12 text-center">
		<div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 bg-panel">
			{#if isPaid}
				<CheckCircle2 size={36} class="text-fg" />
			{:else}
				<AlertCircle size={36} class="text-mute" />
			{/if}
		</div>

		<h1 class="text-xl font-light text-fg mb-2">{isPaid ? '¡Pago confirmado!' : '¡Pedido recibido!'}</h1>

		<p class="text-sm text-mute mb-6">
			{isPaid
				? 'Tu pago fue procesado correctamente. Te contactaremos a la brevedad.'
				: 'Tu pedido fue registrado. Te contactaremos para coordinar el pago.'}
		</p>

		<div class="bg-panel rounded-lg p-4 text-left mb-6">
			<div class="flex justify-between items-center mb-3">
				<span class="text-xs text-mute">N° de pedido</span>
				<span class="text-sm font-medium text-fg">#{order?.id || orderId}</span>
			</div>
			{#if order?.total}
				<div class="flex justify-between items-center">
					<span class="text-xs text-mute">Total</span>
					<span class="text-sm font-medium text-fg">${parseFloat(order.total).toLocaleString('es-AR')}</span>
				</div>
			{/if}
			{#if paymentId}
				<div class="mt-3 pt-3 border-t border-line">
					<span class="text-xs text-mute">ID de transacción</span>
					<p class="text-xs text-mute font-mono mt-1 break-all">{paymentId}</p>
				</div>
			{/if}
		</div>

		<a href="/" class="inline-flex items-center justify-center gap-2 w-full bg-fg text-base py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-colors">
			Volver a la tienda <ArrowRight size={14} />
		</a>
	</div>
{/if}
