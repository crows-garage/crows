<script>
	import { ArrowUpRight, BookOpen, Lightbulb, UsersRound } from '@lucide/svelte'

	const PILLARS = [
		['01', BookOpen, 'Aprendizaje', 'Un espacio para encontrar y compartir apuntes, materiales y recursos organizados por carreras y materias.'],
		['02', UsersRound, 'Comunidad', 'Una comunidad para conectar estudiantes de otros años, carreras y especialidades dentro y fuera del aula.'],
		['03', ArrowUpRight, 'Colaboración', 'La posibilidad de presentar una idea, encontrar talentos complementarios y formar un equipo.'],
		['04', Lightbulb, 'Innovación', 'Un entorno para llevar una inquietud hacia un proyecto, una investigación, un emprendimiento o una competencia.']
	]

	function scrollReveal(node) {
		if (!('IntersectionObserver' in window)) return

		node.classList.add('pillar-reveal-ready')
		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return
				entry.target.classList.add('pillar-reveal-visible')
				observer.disconnect()
			},
			{ threshold: 0.15 }
		)

		observer.observe(node)
		return { destroy: () => observer.disconnect() }
	}
</script>

<section id="pilares" class="py-16 sm:py-20 lg:py-28 border-t border-line">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div use:scrollReveal class="max-w-2xl mb-10 sm:mb-14 pillar-reveal">
			<p class="eyebrow !text-signal mb-3">02 · Una comunidad para hacer</p>
			<h2 class="font-display font-semibold text-3xl sm:text-4xl tracking-tight text-fg">Aprendé algo. Conocé a alguien. Creá algo nuevo.</h2>
		</div>
		<div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
			{#each PILLARS as [number, Icon, title, text], index}
				<article use:scrollReveal style={`--pillar-delay: ${index * 90}ms`} class="border rounded-xs border-line bg-surface p-6 sm:p-7 lg:min-h-[270px] pillar-reveal">
					<div class="mb-10 flex items-start justify-between">
						<Icon class="w-6 h-6 text-signal" strokeWidth={1.5} aria-hidden="true" />
						<span class="font-mono text-[10px] tracking-[0.2em] text-mute">{number}</span>
					</div>
					<h3 class="font-display font-semibold text-2xl tracking-tight text-fg">{title}</h3>
					<p class="mt-3 text-sm leading-relaxed text-mute">{text}</p>
				</article>
			{/each}
		</div>
	</div>
</section>

<style>
	:global(.pillar-reveal-ready) {
		opacity: 0;
		transform: translateY(18px);
		transition: opacity 0.65s ease, transform 0.65s ease;
		transition-delay: var(--pillar-delay, 0ms);
	}

	:global(.pillar-reveal-ready.pillar-reveal-visible) {
		opacity: 1;
		transform: translateY(0);
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.pillar-reveal-ready) {
			opacity: 1;
			transform: none;
			transition: none;
		}
	}
</style>
