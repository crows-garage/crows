import { defineEnvVars } from '@sveltejs/kit/env'

export const variables = defineEnvVars({
	PUBLIC_API_URL: { public: true, static: true },
	PUBLIC_STORE_SLUG: { public: true, static: true },
	PUBLIC_ORG_SLUG: { public: true, static: true }
})
