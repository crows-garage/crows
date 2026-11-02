<script>
	import { X, ChevronDown } from '@lucide/svelte'
	import { buildCategoryTree } from '#lib/utils.js'

	let { categories = [], onClose } = $props()

	const tree = $derived(buildCategoryTree(categories))
	const roots = $derived(tree.filter((c) => !c.parentId))

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

	let openCat = $state(false)
</script>

<div class="fixed inset-0 z-50 lg:hidden">
	<div class="absolute inset-0 bg-black/50" onclick={onClose}></div>
	<div class="absolute inset-y-0 left-0 w-80 max-w-[88vw] bg-surface border-r border-line flex flex-col animate-fade-in">
		<div class="flex items-center justify-between p-4 border-b border-line">
			<span class="font-brand text-signal text-base leading-none">CursoX</span>
			<button onclick={onClose} class="p-2 hover:bg-panel" aria-label="Cerrar menú">
				<X class="w-5 h-5 text-mute" />
			</button>
		</div>

		<div class="flex-1 overflow-y-auto p-3">
			{#each NAV_LINKS as link}
				<a
					href={link.href}
					onclick={onClose}
					class="block px-3 py-3 font-mono text-[12px] uppercase tracking-[0.08em] text-fg border-b border-line/50 hover:bg-panel hover:text-signal transition-colors"
				>
					{link.label}
				</a>
			{/each}

			{#if roots.length > 0}
				<div>
					<button
						type="button"
						onclick={() => (openCat = !openCat)}
						class="w-full flex items-center justify-between px-3 py-3 font-mono text-[12px] uppercase tracking-[0.08em] text-fg border-b border-line/50 hover:bg-panel"
					>
						<span>Rubros</span>
						<ChevronDown class={`w-4 h-4 transition-transform ${openCat ? 'rotate-180' : ''}`} />
					</button>

					{#if openCat}
						<div class="ml-4 border-l border-line py-1">
							{#each roots as root}
								<div>
									<a
										href={`/productos?categoria=${root.slug}`}
										onclick={onClose}
										class="block px-3 py-2 text-sm text-mute hover:bg-panel hover:text-fg transition-colors"
									>
										{root.name}
									</a>
									{#each root.children ?? [] as sub}
										<a
											href={`/productos?categoria=${sub.slug}`}
											onclick={onClose}
											class="block px-6 py-1 text-sm text-mute/70 hover:bg-panel hover:text-fg transition-colors"
										>
											{sub.name}
										</a>
									{/each}
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>
