<script>
	import '../app.css'
	/* 0SC1: cuerpo M PLUS 2 · display Rajdhani · técnico JetBrains Mono · marca Dela Gothic One */
	import '@fontsource/m-plus-2/latin-300.css'
	import '@fontsource/m-plus-2/latin-400.css'
	import '@fontsource/m-plus-2/latin-500.css'
	import '@fontsource/m-plus-2/latin-700.css'
	import '@fontsource/rajdhani/latin-500.css'
	import '@fontsource/rajdhani/latin-600.css'
	import '@fontsource/rajdhani/latin-700.css'
	import '@fontsource/jetbrains-mono/latin-400.css'
	import '@fontsource/jetbrains-mono/latin-500.css'
	import '@fontsource/jetbrains-mono/latin-600.css'
	import '@fontsource/dela-gothic-one/latin-400.css'

	import { Toaster } from 'svelte-french-toast'
	import Navbar from '#lib/components/layout/Navbar.svelte'
	import Footer from '#lib/components/layout/Footer.svelte'
	import AnalyticsTracker from '#lib/components/AnalyticsTracker.svelte'
	import { auth } from '#lib/stores/auth.svelte.js'
	import { hydrateCart } from '#lib/stores/cart.svelte.js'
	import { theme } from '#lib/stores/theme.svelte.js'

	let { data, children } = $props()

	// ≙ useEffect(() => checkAuth()) del AuthProvider
	$effect(() => {
		auth.checkAuth()
	})

	// Carrito persistido: se lee recién después de hidratar (evita mismatch SSR)
	$effect(() => {
		hydrateCart()
	})
</script>

<svelte:head>
	<title>{data.metaTitle}</title>
	<meta name="description" content={data.metaDescription} />
	<!-- Favicon por tema: mismo criterio que el logo del navbar -->
	<link rel="icon" href={$theme === 'dark' ? '/ligth.svg' : '/dark.svg'} type="image/svg+xml" />
</svelte:head>

<AnalyticsTracker />
<Navbar categories={data.categories} store={data.store} org={data.org} />
<main class="min-h-screen bg-base transition-colors">
	{@render children()}
</main>
<Footer
	categories={data.categories}
	store={data.store}
	contact={data.store?.contact || {}}
	locals={data.locals}
	org={data.org}
/>
<Toaster />
