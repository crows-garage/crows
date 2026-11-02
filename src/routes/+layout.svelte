<script>
	import '../app.css'
	import '@fontsource/oswald/400.css'
	import '@fontsource/oswald/500.css'
	import '@fontsource/oswald/600.css'
	import '@fontsource/oswald/700.css'
	import '@fontsource/inter/400.css'
	import '@fontsource/inter/500.css'
	import '@fontsource/inter/600.css'
	import '@fontsource/inter/700.css'
	import '@fontsource/ibm-plex-mono/400.css'
	import '@fontsource/ibm-plex-mono/500.css'
	import '@fontsource/ibm-plex-mono/600.css'

	import { Toaster } from 'svelte-french-toast'
	import Navbar from '#lib/components/layout/Navbar.svelte'
	import Footer from '#lib/components/layout/Footer.svelte'
	import WhatsAppButton from '#lib/components/contact/WhatsAppButton.svelte'
	import AnalyticsTracker from '#lib/components/AnalyticsTracker.svelte'
	import { auth } from '#lib/stores/auth.svelte.js'
	import { hydrateCart } from '#lib/stores/cart.svelte.js'

	let { data, children } = $props()

	// ≙ useEffect(() => checkAuth()) del AuthProvider
	$effect(() => {
		auth.checkAuth()
	})

	// Carrito persistido: se lee recién después de hidratar (evita mismatch SSR)
	$effect(() => {
		hydrateCart()
	})

	const contact = $derived(data.store?.contact || {})
	const whatsappNumber = $derived(contact.whatsapp || '')
</script>

<svelte:head>
	<title>{data.metaTitle}</title>
	<meta name="description" content={data.metaDescription} />
	<link rel="icon" href={data.metaIcon} />
</svelte:head>

<AnalyticsTracker />
<Navbar categories={data.categories} store={data.store} org={data.org} />
<main class="min-h-screen bg-base transition-colors">
	{@render children()}
</main>
<Footer
	categories={data.categories}
	store={data.store}
	{contact}
	locals={data.locals}
	org={data.org}
/>
<WhatsAppButton phoneNumber={whatsappNumber} storeName={data.store?.name} />
<Toaster />
