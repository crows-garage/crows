// ≙ src/app/orders/page.jsx: listado de pedidos del cliente logueado.
<script>
	import { goto } from '$app/navigation'
	import { Loader2, Package } from '@lucide/svelte'
	import { auth } from '#lib/stores/auth.svelte.js'
	import { authApi } from '#lib/api/auth.js'

	const STATUS = {
		CONFIRMED: { label: 'CONFIRMADO', cls: 'bg-signal/10 text-signal border border-signal/30' },
		PENDING: { label: 'EN PROCESO', cls: 'bg-amber/10 text-amber border border-amber/30' },
		CANCELLED: { label: 'CANCELADO', cls: 'bg-rec/10 text-rec border border-rec/30' }
	}

	let orders = $state([])
	let loadingOrders = $state(true)

	// ≙ useEffect: redirect a login si no hay usuario
	$effect(() => {
		if (!auth.loading && !auth.user) {
			goto('/login?redirect=/orders')
		}
	})

	// ≙ useEffect([user]): cargar pedidos
	$effect(() => {
		if (!auth.user) return
		authApi
			.getOrders()
			.then((data) => (orders = data.orders || []))
			.catch(console.error)
			.finally(() => (loadingOrders = false))
	})
</script>

{#if auth.loading || !auth.user}
	<!-- ≙ return null del original -->
{:else}
	<div class="max-w-4xl mx-auto px-4 py-12">
		<p class="eyebrow mb-2">ARCHIVO · EXPEDIENTES DE COMPRA</p>
		<h1 class="font-display text-3xl font-semibold tracking-tight mb-8">Mis Pedidos</h1>

		{#if loadingOrders}
			<div class="panel p-10 flex justify-center py-20"><Loader2 class="animate-spin text-mute" /></div>
		{:else if orders.length === 0}
			<div class="panel p-10 text-center py-20">
				<Package size={40} class="mx-auto mb-3 text-mute" />
				<p class="text-mute mb-1">No tienes pedidos todavía</p>
				<p class="text-xs text-mute/70 mb-4">No tenés pedidos registrados.</p>
				<a href="/productos" class="btn btn-primary inline-flex">Empezar a comprar</a>
			</div>
		{:else}
			<div class="space-y-4">
				{#each orders as order (order.id)}
					<a href={`/pedido/success?orderId=${order.id}`} class="panel block p-5 hover:border-signal/40 transition-colors">
						<div class="flex justify-between items-start gap-3">
							<div>
								<span class="font-mono text-sm font-semibold">Pedido #{order.id}</span>
								<p class="text-sm text-mute mt-0.5">{new Date(order.createdAt).toLocaleDateString('es-AR')}</p>
							</div>
							<span class={`text-[10px] font-mono tracking-wider px-2.5 py-1 rounded-full ${STATUS[order.status]?.cls || 'bg-panel text-mute border rounded-xs border-line'}`}>
								{STATUS[order.status]?.label || order.status}
							</span>
						</div>
						<div class="mt-3 pt-3 border-t border-line flex justify-between text-sm">
							<span class="text-mute">{order.orderitem?.length || 0} producto(s)</span>
							<span class="font-mono font-semibold text-signal">${order.grandTotal?.toLocaleString('es-AR')}</span>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>
{/if}
