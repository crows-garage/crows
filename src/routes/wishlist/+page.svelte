// ≙ src/app/wishlist/page.jsx: favoritos del cliente logueado.
<script>
	import { goto } from '$app/navigation'
	import { Loader2, Heart } from '@lucide/svelte'
	import { auth } from '$lib/stores/auth.svelte.js'
	import { authApi } from '$lib/api/auth.js'
	import ProductCard from '$lib/components/products/ProductCard.svelte'

	let items = $state([])
	let loading = $state(true)

	// ≙ useEffect: redirect a login si no hay usuario
	$effect(() => {
		if (!auth.loading && !auth.user) {
			goto('/login?redirect=/wishlist')
		}
	})

	// ≙ useEffect([user]): cargar wishlist
	$effect(() => {
		if (!auth.user) return
		authApi
			.getWishlist()
			.then((data) => (items = data.wishlist || []))
			.catch((err) => console.error('Error al cargar favoritos:', err))
			.finally(() => (loading = false))
	})
</script>

{#if auth.loading || loading}
	<div class="flex justify-center py-20">
		<Loader2 class="animate-spin text-signal" size={32} />
	</div>
{:else if !auth.user}
	<!-- ≙ return null del original -->
{:else}
	<div class="max-w-7xl mx-auto px-4 py-8">
		<div class="flex items-center gap-3 mb-8">
			<Heart class="text-signal" size={28} />
			<p class="eyebrow">VIGILANCIA · LISTA DE INTERÉS</p>
			<h1 class="font-saira text-2xl md:text-3xl font-semibold tracking-tight">Mis Favoritos</h1>
			{#if items.length > 0}
				<span class="text-sm text-mute">({items.length})</span>
			{/if}
		</div>

		{#if items.length === 0}
			<div class="panel p-10 text-center py-20">
				<Heart size={48} class="mx-auto text-mute/40 mb-4" />
				<p class="text-mute mb-4">No tenés productos en favoritos</p>
				<a href="/productos" class="btn btn-primary inline-flex">Explorar productos</a>
			</div>
		{:else}
			<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
				{#each items as item (item.id)}
					<ProductCard product={item.product} isFavorited={true} />
				{/each}
			</div>
		{/if}
	</div>
{/if}
