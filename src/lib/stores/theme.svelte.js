// Tema claro por defecto con opción de modo oscuro desde el navbar.
import { writable } from 'svelte/store'
import { browser } from '$app/env'

const STORAGE_KEY = 'crow-theme'

function readInitialTheme() {
	if (!browser) return 'light'
	try {
		return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light'
	} catch {
		return 'light'
	}
}

export const theme = writable(readInitialTheme())

if (browser) {
	theme.subscribe((value) => {
		document.documentElement.classList.toggle('dark', value === 'dark')
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
