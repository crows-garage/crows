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
				class="flex items-center justify-center w-10 h-10 bg-night border border-line hover:border-signal transition-all hover:scale-105"
				aria-label="Abrir WhatsApp"
			>
				<MessageCircle class="w-5 h-5 text-white" />
			</button>
		{:else}
			<div class="bg-surface w-72 overflow-hidden border border-line shadow-lg">
				<!-- Header -->
				<div class="bg-night px-4 py-3 flex items-center justify-between">
					<div class="flex items-center gap-2">
						<div class="w-7 h-7 border border-line flex items-center justify-center">
							<MessageCircle class="w-4 h-4 text-brand" />
						</div>
						<div>
							<p class="text-white font-mono text-xs uppercase tracking-[0.18em]">WhatsApp</p>
							<p class="text-white/50 font-mono text-[10px] uppercase tracking-[0.14em]">Respuesta rápida</p>
						</div>
					</div>
					<button type="button" onclick={() => (isOpen = false)} class="text-white/60 hover:text-white" aria-label="Cerrar WhatsApp">
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
						class="flex items-center justify-center gap-2 w-full bg-signal text-base py-2 text-xs font-mono uppercase tracking-[0.14em] hover:opacity-90 transition-opacity"
					>
						<MessageCircle class="w-4 h-4" />
						Abrir conversación
					</a>
				</div>
			</div>
		{/if}
	</div>
{/if}
