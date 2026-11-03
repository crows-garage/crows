<script>
	import { auth } from '#lib/stores/auth.svelte.js'
	import { page } from '$app/state'
	import { Menu, User, LogOut, Sun, Moon } from '@lucide/svelte'
	import { theme, toggleTheme } from '#lib/stores/theme.svelte.js'
	import MobileMenu from './MobileMenu.svelte'

	let { categories = [], store = null, org = null } = $props()

	let showMobile = $state(false)
	let scrolled = $state(false)

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
		{ href: '/about', label: 'Sobre Crow Projects' },
		{ href: '/galeria', label: 'Actividad' },
		{ href: '/blog', label: 'Publicaciones' },
		{ href: '/contacto', label: 'Contacto' }
	]

	function navLinkClass(active) {
		return active ? 'text-signal' : 'text-fg/70 hover:text-fg'
	}

	function activeBorder(active) {
		return active
			? 'after:absolute after:inset-x-0 after:-bottom-[5px] after:h-[2px] after:bg-signal'
			: ''
	}
</script>

<header class={`fixed top-4 inset-x-0 mx-auto  w-[calc(100%_-_2rem)] max-w-7xl z-40 border-b border-line bg-surface/90 backdrop-blur transition-colors duration-300 ${scrolled ? 'bg-surface' : ''}`}>
	<div class="px-4 sm:px-6">
		<div class="flex h-14 items-center justify-between gap-3">
			<button
				type="button"
				onclick={() => (showMobile = true)}
				class="lg:hidden order-first p-2 -ml-1 hover:bg-panel"
				aria-label="Abrir menú"
			>
				<Menu class="w-5 h-5 text-fg" />
			</button>

			<a href="/" class="shrink-0 flex items-center gap-3">
				<!-- Logo por tema: dark.svg = cuervo oscuro (tema claro), ligth.svg = cuervo beige (tema oscuro) -->
				<img src={$theme === 'dark' ? '/ligth.svg' : '/dark.svg'} alt="Crow Projects" width="28" height="28" class="w-7 h-7 object-contain" />
				<span class="font-display text-signal text-base sm:text-lg leading-none tracking-tight">Crow Projects</span>
			</a>

			<div class="flex items-center">
				<nav class="hidden lg:flex items-center gap-1 mr-2">
					{#each NAV_LINKS.slice(0, 6) as link}
						<a
							href={link.href}
							class={`relative px-2.5 py-2 font-display text-[11px] uppercase tracking-[0.08em] transition-colors ${navLinkClass(pathname === link.href)} ${activeBorder(pathname === link.href)}`}
						>
							{link.label}
						</a>
					{/each}
				</nav>

				{#if auth.user}
					<div class="relative group">
						<button type="button" class="flex items-center gap-1 p-2 text-fg/80 hover:text-signal hover:bg-panel transition-colors">
							<User class="w-5 h-5" />
							<span class="hidden md:inline text-sm">{auth.user.firstName}</span>
						</button>
						<div class="absolute right-0 top-full mt-1 w-44 bg-surface border rounded-xs border-line shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
							<a href="/orders" class="block w-full px-4 py-2.5 text-sm text-fg hover:bg-panel">Mis pedidos</a>
							<a href="/wishlist" class="block w-full px-4 py-2.5 text-sm text-fg hover:bg-panel">Favoritos</a>
							<button type="button" onclick={() => auth.logout()} class="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-rec hover:bg-panel">
								<LogOut class="w-4 h-4" />
								Cerrar sesión
							</button>
						</div>
					</div>
				{/if}

				<button
					type="button"
					onclick={toggleTheme}
					class="p-2 border rounded-xs border-line text-fg/80 hover:border-signal hover:text-signal transition-colors"
					aria-label={$theme === 'dark' ? 'Usar tema claro' : 'Usar tema oscuro'}
					title={$theme === 'dark' ? 'Usar tema claro' : 'Usar tema oscuro'}
				>
					{#if $theme === 'dark'}
						<Sun class="w-5 h-5" />
					{:else}
						<Moon class="w-5 h-5" />
					{/if}
				</button>
			</div>
		</div>
	</div>
</header>

{#if showMobile}
	<MobileMenu {categories} onClose={() => (showMobile = false)} />
{/if}
