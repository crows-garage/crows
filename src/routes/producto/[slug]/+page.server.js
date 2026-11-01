// ≙ src/app/producto/[slug]/page.jsx (server): producto por slug con fallback
// a lista completa, relacionados y FAQs.
import { error } from '@sveltejs/kit'
import { api } from '#lib/api/store.js'
import { getAllImages } from '#lib/utils.js'
import { filterEducationalContent, isEducationalContent } from '#lib/contentFilter.js'

async function findProductBySlug(slug) {
	try {
		const product = await api.productBySlug(slug)
		return isEducationalContent(product) ? product : null
	} catch {
		const allProducts = await api.products().catch(() => [])
		return allProducts.find((p) => p.slug === slug && isEducationalContent(p)) || null
	}
}

export async function load({ params }) {
	const [store, product, products, categories, faqs] = await Promise.all([
		api.store().catch(() => null),
		findProductBySlug(params.slug),
		api.products().then(filterEducationalContent).catch(() => []),
		api.categories().catch(() => []),
		api.faqs().then(filterEducationalContent).catch(() => [])
	])

	if (!product) error(404)

	const images = getAllImages(product)

	let related = []
	const productLabelIds = product.labels?.map((l) => l.id) || []
	const hasSpecialLabel = product.labels?.some((l) =>
		['oferta', '2x1', 'nuevo'].includes(l.name?.toLowerCase())
	)

	if (hasSpecialLabel) {
		related = products
			.filter(
				(p) =>
					p.id !== product.id &&
					p.available &&
					p.labels?.some((l) => productLabelIds.includes(l.id))
			)
			.slice(0, 8)
	}

	if (related.length < 4) {
		const additional = products
			.filter(
				(p) =>
					p.id !== product.id &&
					p.available &&
					(p.categoryId === product.categoryId || p.brandId === product.brandId) &&
					!related.some((r) => r.id === p.id)
			)
			.slice(0, 8 - related.length)
		related = [...related, ...additional]
	}
	related = related.slice(0, 8)

	return { store, product, categories, related, faqs, images }
}
