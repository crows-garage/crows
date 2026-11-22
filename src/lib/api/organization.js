// ≙ src/lib/organizationApi.js del original: perfil, agenda, reportes,
// proyectos, biblioteca, blog, galerías, autoridades y turnero.
// Todos los métodos fallan en silencio: si la organización no está configurada,
// las secciones simplemente no se muestran. Des-envuelve {data, pagination}.
import { BASE, ORG_ROOT, fetchJSON, request, unwrap } from './client.js'

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

	project: async (idOrSlug) => {
		const body = await fetchJSON(`${ORG_ROOT}/projects/${encodeURIComponent(idOrSlug)}`)
		return body?.data ?? body
	},
	savedProjects: () => fetchJSON(`${ORG_ROOT}/projects/saved`),
	saveProject: (projectId) => request(`${ORG_ROOT.replace(BASE, '')}/projects/${projectId}/saved`, { method: 'POST' }),
	removeSavedProject: (projectId) => request(`${ORG_ROOT.replace(BASE, '')}/projects/${projectId}/saved`, { method: 'DELETE' }),
	createProject: (data) => request(`${ORG_ROOT.replace(BASE, '')}/projects`, { method: 'POST', body: data }),
	addProjectLink: (projectId, data) => request(`${ORG_ROOT.replace(BASE, '')}/projects/${projectId}/links`, { method: 'POST', body: data }),
	getMyProjectApplication: (projectId) => request(`${ORG_ROOT.replace(BASE, '')}/projects/${projectId}/applications/me`),
	applyToProject: (projectId, data) => request(`${ORG_ROOT.replace(BASE, '')}/projects/${projectId}/applications`, { method: 'POST', body: data }),
	cancelProjectApplication: (projectId) => request(`${ORG_ROOT.replace(BASE, '')}/projects/${projectId}/applications/me`, { method: 'DELETE' }),
	listProjectApplications: (projectId) => request(`${ORG_ROOT.replace(BASE, '')}/projects/${projectId}/applications`),
	reviewProjectApplication: (projectId, applicationId, data) => request(`${ORG_ROOT.replace(BASE, '')}/projects/${projectId}/applications/${applicationId}`, { method: 'PUT', body: data }),
	uploadProjectFile: async (projectId, file, gallery = false) => {
		const form = new FormData()
		form.append('file', file)
		return request(`${ORG_ROOT.replace(BASE, '')}/projects/${projectId}${gallery ? '/images' : '/upload-image'}`, {
			method: 'POST',
			body: form
		})
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
