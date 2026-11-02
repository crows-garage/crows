<script>
	import { page } from '$app/state'
	import { ArrowRight } from '@lucide/svelte'
	import { trackProductView } from '#lib/api/analytics.js'
	import ProductGallery from '#lib/components/product/ProductGallery.svelte'
	import ProductInfo from '#lib/components/product/ProductInfo.svelte'
	import AttributeTable from '#lib/components/product/AttributeTable.svelte'
	import RelatedProducts from '#lib/components/product/RelatedProducts.svelte'
	import FAQSection from '#lib/components/home/FAQSection.svelte'

	let { data } = $props()

	$effect(() => {
		const product = data.product
		if (product?.id) {
			trackProductView(product.id, {
				slug: product.slug,
				name: product.name,
				price: product.price
			})
		}
	})

	const hasDescription = $derived(!!data.product.description?.trim())
	const hasAttributes = $derived(data.product.attributevalues?.length > 0)
</script>

<svelte:head>
	<title>{data.product?.name || 'Curso'} — CursoX</title>
	<meta name="description" content={data.product?.description?.slice(0, 160) || ''} />
</svelte:head>

<div class="max-w-7xl mx-auto px-4 py-8 md:py-12 bg-base transition-colors">
	<div class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
		<div class="md:sticky md:top-40 self-start">
			<ProductGallery images={data.images} />
		</div>
		<div>
			<ProductInfo product={data.product} categories={data.categories} store={data.store} />
		</div>
	</div>

	{#if hasDescription || hasAttributes}
		<div class="mt-12 pt-12 border-t border-line">
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
				{#if hasDescription}
					<div>
						<h2 class="eyebrow mb-4">Descripción del artículo</h2>
						<p class="whitespace-pre-line leading-relaxed text-fg/80 text-[15px]">{data.product.description}</p>
					</div>
				{/if}
				{#if hasAttributes}
					<div>
						<h2 class="eyebrow mb-4">Especificaciones</h2>
						<AttributeTable attributevalues={data.product.attributevalues} />
					</div>
				{/if}
			</div>
		</div>
	{/if}

	{#if data.related.length > 0}
		<section class="mt-16">
			<div class="mb-6">
				<p class="eyebrow mb-2">Cursos relacionados</p>
				<h2 class="font-display font-semibold text-2xl sm:text-3xl tracking-tight text-fg">Cursos vinculados</h2>
			</div>
			<RelatedProducts products={data.related} storeConfig={data.store?.config} />
		</section>
	{/if}

	<div class="mt-12 text-center">
		<a href="/productos" class="btn">
			Ver todo el catálogo
			<ArrowRight class="w-3.5 h-3.5" />
		</a>
	</div>

	{#if data.faqs?.length > 0}
		<div class="mt-16 pt-8 border-t border-line">
			<FAQSection faqs={data.faqs.filter((f) => f.active !== false)} />
		</div>
	{/if}
</div>
