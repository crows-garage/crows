// ≙ src/components/AnalyticsTracker.jsx: PAGE_VIEW por ruta con UTMs.
<script>
	import { page } from '$app/state'
	import { trackEvent } from '#lib/api/analytics.js'

	$effect(() => {
		const pathname = page.url.pathname
		const searchParams = page.url.searchParams

		trackEvent('PAGE_VIEW', {
			pathname,
			utmSource: searchParams.get('utm_source') || null,
			utmMedium: searchParams.get('utm_medium') || null,
			utmCampaign: searchParams.get('utm_campaign') || null,
			utmContent: searchParams.get('utm_content') || null,
			utmTerm: searchParams.get('utm_term') || null,
			searchQuery: searchParams.get('q') || null
		})
	})
</script>
