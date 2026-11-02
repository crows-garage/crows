<script>
	import { api } from '#lib/api/store.js'
	import { auth } from '#lib/stores/auth.svelte.js'
	import { page } from '$app/state'
	import { Search, Menu, User, LogOut } from '@lucide/svelte'
	import { imgUrl } from '#lib/utils.js'
	import SearchBar from './SearchBar.svelte'
	import MobileMenu from './MobileMenu.svelte'

	let { categories = [], store = null, org = null } = $props()

	let showMobile = $state(false)
	let scrolled = $state(false)
	let products = $state([])

	$effect(() => {
		api.products()
			.then((data) => (products = Array.isArray(data) ? data : []))
			.catch(() => (products = []))
	})

	$effect(() => {
		const handler = () => (scrolled = window.scrollY > 10)
		window.addEventListener('scroll', handler)
		return () => window.removeEventListener('scroll', handler)
	})

	const pathname = $derived(page.url.pathname)

	const NAV_LINKS = [
		{ href: '/', label: 'Inicio' },
		{ href: '/productos', label: 'Recursos' },
		{ href: '/turnos', label: 'Turnos' },
		{ href: '/comunidad', label: 'Comunidad' },
		{ href: '/biblioteca', label: 'Biblioteca' },
		{ href: '/proyectos', label: 'Proyectos' },
		{ href: '/about', label: 'Sobre CursoX' },
		{ href: '/galeria', label: 'Actividad' },
		{ href: '/blog', label: 'Publicaciones' },
		{ href: '/contacto', label: 'Contacto' }
	]

	function navLinkClass(active) {
		return active ? 'text-night font-semibold' : 'text-fg/80 hover:text-night'
	}

	function activeBorder(active) {
		return active
			? 'after:absolute after:inset-x-0 after:-bottom-1 after:h-[3px] after:bg-gold after:rounded-full'
			: ''
	}
</script>

<header class={`fixed top-4 left-4 right-4 z-40 mx-auto max-w-6xl rounded-2xl border border-line/80 bg-surface/90 shadow-lg shadow-night/10 backdrop-blur-xl transition-all duration-300 ${scrolled ? 'shadow-xl' : ''}`}>
	<div class="px-3 sm:px-4">
		<div class="flex h-14 items-center justify-between gap-3">
			<button
				type="button"
				onclick={() => (showMobile = true)}
				class="lg:hidden order-first p-2 -ml-1 hover:bg-panel rounded-xl"
				aria-label="Abrir menú"
			>
				<Menu class="w-5 h-5 text-fg" />
			</button>

			<a href="/" class="shrink-0 flex items-center gap-3">
				{#if store?.logo}
					<img src={imgUrl(store.logo)} alt={store?.name || org?.name || 'Institución'} width="44" height="44" class="w-11 h-11 object-contain rounded-full bg-cream p-1" />
				{:else if org?.logo}
					<img src={imgUrl(org.logo)} alt={org?.name || 'Institución'} width="44" height="44" class="w-11 h-11 object-contain rounded-full bg-cream p-1" />
				{:else}
					<span class="w-11 h-11 rounded-full bg-cream flex items-center justify-center font-display font-bold text-night text-lg">{(org?.name || 'IN')[0]?.toUpperCase()}</span>
				{/if}
				<span class="font-display font-semibold text-night text-lg sm:text-xl tracking-tight leading-tight">CursoX</span>
			</a>

			<div class="hidden 2xl:block flex-1 max-w-xs ml-4">
				<SearchBar {categories} {products} />
			</div>

			<div class="flex items-center">
				<nav class="hidden lg:flex items-center gap-0.5 mr-2">
					{#each NAV_LINKS.slice(0, 6) as link}
						<a
							href={link.href}
							class={`relative px-2.5 py-2 text-xs font-medium transition-colors ${navLinkClass(pathname === link.href)} ${activeBorder(pathname === link.href)}`}
						>
							{link.label}
						</a>
					{/each}
				</nav>

				{#if auth.user}
					<div class="relative group">
						<button type="button" class="flex items-center gap-1 p-2 rounded-lg text-fg/80 hover:text-night hover:bg-panel transition-colors">
							<User class="w-5 h-5" />
							<span class="hidden md:inline text-sm">{auth.user.firstName}</span>
						</button>
						<div class="absolute right-0 top-full mt-1 w-44 bg-surface border border-line rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
							<a href="/orders" class="block w-full px-4 py-2.5 text-sm text-fg hover:bg-panel">Mis pedidos</a>
							<a href="/wishlist" class="block w-full px-4 py-2.5 text-sm text-fg hover:bg-panel">Favoritos</a>
							<button type="button" onclick={() => auth.logout()} class="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-panel">
								<LogOut class="w-4 h-4" />
								Cerrar sesión
							</button>
						</div>
					</div>
				{:else}
					<a href="/login" class="flex items-center gap-1 px-3 py-2 rounded-lg text-fg/80 hover:text-night hover:bg-panel transition-colors">
						<User class="w-5 h-5" />
						<span class="hidden md:inline text-sm">Ingresar</span>
					</a>
				{/if}
			</div>
		</div>
	</div>
</header>

{#if showMobile}
	<MobileMenu {categories} onClose={() => (showMobile = false)} />
{/if}
