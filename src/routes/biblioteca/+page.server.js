// ≙ src/app/biblioteca/page.jsx (server): documentos publicados.
import { organizationApi } from '#lib/api/organization.js'

export async function load() {
	const docs = await organizationApi.library().catch(() => [])
	return { docs }
}
