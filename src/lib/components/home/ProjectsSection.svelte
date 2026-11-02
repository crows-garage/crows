<script>
	import { ArrowUpRight, Check, Users } from '@lucide/svelte'

	let { projects = [] } = $props()

	const STEPS = [
		'Compartir una idea o proyecto',
		'Encontrar perfiles de otras disciplinas',
		'Formar un equipo y ponerlo en marcha'
	]
</script>

<section id="proyectos" class="py-16 sm:py-20 lg:py-28 border-t border-line">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1fr_0.9fr] gap-12 lg:gap-20 lg:items-center">
		<div>
			<p class="eyebrow !text-gold mb-3 flex items-center gap-2"><Users class="w-4 h-4" /> Del aula al mundo real</p>
			<h2 class="font-display font-semibold text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight text-fg">Tu próxima gran idea empieza con las personas correctas.</h2>
			<p class="mt-5 max-w-xl text-base sm:text-lg leading-relaxed text-mute">Un proyecto no siempre necesita más ideas. A veces solo necesita una conexión y un impulso. Encontrar personas que compartan tus intereses, descubrir proyectos en los que participar o conectar con quienes quieran sumarse a construir algo juntos.</p>
			<p class="mt-5 max-w-xl text-base sm:text-lg leading-relaxed text-fg">Eso es lo que queremos hacer posible con CursoX: conectar personas, ideas y oportunidades para que los proyectos puedan crecer.</p>
			<div class="mt-8 space-y-3">
				{#each STEPS as step}
					<div class="flex items-center gap-3 text-sm text-fg">
						<span class="w-6 h-6 shrink-0 flex items-center justify-center border border-gold text-gold"><Check class="w-3.5 h-3.5" /></span>
						{step}
					</div>
				{/each}
			</div>
		</div>
		<div class="relative overflow-hidden rounded-xl bg-night p-6 sm:p-8 text-white">
			<div class="absolute inset-0 graticule opacity-20" aria-hidden="true"></div>
			<div class="relative">
				<p class="eyebrow !text-gold">Caso real · BlackSun</p>
				<h3 class="mt-5 font-display font-semibold text-3xl sm:text-4xl tracking-tight">Las mejores ideas no trabajan solas.</h3>
				<p class="mt-5 text-sm leading-relaxed text-white/70">En BlackSun, un equipo del IMB llegó al primer puesto provincial y al octavo nacional en una competencia internacional. Para llevar el proyecto más lejos necesitábamos sumar diseño y más desarrollo. No había un espacio para encontrarnos.</p>
				<p class="mt-5 text-sm leading-relaxed text-white/70">CursoX también nace de esa experiencia: para que la próxima colaboración pueda empezar antes.</p>
				<a href="https://black-sun-project.vercel.app/" target="_blank" rel="noopener noreferrer" class="mt-7 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-gold hover:text-white">Conocé BlackSun <ArrowUpRight class="w-3.5 h-3.5" /></a>
			</div>
		</div>
	</div>
	{#if Array.isArray(projects) && projects.length > 0}
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
			<p class="eyebrow !text-gold mb-4">Proyectos publicados</p>
			<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each projects.slice(0, 3) as project}
					<article class="border border-line bg-surface p-5">
						<h3 class="font-display font-semibold text-xl text-fg">{project.name}</h3>
						{#if project.description}
							<p class="mt-2 text-sm text-mute leading-relaxed line-clamp-3">{project.description}</p>
						{/if}
					</article>
				{/each}
			</div>
		</div>
	{/if}
</section>
