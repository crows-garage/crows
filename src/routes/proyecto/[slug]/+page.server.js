import { error } from '@sveltejs/kit'
import { organizationApi } from '#lib/api/organization.js'

export async function load({ params }) {
	const project = await organizationApi.project(params.slug).catch(() => null)

	if (!project) error(404, 'Proyecto no encontrado')

	return { project }
}
