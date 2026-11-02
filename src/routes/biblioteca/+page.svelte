// ≙ src/app/biblioteca/page.jsx + DownloadButton.jsx (inline como snippet).
// El acceso (público o solo-miembros) lo controla el backend.
<script>
	import { FileText, Lock, BookOpen, Download, Loader2, CheckCircle2 } from '@lucide/svelte'
	import { BASE, ORG_SLUG, STORE_SLUG } from '#lib/api/client.js'

	let { data } = $props()

	const formatBytes = (bytes) => {
		if (!bytes) return ''
		if (bytes < 1024) return `${bytes} B`
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
		return `${(bytes / 1024 / 1024).toFixed(1)} MB`
	}

	const formatPrice = (price) => {
		const n = parseFloat(price)
		if (!n) return null
		return `$${n.toLocaleString('es-AR')}`
	}

	let dlState = $state('idle')
	let dlMessage = $state('')

	async function handleDownload(doc) {
		dlState = 'loading'
		dlMessage = ''
		try {
			const res = await fetch(`${BASE}/organizations/${ORG_SLUG || STORE_SLUG}/library/${doc.id}/download`, {
				credentials: 'include'
			})
			if (!res.ok) {
				let msg = 'No se pudo descargar'
				try {
					const j = await res.json()
					msg = j?.message || msg
				} catch {
					/* respuesta no JSON */
				}
				throw new Error(msg)
			}
			const blob = await res.blob()
			const url = URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = url
			a.download = doc.fileName || doc.title
			document.body.appendChild(a)
			a.click()
			a.remove()
			URL.revokeObjectURL(url)
			dlState = 'done'
		} catch (err) {
			dlState = 'error'
			dlMessage = err.message || 'No se pudo descargar'
		}
	}
</script>

<svelte:head>
	<title>Biblioteca — CursoX</title>
	<meta name="description" content="Documentos y publicaciones de la institución disponibles para descarga." />
</svelte:head>

<div class="min-h-screen pt-20 pb-16 bg-base">
	<div class="max-w-5xl mx-auto px-4">
		<div class="text-center mb-10">
			<p class="text-[10px] uppercase tracking-[0.3em] mb-2 text-mute">Recursos academicos</p>
			<h1 class="text-2xl sm:text-3xl font-light tracking-tight text-fg">Biblioteca</h1>
			<p class="text-sm text-mute mt-2">Apuntes, materiales y conocimientos compartidos por la comunidad.</p>
		</div>

		{#if data.docs.length === 0}
			<div class="text-center py-16">
				<BookOpen size={36} class="mx-auto text-mute/50 mb-3" />
				<p class="text-sm text-mute">Todavía no hay documentos publicados</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				{#each data.docs as doc (doc.id)}
					{@const price = formatPrice(doc.price)}
					{@const membersOnly = doc.visibility === 'MEMBERS_ONLY'}
					<article class="bg-panel border border-line p-5 flex flex-col gap-3">
						<div class="flex items-start gap-3">
							<span class="w-10 h-10 rounded-full bg-cream flex items-center justify-center flex-shrink-0">
								<FileText size={16} class="text-fg/70" />
							</span>
							<div class="min-w-0 flex-1">
								<h2 class="text-sm font-medium text-fg leading-snug">{doc.title}</h2>
								{#if doc.description}
									<p class="text-xs text-mute mt-1 line-clamp-2">{doc.description}</p>
								{/if}
								<p class="text-[11px] text-mute mt-1.5 flex items-center gap-2 flex-wrap">
									{#if doc.category}<span class="uppercase tracking-[0.15em]">{doc.category}</span>{/if}
									{#if membersOnly}
										<span class="flex items-center gap-1 text-gold"><Lock size={10} /> Acceso restringido</span>
									{/if}
									{#if price}<span class="text-fg font-medium">{price}</span>{/if}
								</p>
								{#if doc.fileName}
									<p class="text-[10px] text-mute/70 font-mono mt-1 truncate">
										{doc.fileName}{doc.fileSize ? ` · ${formatBytes(doc.fileSize)}` : ''}
									</p>
								{/if}
							</div>
						</div>

						<div class="mt-auto pt-3 border-t border-line flex items-center justify-between">
							{#if doc.downloads > 0}
								<span class="text-[10px] text-mute/70">{doc.downloads} descarga{doc.downloads === 1 ? '' : 's'}</span>
							{:else}
								<span></span>
							{/if}

							{#if !doc.fileUrl}
								<span class="flex items-center gap-1.5 text-[11px] text-mute/60"><Lock size={11} /> Sin archivo</span>
							{:else}
								<div>
									<button
										type="button"
										onclick={() => handleDownload(doc)}
										disabled={dlState === 'loading'}
										class="flex items-center gap-2 px-4 py-2 bg-fg text-base text-xs font-medium hover:bg-black/80 transition-colors disabled:opacity-50"
									>
										{#if dlState === 'loading'}
											<Loader2 size={13} class="animate-spin" />
										{:else if dlState === 'done'}
											<CheckCircle2 size={13} />
										{:else}
											<Download size={13} />
										{/if}
										{dlState === 'loading' ? 'Descargando…' : dlState === 'done' ? 'Descargado' : 'Descargar'}
									</button>
									{#if dlState === 'error'}
										<p class="text-[11px] text-red-600 mt-1.5">{dlMessage}</p>
									{/if}
								</div>
							{/if}
						</div>
					</article>
				{/each}
			</div>
		{/if}

		<p class="text-[11px] text-mute text-center mt-8 max-w-md mx-auto leading-relaxed">
			Algunos recursos pueden requerir una cuenta o permisos de acceso.
		</p>
	</div>
</div>
