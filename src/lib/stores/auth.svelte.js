// ≙ src/hooks/useAuth.js del original (la implementación usada; AuthContext
// es duplicado obsoleto, R10). Estado de auth con runes de Svelte 5.
// checkAuth se llama on mount desde +layout.svelte.
import { authApi } from '#lib/api/auth.js'

class AuthState {
	user = $state(null)
	loading = $state(true)
	error = $state(null)

	async checkAuth() {
		try {
			this.loading = true
			const profile = await authApi.getProfile()
			this.user = profile
			this.error = null
		} catch (err) {
			this.user = null
			if (err.response?.status !== 401) {
				console.error('Error al verificar autenticación:', err)
			}
		} finally {
			this.loading = false
		}
	}

	async login(email, password) {
		try {
			this.loading = true
			this.error = null
			const data = await authApi.login(email, password)
			this.user = data.customer
			return { success: true, customer: data.customer }
		} catch (err) {
			const message =
				err.response?.data?.message || err.response?.data?.error || 'Error al iniciar sesión'
			this.error = message
			return { success: false, error: message }
		} finally {
			this.loading = false
		}
	}

	async register(userData) {
		try {
			this.loading = true
			this.error = null
			const data = await authApi.register(userData)
			this.user = data.customer
			return { success: true, customer: data.customer, application: data.application || null }
		} catch (err) {
			const message =
				err.response?.data?.message || err.response?.data?.error || 'Error al registrarse'
			this.error = message
			return { success: false, error: message }
		} finally {
			this.loading = false
		}
	}

	googleLogin() {
		authApi.googleLogin()
	}

	async logout() {
		// Llamada al backend (falla ignorada) + limpieza de estado + reload.
		// Las cookies httpOnly las maneja la API (mismo dominio raíz).
		try {
			await authApi.logout()
		} catch (err) {
			console.log('Logout backend ignorado')
		}
		this.user = null
		this.error = null
		window.location.href = '/'
	}

	async updateProfile(data) {
		try {
			const updated = await authApi.updateProfile(data)
			this.user = updated.customer
			return { success: true }
		} catch (err) {
			const message = err.response?.data?.message || 'Error al actualizar perfil'
			return { success: false, error: message }
		}
	}
}

export const auth = new AuthState()
