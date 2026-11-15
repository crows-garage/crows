// ≙ src/lib/siteBranding.js del original: branding 100% data-driven desde el
// perfil de la organización (o la tienda como fallback). Para loads de server.
import { api } from './api/store.js'
import { organizationApi } from './api/organization.js'

const FALLBACK_NAME = 'Institución'
const FALLBACK_TAGLINE = 'Una comunidad estudiantil para aprender, conectar y crear.'

export async function getSiteBranding() {
	const [org, store] = await Promise.all([
		organizationApi.profile().catch(() => null),
		api.store().catch(() => null)
	])

	const name = org?.name || store?.name || FALLBACK_NAME
	const description = org?.description || store?.description || FALLBACK_TAGLINE
	const logo = org?.logo || store?.logo || null

	return { org, store, name, description, logo }
}
