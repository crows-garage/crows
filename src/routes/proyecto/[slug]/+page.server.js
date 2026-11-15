// ≙ src/app/proyecto/[slug]/page.jsx (server): proyecto por slug con fallback a lista.
import { error } from '@sveltejs/kit'
import { organizationApi } from '#lib/api/organization.js'
import { getAllImages } from '#lib/utils.js'
import { filterEducationalContent, isEducationalContent } from '#lib/contentFilter.js'

async function findProjectBySlug(slug) {
	try {
		const project = await organizationApi.projectBySlug(slug)
		return isEducationalContent(project) ? project : null
	} catch {
		const allProjects = await organizationApi.projects().catch(() => [])
		return allProjects.find((p) => p.slug === slug && isEducationalContent(p)) || null
	}
}

export async function load({ params }) {
	const [project, projects, categories] = await Promise.all([
		findProjectBySlug(params.slug),
		organizationApi.projects().then(filterEducationalContent).catch(() => []),
		organizationApi.categories().catch(() => [])
	])

	if (!project) error(404)

	const images = getAllImages(project)

	// Related projects: same category or same brand
	let related = []
	const projectLabelIds = project.labels?.map((l) => l.id) || []
	const hasSpecialLabel = project.labels?.some((l) =>
		['oferta', '2x1', 'nuevo'].includes(l.name?.toLowerCase())
	)

	if (hasSpecialLabel) {
		related = projects
			.filter(
				(p) =>
					p.id !== project.id &&
					p.available &&
					p.labels?.some((l) => projectLabelIds.includes(l.id))
			)
			.slice(0, 8)
	}

	if (related.length < 4) {
		const additional = projects
			.filter(
				(p) =>
					p.id !== project.id &&
					p.available &&
					(p.categoryId === project.categoryId || p.brandId === project.brandId) &&
					!related.some((r) => r.id === p.id)
			)
			.slice(0, 8 - related.length)
		related = [...related, ...additional]
	}
	related = related.slice(0, 8)

	return { project, projects, categories, related, images }
}