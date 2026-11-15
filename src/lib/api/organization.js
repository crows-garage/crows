// ≙ src/lib/organizationApi.js del original: perfil, agenda, reportes,
// proyectos, biblioteca, blog, galerías, autoridades y turnero.
// Todos los métodos fallan en silencio: si la organización no está configurada,
// las secciones simplemente no se muestran. Des-envuelve {data, pagination}.
import { ORG_ROOT, fetchJSON, unwrap } from './client.js'

export const organizationApi = {
	profile: () => fetchJSON(`${ORG_ROOT}`),
	events: () => fetchJSON(`${ORG_ROOT}/events`),
	reports: () => fetchJSON(`${ORG_ROOT}/reports`),
	authorities: () => fetchJSON(`${ORG_ROOT}/authorities`),
	galleries: () => fetchJSON(`${ORG_ROOT}/galleries`),

	// solo publicados; devuelve array
	projects: async () => {
		const body = await fetchJSON(`${ORG_ROOT}/projects?limit=50`)
		return unwrap(body)
	},

	// solo PUBLISHED + PUBLIC; devuelve array
	library: async () => {
		const body = await fetchJSON(`${ORG_ROOT}/library?limit=50`)
		return unwrap(body)
	},

	// solo publicados; devuelve array
	blog: async () => {
		const body = await fetchJSON(`${ORG_ROOT}/blog?limit=20`)
		return unwrap(body)
	},

	blogPost: async (slug) => {
		const posts = await organizationApi.blog()
		return posts.find((p) => p.slug === slug) || null
	},

	// turnero público (solo ACTIVE)
	turneros: () => fetchJSON(`${ORG_ROOT}/turneros`),
	turneroSlots: (id, startDate, endDate) =>
		fetchJSON(`${ORG_ROOT}/turneros/${id}/slots?startDate=${startDate}&endDate=${endDate}`)
}
