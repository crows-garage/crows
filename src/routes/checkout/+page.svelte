// ≙ src/app/checkout/page.jsx: wizard 4 pasos (Datos → Entrega → Pago →
// Confirmar), cupones, creación de orden y redirecciones MP/Nave.
<script>
	import { goto } from '$app/navigation'
	import { cart, cartItems, cartHydrated, selectTotal, selectStoreSlug } from '#lib/stores/cart.svelte.js'
	import { checkoutApi } from '#lib/api/checkout.js'
	import { request } from '#lib/api/client.js'
	import {
		ArrowLeft, Loader2, Truck, Store, Banknote,
		CreditCard, Smartphone, Building, Phone, MapPin, Mail,
		User, MessageSquare, AlertTriangle, Ticket, X
	} from '@lucide/svelte'

	const items = $derived($cartItems)
	const total = $derived($selectTotal)
	const storeSlug = $derived($selectStoreSlug)

	const PAYMENT_METHODS = [
		{ id: 'CASH', label: 'Efectivo', icon: Banknote, description: 'Pagás al recibir' },
		{ id: 'MERCADOPAGO', label: 'Mercado Pago', icon: CreditCard, description: 'Tarjeta o dinero en cuenta' },
		{ id: 'NAVE', label: 'Nave', icon: Smartphone, description: 'QR o link de pago' },
		{ id: 'TRANSFER', label: 'Transferencia', icon: Building, description: 'CBU/Alias' }
	]

	const DEFAULT_CONFIG = {
		delivery: true,
		takeaway: true,
		paymentMethods: ['CASH', 'MERCADOPAGO'],
		deliveryCost: 1500,
		freeShippingMinTotal: 15000
	}

	let step = $state(0)
	let loading = $state(false)
	let loadingConfig = $state(true)
	let error = $state('')
	let storeConfig = $state(DEFAULT_CONFIG)
	let form = $state({
		customerName: '',
		customerPhone: '',
		customerEmail: '',
		customerAddress: '',
		modalidad: 'DELIVERY',
		paymentMethod: 'CASH',
		notes: ''
	})

	let couponCode = $state('')
	let couponDiscount = $state(0)
	let couponType = $state(null)
	let couponError = $state('')
	let validatingCoupon = $state(false)
	let appliedCoupon = $state(null)

	// ≙ useEffect([storeSlug]): config de tienda
	$effect(() => {
		if (!storeSlug) return
		loadingConfig = true
		checkoutApi
			.getConfig(storeSlug)
			.then((config) => {
				if (config) {
					storeConfig = { ...DEFAULT_CONFIG, ...config }
					if (config.delivery === false && config.takeaway !== false) {
						form = { ...form, modalidad: 'TAKEAWAY' }
					}
				}
			})
			.catch((err) => console.error('Error loading store config:', err))
			.finally(() => (loadingConfig = false))
	})

	// ≙ useEffect: sin items → /cart (espera a hidratar el carrito persistido).
	// orderCreated evita que el clearCart() posterior a crear la orden
	// redirija al carrito en lugar de /pedido/success (§2.2 del plan).
	let orderCreated = false

	$effect(() => {
		if (!$cartHydrated) return
		if (orderCreated) return
		if (!loadingConfig && items.length === 0) goto('/cart')
	})

	const deliveryCost = $derived(storeConfig?.deliveryCost ?? 1500)
	const freeShippingMinTotal = $derived(storeConfig?.freeShippingMinTotal ?? 15000)
	const isDeliveryFree = $derived(form.modalidad === 'DELIVERY' && total >= freeShippingMinTotal)
	const shippingCost = $derived(form.modalidad === 'DELIVERY' && !isDeliveryFree ? deliveryCost : 0)
	const finalShippingCost = $derived(couponType === 'FREE_SHIPPING' ? 0 : shippingCost)
	const subtotal = $derived(total)
	const discount = $derived(couponDiscount)
	const finalTotal = $derived(subtotal - discount + finalShippingCost)

	function validateStep(currentStep) {
		if (currentStep === 0) {
			if (!form.customerName.trim()) return 'Ingresá tu nombre'
			if (!form.customerPhone.trim() || form.customerPhone.replace(/\D/g, '').length < 8)
				return 'Teléfono inválido (mínimo 8 dígitos)'
			if (!form.customerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail))
				return 'Ingresá un email válido'
		}
		if (currentStep === 1) {
			if (form.modalidad === 'DELIVERY' && !form.customerAddress.trim())
				return 'Ingresá la dirección de entrega'
		}
		return null
	}

	const validateAll = () => validateStep(0) || validateStep(1)

	function handleNext() {
		const err = validateStep(step)
		if (err) return (error = err)
		error = ''
		step = step + 1
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	async function handleApplyCoupon() {
		if (!couponCode.trim()) return
		validatingCoupon = true
		couponError = ''
		couponDiscount = 0
		couponType = null
		appliedCoupon = null
		try {
			const result = await request(`/stores/${storeSlug}/coupons/validate`, {
				method: 'POST',
				body: JSON.stringify({
					code: couponCode.trim(),
					subtotal: total,
					items: items.map((item) => ({
						productId: item.productId,
						categoryId: item.product?.categoryId,
						brandId: item.product?.brandId,
						labelIds: item.product?.labelIds || [],
						collectionIds: item.product?.collectionIds || []
					}))
				})
			})
			couponDiscount = result.coupon.discount
			couponType = result.coupon.type
			appliedCoupon = result.coupon
		} catch (err) {
			couponError = err?.response?.data?.error || 'Cupón inválido'
		} finally {
			validatingCoupon = false
		}
	}

	function handleRemoveCoupon() {
		couponCode = ''
		couponDiscount = 0
		couponType = null
		couponError = ''
		appliedCoupon = null
	}

	async function handleSubmit() {
		const err = validateAll()
		if (err) return (error = err)
		loading = true
		error = ''
		try {
			const orderData = {
				customerName: form.customerName.trim(),
				customerPhone: form.customerPhone.trim(),
				customerEmail: form.customerEmail?.trim() || undefined,
				customerAddress: form.modalidad === 'DELIVERY' ? form.customerAddress.trim() : undefined,
				modalidad: form.modalidad.toUpperCase(),
				paymentMethod: form.paymentMethod,
				notes: form.notes?.trim() || undefined,
				couponCode: appliedCoupon?.code || undefined,
				items: items.map((i) => ({
					productId: i.productId,
					variantId: i.variant?.id ?? null,
					quantity: i.quantity
				}))
			}
			const result = await checkoutApi.createOrder(storeSlug, orderData)
			const order = result.order
			orderCreated = true
			cart.clearCart()
			if (form.paymentMethod === 'MERCADOPAGO') {
				const mp = await checkoutApi.createMercadoPagoPreference(order.id)
				window.location.href = mp.initPoint || mp.sandboxInitPoint
			} else if (form.paymentMethod === 'NAVE') {
				const nave = await checkoutApi.createNaveIntention(order.id)
				window.location.href = nave.checkout_url
			} else {
				goto(`/pedido/success?orderId=${order.id}`)
			}
		} catch (err) {
			error = err?.response?.data?.error || 'Error al crear el pedido'
			loading = false
		}
	}

	const enabledPaymentMethods = $derived(storeConfig?.paymentMethods || ['CASH', 'MERCADOPAGO'])
	const filteredMethods = $derived(PAYMENT_METHODS.filter((m) => enabledPaymentMethods.includes(m.id)))
</script>

{#if loadingConfig}
	<div class="max-w-2xl mx-auto px-4 py-20 text-center pt-20">
		<Loader2 size={32} class="animate-spin mx-auto text-mute" />
		<p class="text-xs text-mute mt-3">Cargando...</p>
	</div>
{:else if items.length > 0}
	<div class="min-h-screen bg-base pt-20">
		<div class="max-w-2xl mx-auto px-4 py-8">
			<a href="/cart" class="inline-flex items-center gap-1 text-xs text-mute hover:text-black mb-6 transition-colors">
				<ArrowLeft size={14} /> Volver al carrito
			</a>

			<p class="text-[10px] uppercase tracking-[0.3em] mb-2 text-mute">Checkout</p>
			<h1 class="text-2xl font-light text-fg mb-6">Finalizar compra</h1>

			{#if error}
				<div class="border border-line text-mute text-xs px-3 py-2 mb-4 flex items-start gap-2">
					<AlertTriangle size={14} class="shrink-0 mt-0.5" />
					<span>{error}</span>
				</div>
			{/if}

			<!-- Steps -->
			<div class="flex items-center gap-2 mb-6">
				{#each ['Datos', 'Entrega', 'Pago', 'Confirmar'] as s, i}
					<div class="flex items-center gap-2">
						<div class={`w-7 h-7 flex items-center justify-center text-[11px] font-medium border ${i < step || i === step ? 'border-fg text-fg' : 'border-line text-mute'}`}>
							{i < step ? '✓' : i + 1}
						</div>
						<span class={`text-[11px] font-medium hidden sm:block ${i <= step ? 'text-fg' : 'text-mute'}`}>{s}</span>
						{#if i < 3}<div class={`w-4 h-px ${i < step ? 'bg-black' : 'bg-black/20'}`}></div>{/if}
					</div>
				{/each}
			</div>

			<!-- Step 0: Datos personales -->
			{#if step === 0}
				<div class="space-y-3">
					<div class="space-y-3">
						<div>
							<label class="flex items-center gap-1.5 text-xs font-medium text-black/70 mb-1" for="co-name">
								<User size={12} /> Nombre completo *
							</label>
							<input id="co-name" type="text" bind:value={form.customerName}
								class="w-full border border-line px-3 py-2 text-sm bg-base text-fg focus:outline-none focus:border-signal transition-colors"
								placeholder="Nombre Apellido" />
						</div>
						<div>
							<label class="flex items-center gap-1.5 text-xs font-medium text-black/70 mb-1" for="co-phone">
								<Phone size={12} /> Teléfono *
							</label>
							<input id="co-phone" type="tel" bind:value={form.customerPhone}
								class="w-full border border-line px-3 py-2 text-sm bg-base text-fg focus:outline-none focus:border-signal transition-colors"
								placeholder="Ej: 2613456789" />
							<p class="text-[10px] text-mute mt-1">Mínimo 8 dígitos, sin guiones</p>
						</div>
						<div>
							<label class="flex items-center gap-1.5 text-xs font-medium text-black/70 mb-1" for="co-email">
								<Mail size={12} /> Email *
							</label>
							<input id="co-email" type="email" bind:value={form.customerEmail}
								class="w-full border border-line px-3 py-2 text-sm bg-base text-fg focus:outline-none focus:border-signal transition-colors"
								placeholder="email@ejemplo.com" />
						</div>
					</div>
					<div>
						<label class="flex items-center gap-1.5 text-xs font-medium text-black/70 mb-1" for="co-notes">
							<MessageSquare size={12} /> Notas (opcional)
						</label>
						<textarea id="co-notes" bind:value={form.notes} rows="2"
							class="w-full border border-line px-3 py-2 text-sm bg-base text-fg focus:outline-none focus:border-signal transition-colors resize-none"
							placeholder="Ej: Llamar antes de entregar"></textarea>
					</div>
				</div>
			{/if}

			<!-- Step 1: Modalidad de entrega -->
			{#if step === 1}
				<div class="space-y-3">
					<div class="grid grid-cols-2 gap-3">
						{#if storeConfig?.delivery !== false}
							<button type="button" onclick={() => (form = { ...form, modalidad: 'DELIVERY' })}
								class={`flex flex-col items-center gap-1.5 p-3 border transition-all ${form.modalidad === 'DELIVERY' ? 'border-fg bg-panel' : 'border-line hover:border-black/40'}`}>
								<Truck size={18} class={form.modalidad === 'DELIVERY' ? 'text-fg' : 'text-mute'} />
								<span class="text-xs font-medium">Delivery</span>
								{#if !isDeliveryFree}<span class="text-[10px] text-mute">+${deliveryCost.toLocaleString('es-AR')}</span>{/if}
								{#if isDeliveryFree}<span class="text-[10px] text-mute">¡Envío gratis!</span>{/if}
							</button>
						{/if}
						{#if storeConfig?.takeaway !== false}
							<button type="button" onclick={() => (form = { ...form, modalidad: 'TAKEAWAY' })}
								class={`flex flex-col items-center gap-1.5 p-3 border transition-all ${form.modalidad === 'TAKEAWAY' ? 'border-fg bg-panel' : 'border-line hover:border-black/40'}`}>
								<Store size={18} class={form.modalidad === 'TAKEAWAY' ? 'text-fg' : 'text-mute'} />
								<span class="text-xs font-medium">Retiro en local</span>
								<span class="text-[10px] text-mute">Sin costo</span>
							</button>
						{/if}
					</div>
					{#if form.modalidad === 'DELIVERY'}
						<div>
							<label class="flex items-center gap-1.5 text-xs font-medium text-black/70 mb-1" for="co-address">
								<MapPin size={12} /> Dirección *
							</label>
							<input id="co-address" type="text" bind:value={form.customerAddress}
								class="w-full border border-line px-3 py-2 text-sm bg-base text-fg focus:outline-none focus:border-signal transition-colors"
								placeholder="Calle, número, localidad" />
						</div>
					{/if}
				</div>
			{/if}

			<!-- Step 2: Método de pago -->
			{#if step === 2}
				<div class="space-y-2">
					{#each filteredMethods as pm (pm.id)}
						<button type="button" onclick={() => (form = { ...form, paymentMethod: pm.id })}
							class={`w-full flex items-center gap-3 p-3 border transition-all ${form.paymentMethod === pm.id ? 'border-fg bg-panel' : 'border-line hover:border-black/40'}`}>
							<pm.icon size={18} class={form.paymentMethod === pm.id ? 'text-fg' : 'text-mute'} />
							<div class="text-left">
								<p class="text-xs font-medium">{pm.label}</p>
								<p class="text-[10px] text-mute">{pm.description}</p>
							</div>
							{#if form.paymentMethod === pm.id}
								<div class="ml-auto w-4 h-4 border border-fg flex items-center justify-center">
									<div class="w-1.5 h-1.5 bg-black"></div>
								</div>
							{/if}
						</button>
					{/each}
				</div>
			{/if}

			<!-- Step 3: Confirmar -->
			{#if step === 3}
				<div class="space-y-3">
					<div class="border border-line p-3">
						<h3 class="text-xs font-medium text-fg mb-2 flex items-center gap-1.5">
							<Ticket size={14} /> Cupón de descuento
						</h3>
						{#if !appliedCoupon}
							<div class="flex gap-2">
								<input type="text" bind:value={couponCode} oninput={(e) => (couponCode = e.currentTarget.value.toUpperCase())} placeholder="Código"
									class="flex-1 border border-line px-3 py-1.5 text-sm bg-base text-fg focus:outline-none focus:border-signal transition-colors uppercase"
									disabled={validatingCoupon} />
								<button type="button" onclick={handleApplyCoupon} disabled={!couponCode.trim() || validatingCoupon}
									class="px-3 py-1.5 border border-line text-fg text-xs font-medium hover:bg-panel disabled:opacity-50 transition-colors">
									{#if validatingCoupon}<Loader2 size={12} class="animate-spin" />{:else}Aplicar{/if}
								</button>
							</div>
						{:else}
							<div class="flex items-center justify-between bg-panel border border-line px-3 py-2">
								<div class="flex items-center gap-2">
									<Ticket size={14} class="text-mute" />
									<div>
										<p class="text-xs font-medium text-fg">{appliedCoupon.code}</p>
										<p class="text-[10px] text-mute">{appliedCoupon.description}</p>
									</div>
								</div>
								<button type="button" onclick={handleRemoveCoupon} class="text-mute hover:text-black">
									<X size={14} />
								</button>
							</div>
						{/if}
						{#if couponError}<p class="text-[10px] text-mute mt-1">{couponError}</p>{/if}
					</div>

					<div class="border border-line p-3 space-y-2">
						<h3 class="text-xs font-medium text-fg">Resumen</h3>
						<div class="text-xs space-y-1 bg-panel p-2">
							<div class="flex justify-between">
								<span class="text-mute">Nombre</span>
								<span class="font-medium text-fg">{form.customerName}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-mute">Teléfono</span>
								<span class="font-medium text-fg">{form.customerPhone}</span>
							</div>
							{#if form.customerEmail}
								<div class="flex justify-between">
									<span class="text-mute">Email</span>
									<span class="font-medium text-fg truncate max-w-[180px]">{form.customerEmail}</span>
								</div>
							{/if}
							<div class="flex justify-between">
								<span class="text-mute">Entrega</span>
								<span class="font-medium text-fg">{form.modalidad === 'DELIVERY' ? 'Delivery' : 'Retiro'}</span>
							</div>
							{#if form.customerAddress}
								<div class="flex justify-between">
									<span class="text-mute">Dirección</span>
									<span class="font-medium text-fg text-right max-w-[180px]">{form.customerAddress}</span>
								</div>
							{/if}
						</div>

						<div class="space-y-0.5 max-h-40 overflow-y-auto">
							{#each items as item (item.key)}
								<div class="flex justify-between text-xs py-1">
									<span class="text-mute">{item.quantity}x {item.product.name}{item.variant ? ` (${item.variant.name})` : ''}</span>
									<span class="font-medium text-fg">${(item.price * item.quantity).toLocaleString('es-AR')}</span>
								</div>
							{/each}
						</div>

						<div class="border-t border-line pt-2 space-y-1">
							<div class="flex justify-between text-xs">
								<span class="text-mute">Subtotal</span>
								<span class="text-fg">${subtotal.toLocaleString('es-AR')}</span>
							</div>
							{#if discount > 0}
								<div class="flex justify-between text-xs">
									<span class="text-mute">Descuento</span>
									<span class="text-fg">-${discount.toLocaleString('es-AR')}</span>
								</div>
							{/if}
							{#if form.modalidad === 'DELIVERY'}
								<div class="flex justify-between text-xs">
									<span class="text-mute">Envío</span>
									<span class={finalShippingCost === 0 ? 'text-mute' : 'text-fg'}>
										{finalShippingCost === 0 ? 'Gratis' : `$${finalShippingCost.toLocaleString('es-AR')}`}
									</span>
								</div>
							{/if}
							<div class="flex justify-between font-medium text-sm pt-1 border-t border-line mt-1">
								<span>Total</span>
								<span class="text-fg">${finalTotal.toLocaleString('es-AR')}</span>
							</div>
						</div>
					</div>
				</div>
			{/if}

			<!-- Navegación -->
			<div class="flex gap-2 mt-4">
				{#if step > 0}
					<button type="button" onclick={() => { error = ''; step = step - 1; window.scrollTo({ top: 0, behavior: 'smooth' }); }}
						class="px-4 py-2 border border-line text-xs font-medium text-fg hover:bg-panel transition-colors">
						Atrás
					</button>
				{/if}
				{#if step < 3}
					<button type="button" onclick={handleNext}
						class="flex-1 bg-fg text-base py-2 text-xs font-medium hover:bg-black/80 transition-colors">
						Continuar
					</button>
				{:else}
					<button type="button" onclick={handleSubmit} disabled={loading}
						class="flex-1 bg-fg text-base py-2 text-xs font-medium hover:bg-black/80 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
						{#if loading}<Loader2 size={12} class="animate-spin" />{/if}
						{loading ? 'Procesando...' : `Confirmar • $${finalTotal.toLocaleString('es-AR')}`}
					</button>
				{/if}
			</div>
		</div>
	</div>
{/if}
