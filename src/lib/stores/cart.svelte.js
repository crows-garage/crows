// ≙ src/store/cartStore.js del original (Zustand + persist).
// writable + sincronización manual con localStorage: misma key
// (`econopet-cart`), mismo formato JSON `{ state: { items }, version: 2 }`
// y mismo migrate. SSR-safe: items empiezan vacíos en server (R4).
import { writable, derived, get } from 'svelte/store'
import { browser } from '$app/environment'
import { STORE_SLUG } from '$lib/api/client.js'

const STORAGE_KEY = 'econopet-cart'
const VERSION = 2

// Mismo migrate que el persist del original
function migrate(persistedState, version) {
	if (version < 2) {
		return {
			...persistedState,
			items: (persistedState.items || []).map((item) => ({
				...item,
				storeSlug: item.storeSlug || STORE_SLUG,
				addedAt: item.addedAt || Date.now()
			}))
		}
	}
	return persistedState
}

function loadItems() {
	if (!browser) return []
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		if (!raw) return []
		const parsed = JSON.parse(raw)
		const state = migrate(parsed?.state ?? parsed, parsed?.version ?? 1)
		return Array.isArray(state.items) ? state.items : []
	} catch {
		return []
	}
}

export const cartItems = writable(loadItems())

if (browser) {
	// Persistir con el mismo formato que escribe zustand/persist
	cartItems.subscribe((value) => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: { items: value }, version: VERSION }))
	})
}

// ─── Acciones (misma forma de datos que el original) ───────
export const cart = {
	addItem: (product, variant = null, quantity = 1, storeSlug) => {
		if (!product?.id) return
		const slug = storeSlug || STORE_SLUG
		const current = get(cartItems)
		const key = variant ? `${product.id}-${variant.id}` : `${product.id}`
		const existingIndex = current.findIndex((i) => i.key === key)

		const getImage = () => {
			if (product.images) {
				try {
					const parsed = typeof product.images === 'string' ? JSON.parse(product.images) : product.images
					if (Array.isArray(parsed) && parsed.length > 0) return parsed[0]
				} catch {
					return null
				}
			}
			return product.image || null
		}

		const getPrice = () => {
			if (variant) {
				return parseFloat(variant.discountPrice || variant.finalPrice || variant.price || product.price || 0)
			}
			return parseFloat(product.price || 0)
		}

		if (existingIndex > -1) {
			const updated = [...current]
			updated[existingIndex] = {
				...updated[existingIndex],
				quantity: updated[existingIndex].quantity + quantity,
				product: {
					...updated[existingIndex].product,
					name: product.name,
					price: parseFloat(product.price || 0),
					stock: product.stock || 0,
					available: product.available !== false
				},
				variant: variant
					? {
							id: variant.id,
							name: variant.name,
							price: parseFloat(variant.price || 0),
							finalPrice: variant.finalPrice ? parseFloat(variant.finalPrice) : null,
							discountPrice: variant.discountPrice ? parseFloat(variant.discountPrice) : null,
							stock: variant.stock || 0
						}
					: updated[existingIndex].variant,
				price: getPrice(),
				image: getImage() || updated[existingIndex].image,
				storeSlug: slug
			}
			cartItems.set(updated)
		} else {
			cartItems.set([
				...current,
				{
					key,
					productId: product.id,
					product: {
						id: product.id,
						name: product.name,
						slug: product.slug || '',
						price: parseFloat(product.price || 0),
						stock: product.stock || 0,
						available: product.available !== false,
						images: product.images || null
					},
					variant: variant
						? {
								id: variant.id,
								name: variant.name,
								price: parseFloat(variant.price || 0),
								finalPrice: variant.finalPrice ? parseFloat(variant.finalPrice) : null,
								discountPrice: variant.discountPrice ? parseFloat(variant.discountPrice) : null,
								stock: variant.stock || 0
							}
						: null,
					quantity: Math.max(1, Math.min(quantity, 99)),
					price: getPrice(),
					image: getImage(),
					storeSlug: slug,
					addedAt: Date.now()
				}
			])
		}
	},

	removeItem: (key) => cartItems.update((items) => items.filter((i) => i.key !== key)),

	updateQuantity: (key, quantity) => {
		const qty = parseInt(quantity)
		if (isNaN(qty) || qty <= 0) {
			cart.removeItem(key)
			return
		}
		cartItems.update((items) =>
			items.map((i) => (i.key === key ? { ...i, quantity: Math.min(qty, 99) } : i))
		)
	},

	syncItem: (key, freshProduct, freshVariant = null) => {
		const getImage = () => {
			if (freshProduct.images) {
				try {
					const parsed =
						typeof freshProduct.images === 'string' ? JSON.parse(freshProduct.images) : freshProduct.images
					if (Array.isArray(parsed) && parsed.length > 0) return parsed[0]
				} catch {
					return null
				}
			}
			return freshProduct.image || null
		}
		cartItems.update((items) =>
			items.map((i) => {
				if (i.key !== key) return i
				return {
					...i,
					product: {
						...i.product,
						name: freshProduct.name,
						price: parseFloat(freshProduct.price || 0),
						stock: freshProduct.stock || 0,
						available: freshProduct.available !== false
					},
					variant: freshVariant
						? {
								id: freshVariant.id,
								name: freshVariant.name,
								price: parseFloat(freshVariant.price || 0),
								finalPrice: freshVariant.finalPrice ? parseFloat(freshVariant.finalPrice) : null,
								discountPrice: freshVariant.discountPrice ? parseFloat(freshVariant.discountPrice) : null,
								stock: freshVariant.stock || 0
							}
						: i.variant,
					price: freshVariant
						? parseFloat(
								freshVariant.discountPrice || freshVariant.finalPrice || freshVariant.price || freshProduct.price || 0
							)
						: parseFloat(freshProduct.price || 0),
					image: getImage() || i.image
				}
			})
		)
	},

	validateStock: () => {
		return get(cartItems).filter((item) => {
			const maxStock = item.variant?.stock || item.product?.stock || 0
			return item.quantity > maxStock && maxStock > 0
		})
	},

	clearCart: () => cartItems.set([])
}

// ─── Selectores (≙ select* del original) ───────────────────
export const selectTotal = derived(cartItems, (s) => s.reduce((sum, i) => sum + i.price * i.quantity, 0))
export const selectCount = derived(cartItems, (s) => s.reduce((sum, i) => sum + i.quantity, 0))
export const selectUniqueCount = derived(cartItems, (s) => s.length)
export const selectStoreSlug = derived(cartItems, (s) => s[0]?.storeSlug || STORE_SLUG)
export const selectOrderItems = derived(cartItems, (s) =>
	s.map((i) => ({
		productId: i.productId,
		variantId: i.variant?.id || null,
		quantity: i.quantity,
		notes: ''
	}))
)
