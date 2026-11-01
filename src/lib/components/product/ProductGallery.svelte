// ≙ src/components/product/ProductGallery.jsx: thumbnails + lightbox.
// next/image fill → <img> absoluto.
<script>
	import { X, ChevronLeft, ChevronRight } from '@lucide/svelte'
	import { imgUrl } from '#lib/utils.js'

	let { images = [] } = $props()

	let active = $state(0)
	let showLightbox = $state(false)
	let lightboxIndex = $state(0)

	$effect(() => {
		document.body.style.overflow = showLightbox ? 'hidden' : ''
		return () => {
			document.body.style.overflow = ''
		}
	})

	function handleKey(e) {
		if (!showLightbox) return
		if (e.key === 'Escape') showLightbox = false
		if (e.key === 'ArrowLeft') lightboxIndex = (lightboxIndex - 1 + images.length) % images.length
		if (e.key === 'ArrowRight') lightboxIndex = (lightboxIndex + 1) % images.length
	}
</script>

<svelte:window onkeydown={handleKey} />

{#if !images?.length}
	<div class="relative aspect-square bg-panel flex items-center justify-center border border-line overflow-hidden">
		<div class="absolute inset-0 graticule"></div>
		<span class="relative font-mono text-[10px] uppercase tracking-[0.28em] text-mute">Sin imagen</span>
	</div>
{:else}
	<div class="flex gap-3">
		<!-- Thumbnails desktop -->
		<div class="hidden md:flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-1 scrollbar-hide">
			{#each images as img, i}
				<button
					type="button"
					onclick={() => (active = i)}
					class={`relative w-16 h-16 overflow-hidden border transition-all ${active === i ? 'border-signal' : 'border-line hover:border-mute'}`}
				>
					<img src={imgUrl(img)} alt={`Foto ${i + 1}`} loading="lazy" class="absolute inset-0 w-full h-full object-cover" />
				</button>
			{/each}
		</div>

		<!-- Main image -->
		<div class="flex-1">
			<button
				type="button"
				class="relative aspect-square bg-panel border border-line overflow-hidden w-full group"
				onclick={() => {
					lightboxIndex = active
					showLightbox = true
				}}
			>
				<img src={imgUrl(images[active])} alt="Producto" class="absolute inset-0 w-full h-full object-contain p-4" />
				<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
					<span class="font-mono text-[9px] uppercase tracking-[0.2em] text-mute border border-line bg-surface/90 px-2 py-1">Ampliar imagen</span>
				</div>
			</button>

			<!-- Thumbnails mobile -->
			<div class="flex md:hidden gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
				{#each images as img, i}
					<button
						type="button"
						onclick={() => (active = i)}
						class={`relative w-16 h-16 overflow-hidden border shrink-0 transition-all ${active === i ? 'border-signal' : 'border-line'}`}
					>
						<img src={imgUrl(img)} alt={`Foto ${i + 1}`} loading="lazy" class="absolute inset-0 w-full h-full object-cover" />
					</button>
				{/each}
			</div>
		</div>
	</div>

	<!-- Lightbox Modal -->
	{#if showLightbox}
		<div class="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onclick={() => (showLightbox = false)}>
			<button
				type="button"
				onclick={() => (showLightbox = false)}
				class="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
				aria-label="Cerrar"
			>
				<X class="w-6 h-6" />
			</button>

			<div class="absolute top-4 left-4 text-white/60 text-sm">{lightboxIndex + 1} / {images.length}</div>

			{#if images.length > 1}
				<button
					type="button"
					onclick={(e) => {
						e.stopPropagation()
						lightboxIndex = (lightboxIndex - 1 + images.length) % images.length
					}}
					class="absolute left-4 z-10 w-10 h-10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
					aria-label="Anterior"
				>
					<ChevronLeft class="w-8 h-8" />
				</button>
			{/if}

			<div class="relative w-full h-full flex items-center justify-center p-8" onclick={(e) => e.stopPropagation()}>
				<img src={imgUrl(images[lightboxIndex])} alt={`Foto ${lightboxIndex + 1}`} class="absolute inset-0 w-full h-full object-contain" />
			</div>

			{#if images.length > 1}
				<button
					type="button"
					onclick={(e) => {
						e.stopPropagation()
						lightboxIndex = (lightboxIndex + 1) % images.length
					}}
					class="absolute right-4 z-10 w-10 h-10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
					aria-label="Siguiente"
				>
					<ChevronRight class="w-8 h-8" />
				</button>
			{/if}
		</div>
	{/if}
{/if}
