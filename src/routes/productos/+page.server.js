// ≙ src/app/productos/page.jsx (server): productos + categorías + labels.
import { api } from '#lib/api/store.js'
import { filterEducationalContent } from '#lib/contentFilter.js'

export async function load() {
	const [products, categories, labels, store] = await Promise.all([
		api.products().catch(() => []),
		api.categories().catch(() => []),
		api.labels().catch(() => []),
		api.store().catch(() => null)
	])

	let storeConfig = {}
	if (store?.config) {
		try {
			storeConfig = typeof store.config === 'string' ? JSON.parse(store.config) : store.config
		} catch (e) {
			storeConfig = {}
		}
	}

	return {
		products: filterEducationalContent(products),
		categories: filterEducationalContent(categories),
		labels,
		storeConfig
	}
}
