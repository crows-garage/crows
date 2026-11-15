// ≙ src/lib/checkoutApi.js del original: config de tienda, órdenes,
// preferencia MercadoPago, intención Nave, status de pago.
import { request } from './client.js'

export const checkoutApi = {
	/** Obtener productos de una tienda */
	getProducts: (storeSlug) => request(`/stores/${storeSlug}/products`),

	/** Obtener configuración de una tienda (con defaults si falla) */
	getConfig: (storeSlug) =>
		request(`/stores/${storeSlug}/config`).catch(() => ({
			delivery: true,
			takeaway: true,
			paymentMethods: ['CASH', 'MERCADOPAGO'],
			deliveryCost: 500,
			freeShippingMinTotal: 5000
		})),

	/** Crear un pedido */
	createOrder: (storeSlug, orderData) =>
		request(`/stores/${storeSlug}/orders`, { method: 'POST', body: JSON.stringify(orderData) }),

	/** Crear preferencia de Mercado Pago */
	createMercadoPagoPreference: (orderId) =>
		request('/payments/create-preference', { method: 'POST', body: JSON.stringify({ orderId }) }),

	/** Crear intención de pago Nave */
	createNaveIntention: (orderId) =>
		request('/payments/create-nave-intention', { method: 'POST', body: JSON.stringify({ orderId }) }),

	/** Consultar estado de un pedido */
	getOrderStatus: (orderId) => request(`/payments/status/${orderId}`)
}
