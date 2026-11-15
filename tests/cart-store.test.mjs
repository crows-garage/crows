// Test del store real del carrito, cargado con el SSR de Vite (resuelve los
// aliases de SvelteKit). Ejecutar: node tests/cart-store.test.mjs
import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({
	configFile: './vite.config.js',
	server: { middlewareMode: true },
	appType: 'custom',
	logLevel: 'error'
})

try {
	const { cart, cartItems, selectTotal, selectCount, selectUniqueCount, selectOrderItems } =
		await server.ssrLoadModule('/src/lib/stores/cart.svelte.js')
	const { get } = await import('svelte/store')

	const product = { id: 10, name: 'Curso A', price: 100, stock: 5, slug: 'curso-a' }
	const variant = { id: 20, name: 'Turno 1', price: 90, finalPrice: 80, stock: 3 }

	// 1. addItem sin variante → key = productId
	cart.addItem(product, null, 2)
	let items = get(cartItems)
	assert.equal(items.length, 1)
	assert.equal(items[0].key, '10')
	assert.equal(items[0].quantity, 2)
	assert.equal(items[0].price, 100)

	// 2. addItem con variante → key = productId-variantId
	cart.addItem(product, variant, 1)
	items = get(cartItems)
	assert.equal(items.length, 2)
	assert.equal(items[1].key, '10-20')
	assert.equal(items[1].price, 80, 'con variante el precio sale de discountPrice/finalPrice/price')
	assert.equal(items[1].variant.stock, 3)

	// 3. Total y contadores
	assert.equal(get(selectTotal), 100 * 2 + 80)
	assert.equal(get(selectCount), 3)
	assert.equal(get(selectUniqueCount), 2)

	// 4. updateQuantity y removeItem
	cart.updateQuantity('10', 5)
	assert.equal(get(selectTotal), 100 * 5 + 80)
	cart.updateQuantity('10', 0)
	assert.equal(get(cartItems).length, 1, 'cantidad 0 elimina el item')

	// 5. El mismo producto+variante no se duplica: suma cantidad
	cart.addItem(product, variant, 2)
	items = get(cartItems)
	assert.equal(items.length, 1, 'el item "10" se eliminó en el paso 4')
	assert.equal(items.find((i) => i.key === '10-20').quantity, 3)

	// 6. orderItems: el shape que espera la API de órdenes
	const orderItems = get(selectOrderItems)
	assert.equal(orderItems.length, 1)
	assert.deepEqual(orderItems[0], { productId: 10, variantId: 20, quantity: 3, notes: '' })

	// 7. validateStock: marca los items que superan el stock
	const overStock = cart.validateStock()
	assert.equal(overStock.length, 0, 'cantidad 3 con stock de variante 3 no excede el stock')

	cart.updateQuantity('10-20', 5)
	assert.equal(cart.validateStock().length, 1, 'cantidad 5 con stock 3 se marca')

	// 8. clearCart
	cart.clearCart()
	assert.equal(get(cartItems).length, 0)
	assert.equal(get(selectTotal), 0)

	console.log('cart-store: 8 checks OK')
} finally {
	await server.close()
}
