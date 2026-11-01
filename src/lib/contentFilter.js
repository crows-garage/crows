// Copia 1:1 del original (src/lib/contentFilter.js). Comportamiento requerido,
// no "arreglar" (R7).
const BLOCKED_CONTENT = /justicia|judicial|perit|forens|tribunal|mendoza/i

export function isEducationalContent(value) {
	return !BLOCKED_CONTENT.test(JSON.stringify(value ?? ''))
}

export function filterEducationalContent(items) {
	return Array.isArray(items) ? items.filter(isEducationalContent) : []
}
