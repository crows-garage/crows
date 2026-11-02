// ≙ src/app/about/page.jsx (server): perfil de la organización + autoridades.
import { organizationApi } from '#lib/api/organization.js'
import { api } from '#lib/api/store.js'

export async function load() {
	const [org, store] = await Promise.all([
		organizationApi.profile().catch(() => null),
		api.store().catch(() => null)
	])
	const authorities = await organizationApi.authorities().catch(() => [])
	return { org, store, authorities }
}
