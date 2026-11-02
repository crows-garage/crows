<script>
	import { imgUrl } from '#lib/utils.js'
	import { Mail, MapPin, Phone, MessageCircle, GraduationCap } from '@lucide/svelte'
	import SocialIcon from '#lib/components/icons/SocialIcon.svelte'

	let { categories = [], store = null, contact = null, locals = [], org = null } = $props()

	function parseSocial(socialLinks) {
		if (!socialLinks) return {}
		try {
			return typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks
		} catch {
			return {}
		}
	}

	function normalizeSocialUrl(value) {
		if (!value) return null
		if (value.startsWith('http')) return value
		const clean = value.replace('@', '')
		const host =
			clean.includes('facebook.com') || clean.includes('instagram.com') || clean.includes('linkedin.com')
				? 'https://' + clean
				: 'https://www.' + clean
		return host
	}

	const contactInfo = $derived(contact || store?.contact || {})
	const whatsapp = $derived(contactInfo.whatsapp || org?.contactPhone || '')
	const phones = $derived(contactInfo.phones || [])
	const emails = $derived(contactInfo.emails || (org?.contactEmail ? [org.contactEmail] : []))
	const social = $derived({
		...parseSocial(org?.socialLinks),
		...(contactInfo.social || {}),
		...(contactInfo.instagram ? { instagram: contactInfo.instagram } : {}),
		...(contactInfo.facebook ? { facebook: contactInfo.facebook } : {})
	})

	const instagram = $derived(normalizeSocialUrl(social.instagram))
	const facebook = $derived(normalizeSocialUrl(social.facebook))
	const linkedin = $derived(normalizeSocialUrl(social.linkedin))
	const youtube = $derived(normalizeSocialUrl(social.youtube))
	const address = $derived(locals?.[0]?.address || org?.address || '')
	const mainCategories = $derived(categories.filter((c) => !c.parentId && c.active !== false).slice(0, 6))
	const currentYear = new Date().getFullYear()

	const socialItems = $derived(
		[
			instagram && { href: instagram, label: 'Instagram', name: 'instagram' },
			facebook && { href: facebook, label: 'Facebook', name: 'facebook' },
			linkedin && { href: linkedin, label: 'LinkedIn', name: 'linkedin' },
			youtube && { href: youtube, label: 'YouTube', name: 'youtube' }
		].filter(Boolean)
	)

	// Revelado de créditos al hacer scroll (IntersectionObserver)
	let creditsRef = $state(null)
	let isRevealed = $state(false)

	$effect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						isRevealed = true
						observer.disconnect()
					}
				})
			},
			{ threshold: 0.2, rootMargin: '0px' }
		)
		if (creditsRef) observer.observe(creditsRef)
		return () => observer.disconnect()
	})
</script>

<footer class="bg-cream text-fg mt-20">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
			<!-- Marca + redes -->
			<div class="space-y-4">
				<a href="/" class="flex items-center gap-3">
					{#if store?.logo}
						<img src={imgUrl(store.logo)} alt={store?.name || org?.name || 'Institución'} width="44" height="44" class="w-11 h-11 object-contain rounded-full bg-surface p-1" />
					{:else if org?.logo}
						<img src={imgUrl(org.logo)} alt={org?.name || 'Institución'} width="44" height="44" class="w-11 h-11 object-contain rounded-full bg-surface p-1" />
					{:else}
						<span class="w-11 h-11 rounded-full bg-surface flex items-center justify-center font-display font-bold text-fg text-lg">{(org?.name || 'IN')[0]?.toUpperCase()}</span>
					{/if}
					<span class="font-display font-semibold text-signal text-lg leading-tight">
						{org?.name || store?.name || 'Institución'}
					</span>
				</a>
				<p class="text-sm text-fg/70 leading-relaxed max-w-xs">
					Un espacio para aprender, compartir conocimiento, encontrar colaboradores y llevar tus ideas más lejos.
				</p>

				{#if socialItems.length > 0}
					<div class="flex gap-3 pt-1">
						{#each socialItems as { href, label, name }}
							<a
								{href}
								target="_blank"
								rel="noopener noreferrer"
								aria-label={label}
								class="w-9 h-9 rounded-full border border-line flex items-center justify-center text-fg/70 hover:bg-surface hover:text-signal hover:border-signal transition-colors"
							>
								<SocialIcon {name} />
							</a>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Recursos -->
			<div class="space-y-4">
				<h4 class="eyebrow !text-signal">Recursos</h4>
				<ul class="space-y-2.5">
					{#if mainCategories.length > 0}
						{#each mainCategories as cat}
							<li>
								<a href={`/productos?categoria=${cat.slug}`} class="text-sm text-fg/75 hover:text-signal transition-colors">
									{cat.name}
								</a>
							</li>
						{/each}
					{:else}
						<li><a href="/biblioteca" class="text-sm text-fg/75 hover:text-signal transition-colors">Biblioteca académica</a></li>
						<li><a href="/proyectos" class="text-sm text-fg/75 hover:text-signal transition-colors">Proyectos colaborativos</a></li>
					{/if}
					<li>
						<a href="/biblioteca" class="text-sm text-fg/75 hover:text-signal transition-colors">Explorar recursos</a>
					</li>
				</ul>
			</div>

			<!-- Institucional -->
			<div class="space-y-4">
				<h4 class="eyebrow !text-signal">CursoX</h4>
				<ul class="space-y-2.5">
					<li><a href="/about" class="text-sm text-fg/75 hover:text-signal transition-colors">La visión de CursoX</a></li>
					<li><a href="/comunidad" class="text-sm text-fg/75 hover:text-signal transition-colors">Comunidad</a></li>
					<li><a href="/blog" class="text-sm text-fg/75 hover:text-signal transition-colors">Publicaciones</a></li>
					<li><a href="/contacto" class="text-sm text-fg/75 hover:text-signal transition-colors">Contacto</a></li>
					<li><a href="/privacidad" class="text-sm text-fg/75 hover:text-signal transition-colors">Política de privacidad</a></li>
					<li><a href="/terms-and-conditions" class="text-sm text-fg/75 hover:text-signal transition-colors">Términos y condiciones</a></li>
				</ul>
			</div>

			<!-- Contacto -->
			<div class="space-y-4">
				<h4 class="eyebrow !text-signal">Contacto</h4>
				<ul class="space-y-3">
					{#if emails.length > 0}
						{#each emails.slice(0, 2) as email, i}
							<li>
								<a href={`mailto:${email}`} class="flex items-center gap-2.5 text-sm text-fg/75 hover:text-signal transition-colors break-all">
									<Mail class="w-4 h-4 shrink-0 text-signal" />
									{email}
								</a>
							</li>
						{/each}
					{/if}
					{#if whatsapp}
						<li>
							<a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" class="flex items-center gap-2.5 text-sm text-fg/75 hover:text-signal transition-colors">
								<MessageCircle class="w-4 h-4 shrink-0 text-signal" />
								{whatsapp}
							</a>
						</li>
					{/if}
					{#if phones.length > 0}
						{#each phones.slice(0, 2) as phone, i}
							<li>
								<a href={`tel:${phone}`} class="flex items-center gap-2.5 text-sm text-fg/75 hover:text-signal transition-colors">
									<Phone class="w-4 h-4 shrink-0 text-signal" />
									{phone}
								</a>
							</li>
						{/each}
					{/if}
					{#if address}
						<li class="flex items-start gap-2.5 text-sm text-fg/75">
							<MapPin class="w-4 h-4 shrink-0 mt-0.5 text-signal" />
							<span>{address}</span>
						</li>
					{/if}
				</ul>
			</div>
		</div>
	</div>

	<div class="border-t border-signal/20 py-4">
		<div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2">
			<p class="font-mono text-[10px] uppercase tracking-[0.24em] text-fg/60">
				© {currentYear} {org?.name || store?.name || 'Institución'} · Todos los derechos reservados
			</p>
			<p class="font-mono text-[10px] uppercase tracking-[0.24em] text-fg/60">
				<GraduationCap class="w-3 h-3 inline-block -mt-0.5 mr-1" />
				El conocimiento nos conecta. Las ideas nos impulsan.
			</p>
		</div>
	</div>

	<div
		bind:this={creditsRef}
		class={`border-t border-signal/20 py-4 bg-sand transition-all duration-700 ${isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
	>
		<div class="max-w-7xl mx-auto px-4 flex items-center justify-center gap-2">
			<img src="/HOD.png" alt="HOD software" width="20" height="20" class="opacity-60" />
			<p class="font-mono text-[10px] uppercase tracking-[0.24em] text-fg/60">
				Desarrollado por HOD software
			</p>
		</div>
	</div>
</footer>
