// Store de tema (oscuro/claro). El ThemeProvider del original era un no-op
// (fuerza light y nadie lo usaba); el plan pide un toggle simple, así que
// acá hay un store real con persistencia en localStorage.
import { writable } from 'svelte/store'
import { browser } from '$app/env'

const STORAGE_KEY = 'crow-theme'

function readInitialTheme() {
	// Tema oscuro por defecto; el usuario sólo queda en claro si lo eligió
	if (!browser) return 'dark'
	try {
		return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark'
	} catch {
		return 'dark'
	}
}

export const theme = writable(readInitialTheme())

if (browser) {
	// Aplicar el tema al documento y mantenerlo entre navegaciones
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
