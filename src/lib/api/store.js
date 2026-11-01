// ≙ src/lib/api.js del original: tienda, categorías, productos, etc.
import { STORE_ROOT, STORE_SLUG, fetchJSON, postJSON } from './client.js'

export const api = {
	store: () => fetchJSON(`${STORE_ROOT}`),
	categories: () => fetchJSON(`${STORE_ROOT}/categories`),
	products: () => fetchJSON(`${STORE_ROOT}/products`),
	productsPaged: (query) => fetchJSON(`${STORE_ROOT}/products?${query}`),
	product: (id) => fetchJSON(`${STORE_ROOT}/products/${id}`),
	productBySlug: (slug) => fetchJSON(`${STORE_ROOT}/products/slug/${slug}`),
	brands: () => fetchJSON(`${STORE_ROOT}/brands`),
	collections: () => fetchJSON(`${STORE_ROOT}/collections`),
	labels: () => fetchJSON(`${STORE_ROOT}/labels`),
	faqs: () => fetchJSON(`${STORE_ROOT}/faqs`),
	attributes: (catId) => fetchJSON(`${STORE_ROOT}/categories/${catId}/attributes`),
	ctas: () => fetchJSON(`${STORE_ROOT}/ctas`),
	locals: () => fetchJSON(`${STORE_ROOT}/locals`),
	blog: () => fetchJSON(`${STORE_ROOT}/blog`),
	newsletter: {
		subscribe: (email) => postJSON(`${STORE_ROOT}/newsletter/subscribe`, { email })
	}
}
