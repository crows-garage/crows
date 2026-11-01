// ≙ src/app/productos/page.jsx: metadata + ProductsClient (filtros inline).
<script>
	import ProductsClient from '#lib/components/products/ProductsClient.svelte'
	import { page } from '$app/state'

	let { data } = $props()
</script>

<svelte:head>
	<title>Recursos — CursoX</title>
	<meta name="description" content="Recursos y propuestas de aprendizaje de la comunidad de CursoX." />
</svelte:head>

<ProductsClient
	initialProducts={data.products}
	categories={data.categories}
	labels={data.labels}
	storeConfig={data.storeConfig}
	urlParams={page.url.searchParams}
/>
