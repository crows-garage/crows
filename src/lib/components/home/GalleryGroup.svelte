// ≙ GalleryGroup (export de src/components/home/GalleryShowcase.jsx), usado
// por la home y por /galeria.
<script>
	import { ImageIcon, FileText, Play } from '@lucide/svelte'
	import { imgUrl } from '#lib/utils.js'

	let { gallery, index = 0 } = $props()

	const media = $derived(gallery.media || [])
	const sorted = $derived([...media].sort((a, b) => (a.position ?? 0) - (b.position ?? 0)))
</script>

{#snippet mediaTile(m, name)}
	{@const src = imgUrl(m.thumbnail || m.url)}
	{#if m.type === 'document'}
		<a
			href={imgUrl(m.url)}
			target="_blank"
			rel="noopener noreferrer"
			class="group relative aspect-square overflow-hidden bg-panel border border-line flex flex-col items-center justify-center gap-2 p-4 hover:border-signal transition-colors"
		>
			<FileText class="w-6 h-6 text-mute group-hover:text-signal transition-colors" />
			<span class="font-mono text-[9px] uppercase tracking-[0.18em] text-mute text-center line-clamp-2">
				{m.alt || 'Documento'}
			</span>
		</a>
	{:else}
		<a
			href={m.type === 'video' ? imgUrl(m.url) : src}
			target="_blank"
			rel="noopener noreferrer"
			class="group relative block aspect-square overflow-hidden bg-panel border border-line"
		>
			<img src={src} alt={m.alt || name} loading="lazy" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
			{#if m.type === 'video'}
				<span class="absolute inset-0 flex items-center justify-center bg-night/30">
					<span class="w-10 h-10 border border-brand/80 bg-night/60 flex items-center justify-center">
						<Play class="w-4 h-4 text-white fill-current" />
					</span>
				</span>
			{/if}
		</a>
	{/if}
{/snippet}

<article class="border border-line bg-surface">
	<div class="flex items-end justify-between gap-4 p-5 border-b border-line">
		<div class="min-w-0">
			<p class="eyebrow mb-1.5">Grupo {String(index + 1).padStart(2, '0')}</p>
			<h3 class="font-display font-semibold text-xl sm:text-2xl tracking-tight text-fg leading-snug">{gallery.name}</h3>
			{#if gallery.description}
				<p class="mt-2 text-sm text-mute leading-relaxed line-clamp-2">{gallery.description}</p>
			{/if}
		</div>
		<span class="font-mono text-[9px] uppercase tracking-[0.18em] text-mute tel shrink-0">
			{media.length} imagen{media.length !== 1 ? 'es' : ''}
		</span>
	</div>

	{#if sorted.length > 0}
		<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
			{#each sorted as m}
				<div class="border-r border-b border-line last:border-r-0">
					{@render mediaTile(m, gallery.name)}
				</div>
			{/each}
		</div>
	{:else}
		<div class="graticule flex flex-col items-center justify-center gap-2 py-14">
			<ImageIcon class="w-6 h-6 text-mute/50" />
			<span class="font-mono text-[10px] uppercase tracking-[0.28em] text-mute">Sin imágenes cargadas</span>
		</div>
	{/if}
</article>
