<script>
	import { ArrowDown, ArrowRight, ChevronLeft, ChevronRight, Play } from '@lucide/svelte'
	import { HERO_MEDIA } from '#lib/data/heroMedia.js'
	import { imgUrl } from '#lib/utils.js'

	let { store = null, org = null } = $props()

	let activeIndex = $state(HERO_MEDIA.length > 1 ? 1 : 0)
	const activeMedia = $derived(HERO_MEDIA[activeIndex])
	const cover = $derived(imgUrl(org?.coverImage))

	$effect(() => {
		const timer = window.setInterval(() => {
			activeIndex = (activeIndex + 1) % HERO_MEDIA.length
		}, 8000)

		return () => window.clearInterval(timer)
	})

	function previousMedia() {
		activeIndex = (activeIndex - 1 + HERO_MEDIA.length) % HERO_MEDIA.length
	}

	function nextMedia() {
		activeIndex = (activeIndex + 1) % HERO_MEDIA.length
	}
</script>

<section class="relative flex min-h-[100svh] items-center overflow-hidden bg-night text-white">
	<!-- Background video remains the main visual layer. -->
	<video
		src="/video4.mp4"
		class="absolute inset-0 w-full h-full object-cover opacity-20"
		autoplay
		muted
		loop
		playsinline
		preload="metadata"
	></video>
	{#if org?.coverImage}
		<img src={cover} alt="" class="absolute inset-0 w-full h-full object-cover opacity-20" />
	{/if}
	<div class="absolute inset-0 bg-gradient-to-br from-night via-night/95 to-brand/20"></div>
	<div class="absolute inset-0 graticule opacity-20" aria-hidden="true"></div>

	<div class="relative mx-auto grid min-h-[100svh] w-full max-w-7xl items-center gap-12 px-4 pb-10 pt-28 sm:px-6 sm:pb-14 sm:pt-32 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20 lg:px-8 lg:pt-28">
		<div>
			<h1 class="mt-7 max-w-4xl font-display font-semibold text-[clamp(3.2rem,8vw,7rem)] leading-[0.88] tracking-[-0.06em]">
				Las ideas<br />nos <span class="text-brand">conectan.</span><br />
				Los equipos<br />las hacen <span class="text-brand">realidad.</span>
			</h1>
			<div class="mt-9 flex flex-wrap gap-3">
				<a href="#proposito" class="btn btn-primary">Descubrí Crow Projects <ArrowDown class="w-3.5 h-3.5" /></a>
				<a href="https://github.com/crows-garage/crows" class="btn border-white/30 text-white hover:text-brand">Pensá en grande <ArrowRight class="w-3.5 h-3.5" /></a>
			</div>
			<div class="mt-8 max-w-xl border-l-2 border-brand/70 pl-4">
				<p class="font-mono text-[10px] uppercase tracking-[0.16em] text-brand">Proyecto abierto · Para todos los IES</p>
				<p class="mt-2 text-sm leading-relaxed text-white/55">
					Si estudiás Desarrollo, Ciberseguridad o cualquier otra carrera, si tenés una idea o querés sumarte, Crow Projects también puede ser tu espacio.
				</p>
			</div>
		</div>

		<div class="overflow-hidden rounded-xs border border-brand/30 bg-night/70 backdrop-blur-sm">
			<div class="relative aspect-video bg-black/40">
				{#key activeMedia.src}
					<video
						src={activeMedia.src}
						class="absolute inset-0 h-full w-full object-cover"
						autoplay
						muted
						loop
						playsinline
						preload="metadata"
					></video>
				{/key}
				<div class="absolute inset-0 bg-gradient-to-t from-night/90 via-transparent to-transparent"></div>
				<div class="absolute left-4 top-4 flex items-center gap-2">
					<span class="flex items-center gap-1.5 rounded-xs border border-brand/60 bg-night/70 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-brand">
						<Play size={10} fill="currentColor" /> {activeMedia.label}
					</span>
				</div>
				<div class="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
					<p class="font-display text-lg leading-tight text-white">{activeMedia.title}</p>
					<span class="font-mono text-[10px] text-white/60">{String(activeIndex + 1).padStart(2, '0')} / {String(HERO_MEDIA.length).padStart(2, '0')}</span>
				</div>
			</div>

			<div class="p-5 sm:p-6">
				<div class="flex items-center justify-between gap-3 border-b border-white/15 pb-4">
					<span class="eyebrow !text-brand">Eventos y proyectos en movimiento</span>
					<div class="flex items-center gap-1">
						<button type="button" onclick={previousMedia} class="p-1 text-white/60 hover:text-brand" aria-label="Video anterior"><ChevronLeft size={16} /></button>
						<button type="button" onclick={nextMedia} class="p-1 text-white/60 hover:text-brand" aria-label="Video siguiente"><ChevronRight size={16} /></button>
					</div>
				</div>
				<p class="mt-4 text-sm leading-relaxed text-white/70">Mirá lo que estamos construyendo y encontrá el próximo proyecto del que quieras formar parte.</p>
				<div class="mt-5 flex gap-1.5" aria-label="Seleccionar video">
					{#each HERO_MEDIA as media, index}
						<button
							type="button"
							onclick={() => (activeIndex = index)}
							class={`h-1.5 flex-1 rounded-full transition-colors ${activeIndex === index ? 'bg-brand' : 'bg-white/20 hover:bg-white/40'}`}
							aria-label={`Mostrar ${media.title}`}
						></button>
					{/each}
				</div>
			</div>
		</div>
	</div>
</section>
