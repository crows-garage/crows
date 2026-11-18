<script>
	import { ArrowLeft, CheckCircle2, ExternalLink, Flag, MapPin, Users, X } from '@lucide/svelte'
	import { imgUrl } from '#lib/utils.js'
	import { auth } from '#lib/stores/auth.svelte.js'
	import { organizationApi } from '#lib/api/organization.js'

	let { data } = $props()
	const project = $derived(data.project)

	const gallery = $derived.by(() => [
		...(project.coverImage ? [{ src: imgUrl(project.coverImage), alt: project.name }] : []),
		...(project.images || [])
			.slice()
			.sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
			.filter((image) => image?.url)
			.map((image) => ({ src: imgUrl(image.url), alt: image.alt || project.name }))
	])

	let active = $state(0)
	let application = $state(null)
	let applicationLoading = $state(false)
	let applicationError = $state('')
	let showApplicationForm = $state(false)
	let showSuccessModal = $state(false)
	let applicationChecked = $state(false)
	let applicationForm = $state({ message: '', skills: '', availability: '' })

	$effect(() => {
		if (auth.user && project?.id) {
			organizationApi.getMyProjectApplication(project.id)
				.then((value) => (application = value?.data ?? value))
				.catch(() => (application = null))
				.finally(() => (applicationChecked = true))
		}
	})

	$effect(() => {
		if (applicationChecked && auth.user && !application && typeof window !== 'undefined' && window.location.hash === '#participacion') {
			showApplicationForm = true
		}
	})

	async function apply() {
		applicationLoading = true
		applicationError = ''
		try {
			const result = await organizationApi.applyToProject(project.id, applicationForm)
			application = result?.data ?? result
			showApplicationForm = false
			showSuccessModal = true
		} catch (error) {
			applicationError = error?.response?.data?.message || error?.response?.data?.error || error.message || 'No se pudo enviar la solicitud'
		} finally {
			applicationLoading = false
		}
	}

	const STATUS_LABELS = {
		ACTIVE: 'En curso',
		COMPLETED: 'Completado',
		CANCELLED: 'Cancelado'
	}

	const MILESTONE_LABELS = {
		PLANNED: 'Planificado',
		IN_PROGRESS: 'En progreso',
		DONE: 'Completado',
		DELAYED: 'Demorado'
	}

	function formatDate(value) {
		if (!value) return ''
		return new Date(value).toLocaleDateString('es-AR', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		})
	}
</script>

<svelte:head>
	<title>{project.name || 'Proyecto'} — Crow Projects</title>
	<meta name="description" content={project.description?.slice(0, 160) || 'Detalle del proyecto'} />
</svelte:head>

<div class="min-h-screen bg-base pt-20 pb-16">
	<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
		<a href="/proyectos" class="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-mute hover:text-fg transition-colors">
			<ArrowLeft size={14} /> Volver a proyectos
		</a>

		<div class="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-12 mt-8">
			<section>
				{#if gallery.length > 0}
					<div class="relative aspect-[4/3] overflow-hidden rounded-xs border border-line bg-panel">
						<img src={gallery[active].src} alt={gallery[active].alt} class="absolute inset-0 h-full w-full object-cover" />
					</div>
					{#if gallery.length > 1}
						<div class="grid grid-cols-5 gap-2 mt-3">
							{#each gallery as image, index}
								<button
									type="button"
									onclick={() => (active = index)}
									class={`relative aspect-square overflow-hidden rounded-xs border ${active === index ? 'border-signal' : 'border-line hover:border-mute'}`}
									aria-label={`Mostrar imagen ${index + 1}`}
								>
									<img src={image.src} alt={image.alt} loading="lazy" class="absolute inset-0 h-full w-full object-cover" />
								</button>
							{/each}
						</div>
					{/if}
				{:else}
					<div class="aspect-[4/3] border border-line rounded-xs bg-panel flex items-center justify-center text-xs uppercase tracking-[0.2em] text-mute">
						Sin imágenes
					</div>
				{/if}
			</section>

			<section class="space-y-6">
				<div>
					<div class="flex flex-wrap items-center gap-2 mb-3">
						<span class="text-[10px] uppercase tracking-[0.2em] text-signal">Proyecto</span>
						{#if project.status}
							<span class="text-[10px] uppercase tracking-[0.15em] border border-line rounded-xs px-2 py-1 text-mute">
								{STATUS_LABELS[project.status] || project.status}
							</span>
						{/if}
					</div>
					<h1 class="font-display font-semibold text-3xl sm:text-5xl leading-tight tracking-tight text-fg">{project.name}</h1>
					{#if project.category}
						<p class="mt-3 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-mute"><MapPin size={13} /> {project.category}</p>
					{/if}
					{#if project.creator?.firstName}
						<p class="mt-3 text-xs text-mute">Creado por <strong class="text-fg">{project.creator.firstName} {project.creator.lastName || ''}</strong>{project.creator.profession ? ` · ${project.creator.profession}` : ''}</p>
					{/if}
				</div>

				{#if project.description}
					<p class="text-base leading-relaxed text-fg/80 whitespace-pre-line">{project.description}</p>
				{/if}

				{#if project.links?.length}
					<div class="flex flex-wrap gap-2">
						{#each project.links as link}
							<a href={link.url} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 border border-line px-3 py-2 text-xs text-fg hover:border-signal hover:text-signal transition-colors"><ExternalLink size={13} /> {link.title}</a>
						{/each}
					</div>
				{/if}

				<div class="border border-line bg-panel p-4">
					<div id="participacion" class="scroll-mt-24">
					<div class="flex items-center gap-2 text-sm text-fg"><Users size={15} class="text-signal" /> Participación</div>
					{#if !auth.user}
						<p class="mt-2 text-xs text-mute">Ingresá o registrate para enviar tu solicitud.</p>
						<div class="mt-3 flex flex-wrap gap-2">
							<a href={`/login?redirect=${encodeURIComponent(`/proyecto/${project.slug || project.id}#participacion`)}`} class="inline-flex items-center justify-center bg-signal text-base px-4 py-2 text-xs font-medium hover:bg-brand">Ingresar</a>
							<a href={`/register?redirect=${encodeURIComponent(`/proyecto/${project.slug || project.id}#participacion`)}`} class="inline-flex items-center justify-center border border-line text-fg px-4 py-2 text-xs font-medium hover:border-signal hover:text-signal">Registrarse</a>
						</div>
					{:else if application?.status === 'PENDING'}
						<div class="mt-3 flex items-start gap-3 rounded-xl border border-brand/40 bg-brand/10 p-4 text-brand">
							<CheckCircle2 size={18} class="mt-0.5 shrink-0" />
							<div><p class="text-sm font-semibold">Solicitud enviada correctamente</p><p class="mt-1 text-xs leading-relaxed text-fg/70">Recibimos tu propuesta para este proyecto. El equipo la revisará y te avisará cuando haya novedades.</p></div>
						</div>
					{:else if application?.status === 'ACCEPTED'}
						<p class="mt-2 text-xs text-signal">Ya participás en este proyecto.</p>
					{:else}
						<button type="button" onclick={() => (showApplicationForm = !showApplicationForm)} class="mt-3 bg-signal text-base px-4 py-2 text-xs font-medium hover:bg-brand">Participar en el proyecto</button>
					{/if}
					</div>
				</div>

				<div class="border-t border-line pt-5 space-y-3">
					<div class="flex items-center justify-between text-xs uppercase tracking-[0.14em] text-mute">
						<span>Progreso</span>
						<span>{project.progress || 0}%</span>
					</div>
					<div class="h-2 bg-line/40 overflow-hidden">
						<div class="h-full bg-signal" style={`width: ${project.progress || 0}%`}></div>
					</div>
					<div class="flex flex-wrap gap-x-5 gap-y-1 text-xs text-mute">
						{#if project.startDate}<span>Inicio: {formatDate(project.startDate)}</span>{/if}
						{#if project.endDate}<span>Cierre estimado: {formatDate(project.endDate)}</span>{/if}
					</div>
				</div>
			</section>
		</div>

		{#if project.milestones?.length}
			<section class="mt-12 border-t border-line pt-8">
				<h2 class="eyebrow mb-5 flex items-center gap-2"><Flag size={13} /> Hoja de ruta</h2>
				<div class="grid gap-4 md:grid-cols-2">
					{#each project.milestones as milestone, index}
						<div class="border border-line rounded-xs p-4 bg-panel">
							<div class="flex items-start gap-3">
								<span class="w-6 h-6 shrink-0 border border-line rounded-xs flex items-center justify-center text-xs text-mute">{index + 1}</span>
								<div>
									<h3 class="text-sm text-fg">{milestone.title}</h3>
									<p class="mt-1 text-[10px] uppercase tracking-[0.12em] text-signal">{MILESTONE_LABELS[milestone.status] || milestone.status}</p>
									{#if milestone.description || milestone.dueDate}
										<p class="mt-2 text-xs text-mute">{milestone.description || ''}{milestone.dueDate ? ` · ${formatDate(milestone.dueDate)}` : ''}</p>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/if}
	</div>
</div>

{#if showApplicationForm}
	<div class="fixed inset-0 z-50 grid place-items-center bg-night/70 p-4 backdrop-blur-sm" role="presentation" onclick={(event) => event.target === event.currentTarget && (showApplicationForm = false)}>
		<div class="relative w-full max-w-lg rounded-2xl border border-line bg-panel p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="application-form-title">
			<button type="button" onclick={() => (showApplicationForm = false)} class="absolute right-4 top-4 text-mute hover:text-fg" aria-label="Cerrar formulario"><X size={18} /></button>
			<p class="eyebrow text-signal">Participación</p>
			<h2 id="application-form-title" class="mt-2 font-display text-2xl font-semibold text-fg">Participar en el proyecto</h2>
			<p class="mt-2 text-sm text-mute">Contanos cómo te gustaría aportar a <strong class="text-fg">{project.name}</strong>.</p>
			<form onsubmit={(event) => { event.preventDefault(); apply() }} class="mt-5 space-y-3">
				<textarea bind:value={applicationForm.message} placeholder="¿Por qué te interesa participar?" class="input min-h-24 w-full"></textarea>
				<input bind:value={applicationForm.skills} placeholder="Tus habilidades" class="input w-full" />
				<input bind:value={applicationForm.availability} placeholder="Disponibilidad" class="input w-full" />
				{#if applicationError}<p class="text-xs text-rec">{applicationError}</p>{/if}
				<div class="flex justify-end gap-2 pt-2">
					<button type="button" onclick={() => (showApplicationForm = false)} class="btn text-xs">Cancelar</button>
					<button type="submit" disabled={applicationLoading} class="btn btn-primary text-xs">{applicationLoading ? 'Enviando...' : 'Enviar solicitud'}</button>
				</div>
			</form>
		</div>
	</div>
{/if}

{#if showSuccessModal}
	<div class="fixed inset-0 z-50 grid place-items-center bg-night/70 p-4 backdrop-blur-sm" role="presentation" onclick={(event) => event.target === event.currentTarget && (showSuccessModal = false)}>
		<div class="glass-card relative w-full max-w-md rounded-2xl border border-signal/40 p-7 text-center shadow-none" role="dialog" aria-modal="true" aria-labelledby="application-success-title">
			<button type="button" onclick={() => (showSuccessModal = false)} class="absolute right-4 top-4 text-mute hover:text-fg" aria-label="Cerrar confirmación"><X size={18} /></button>
			<div class="mx-auto grid h-14 w-14 place-items-center rounded-full bg-signal/15 text-signal"><CheckCircle2 size={30} /></div>
			<p class="eyebrow mt-5 text-signal">Participación</p>
			<h2 id="application-success-title" class="mt-2 font-display text-3xl font-semibold text-fg">Solicitud enviada</h2>
			<p class="mt-3 text-sm leading-relaxed text-mute">Tu propuesta para participar en <strong class="text-fg">{project.name}</strong> fue recibida. El equipo la va a revisar y te avisará cuando haya novedades.</p>
			<button type="button" onclick={() => (showSuccessModal = false)} class="btn btn-primary mt-6">Continuar</button>
		</div>
	</div>
{/if}
