// ≙ src/app/layout.js del original: fetch global de tienda/org en paralelo
// (server-side, Workers fetch sin Origin → API responde 200) + metadata base
// (≙ generateMetadata) con favicon desde el logo de la org.
import { api } from '#lib/api/store.js'
import { organizationApi } from '#lib/api/organization.js'
import { filterEducationalContent } from '#lib/contentFilter.js'
import { getSiteBranding } from '#lib/branding.js'
import { BASE } from '#lib/api/client.js'

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

	// Metadata base: título y favicon (logo de la org en la API)
	const name = 'CursoX'
	const description =
		'CursoX es una comunidad estudiantil para compartir conocimiento, encontrar colaboradores y convertir ideas en proyectos.'
	const rawIcon = org?.logo || store?.logo || ''
	const metaIcon = rawIcon
		? rawIcon.startsWith('http')
			? rawIcon
			: `${BASE}${rawIcon}`
		: '/favicon.ico'

	return { store, categories, collections, labels, locals, org, metaTitle: name, metaDescription: description, metaIcon }
}
