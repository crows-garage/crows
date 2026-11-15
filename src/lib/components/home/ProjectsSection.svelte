<script>
	import { ArrowUpRight, Check, Users } from "@lucide/svelte";
	import { imgUrl } from "#lib/utils.js";

	let { projects = [] } = $props();
</script>

<section id="proyectos" class="py-10 sm:py-16 lg:py-20 border-t border-line">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="grid lg:grid-cols-[1fr] gap-6">
			<div>
				<p class="eyebrow !text-signal mb-3 flex items-center gap-2">
					<Users class="w-4 h-4" /> 03 · PROYECTOS DE LA COMUNIDAD
				</p>
				<h2
					class="font-display font-semibold text-2xl sm:text-3xl lg:text-4xl leading-tight tracking-tight text-fg"
				>
					Las ideas nos conectan. Los equipos las hacen realidad
				</h2>
				<p class="mt-3 text-base sm:text-lg leading-relaxed text-mute">
					Un proyecto no siempre necesita más ideas. A veces solo necesita
					una conexión y un impulso. Encontrar personas que compartan tus
					intereses, descubrir proyectos en los que participar o conectar
					con quienes quieran sumarse a construir algo juntos.
				</p>
				<p class="mt-3 text-sm leading-relaxed text-fg">
					Eso es lo que queremos hacer posible con Crow Projects: conectar
					personas, ideas y oportunidades para que los proyectos puedan
					crecer.
				</p>
			</div>
		</div>
	</div>
	{#if Array.isArray(projects) && projects.length > 0}
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
			<p class="eyebrow !text-signal mb-4">Proyectos publicados · {projects.length}</p>
			<div class="grid grid-cols-2 gap-3">
				{#each projects.slice(0, 3) as project}
					<article class="border rounded-xs border-line bg-surface overflow-hidden">
						<a href={`/proyecto/${project.slug || project.id}`} class="block">
							{#if project.coverImage}
								<img src={imgUrl(project.coverImage)} alt={project.name} loading="lazy" class="h-32 w-full object-cover" />
							{/if}
							<div class="p-3">
								<h3 class="font-display font-semibold text-base text-fg hover:text-signal transition-colors">
									{project.name}
								</h3>
								{#if project.description}
									<p class="mt-1 text-xs text-mute leading-relaxed line-clamp-2">{project.description}</p>
								{/if}
							</div>
						</a>
					</article>
				{/each}
			</div>
		</div>
	{/if}
</section>
