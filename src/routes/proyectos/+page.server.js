// ≙ src/app/proyectos/page.jsx (server): proyectos con roadmap.
import { organizationApi } from '#lib/api/organization.js'

export async function load() {
	const projects = await organizationApi.projects().catch(() => [])
	return { projects }
}
