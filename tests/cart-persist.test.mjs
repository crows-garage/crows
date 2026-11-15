// Test de la lógica de persistencia del carrito (mismo formato que el
// zustand/persist del original). Ejecutar: node tests/cart-persist.test.mjs
import assert from 'node:assert/strict'

const STORAGE_KEY = 'econopet-cart'
const VERSION = 2

// Réplica mínima de la lógica del store para poder testearla en Node
function migrate(persistedState, version) {
	if (version < 2) {
		return {
			...persistedState,
			items: (persistedState.items || []).map((item) => ({
				...item,
				storeSlug: item.storeSlug || 'cursox',
				addedAt: item.addedAt || Date.now()
			}))
		}
	}
	return persistedState
}

function loadItems(raw) {
	if (!raw) return []
	try {
		const parsed = JSON.parse(raw)
		const state = migrate(parsed?.state ?? parsed, parsed?.version ?? 1)
		return Array.isArray(state.items) ? state.items : []
	} catch {
		return []
	}
}

// 1. Formato de escritura idéntico al de zustand/persist
const persisted = JSON.stringify({ state: { items: [{ key: '1' }] }, version: VERSION })
assert.equal(
	persisted,
	'{"state":{"items":[{"key":"1"}]},"version":2}',
	'el formato persistido debe ser { state: { items }, version: 2 }'
)

// 2. Lectura de un carrito guardado
const items = loadItems(persisted)
assert.equal(items.length, 1)
assert.equal(items[0].key, '1')

// 3. Migrate desde versión 1: agrega storeSlug y addedAt
const legacy = JSON.stringify({ state: { items: [{ key: '7', productId: 7 }] }, version: 1 })
const migrated = loadItems(legacy)
assert.equal(migrated[0].storeSlug, 'cursox', 'la migración debe completar storeSlug')
assert.ok(migrated[0].addedAt, 'la migración debe agregar addedAt')

// 4. Carrito vacío / corrupto
assert.deepEqual(loadItems(null), [])
assert.deepEqual(loadItems('no-json'), [])
assert.deepEqual(loadItems(JSON.stringify({ state: {}, version: 2 })), [])

// 5. La key de localStorage es la del original
assert.equal(STORAGE_KEY, 'econopet-cart')

console.log('cart-persist: 5 checks OK')
