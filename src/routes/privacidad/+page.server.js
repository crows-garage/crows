// ≙ src/app/privacidad/page.jsx (server): política de privacidad desde la tienda.
import { api } from '#lib/api/store.js'

export async function load() {
	const store = await api.store().catch(() => null)
	return { content: store?.privacyPolicy || null }
}
