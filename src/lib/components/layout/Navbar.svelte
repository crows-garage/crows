<script>
	import { auth } from '#lib/stores/auth.svelte.js'
	import { page } from '$app/state'
	import { Menu, User, LogOut } from '@lucide/svelte'
	import MobileMenu from './MobileMenu.svelte'
	import { imgUrl } from '#lib/utils.js'

	let { categories = [], store = null, org = null } = $props()

	let showMobile = $state(false)

	const pathname = $derived(page.url.pathname)

	const NAV_LINKS = [
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

	<header class="glass-nav fixed top-4 inset-x-0 z-40 mx-auto w-[calc(100%_-_2rem)] max-w-7xl rounded-2xl border transition-colors duration-300 lg:top-0 lg:mx-0 lg:w-full lg:max-w-none lg:rounded-none lg:border-x-0 lg:shadow-none">
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
				<img src="/dark.svg" alt="Crow Projects" width="28" height="28" class="w-7 h-7 object-contain" />
				<span class="font-display text-signal text-base sm:text-lg leading-none tracking-tight">Crow Projects</span>
			</a>

			<div class="flex items-center">
				<nav class="hidden lg:flex items-center gap-1 mr-2">
					{#each NAV_LINKS.slice(0, 5) as link}
						<a
							href={link.href}
							class={`relative px-3 py-2 font-display text-[13px] font-semibold uppercase tracking-[0.08em] transition-colors ${navLinkClass(pathname === link.href)} ${activeBorder(pathname === link.href)}`}
						>
							{link.label}
						</a>
					{/each}
				</nav>

				{#if auth.user}
					<div class="relative group">
						<button type="button" class="flex items-center p-1 text-fg/80 hover:text-signal transition-colors" aria-label="Abrir menú de perfil">
							<span class="grid h-8 w-8 place-items-center overflow-hidden rounded-full border border-line bg-panel text-signal">
								{#if auth.user.avatarUrl}<img src={imgUrl(auth.user.avatarUrl)} alt="" class="h-full w-full object-cover" />{:else}<User class="h-4 w-4" />{/if}
							</span>
						</button>
						<div class="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-2xl border border-line bg-panel shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
							<a href="/perfil" class="block w-full px-4 py-2.5 text-sm text-fg hover:bg-panel">Mi perfil</a>
							<a href="/proyectos/nuevo" class="block w-full px-4 py-2.5 text-sm text-fg hover:bg-panel">Crear proyecto</a>
							<a href="/orders" class="block w-full px-4 py-2.5 text-sm text-fg hover:bg-panel">Mis pedidos</a>
							<a href="/wishlist" class="block w-full px-4 py-2.5 text-sm text-fg hover:bg-panel">Favoritos</a>
							<button type="button" onclick={() => auth.logout()} class="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-rec hover:bg-panel">
								<LogOut class="w-4 h-4" />
								Cerrar sesión
							</button>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</header>

{#if showMobile}
	<MobileMenu {categories} onClose={() => (showMobile = false)} />
{/if}
