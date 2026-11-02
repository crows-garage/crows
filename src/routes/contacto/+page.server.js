// ≙ src/app/contacto/page.jsx (server): datos de contacto de tienda y org.
import { api } from '#lib/api/store.js'
import { organizationApi } from '#lib/api/organization.js'

export async function load() {
	const [store, locals, org] = await Promise.all([
		api.store().catch(() => null),
		api.locals().catch(() => []),
		organizationApi.profile().catch(() => null)
	])

	return { store, locals, org, contact: store?.contact || {} }
}
