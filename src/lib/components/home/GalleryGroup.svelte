<script>
	import { ImageIcon, FileText } from '@lucide/svelte'
	import { imgUrl } from '#lib/utils.js'

	let { gallery, index = 0, mediaOverride = null } = $props()

	const media = $derived(mediaOverride ?? gallery.media ?? [])
	const sorted = $derived([...media].sort((a, b) => (a.position ?? 0) - (b.position ?? 0)))
</script>

{#snippet mediaTile(m, name)}
	{@const src = imgUrl(m.thumbnail || m.url)}
	{#if m.type === 'document'}
		<a
			href={imgUrl(m.url)}
			target="_blank"
			rel="noopener noreferrer"
			class="group relative aspect-square overflow-hidden bg-panel border rounded-xs border-line flex flex-col items-center justify-center gap-2 p-4 hover:border-signal transition-colors"
		>
			<FileText class="w-6 h-6 text-mute group-hover:text-signal transition-colors" />
			<span class="font-mono text-[9px] uppercase tracking-[0.18em] text-mute text-center line-clamp-2">
				{m.alt || 'Documento'}
			</span>
		</a>
	{:else if m.type === 'video'}
		<div class="group relative aspect-square overflow-hidden bg-panel border rounded-xs border-line">
			<video
				src={imgUrl(m.url)}
				poster={m.thumbnail ? imgUrl(m.thumbnail) : undefined}
				controls
				muted
				playsinline
				preload="metadata"
				aria-label={m.alt || name}
				class="absolute inset-0 w-full h-full object-cover"
			></video>
		</div>
	{:else}
		<a
			href={src}
			target="_blank"
			rel="noopener noreferrer"
			class="group relative block aspect-square overflow-hidden bg-panel border rounded-xs border-line"
		>
			<img src={src} alt={m.alt || name} loading="lazy" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
		</a>
	{/if}
{/snippet}

<article class="border rounded-xs border-line bg-surface">
	<div class="flex items-end justify-between gap-4 p-5 border-b border-line">
		<div class="min-w-0">
			<p class="eyebrow mb-1.5">Grupo {String(index + 1).padStart(2, '0')}</p>
			<h3 class="font-display font-semibold text-xl sm:text-2xl tracking-tight text-fg leading-snug">{gallery.name}</h3>
			{#if gallery.description}
				<p class="mt-2 text-sm text-mute leading-relaxed line-clamp-2">{gallery.description}</p>
			{/if}
		</div>
		<span class="font-mono text-[9px] uppercase tracking-[0.18em] text-mute tel shrink-0">
			{media.length} elemento{media.length !== 1 ? 's' : ''}
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
