// ≙ src/app/blog/[slug]/page.jsx (server): nota individual + otras noticias.
// El original consulta GET /organizations/{slug}/blog/{slug} directamente.
import { error } from '@sveltejs/kit'
import { BASE, ORG_SLUG, STORE_SLUG } from '#lib/api/client.js'
import { organizationApi } from '#lib/api/organization.js'
import { isEducationalContent, filterEducationalContent } from '#lib/contentFilter.js'

async function getPost(slug) {
	try {
		const res = await fetch(`${BASE}/organizations/${ORG_SLUG || STORE_SLUG}/blog/${slug}`)
		if (!res.ok) return null
		const post = await res.json()
		return isEducationalContent(post) ? post : null
	} catch {
		return null
	}
}

async function getOtherPosts(currentSlug) {
	try {
		const posts = await organizationApi.blog().catch(() => [])
		return filterEducationalContent(posts)
			.filter((p) => p.slug !== currentSlug && p.published !== false)
			.sort((a, b) => {
				if (a.featured && !b.featured) return -1
				if (!a.featured && b.featured) return 1
				return new Date(b.createdAt) - new Date(a.createdAt)
			})
	} catch {
		return []
	}
}

export async function load({ params }) {
	const post = await getPost(params.slug)
	if (!post) error(404)

	const otherPosts = await getOtherPosts(params.slug)
	return { post, otherPosts }
}
