// ≙ src/app/about/page.jsx: visión, historia, autoridades y contacto.
<script>
	import { Mail, Phone, Globe, MapPin, GraduationCap, Users } from '@lucide/svelte'
	import { imgUrl } from '#lib/utils.js'

	let { data } = $props()

	const FALLBACK_HISTORY = [
		'CursoX es una plataforma educativa y colaborativa impulsada por HOD Software. Comienza enfocada en los estudiantes del Instituto Manuel Belgrano, con la mirada puesta en crecer junto a otras instituciones.',
		'La idea nace de algo simple: en una institución hay personas con talentos y conocimientos complementarios, pero no siempre existe una forma de encontrarse para trabajar juntas.',
		'Queremos construir una comunidad donde compartir recursos, publicar ideas, descubrir oportunidades y formar equipos sea parte natural de la experiencia estudiantil.'
	]

	const org = $derived(data.org)
	const store = $derived(data.store)
	const name = $derived(org?.name || store?.name || 'Institución')
	const description = $derived('Una comunidad para compartir conocimiento, encontrar colaboradores y llevar tus ideas mas lejos.')
	const cover = $derived(imgUrl(org?.coverImage))
	const logo = $derived(imgUrl(org?.logo))

	const history = $derived(FALLBACK_HISTORY)

	const contactItems = $derived(
		[
			org?.contactEmail && { label: 'Email', value: org.contactEmail, href: `mailto:${org.contactEmail}`, icon: Mail },
			(org?.contactPhone || store?.contact?.whatsapp) && {
				label: 'WhatsApp / Teléfono',
				value: org.contactPhone || store?.contact?.whatsapp,
				href: `https://wa.me/${(org.contactPhone || store.contact.whatsapp).replace(/[^+\d]/g, '')}`,
				icon: Phone
			},
			org?.website && {
				label: 'Sitio web',
				value: org.website.replace(/^https?:\/\//, ''),
				href: org.website,
				icon: Globe
			},
			(org?.address || store?.contact?.address) && {
				label: 'Ubicación',
				value: org?.address || store?.contact?.address,
				href: null,
				icon: MapPin
			}
		].filter(Boolean)
	)

	const activeAuthorities = $derived(
		data.authorities.filter((a) => a.status !== 'INACTIVE' && a.status !== 'REMOVED')
	)
</script>

<svelte:head>
	<title>Sobre CursoX — CursoX</title>
</svelte:head>

<div class="min-h-screen bg-base">
	<!-- Portada + logo de la organización -->
	<div class="relative overflow-hidden bg-sand">
		{#if cover}
			<img src={cover} alt={`${name} · portada`} loading="lazy" class="absolute inset-0 w-full h-full object-cover" />
		{/if}
		<div class="absolute inset-0 bg-gradient-to-r from-cream/95 via-cream/85 to-cream/60"></div>
		<div class="absolute inset-0 bg-gradient-to-b from-sand/40 via-transparent to-sand/60"></div>

		<div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
			<div class="flex flex-col sm:flex-row items-start sm:items-end gap-6">
				{#if logo}
					<div class="w-20 h-20 sm:w-28 sm:h-28 shrink-0 bg-surface rounded-xl p-2 flex items-center justify-center overflow-hidden shadow-lg border border-line">
						<img src={logo} alt={`${name} · logo`} loading="lazy" class="w-full h-full object-contain" />
					</div>
				{/if}
				<div class="min-w-0">
					<p class="eyebrow !text-gold mb-3 flex items-center gap-2">
						<GraduationCap class="w-3.5 h-3.5" />
						CursoX · La comunidad
					</p>
					<h1 class="font-display font-semibold tracking-tight text-night text-[clamp(2.2rem,6vw,4.2rem)] leading-[1.02]">
						{name}
					</h1>
					<p class="mt-4 max-w-2xl text-base sm:text-lg leading-relaxed text-fg/85">{description}</p>
				</div>
			</div>
		</div>
	</div>

	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
		<!-- Historia -->
		<section class="max-w-3xl">
			<p class="eyebrow mb-2">CursoX · Nuestra vision</p>
			<h2 class="font-display font-semibold text-2xl sm:text-3xl lg:text-4xl tracking-tight text-fg mb-6">Por que hacemos esto</h2>
			<div class="space-y-5">
				{#each history as paragraph, i}
					<p class="text-base sm:text-lg leading-relaxed text-mute">{paragraph}</p>
				{/each}
			</div>
		</section>

		<!-- Autoridades -->
		{#if activeAuthorities.length > 0}
			<section class="mt-16 sm:mt-20">
				<p class="eyebrow mb-2 flex items-center gap-2">
					<Users class="w-3.5 h-3.5" />
					Institucional · Equipo CursoX
				</p>
				<h2 class="font-display font-semibold text-2xl sm:text-3xl lg:text-4xl tracking-tight text-fg mb-8">Autoridades</h2>
				<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
					{#each activeAuthorities as authority (authority.id)}
						<div class="rounded-xl border border-line bg-surface p-5 transition-colors hover:border-signal/40">
							<p class="font-mono text-[10px] uppercase tracking-[0.2em] text-signal">
								{authority.position || authority.role || 'Autoridad'}
							</p>
							<p class="mt-2 font-display font-semibold text-lg text-fg">{authority.name}</p>
							{#if authority.description}
								<p class="mt-1.5 text-sm text-mute leading-relaxed">{authority.description}</p>
							{/if}
						</div>
					{/each}
				</div>
			</section>
		{/if}

		<!-- Datos de contacto -->
		{#if contactItems.length > 0}
			<section class="mt-16 sm:mt-20">
				<p class="eyebrow mb-2">Contacto · Datos institucionales</p>
				<h2 class="font-display font-semibold text-2xl sm:text-3xl lg:text-4xl tracking-tight text-fg mb-8">Contacto</h2>
				<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
					{#each contactItems as item (item.label)}
						{@const Icon = item.icon}
						{#if item.href}
							<a
								href={item.href}
								target={item.href.startsWith('http') ? '_blank' : undefined}
								rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
								class="rounded-xl border border-line bg-surface p-5 block transition-all hover:-translate-y-0.5 hover:shadow-lg hover:border-signal/40"
							>
								<div class="flex items-center gap-3 mb-3">
									<span class="w-9 h-9 rounded-lg bg-signal/10 text-signal flex items-center justify-center">
										<Icon class="w-4 h-4" />
									</span>
									<span class="font-mono text-[9px] uppercase tracking-[0.22em] text-mute">{item.label}</span>
								</div>
								<p class="font-medium text-sm text-fg break-all">{item.value}</p>
							</a>
						{:else}
							<div class="rounded-xl border border-line bg-surface p-5">
								<div class="flex items-center gap-3 mb-3">
									<span class="w-9 h-9 rounded-lg bg-signal/10 text-signal flex items-center justify-center">
										<Icon class="w-4 h-4" />
									</span>
									<span class="font-mono text-[9px] uppercase tracking-[0.22em] text-mute">{item.label}</span>
								</div>
								<p class="font-medium text-sm text-fg break-all">{item.value}</p>
							</div>
						{/if}
					{/each}
				</div>
			</section>
		{/if}
	</div>
</div>
