// ≙ src/app/page.js del original: carga de datos org en paralelo.
import { organizationApi } from '#lib/api/organization.js'

export async function load() {
	const [org, posts, events, galleries, projects] = await Promise.all([
		organizationApi.profile().catch(() => null),
		organizationApi.blog().catch(() => []),
		organizationApi.events().catch(() => []),
		organizationApi.galleries().catch(() => []),
		organizationApi.projects().catch(() => [])
	])

	return { org, posts, events, galleries, projects }
}
