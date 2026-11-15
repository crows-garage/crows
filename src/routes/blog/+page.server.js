// ≙ src/app/blog/page.jsx (server): publicaciones de la organización.
import { organizationApi } from '#lib/api/organization.js'
import { filterEducationalContent } from '#lib/contentFilter.js'

export async function load() {
	const posts = await organizationApi.blog().then(filterEducationalContent).catch(() => [])
	return { posts }
}
