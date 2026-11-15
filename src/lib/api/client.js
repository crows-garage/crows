// Base común de los clientes de API: mismas rutas/headers/payloads que el
// original (src/lib/*.js). Nada de proxy: todo sale directo a la API pública.
//
// SvelteKit 3 exposes configured public variables through $app/env/public.
import { PUBLIC_API_URL, PUBLIC_STORE_SLUG, PUBLIC_ORG_SLUG } from '$app/env/public'

export const BASE = PUBLIC_API_URL
export const STORE_SLUG = PUBLIC_STORE_SLUG
export const ORG_SLUG = PUBLIC_ORG_SLUG || STORE_SLUG
export const STORE_ROOT = `${BASE}/stores/${STORE_SLUG}`
export const ORG_ROOT = `${BASE}/organizations/${ORG_SLUG}`

// ─── Refresh automático (una sola vez al 401) ─────────────
let isRefreshing = false
let refreshPromise = null

async function refreshToken() {
	if (isRefreshing) return refreshPromise
	isRefreshing = true
	refreshPromise = fetch(`${BASE}/customer/refresh-token`, { method: 'POST', credentials: 'include' })
		.then((res) => {
			isRefreshing = false
			refreshPromise = null
			return res.ok
		})
		.catch(() => {
			isRefreshing = false
			refreshPromise = null
			return false
		})
	return refreshPromise
}

// ─── GET simple (loads de server, sin credenciales como el original) ──
export async function fetchJSON(url) {
	const res = await fetch(url)
	if (!res.ok) throw new Error(`API error: ${res.status} ${url}`)
	return res.json()
}

// ─── POST simple (sin credenciales, ≙ postJSON del original) ──
export async function postJSON(url, body) {
	const res = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	})
	if (!res.ok) throw new Error(`API error: ${res.status} ${url}`)
	return res.json()
}

// ─── Request con credenciales y refresh ───────────────────
export async function request(url, options = {}) {
	const { headers: extraHeaders, body, ...restOptions } = options
	const hasBody = body !== undefined && body !== null

	const doFetch = () =>
		fetch(`${BASE}${url}`, {
			...restOptions,
			headers: {
				...(hasBody ? { 'Content-Type': 'application/json' } : {}),
				...extraHeaders
			},
			credentials: 'include',
			body: hasBody ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined
		})

	let res = await doFetch()

	// Si 401, intentar refrescar token UNA SOLA VEZ
	if (res.status === 401 && !url.includes('/refresh-token') && !url.includes('/logout')) {
		const refreshed = await refreshToken()
		if (refreshed) res = await doFetch()
	}

	const data = await res.json().catch(() => ({ error: 'Error desconocido' }))
	if (!res.ok) throw { response: { data, status: res.status } }
	return data
}

// Des-envuelve { data, pagination } → array; arrays planos pasan intactos.
export function unwrap(body) {
	if (Array.isArray(body)) return body
	return body?.data ?? []
}
