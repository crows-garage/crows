<script>
	import { ArrowDown, ArrowRight, Sparkles } from '@lucide/svelte'
	import { imgUrl } from '#lib/utils.js'

	let { store = null, org = null } = $props()

	const name = $derived(org?.name || store?.name || 'CursoX')
	const cover = $derived(imgUrl(org?.coverImage))
	const logo = $derived(imgUrl(org?.logo || store?.logo))
</script>

<section class="relative flex min-h-[100svh] items-center overflow-hidden bg-night text-white">
	{#if cover}<img src={cover} alt="" class="absolute inset-0 w-full h-full object-cover opacity-20" />{/if}
	<div class="absolute inset-0 bg-gradient-to-br from-night via-night/95 to-gold/20"></div>
	<div class="absolute inset-0 graticule opacity-20" aria-hidden="true"></div>
	<div class="relative mx-auto grid min-h-[100svh] w-full max-w-7xl items-center gap-12 px-4 pb-10 pt-28 sm:px-6 sm:pb-14 sm:pt-32 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20 lg:px-8 lg:pt-28">
		<div>
			<div class="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
				{#if logo}<img src={logo} alt="" class="w-7 h-7 object-contain" />{:else}<Sparkles class="w-4 h-4" />{/if}
				<span>Desarrollado por estudiantes y devs del IES</span>
			</div>
			<h1 class="mt-7 max-w-4xl font-display font-semibold text-[clamp(3.5rem,10vw,8rem)] leading-[0.86] tracking-[-0.06em]">Aprendé.<br />Conectá.<br /><span class="text-gold">Creá.</span></h1>
			<p class="mt-8 max-w-2xl text-lg leading-relaxed text-white/75 sm:text-xl">{name} es una comunidad educativa y colaborativa para conectar personas, ideas y oportunidades. Nace en el IES y busca crecer como un proyecto de código abierto para cualquier estudiante con ganas de aprender y construir.</p>
			<div class="mt-9 flex flex-wrap gap-3">
				<a href="#proposito" class="btn btn-primary">Descubrí CursoX <ArrowDown class="w-3.5 h-3.5" /></a>
				<a href="#proyectos" class="btn border-white/30 text-white hover:text-night">Pensá en grande <ArrowRight class="w-3.5 h-3.5" /></a>
			</div>
			<div class="mt-8 max-w-xl border-l-2 border-gold/70 pl-4">
				<p class="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">Proyecto abierto · Para todos los IES</p>
				<p class="mt-2 text-sm leading-relaxed text-white/55">Si estudiás Desarrollo, Ciberseguridad o cualquier otra carrera, si tenés una idea o querés sumarte, CursoX también puede ser tu espacio. El repositorio público llegará pronto a GitHub.</p>
			</div>
			<p class="mt-7 font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">Aprendé hoy. Crecé mañana.</p>
		</div>
		<div class="border border-white/20 bg-night/60 p-5 sm:p-7 backdrop-blur-sm">
			<div class="mb-8 flex items-center justify-between border-b border-white/15 pb-4">
				<span class="eyebrow !text-gold">La idea en movimiento</span>
				<span class="font-mono text-[10px] text-white/50">01 / 04</span>
			</div>
			<p class="font-display font-semibold text-2xl sm:text-3xl leading-tight">Más que apuntes.<br />Una comunidad de ideas.</p>
			<p class="mt-5 text-sm leading-relaxed text-white/70">Un lugar para descubrir recursos, oportunidades y personas que quizás todavía no conocés.</p>
			<div class="mt-10 grid grid-cols-3 border-t border-white/15 pt-4 font-mono text-[9px] uppercase tracking-[0.14em] text-white/50">
				<span>Compartir</span><span class="text-center">Conectar</span><span class="text-right">Construir</span>
			</div>
		</div>
	</div>
</section>
