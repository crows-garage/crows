<script>
	import { formatPrice, getFirstImage, imgUrl } from '#lib/utils.js'

	let { products = [] } = $props()
</script>

{#if products?.length}
	<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-5">
		{#each products as product (product.id)}
			<a href={`/producto/${product.slug}`} class="group border rounded-xs border-line bg-surface block transition-colors hover:border-signal">
				<div class="relative aspect-square bg-panel overflow-hidden">
					{#if getFirstImage(product)}
						<img src={imgUrl(getFirstImage(product))} alt={product.name} loading="lazy" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
					{:else}
						<div class="absolute inset-0 graticule"></div>
					{/if}
					<span class="absolute bottom-2 left-2 font-mono text-[9px] tracking-[0.12em] text-mute bg-surface/80 px-1.5 py-0.5 tel">
						REF-{product.id}
					</span>
				</div>
				<div class="p-3">
					<h3 class="font-display font-semibold text-sm text-fg line-clamp-2 group-hover:text-signal transition-colors">{product.name}</h3>
					<p class="font-mono text-sm tel text-mute mt-1">{formatPrice(product.finalPrice || product.price)}</p>
				</div>
			</a>
		{/each}
	</div>
{/if}
