// ≙ src/lib/utils.js del original. Sin rewrites en Pages: las imágenes del
// backend se arman como URL absoluta contra la API.
import { PUBLIC_API_URL } from '$app/env/public'

const IMAGE_BASE = PUBLIC_API_URL

// ─── Imágenes ──────────────────────────────────────────────
export function imgUrl(path) {
	if (!path) return '/placeholder.png'

	// Si ya es una URL absoluta externa, la dejamos pasar
	if (path.startsWith('http')) return path

	// Si la ruta es del backend, usar URL completa (no hay rewrites en Pages)
	if (path.startsWith('/auth-image') || path.startsWith('/uploads')) {
		return `${IMAGE_BASE}${path}`
	}

	// Para cualquier otra ruta relativa
	return path.startsWith('/') ? path : `/${path}`
}

// ─── Precios ───────────────────────────────────────────────
export function formatPrice(price) {
	if (price == null || isNaN(price)) return '$0'
	return new Intl.NumberFormat('es-AR', {
		style: 'currency',
		currency: 'ARS',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(price)
}

export function getProductPrice(product) {
	const variants = product.variants?.filter((v) => v.active) || []
	if (!variants.length) {
		return {
			price: parseFloat(product.price),
			originalPrice: null,
			hasDiscount: false,
			isFrom: false
		}
	}
	const prices = variants.map((v) => parseFloat(v.finalPrice || v.price))
	const originals = variants.map((v) => parseFloat(v.price))
	const minFinal = Math.min(...prices)
	const minOriginal = Math.min(...originals)
	const hasDiscount = variants.some((v) => v.discount > 0)
	return {
		price: minFinal,
		originalPrice: hasDiscount ? minOriginal : null,
		hasDiscount,
		isFrom: variants.length > 1
	}
}

// ─── Categorías ────────────────────────────────────────────
export function buildCategoryTree(categories) {
	const map = {}
	categories.forEach((c) => (map[c.id] = { ...c, children: [] }))
	const roots = []
	categories.forEach((c) => {
		if (c.parentId && map[c.parentId]) map[c.parentId].children.push(map[c.id])
		else roots.push(map[c.id])
	})
	return roots
}

export function getCategoryPath(categories, categoryId) {
	const map = {}
	categories.forEach((c) => (map[c.id] = c))
	const path = []
	let current = map[categoryId]
	while (current) {
		path.unshift(current)
		current = current.parentId ? map[current.parentId] : null
	}
	return path
}

export function getCategoryAncestorIds(categories, categoryId) {
	const map = {}
	categories.forEach((c) => (map[c.id] = c))
	const ids = []
	let current = map[categoryId]
	while (current) {
		ids.push(current.id)
		current = current.parentId ? map[current.parentId] : null
	}
	return ids
}

export function getDescendantIds(categories, categoryId) {
	const result = [categoryId]
	const children = categories.filter((c) => c.parentId === categoryId)
	children.forEach((c) => result.push(...getDescendantIds(categories, c.id)))
	return result
}

// ─── Imágenes de productos ─────────────────────────────────
export function getFirstImage(product) {
	try {
		const imgs =
			typeof product.images === 'string' ? JSON.parse(product.images) : product.images || []
		return imgs[0] || null
	} catch {
		return null
	}
}

export function getAllImages(product) {
	try {
		const imgs =
			typeof product.images === 'string' ? JSON.parse(product.images) : product.images || []
		return imgs
	} catch {
		return []
	}
}

// ─── URLs y navegación ─────────────────────────────────────
export function buildProductUrl(product) {
	const slug = product.slug || product.id
	return `/producto/${slug}`
}

export function buildCategoryUrl(category) {
	return `/productos?categoria=${category.id}`
}

// ─── Validaciones ──────────────────────────────────────────
export function isValidUrl(string) {
	try {
		new URL(string)
		return true
	} catch {
		return false
	}
}

export function truncateText(text, maxLength = 100) {
	if (!text) return ''
	if (text.length <= maxLength) return text
	return text.substring(0, maxLength) + '...'
}

// ─── Formateo ──────────────────────────────────────────────
export function formatDate(date) {
	if (!date) return ''
	return new Date(date).toLocaleDateString('es-AR', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	})
}

export function formatDiscount(discount) {
	if (!discount) return null
	return `-${Math.round(discount)}%`
}

// ─── Stock ─────────────────────────────────────────────────
export function getStockStatus(product) {
	if (!product) return { label: 'Sin información', color: 'gray', inStock: false }

	const totalStock =
		product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || product.stock || 0

	if (totalStock === 0) return { label: 'Sin stock', color: 'red', inStock: false }
	if (totalStock <= 5) return { label: 'Últimas unidades', color: 'orange', inStock: true }
	return { label: 'En stock', color: 'green', inStock: true }
}

// ─── Variantes ─────────────────────────────────────────────
export function getActiveVariants(product) {
	return product?.variants?.filter((v) => v.active) || []
}

export function getVariantLabel(variant) {
	if (!variant) return ''
	const parts = []
	if (variant.size) parts.push(variant.size)
	if (variant.color) parts.push(variant.color)
	if (variant.flavor) parts.push(variant.flavor)
	return parts.join(' - ') || 'Única'
}

// ─── Labels y etiquetas ────────────────────────────────────
export function getProductLabels(product) {
	const labels = []
	if (product.isOffer) labels.push({ name: 'Oferta', color: 'red' })
	if (product.isNew) labels.push({ name: 'Nuevo', color: 'blue' })
	if (product.isFeatured) labels.push({ name: 'Destacado', color: 'orange' })
	return labels
}

// ─── Breadcrumbs ───────────────────────────────────────────
export function generateBreadcrumbs(categories, currentCategoryId, productName) {
	const breadcrumbs = [{ name: 'Inicio', href: '/' }]

	if (currentCategoryId) {
		const path = getCategoryPath(categories, currentCategoryId)
		path.forEach((cat) => {
			breadcrumbs.push({ name: cat.name, href: buildCategoryUrl(cat) })
		})
	}

	if (productName) {
		breadcrumbs.push({ name: productName, href: '#' })
	}

	return breadcrumbs
}
