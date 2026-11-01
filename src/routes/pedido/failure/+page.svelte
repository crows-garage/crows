// ≙ src/app/pedido/failure/page.jsx: pago rechazado con retry.
<script>
	import { page } from '$app/state'
	import { Loader2, XCircle, RefreshCw, AlertTriangle, ArrowLeft, CreditCard } from '@lucide/svelte'
	import { BASE } from '#lib/api/client.js'

	let order = $state(null)
	let loading = $state(true)
	let retrying = $state(false)

	const orderId = $derived(page.url.searchParams.get('orderId') || page.url.searchParams.get('external_reference'))
	const paymentStatus = $derived(page.url.searchParams.get('collection_status') || page.url.searchParams.get('status'))
	const paymentId = $derived(page.url.searchParams.get('payment_id') || page.url.searchParams.get('collection_id'))

	$effect(() => {
		if (!orderId) {
			loading = false
			return
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

	async function handleRetry() {
		if (!orderId) {
			window.location.href = '/checkout'
			return
		}

		retrying = true
		try {
			const response = await fetch(`${BASE}/payments/status/${orderId}`)
			if (response.ok) {
				const orderData = await response.json()
				if (orderData.status === 'CANCELLED') {
					window.location.href = '/checkout'
				} else {
					const mpResponse = await fetch(`${BASE}/payments/create-preference`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ orderId: parseInt(orderId) })
					})
					if (mpResponse.ok) {
						const mpData = await mpResponse.json()
						window.location.href = mpData.initPoint || mpData.sandboxInitPoint
					} else {
						window.location.href = '/checkout'
					}
				}
			} else {
				window.location.href = '/checkout'
			}
		} catch (err) {
			console.error('Error retrying payment:', err)
			window.location.href = '/checkout'
		} finally {
			retrying = false
		}
	}
</script>

{#if loading}
	<div class="max-w-xl mx-auto px-4 py-20 text-center">
		<Loader2 size={40} class="animate-spin mx-auto text-gray-400" />
		<p class="text-xs text-gray-500 mt-3">Cargando...</p>
	</div>
{:else if !orderId}
	<div class="max-w-md mx-auto px-4 py-12 text-center">
		<div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
			<XCircle size={32} class="text-gray-500" />
		</div>
		<h1 class="text-xl font-light text-gray-900 mb-2">Pago no procesado</h1>
		<p class="text-sm text-gray-500 mb-6">No se encontró información del pago.</p>
		<a href="/cart" class="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
			<ArrowLeft size={14} /> Volver al carrito
		</a>
	</div>
{:else}
	<div class="max-w-md mx-auto px-4 py-12">
		<div class="text-center mb-5">
			<div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
				<XCircle size={32} class="text-gray-500" />
			</div>
			<h1 class="text-xl font-light text-gray-900 mb-2">Pago rechazado</h1>
			<p class="text-sm text-gray-500">El pago no pudo procesarse. Intentá nuevamente.</p>
		</div>

		<div class="bg-gray-50 rounded-lg p-4 mb-5">
			<div class="flex justify-between items-center mb-3">
				<span class="text-xs text-gray-500">N° de pedido</span>
				<span class="text-sm font-medium text-gray-900">#{orderId}</span>
			</div>
			{#if order?.total}
				<div class="flex justify-between items-center mb-3">
					<span class="text-xs text-gray-500">Total</span>
					<span class="text-sm font-medium text-gray-900">${parseFloat(order.total).toLocaleString('es-AR')}</span>
				</div>
			{/if}
			{#if paymentId}
				<div class="pt-3 border-t border-gray-200">
					<span class="text-xs text-gray-500">ID de transacción</span>
					<p class="text-xs text-gray-500 font-mono mt-1 break-all">{paymentId}</p>
				</div>
			{/if}
			<div class="mt-3 flex items-center gap-2 text-amber-600 bg-amber-50 p-2.5 rounded-lg">
				<AlertTriangle size={14} />
				<p class="text-xs">El pago fue rechazado. Intentá con otro método.</p>
			</div>
		</div>

		<div class="space-y-2">
			<button
				type="button"
				onclick={handleRetry}
				disabled={retrying}
				class="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
			>
				{#if retrying}<Loader2 size={14} class="animate-spin" />{:else}<RefreshCw size={14} />{/if}
				{retrying ? 'Procesando...' : 'Intentar nuevamente'}
			</button>

			<a href="/checkout" class="flex items-center justify-center gap-2 w-full py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
				<CreditCard size={14} /> Elegir otro método
			</a>
		</div>
	</div>
{/if}
