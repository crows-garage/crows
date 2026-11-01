// ≙ src/components/home/FAQSection.jsx: acordeón de preguntas frecuentes.
<script>
	import { ChevronDown } from '@lucide/svelte'

	let { faqs = [] } = $props()

	let openId = $state(null)
</script>

{#if faqs?.length}
	<div class="max-w-3xl mx-auto">
		<div class="mb-10">
			<p class="eyebrow mb-2 text-center">Ayuda · Preguntas frecuentes</p>
			<h2 class="font-display font-semibold text-2xl sm:text-3xl tracking-tight text-fg text-center">Consultas frecuentes</h2>
		</div>

		<div class="space-y-2">
			{#each faqs as faq (faq.id)}
				<div class="border border-line bg-surface">
					<button
						type="button"
						onclick={() => (openId = openId === faq.id ? null : faq.id)}
						class="w-full flex items-center justify-between gap-4 px-4 sm:px-5 py-4 text-left min-h-[48px]"
					>
						<span class="font-display font-semibold text-sm sm:text-base text-fg">{faq.question}</span>
						<ChevronDown class={`w-4 h-4 text-mute transition-transform shrink-0 ${openId === faq.id ? 'rotate-180 text-signal' : ''}`} />
					</button>
					{#if openId === faq.id}
						<div class="px-4 sm:px-5 pb-4 pt-3 text-sm text-mute leading-relaxed border-t border-line">{faq.answer}</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
{/if}
