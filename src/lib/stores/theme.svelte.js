// Crow Projects usa tema claro fijo.
import { writable } from 'svelte/store'
import { browser } from '$app/env'

const STORAGE_KEY = 'crow-theme'

function readInitialTheme() {
	return 'light'
}

export const theme = writable(readInitialTheme())

if (browser) {
	theme.subscribe((value) => {
		document.documentElement.classList.remove('dark')
		try {
			localStorage.setItem(STORAGE_KEY, value)
		} catch {
			// localStorage no disponible: el tema sigue funcionando en memoria
		}
	})
}

export function toggleTheme() {
	theme.update((value) => (value === 'dark' ? 'light' : 'dark'))
}
