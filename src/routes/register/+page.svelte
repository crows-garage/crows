// ≙ src/app/register/RegisterForm.jsx: registro en 2 pasos con opción de
// solicitud de afiliación y Google.
<script>
	import { goto } from '$app/navigation'
	import { page } from '$app/state'
	import { Eye, EyeOff, CheckCircle2 } from '@lucide/svelte'
	import { auth } from '#lib/stores/auth.svelte.js'
	import { ORG_SLUG, STORE_SLUG } from '#lib/api/client.js'

	let formData = $state({
		firstName: '',
		lastName: '',
		email: '',
		phone: '',
		password: '',
		confirmPassword: '',
		profession: '',
		registrationNumber: '',
		documentType: '',
		documentNumber: ''
	})

	let formError = $state('')
	let fieldErrors = $state({})
	let showPassword = $state(false)
	let step = $state(1)
	let done = $state(null)

	function validateStep1() {
		const errors = {}

		if (!formData.firstName || formData.firstName.length < 2) {
			errors.firstName = 'El nombre debe tener al menos 2 caracteres'
		}

		if (!formData.email) {
			errors.email = 'El email es obligatorio'
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			errors.email = 'Email inválido'
		}

		if (!formData.password) {
			errors.password = 'La contraseña es obligatoria'
		} else if (formData.password.length < 8) {
			errors.password = 'La contraseña debe tener al menos 8 caracteres'
		}

		if (formData.password !== formData.confirmPassword) {
			errors.confirmPassword = 'Las contraseñas no coinciden'
		}

		fieldErrors = errors
		return Object.keys(errors).length === 0
	}

	function handleChange(e) {
		const { name, value } = e.currentTarget
		formData = { ...formData, [name]: value }
		if (fieldErrors[name]) fieldErrors = { ...fieldErrors, [name]: '' }
		if (formError) formError = ''
	}

	function handleNextStep() {
		if (validateStep1()) {
			step = 2
			formError = ''
		} else {
			formError = 'Por favor corrige los errores antes de continuar'
		}
	}

	function handlePrevStep() {
		step = 1
		formError = ''
	}

	async function submit(asAssociate) {
		formError = ''
		fieldErrors = {}

		const registerData = {
			firstName: formData.firstName.trim(),
			lastName: formData.lastName.trim(),
			email: formData.email.toLowerCase().trim(),
			password: formData.password,
			phone: formData.phone.trim() || undefined,
			...(asAssociate
				? {
						profession: formData.profession.trim(),
						registrationNumber: formData.registrationNumber.trim(),
						documentType: formData.documentType,
						documentNumber: formData.documentNumber.trim(),
						organizationSlug: ORG_SLUG || STORE_SLUG
					}
				: {})
		}

		const result = await auth.register(registerData)

		if (result.success) {
			if (result.application) {
				done = result.application
			} else {
				const redirectTo = page.url.searchParams.get('redirect') || '/'
				goto(redirectTo)
			}
		} else {
			formError = result.error || 'Error al registrarse. Intenta de nuevo.'
		}
	}

	function validateStep2() {
		const errors = {}

		if (!formData.profession || formData.profession.length < 2) {
			errors.profession = 'Indicá tu profesión'
		}

		if (!formData.registrationNumber || formData.registrationNumber.length < 2) {
			errors.registrationNumber = 'Indicá tu matrícula profesional'
		}

		if (!formData.documentType) {
			errors.documentType = 'Seleccioná el tipo de documento'
		}

		if (!formData.documentNumber || formData.documentNumber.length < 6) {
			errors.documentNumber = 'Ingresá un documento válido'
		}

		fieldErrors = errors
		return Object.keys(errors).length === 0
	}

	function handleSubmit(e) {
		e.preventDefault()
		if (!validateStep1()) {
			formError = 'Por favor corrige los errores antes de registrarte'
			return
		}
		if (!validateStep2()) {
			formError = 'Completá tus datos profesionales para solicitar la afiliación'
			return
		}
		submit(true)
	}

	function handleSkip() {
		if (!validateStep1()) {
			formError = 'Por favor corrige los errores antes de registrarte'
			return
		}
		submit(false)
	}
</script>

{#if done}
	<div class="min-h-screen pt-20 pb-16 bg-base">
		<div class="max-w-md mx-auto px-4">
			<div class="bg-panel border border-line p-6 sm:p-8 text-center">
				<CheckCircle2 size={44} class="mx-auto mb-4 text-signal" />
				<p class="text-[10px] uppercase tracking-[0.3em] mb-2 text-mute">Solicitud enviada</p>
				<h1 class="text-xl sm:text-2xl font-light tracking-tight text-fg">¡Gracias por querer asociarte!</h1>
				<p class="text-sm text-mute mt-3 leading-relaxed">
					Tu solicitud de afiliación fue enviada y está
					<strong class="text-fg">pendiente de revisión</strong> por la comisión
					de la institución.
				</p>
				<p class="text-xs text-mute mt-2">
					Te avisaremos por email cuando sea aprobada. Mientras tanto, tu cuenta
					ya te permite comprar cursos.
				</p>
				<button
					type="button"
					onclick={() => goto('/')}
					class="mt-6 w-full py-2.5 bg-fg text-base text-sm font-medium hover:opacity-90 transition-colors"
				>
					Volver al inicio
				</button>
			</div>
		</div>
	</div>
{:else}
	<div class="min-h-screen pt-20 pb-16 bg-base">
		<div class="max-w-md mx-auto px-4">
			<div class="text-center mb-8">
				<p class="text-[10px] uppercase tracking-[0.3em] mb-2 text-mute">Registro</p>
				<h1 class="text-2xl sm:text-3xl font-light tracking-tight text-fg">Crear cuenta</h1>
				<p class="text-sm text-mute mt-1">{step === 1 ? 'Completa tus datos' : 'Datos de asociado'}</p>
			</div>

			<!-- Step indicator -->
			<div class="flex items-center justify-center gap-3 mb-8">
				<div class="flex items-center justify-center w-8 h-8 text-xs font-medium border border-fg text-fg">
					{step === 1 ? '1' : '✓'}
				</div>
				<div class="w-12 h-px bg-fg/20"></div>
				<div class={`flex items-center justify-center w-8 h-8 text-xs font-medium border ${step === 2 ? 'border-fg text-fg' : 'border-line text-mute'}`}>
					2
				</div>
			</div>

			{#if formError}
				<div class="mb-4 border border-line text-mute px-3 py-2 text-xs">{formError}</div>
			{/if}

			<form onsubmit={handleSubmit} class="space-y-4">
				{#if step === 1}
					<div>
						<label class="block text-xs font-medium text-fg/70 mb-1" for="reg-firstName">Nombre *</label>
						<input
							id="reg-firstName"
							name="firstName"
							type="text"
							value={formData.firstName}
							oninput={handleChange}
							class={`w-full px-3 py-2 border bg-base text-fg text-sm focus:outline-none focus:border-signal transition-colors ${fieldErrors.firstName ? 'border-rec' : 'border-line'}`}
							placeholder="Nombre"
						/>
						{#if fieldErrors.firstName}<p class="mt-1 text-[10px] text-mute">{fieldErrors.firstName}</p>{/if}
					</div>

					<div>
						<label class="block text-xs font-medium text-fg/70 mb-1" for="reg-lastName">Apellido *</label>
						<input
							id="reg-lastName"
							name="lastName"
							type="text"
							value={formData.lastName}
							oninput={handleChange}
							class="w-full px-3 py-2 border border-line bg-base text-fg text-sm focus:outline-none focus:border-signal transition-colors"
							placeholder="Apellido"
						/>
					</div>

					<div>
						<label class="block text-xs font-medium text-fg/70 mb-1" for="reg-email">Email *</label>
						<input
							id="reg-email"
							name="email"
							type="email"
							value={formData.email}
							oninput={handleChange}
							class={`w-full px-3 py-2 border bg-base text-fg text-sm focus:outline-none focus:border-signal transition-colors ${fieldErrors.email ? 'border-rec' : 'border-line'}`}
							placeholder="tu@email.com"
						/>
						{#if fieldErrors.email}<p class="mt-1 text-[10px] text-mute">{fieldErrors.email}</p>{/if}
					</div>

					<div>
						<label class="block text-xs font-medium text-fg/70 mb-1" for="reg-phone">Teléfono</label>
						<input
							id="reg-phone"
							name="phone"
							type="tel"
							value={formData.phone}
							oninput={handleChange}
							class="w-full px-3 py-2 border border-line bg-base text-fg text-sm focus:outline-none focus:border-signal transition-colors"
							placeholder="+54 261 1234567"
						/>
					</div>

					<div>
						<label class="block text-xs font-medium text-fg/70 mb-1" for="reg-password">Contraseña *</label>
						<div class="relative">
							<input
								id="reg-password"
								name="password"
								type={showPassword ? 'text' : 'password'}
								value={formData.password}
								oninput={handleChange}
								class={`w-full px-3 py-2 border bg-base text-fg text-sm focus:outline-none focus:border-signal transition-colors ${fieldErrors.password ? 'border-rec' : 'border-line'}`}
								placeholder="Mínimo 8 caracteres"
							/>
							<button
								type="button"
								onclick={() => (showPassword = !showPassword)}
								class="absolute right-3 top-1/2 -translate-y-1/2 text-mute hover:text-fg"
							>
								{#if showPassword}<EyeOff size={16} />{:else}<Eye size={16} />{/if}
							</button>
						</div>
						{#if fieldErrors.password}<p class="mt-1 text-[10px] text-mute">{fieldErrors.password}</p>{/if}
					</div>

					<div>
						<label class="block text-xs font-medium text-fg/70 mb-1" for="reg-confirm">Confirmar contraseña *</label>
						<input
							id="reg-confirm"
							name="confirmPassword"
							type="password"
							value={formData.confirmPassword}
							oninput={handleChange}
							class={`w-full px-3 py-2 border bg-base text-fg text-sm focus:outline-none focus:border-signal transition-colors ${fieldErrors.confirmPassword ? 'border-rec' : 'border-line'}`}
							placeholder="Repite tu contraseña"
						/>
						{#if fieldErrors.confirmPassword}<p class="mt-1 text-[10px] text-mute">{fieldErrors.confirmPassword}</p>{/if}
					</div>
				{/if}

				{#if step === 2}
					<div class="border border-line p-3">
						<p class="text-xs text-mute leading-relaxed">
							Completá tus datos profesionales para solicitar la
							<strong class="text-fg">afiliación a la Asociación</strong>.
							La solicitud será revisada por la comisión antes de su aprobación.
						</p>
					</div>

					<div>
						<label class="block text-xs font-medium text-fg/70 mb-1" for="reg-profession">Profesión *</label>
						<input
							id="reg-profession"
							name="profession"
							type="text"
							value={formData.profession}
							oninput={handleChange}
							class={`w-full px-3 py-2 border bg-base text-fg text-sm focus:outline-none focus:border-signal transition-colors ${fieldErrors.profession ? 'border-rec' : 'border-line'}`}
							placeholder="Ej: Docente, Diseñador, Contador..."
						/>
						{#if fieldErrors.profession}<p class="mt-1 text-[10px] text-mute">{fieldErrors.profession}</p>{/if}
					</div>

					<div>
						<label class="block text-xs font-medium text-fg/70 mb-1" for="reg-registration">Matrícula profesional *</label>
						<input
							id="reg-registration"
							name="registrationNumber"
							type="text"
							value={formData.registrationNumber}
							oninput={handleChange}
							class={`w-full px-3 py-2 border bg-base text-fg text-sm focus:outline-none focus:border-signal transition-colors ${fieldErrors.registrationNumber ? 'border-rec' : 'border-line'}`}
							placeholder="Ej: MP-1234"
						/>
						{#if fieldErrors.registrationNumber}<p class="mt-1 text-[10px] text-mute">{fieldErrors.registrationNumber}</p>{/if}
					</div>

					<div>
						<label class="block text-xs font-medium text-fg/70 mb-1" for="reg-docType">Tipo de documento *</label>
						<select
							id="reg-docType"
							name="documentType"
							value={formData.documentType}
							onchange={handleChange}
							class={`w-full px-3 py-2 border bg-base text-fg text-sm focus:outline-none focus:border-signal transition-colors ${fieldErrors.documentType ? 'border-rec' : 'border-line'}`}
						>
							<option value="">Seleccionar...</option>
							<option value="DNI">DNI</option>
							<option value="CUIT">CUIT</option>
							<option value="CUIL">CUIL</option>
							<option value="LC">LC</option>
							<option value="LE">LE</option>
						</select>
						{#if fieldErrors.documentType}<p class="mt-1 text-[10px] text-mute">{fieldErrors.documentType}</p>{/if}
					</div>

					<div>
						<label class="block text-xs font-medium text-fg/70 mb-1" for="reg-docNumber">Número de documento *</label>
						<input
							id="reg-docNumber"
							name="documentNumber"
							type="text"
							value={formData.documentNumber}
							oninput={handleChange}
							class={`w-full px-3 py-2 border bg-base text-fg text-sm focus:outline-none focus:border-signal transition-colors ${fieldErrors.documentNumber ? 'border-rec' : 'border-line'}`}
							placeholder="Sin puntos ni guiones"
						/>
						{#if fieldErrors.documentNumber}<p class="mt-1 text-[10px] text-mute">{fieldErrors.documentNumber}</p>{/if}
					</div>
				{/if}

				{#if step === 1}
					<button
						type="button"
						onclick={handleNextStep}
						class="w-full py-2.5 bg-fg text-base text-sm font-medium hover:opacity-90 transition-colors"
					>
						Continuar →
					</button>
				{:else}
					<div class="space-y-3">
						<button
							type="submit"
							disabled={auth.loading}
							class="w-full py-2.5 bg-fg text-base text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-colors"
						>
							{auth.loading ? 'Enviando...' : 'Solicitar afiliación'}
						</button>
						<button
							type="button"
							onclick={handlePrevStep}
							class="w-full py-2.5 border border-line text-fg text-sm font-medium hover:bg-panel transition-colors"
						>
							← Volver
						</button>
						<button
							type="button"
							onclick={handleSkip}
							disabled={auth.loading}
							class="w-full py-2 text-xs text-mute hover:text-fg transition-colors disabled:opacity-50"
						>
							Solo quiero la cuenta para comprar cursos
						</button>
					</div>
				{/if}
			</form>

			<div class="relative my-6">
				<div class="absolute inset-0 flex items-center">
					<div class="w-full border-t border-line"></div>
				</div>
				<div class="relative flex justify-center text-xs">
					<span class="px-2 bg-base text-mute">O registrarse con</span>
				</div>
			</div>

			<button
				type="button"
				onclick={() => auth.googleLogin()}
				class="w-full flex items-center justify-center gap-2 py-2.5 border border-line text-fg text-sm font-medium hover:bg-panel transition-colors"
			>
				<svg class="w-4 h-4" viewBox="0 0 24 24">
					<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1z" />
					<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
					<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
					<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
				</svg>
				Google
			</button>

			<p class="text-center text-xs text-mute mt-6">
				¿Ya tienes cuenta?
				<a href="/login" class="text-fg underline">Iniciar sesión</a>
			</p>
		</div>
	</div>
{/if}
