// ≙ src/app/galeria/page.jsx (server) + página: galerías activas.
import { organizationApi } from '#lib/api/organization.js'

export async function load() {
	const galleries = await organizationApi.galleries().catch(() => [])
	return { galleries }
}
