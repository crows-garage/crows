// ≙ src/app/terms-and-conditions/page.jsx (server): T&C desde la tienda.
import { api } from '#lib/api/store.js'

export async function load() {
	const store = await api.store().catch(() => null)
	return { content: store?.termsAndConditions || null }
}
