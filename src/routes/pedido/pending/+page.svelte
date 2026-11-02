// ≙ src/app/pedido/pending/page.jsx: pago pendiente con polling cada 5s.
// El original redirige a /order/success (ruta inexistente): acá usa
// /pedido/success, la página de confirmación real del flujo.
<script>
	import { page } from '$app/state'
	import { Loader2, Clock, RefreshCw, ArrowLeft } from '@lucide/svelte'
	import { BASE } from '#lib/api/client.js'

	let order = $state(null)
	let loading = $state(true)
	let refreshing = $state(false)

	const orderId = $derived(page.url.searchParams.get('orderId') || page.url.searchParams.get('external_reference'))

	async function fetchOrder() {
		try {
			const response = await fetch(`${BASE}/payments/status/${orderId}`)
			if (response.ok) {
				const data = await response.json()
				order = data
				if (data.paymentStatus === 'paid' || data.status === 'CONFIRMED') {
					window.location.href = `/pedido/success?orderId=${orderId}`
				}
			}
		} catch (err) {
			console.error('Error fetching order:', err)
		} finally {
			loading = false
		}
	}

	$effect(() => {
		if (!orderId) {
			loading = false
			return
		}
		loading = true
		fetchOrder()

		const interval = setInterval(() => {
			if (order?.paymentStatus !== 'paid' && order?.status !== 'CONFIRMED') {
				fetchOrder()
			}
		}, 5000)

		return () => clearInterval(interval)
	})

	async function handleRefresh() {
		if (!orderId) return
		refreshing = true
		await fetchOrder()
		refreshing = false
	}
</script>

{#if loading}
	<div class="max-w-xl mx-auto px-4 py-20 text-center">
		<Loader2 size={40} class="animate-spin mx-auto text-mute" />
		<p class="text-xs text-mute mt-3">Cargando...</p>
	</div>
{:else if !orderId}
	<div class="max-w-md mx-auto px-4 py-12 text-center">
		<div class="w-16 h-16 rounded-full bg-panel flex items-center justify-center mx-auto mb-5">
			<Clock size={32} class="text-mute" />
		</div>
		<h1 class="text-xl font-light text-fg mb-2">Pago pendiente</h1>
		<p class="text-sm text-mute mb-6">No se encontró información del pedido.</p>
		<a href="/" class="inline-flex items-center gap-2 text-mute text-sm hover:text-fg transition-colors">
			<ArrowLeft size={14} /> Volver a la tienda
		</a>
	</div>
{:else}
	<div class="max-w-md mx-auto px-4 py-12 text-center">
		<div class="w-16 h-16 rounded-full bg-panel flex items-center justify-center mx-auto mb-5">
			<Clock size={32} class="text-mute" />
		</div>

		<h1 class="text-xl font-light text-fg mb-2">Pago pendiente</h1>
		<p class="text-sm text-mute mb-6">Tu pago está siendo procesado. Te notificaremos cuando se confirme.</p>

		<div class="bg-panel rounded-lg p-4 text-left mb-6">
			<div class="flex justify-between items-center mb-3">
				<span class="text-xs text-mute">N° de pedido</span>
				<span class="text-sm font-medium text-fg">#{order.id}</span>
			</div>
			{#if order.total}
				<div class="flex justify-between items-center mb-3">
					<span class="text-xs text-mute">Total</span>
					<span class="text-sm font-medium text-fg">${parseFloat(order.total).toLocaleString('es-AR')}</span>
				</div>
			{/if}
			<div class="flex justify-between items-center pt-3 border-t border-line">
				<span class="text-xs text-mute">Estado</span>
				<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-panel text-mute">
					<Clock size={10} /> Pendiente
				</span>
			</div>
		</div>

		<button
			type="button"
			onclick={handleRefresh}
			disabled={refreshing}
			class="flex items-center justify-center gap-2 w-full py-2.5 border border-line text-fg/85 rounded-lg text-sm font-medium hover:bg-panel transition-colors mb-3 disabled:opacity-50"
		>
			{#if refreshing}<Loader2 size={14} class="animate-spin" />{:else}<RefreshCw size={14} />{/if}
			{refreshing ? 'Actualizando...' : 'Consultar estado'}
		</button>

		<a href="/" class="inline-flex items-center justify-center gap-1 text-sm text-mute hover:text-fg/85 transition-colors">
			<ArrowLeft size={14} /> Volver a la tienda
		</a>

		<div class="mt-5 p-3 bg-panel rounded-lg">
			<p class="text-xs text-mute">💡 La página se actualiza automáticamente cada 5 segundos.</p>
		</div>
	</div>
{/if}
