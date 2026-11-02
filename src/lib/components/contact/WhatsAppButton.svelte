<script>
	import { MessageCircle, X } from '@lucide/svelte'

	let { phoneNumber, storeName = null } = $props()

	const defaultNumber = '2612528276'
	const finalNumber = phoneNumber?.replace(/\D/g, '') || defaultNumber
	const whatsappUrl = `https://wa.me/${finalNumber}`

	let isOpen = $state(false)
	let isVisible = $state(true)
	let lastScrollY = 0

	// Ocultar/mostrar al hacer scroll
	$effect(() => {
		const handleScroll = () => {
			const currentScrollY = window.scrollY
			if (currentScrollY > lastScrollY && currentScrollY > 300) {
				isVisible = false
			} else {
				isVisible = true
			}
			lastScrollY = currentScrollY
		}
		window.addEventListener('scroll', handleScroll, { passive: true })
		return () => window.removeEventListener('scroll', handleScroll)
	})
</script>

{#if phoneNumber || defaultNumber}
	<div class={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}`}>
		{#if !isOpen}
			<button
				type="button"
				onclick={() => (isOpen = true)}
				class="flex items-center justify-center w-10 h-10 bg-night rounded-full shadow-md hover:opacity-90 transition-all hover:scale-105"
				aria-label="Abrir WhatsApp"
			>
				<MessageCircle class="w-5 h-5 text-white" />
			</button>
		{:else}
			<div class="bg-white rounded-lg shadow-lg w-72 overflow-hidden border border-line">
				<!-- Header -->
				<div class="bg-night px-4 py-3 flex items-center justify-between">
					<div class="flex items-center gap-2">
						<div class="w-7 h-7 bg-panel rounded-full flex items-center justify-center">
							<MessageCircle class="w-4 h-4 text-fg" />
						</div>
						<div>
							<p class="text-white font-medium text-sm">WhatsApp</p>
							<p class="text-fg/60 text-xs">Respuesta rápida</p>
						</div>
					</div>
					<button type="button" onclick={() => (isOpen = false)} class="text-white/60 hover:text-white">
						<X class="w-4 h-4" />
					</button>
				</div>

				<!-- Body -->
				<div class="p-4">
					<p class="text-mute text-sm mb-3">
						Hola, ¿en qué podemos ayudarte?
					</p>
					<a
						href={whatsappUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center justify-center gap-2 w-full bg-fg text-base py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-colors"
					>
						<MessageCircle class="w-4 h-4" />
						Abrir conversación
					</a>
				</div>
			</div>
		{/if}
	</div>
{/if}
