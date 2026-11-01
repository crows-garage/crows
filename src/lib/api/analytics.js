// ≙ src/lib/analytics.js del original: trackEvent → /analytics/track
// (sessionId en localStorage, device type, búsquedas). Silencioso.
import { BASE, STORE_SLUG } from './client.js'

let sessionId = null
let cachedStoreId = null

function getSessionId() {
	if (typeof window === 'undefined') return null
	if (!sessionId) {
		sessionId = localStorage.getItem('analytics_session_id')
		if (!sessionId) {
			sessionId = crypto.randomUUID()
			localStorage.setItem('analytics_session_id', sessionId)
		}
	}
	return sessionId
}

async function getStoreId() {
	if (cachedStoreId) return cachedStoreId
	try {
		const res = await fetch(`${BASE}/stores/${STORE_SLUG}`)
		const store = await res.json()
		cachedStoreId = store.id
		return cachedStoreId
	} catch {
		return null
	}
}

function getDeviceType() {
	if (typeof window === 'undefined') return 'desktop'
	const ua = navigator.userAgent
	if (/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(ua)) return 'tablet'
	if (/(mobile|iphone|ipod|android|blackberry|windows phone|opera mini|iemobile)/i.test(ua)) return 'mobile'
	return 'desktop'
}

export async function trackEvent(type, data = {}) {
	if (typeof window === 'undefined') return
	const storeId = await getStoreId()
	if (!storeId) return

	const eventData = {
		storeId,
		type,
		sessionId: getSessionId(),
		url: window.location.href,
		referer: document.referrer || null,
		deviceType: getDeviceType(),
		searchQuery: data.searchQuery || null,
		selectedSuggestion: data.selectedSuggestion || null,
		suggestionType: data.suggestionType || null,
		...data
	}

	try {
		await fetch(`${BASE}/analytics/track`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(eventData)
		})
	} catch (error) {
		// Silencioso
	}
}

// Helpers
export function trackProductView(productId, productData = {}) {
	return trackEvent('PRODUCT_VIEW', {
		entityId: productId,
		entityType: 'product',
		metadata: { slug: productData.slug, name: productData.name, price: productData.price }
	})
}

export function trackCategoryView(categoryId, categoryData = {}) {
	return trackEvent('CATEGORY_VIEW', {
		entityId: categoryId,
		entityType: 'category',
		metadata: { slug: categoryData.slug, name: categoryData.name }
	})
}

export function trackAddToCart(productId, quantity = 1, price = 0, variantId = null) {
	return trackEvent('ADD_TO_CART', {
		entityId: productId,
		entityType: 'product',
		metadata: { quantity, price, variantId }
	})
}

export function trackSearch(searchQuery, selectedSuggestion = null, suggestionType = null) {
	return trackEvent('SEARCH', {
		searchQuery,
		selectedSuggestion,
		suggestionType,
		entityType:
			suggestionType === 'product' ? 'product' : suggestionType === 'category' ? 'category' : null,
		entityId: selectedSuggestion ? null : null
	})
}
