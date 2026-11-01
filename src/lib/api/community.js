// ≙ src/lib/communityApi.js del original: posts, comentarios, encuestas,
// reacciones, miembros, reservas de turnero y solicitud de asociación.
// Auth por cookies de sesión (credentials include, ver client.js).
import { BASE, STORE_SLUG, ORG_ROOT, request, unwrap } from './client.js'

function authorName(author) {
	const c = author?.customers?.[0]
	if (c?.firstName) return `${c.firstName}${c.lastName ? ' ' + c.lastName : ''}`
	if (author?.email) return author.email.split('@')[0]
	return 'Institución'
}

export const communityApi = {
	// ===== Posts de comunidad (público: solo PUBLISHED) =====
	getPosts: async () => unwrap(await request(`${ORG_ROOT}/community/posts`)),
	getPost: (id) => request(`${ORG_ROOT}/community/posts/${id}`),
	getComments: (postId) => request(`${ORG_ROOT}/community/posts/${postId}/comments`),
	addComment: (postId, content) =>
		request(`${ORG_ROOT}/community/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ content }) }),

	// ===== Encuestas =====
	getPoll: (postId) => request(`${ORG_ROOT}/community/posts/${postId}/poll`),
	votePoll: (postId, optionIds) =>
		request(`${ORG_ROOT}/community/posts/${postId}/poll/vote`, {
			method: 'POST',
			body: JSON.stringify({ optionIds })
		}),

	// ===== Reacciones (me gusta) =====
	togglePostLike: (postId) => request(`${ORG_ROOT}/community/posts/${postId}/like`, { method: 'POST' }),
	toggleCommentLike: (postId, commentId) =>
		request(`${ORG_ROOT}/community/posts/${postId}/comments/${commentId}/like`, { method: 'POST' }),

	// ===== Miembros =====
	getMembers: () => request(`${ORG_ROOT}/members`),

	// ===== Turnero (cupos) =====
	getTurneros: () => request(`${ORG_ROOT}/turneros`),
	getSlots: (turneroId, startDate, endDate) =>
		request(`${ORG_ROOT}/turneros/${turneroId}/slots?startDate=${startDate}&endDate=${endDate}`),
	reserve: (turneroId, slotId, extra = {}) =>
		request(`${ORG_ROOT}/turneros/${turneroId}/reserve`, {
			method: 'POST',
			body: JSON.stringify({ slotId, ...extra })
		}),
	cancel: (turneroId, reservationId) =>
		request(`${ORG_ROOT}/turneros/${turneroId}/cancel/${reservationId}`, { method: 'POST' }),
	myReservations: () => request(`${ORG_ROOT}/turneros/my-reservations`),

	// ===== Solicitud de asociación =====
	resubmit: async (data) => {
		let storeId = null
		try {
			const store = await fetch(`${BASE}/stores/${STORE_SLUG}`).then((r) => r.json())
			storeId = store.id
		} catch {
			/* ignore */
		}
		if (!storeId) throw new Error('Tienda no encontrada')

		return request('/customer/association-application', {
			method: 'PUT',
			headers: { 'X-Store-Id': storeId.toString() },
			body: JSON.stringify(data)
		})
	},

	authorName
}
