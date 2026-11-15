// ≙ src/lib/authApi.js del original. Header X-Store-Id, cookies con
// credentials: 'include', refresh automático en client.js.
// Logout simplificado (R6): llamada al backend + limpieza de estado; las
// cookies httpOnly las controla la API (same-site subdominio funciona).
import { BASE, STORE_SLUG, request } from './client.js'

export const authApi = {
	getStoreId: async () => {
		try {
			const store = await fetch(`${BASE}/stores/${STORE_SLUG}`).then((r) => r.json())
			return store.id
		} catch {
			return null
		}
	},

	login: async (email, password) => {
		const storeId = await authApi.getStoreId()
		if (!storeId) throw new Error('Tienda no encontrada')

		return request('/customer/login', {
			method: 'POST',
			headers: { 'X-Store-Id': storeId.toString() },
			body: JSON.stringify({ email, password })
		})
	},

	register: async (userData) => {
		const storeId = await authApi.getStoreId()
		if (!storeId) throw new Error('Tienda no encontrada')

		return request('/customer/register', {
			method: 'POST',
			headers: { 'X-Store-Id': storeId.toString() },
			body: JSON.stringify(userData)
		})
	},

	getProfile: () => request('/customer/me'),

	updateProfile: (data) => request('/customer/me', { method: 'PUT', body: JSON.stringify(data) }),

	logout: async () => {
		try {
			await request('/customer/logout', { method: 'POST' })
		} catch (err) {
			console.log('Logout backend ignorado')
		}
	},

	getOrders: () => request('/customer/orders'),

	googleLogin: async () => {
		const storeId = await authApi.getStoreId()
		if (!storeId) throw new Error('Tienda no encontrada')
		window.location.href = `${BASE}/customer/google?storeId=${storeId}&redirectTo=/`
	},

	forgotPassword: async (email) => {
		const storeId = await authApi.getStoreId()
		return request('/customer/forgot-password', {
			method: 'POST',
			headers: { 'X-Store-Id': storeId.toString() },
			body: JSON.stringify({ email })
		})
	},

	resetPassword: (token, newPassword) =>
		request('/customer/reset-password', { method: 'POST', body: JSON.stringify({ token, newPassword }) }),

	getWishlist: () => request('/customer/wishlist'),

	addToWishlist: (productId) => request('/customer/wishlist', { method: 'POST', body: JSON.stringify({ productId }) }),

	removeFromWishlist: (productId) => request(`/customer/wishlist/${productId}`, { method: 'DELETE' })
}
