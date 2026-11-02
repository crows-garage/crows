// ≙ src/app/contacto/page.jsx + ContactContent.jsx: canales de contacto y
// formulario que abre WhatsApp.
<script>
	import { Phone, MapPin, Send, MessageCircle, Mail } from '@lucide/svelte'
	import SocialIcon from '#lib/components/icons/SocialIcon.svelte'

	let { data } = $props()

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
		return 'https://www.' + value.replace('@', '')
	}

	let formData = $state({ name: '', message: '' })
	let sent = $state(false)

	const contact = $derived(data.contact || {})
	const org = $derived(data.org)
	const whatsapp = $derived(contact.whatsapp || org?.contactPhone || '')
	const facebook = $derived(
		normalizeSocialUrl(contact.facebook || (org?.socialLinks && parseSocial(org.socialLinks).facebook) || '')
	)
	const instagram = $derived(
		normalizeSocialUrl(contact.instagram || (org?.socialLinks && parseSocial(org.socialLinks).instagram) || '')
	)
	const whatsappLink = $derived(whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, '')}` : null)
	const emails = $derived(contact.emails || (org?.contactEmail ? [org.contactEmail] : []))
	const address = $derived(data.locals[0]?.address || org?.address || '')

	const socialItems = $derived(
		[
			instagram && { label: 'Instagram', name: 'instagram', href: instagram },
			facebook && { label: 'Facebook', name: 'facebook', href: facebook }
		].filter(Boolean)
	)

	function handleSubmit(e) {
		e.preventDefault()
		const message = `Hola! Soy ${formData.name}. ${formData.message}`
		window.open(
			`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`,
			'_blank'
		)
		sent = true
	}
</script>

<svelte:head>
	<title>Contacto — CursoX</title>
	<meta name="description" content="Contactanos: WhatsApp, email, redes sociales y ubicación." />
</svelte:head>

<div class="min-h-screen bg-base pb-16">
	<div class="max-w-7xl mx-auto px-4 py-8">
		<!-- Breadcrumb -->
		<nav class="flex items-center gap-1.5 text-sm text-mute mb-8">
			<a href="/" class="hover:text-signal transition-colors">Inicio</a>
			<span>/</span>
			<span class="text-signal font-medium">Contacto</span>
		</nav>

		<!-- Header -->
		<div class="text-center mb-12">
			<h1 class="font-display font-semibold text-3xl md:text-4xl text-fg mb-4">Contactanos</h1>
			<p class="text-mute max-w-2xl mx-auto">
				Estamos para ayudarte. Elegí el canal que prefieras y te respondemos a la brevedad.
			</p>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
			<!-- Columna izquierda -->
			<div class="lg:col-span-1 space-y-6">
				<!-- WhatsApp -->
				{#if whatsappLink}
					<div class="rounded-2xl p-6 border border-line bg-surface">
						<div class="flex items-center gap-3 mb-3">
							<div class="w-12 h-12 bg-[#25d366] rounded-xl flex items-center justify-center">
								<Phone class="w-6 h-6 text-white" />
							</div>
							<div>
								<h3 class="font-semibold text-fg">WhatsApp</h3>
								<p class="text-xs text-mute">Respuesta rápida</p>
							</div>
						</div>
						<a
							href={whatsappLink}
							target="_blank"
							rel="noopener noreferrer"
							class="block w-full text-center py-3 bg-[#25d366] text-white rounded-xl font-semibold hover:bg-[#1fb958] transition-colors"
						>
							{whatsapp}
						</a>
					</div>
				{/if}

				<!-- Email -->
				{#if emails.length > 0}
					<div class="rounded-2xl p-6 border border-line bg-surface">
						<div class="flex items-center gap-3 mb-3">
							<div class="w-12 h-12 bg-signal/10 rounded-xl flex items-center justify-center">
								<Mail class="w-6 h-6 text-signal" />
							</div>
							<div>
								<h3 class="font-semibold text-fg">Email</h3>
								<p class="text-xs text-mute">Correo institucional</p>
							</div>
						</div>
						<div class="space-y-2">
							{#each emails.slice(0, 2) as email, i}
								<a key={i} href={`mailto:${email}`} class="block text-sm text-signal hover:underline break-all">{email}</a>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Redes sociales -->
				{#if socialItems.length > 0}
					<div class="rounded-2xl p-6 border border-line bg-surface">
						<h3 class="font-semibold text-fg mb-3">Redes Sociales</h3>
						<div class="flex gap-3">
							{#each socialItems as { label, href, name }}
								<a
									{href}
									target="_blank"
									rel="noopener noreferrer"
									aria-label={label}
									class="w-10 h-10 bg-signal/10 text-signal rounded-xl flex items-center justify-center hover:bg-signal hover:text-base transition-colors"
								>
									<SocialIcon {name} class="w-5 h-5" />
								</a>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Ubicación -->
				{#if address}
					<div class="rounded-2xl p-6 border border-line bg-surface">
						<h3 class="font-semibold text-fg mb-3 flex items-center gap-2">
							<MapPin class="w-5 h-5 text-signal" />
							Ubicación
						</h3>
						<p class="text-sm text-mute mb-3">{address}</p>
						<a
							href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
							target="_blank"
							rel="noopener noreferrer"
							class="text-xs text-signal hover:underline mb-3 inline-block"
						>
							Ver en Google Maps →
						</a>
						<div class="rounded-xl overflow-hidden border border-line">
							<iframe
								src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
								width="100%"
								height="200"
								style="border: 0"
								allowFullScreen
								loading="lazy"
								referrerPolicy="no-referrer-when-downgrade"
								title="Ubicación"
							></iframe>
						</div>
					</div>
				{/if}
			</div>

			<!-- Columna derecha: formulario -->
			<div class="lg:col-span-2">
				<div class="rounded-2xl p-6 md:p-8 border border-line bg-surface">
					<h2 class="text-xl font-semibold text-fg mb-6">Enviá tu consulta</h2>
					{#if sent}
						<div class="text-center py-8">
							<div class="w-16 h-16 bg-[#25d366]/15 rounded-full flex items-center justify-center mx-auto mb-4">
								<Send class="w-8 h-8 text-[#25d366]" />
							</div>
							<h3 class="text-lg font-semibold text-fg mb-2">¡Mensaje listo!</h3>
							<p class="text-mute">Te redirigimos a WhatsApp para continuar la conversación.</p>
							<button type="button" onclick={() => (sent = false)} class="mt-4 text-sm text-signal font-medium hover:underline">
								Enviar otro mensaje
							</button>
						</div>
					{:else}
						<form onsubmit={handleSubmit} class="space-y-4">
							<div>
								<label class="text-xs font-medium text-mute mb-1.5 block" for="ct-name">Nombre</label>
								<input id="ct-name" type="text" bind:value={formData.name} required placeholder="Tu nombre" class="input" />
							</div>
							<div>
								<label class="text-xs font-medium text-mute mb-1.5 block" for="ct-msg">Mensaje</label>
								<textarea id="ct-msg" bind:value={formData.message} required rows="5" placeholder="Escribí tu consulta..." class="input resize-none"></textarea>
							</div>
							<button type="submit" class="btn btn-primary w-full !py-3">
								<MessageCircle class="w-4 h-4" />
								Enviar por WhatsApp
							</button>
						</form>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
