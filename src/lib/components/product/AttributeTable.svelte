// ≙ src/components/product/AttributeTable.jsx: especificaciones agrupadas.
<script>
	let { attributevalues } = $props()

	const groups = $derived.by(() => {
		if (!attributevalues?.length) return []
		const grouped = {}
		attributevalues.forEach((av) => {
			const group = av.attribute?.group?.name || 'General'
			if (!grouped[group]) grouped[group] = []
			const value =
				av.option?.label ||
				av.valueText ||
				av.valueNumber?.toString() ||
				(av.valueBoolean ? 'Sí' : 'No') ||
				'—'
			const unit = av.attribute?.unit ? ` ${av.attribute.unit}` : ''
			grouped[group].push({ name: av.attribute?.name || 'Atributo', value: `${value}${unit}` })
		})
		return Object.entries(grouped)
	})
</script>

{#if groups.length}
	<div class="space-y-5">
		{#each groups as [group, attrs]}
			<div>
				<h4 class="eyebrow mb-2">{group}</h4>
				<div class="border border-line overflow-hidden">
					{#each attrs as attr, i}
						<div class={`flex justify-between gap-4 px-4 py-2.5 font-mono text-xs ${i % 2 === 0 ? 'bg-surface' : 'bg-panel'}`}>
							<span class="text-mute uppercase tracking-[0.12em]">{attr.name}</span>
							<span class="text-fg font-medium tel">{attr.value}</span>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
{/if}
