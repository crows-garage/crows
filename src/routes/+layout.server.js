import { api } from '#lib/api/store.js'
import { organizationApi } from '#lib/api/organization.js'
import { filterEducationalContent } from '#lib/contentFilter.js'
import { getSiteBranding } from '#lib/branding.js'

export async function load({ setHeaders }) {
	const [store, categories, collections, labels, locals, branding] = await Promise.all([
		api.store().catch(() => null),
		api.categories().then(filterEducationalContent).catch(() => []),
		api.collections().catch(() => []),
		api.labels().catch(() => []),
		api.locals().catch(() => []),
		getSiteBranding().catch(() => null)
	])

	// SSR siempre (≙ dynamic = 'force-dynamic' del original)
	setHeaders({ 'cache-control': 'private, no-store' })

	const org = branding?.org ?? null

	// Metadata base: título (el favicon se resuelve por tema en +layout.svelte)
	const name = 'Crow Projects'
	const description =
		'Crow Projects es una comunidad estudiantil para compartir conocimiento, encontrar colaboradores y convertir ideas en proyectos.'

	return { store, categories, collections, labels, locals, org, metaTitle: name, metaDescription: description }
}
