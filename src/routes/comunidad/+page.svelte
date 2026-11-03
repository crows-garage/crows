<script>
	import { Loader2, MessageSquare, Hourglass, XCircle, Users, ThumbsUp, Pin } from '@lucide/svelte'
	import { auth } from '#lib/stores/auth.svelte.js'
	import { communityApi } from '#lib/api/community.js'
	import { ORG_SLUG } from '#lib/api/client.js'
	import PollSection from '#lib/components/comunidad/PollSection.svelte'

	function formatDate(iso) {
		try {
			return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
		} catch {
			return ''
		}
	}

	let posts = $state([])
	let loading = $state(true)
	let error = $state('')
	let membership = $state(null)
	let commentDrafts = $state({})
	let commentLoading = $state(null)
	let commentError = $state('')
	let likeBusy = $state(null)
	let openComments = $state({}) // postId → bool
	let commentsByPost = $state({}) // postId → array

	async function load() {
		try {
			const [postsData, membersData] = await Promise.all([communityApi.getPosts(), communityApi.getMembers()])
			posts = postsData || []
			if (auth.user?.userId) {
				const mine = (membersData || []).find((m) => m.userId === auth.user.userId && !m.deletedAt)
				membership = mine || null
			}
			error = ''
		} catch (err) {
			error = 'No se pudo cargar la comunidad. Intentá de nuevo más tarde.'
		} finally {
			loading = false
		}
	}

	// ≙ useEffect([user]) con load = useCallback([user])
	$effect(() => {
		void auth.user
		load()
	})

	async function handleSubmitComment(postId) {
		const content = (commentDrafts[postId] || '').trim()
		if (!content) return

		commentLoading = postId
		commentError = ''
		try {
			await communityApi.addComment(postId, content)
			commentDrafts = { ...commentDrafts, [postId]: '' }
			// Refrescar comentarios del post y el conteo
			const [comments, postsData] = await Promise.all([
				communityApi.getComments(postId).catch(() => null),
				communityApi.getPosts().catch(() => null)
			])
			if (comments) commentsByPost = { ...commentsByPost, [postId]: comments }
			if (postsData) posts = postsData
		} catch (err) {
			commentError =
				err.response?.data?.message || err.response?.data?.error || 'No se pudo enviar el comentario'
		} finally {
			commentLoading = null
		}
	}

	async function handleResubmit() {
		commentError = ''
		try {
			await communityApi.resubmit({ organizationSlug: ORG_SLUG })
			await load()
		} catch (err) {
			commentError = err.response?.data?.error || err.message || 'No se pudo reenviar la solicitud'
		}
	}

	// Carga perezosa de comentarios por post
	async function toggleComments(postId) {
		const isOpen = openComments[postId]
		openComments = { ...openComments, [postId]: !isOpen }
		if (!isOpen && !commentsByPost[postId]) {
			try {
				const comments = await communityApi.getComments(postId)
				commentsByPost = { ...commentsByPost, [postId]: comments || [] }
			} catch (err) {
				commentError = 'No se pudieron cargar los comentarios'
			}
		}
	}

	async function handlePostLike(postId) {
		if (likeBusy) return
		likeBusy = postId
		try {
			const { liked, likeCount } = await communityApi.togglePostLike(postId)
			posts = posts.map((p) =>
				p.id === postId
					? { ...p, liked, likeCount: likeCount ?? (p._count?.reactions ?? 0) + (liked ? 1 : -1) }
					: p
			)
		} catch (err) {
			commentError = err.response?.data?.message || 'No se pudo registrar tu reacción'
		} finally {
			likeBusy = null
		}
	}

	async function handleCommentLike(postId, commentId) {
		if (likeBusy) return
		likeBusy = commentId
		try {
			const { liked, likeCount } = await communityApi.toggleCommentLike(postId, commentId)
			commentsByPost = {
				...commentsByPost,
				[postId]: (commentsByPost[postId] || []).map((c) =>
					c.id === commentId
						? { ...c, liked, likeCount: likeCount ?? (c._count?.reactions ?? 0) + (liked ? 1 : -1) }
						: c
				)
			}
		} catch (err) {
			commentError = err.response?.data?.message || 'No se pudo registrar tu reacción'
		} finally {
			likeBusy = null
		}
	}

	const canComment = $derived(membership?.status === 'ACTIVE')
	const membershipStatus = $derived(membership?.status)
</script>

<svelte:head>
	<title>Comunidad — Crow Projects</title>
	<meta name="description" content="Un espacio para compartir ideas, experiencias y oportunidades con estudiantes." />
</svelte:head>

<div class="min-h-screen pt-20 pb-16 bg-base">
	<div class="max-w-3xl mx-auto px-4">
		<div class="text-center mb-8">
			<p class="text-[10px] uppercase tracking-[0.3em] mb-2 text-mute">Comunidad</p>
			<h1 class="text-2xl sm:text-3xl font-display font-semibold tracking-tight text-fg">Comunidad estudiantil</h1>
			<p class="text-sm text-mute mt-2">Un espacio para compartir ideas, experiencias y oportunidades con estudiantes.</p>
		</div>

		{#if auth.loading || (loading && !auth.user)}
			<div class="flex items-center justify-center py-12">
				<Loader2 size={24} class="animate-spin text-mute" />
			</div>
		{:else if !auth.user}
			<div class="bg-panel border rounded-xs border-line p-5 flex flex-col sm:flex-row sm:items-center gap-3">
				<MessageSquare size={20} class="text-mute flex-shrink-0" />
				<p class="text-sm text-mute flex-1">Inicia sesion para participar en la comunidad.</p>
				<div class="flex gap-2 flex-shrink-0">
					<a href="/login?redirect=/comunidad" class="px-4 py-2 border rounded-xs border-line text-fg text-xs font-medium hover:bg-panel transition-colors">
						Iniciar sesión
					</a>
					<a href="/register?redirect=/comunidad" class="px-4 py-2 bg-signal text-base text-xs font-medium hover:bg-brand transition-colors">
						Crear cuenta
					</a>
				</div>
			</div>
		{:else if !membership}
			<div class="bg-panel border rounded-xs border-line p-5">
				<p class="text-sm text-mute">
					Tu cuenta aún no está vinculada a la institución.
					<a href="/register" class="text-fg underline">Completá tu perfil</a>
					para poder participar.
				</p>
			</div>
		{:else if membershipStatus === 'PENDING'}
			<div class="bg-panel border rounded-xs border-line p-5 flex items-start gap-3">
				<Hourglass size={20} class="text-mute flex-shrink-0 mt-0.5" />
				<p class="text-sm text-mute">
					Tu solicitud de acceso está<strong class="text-fg"> pendiente de revisión</strong>.
					Cuando sea aprobada, vas a poder comentar, votar y reaccionar en la comunidad.
				</p>
			</div>
		{:else if membershipStatus === 'REJECTED'}
			<div class="bg-panel border rounded-xs border-line p-5 flex items-start gap-3">
				<XCircle size={20} class="text-rec flex-shrink-0 mt-0.5" />
				<div class="flex-1">
					<p class="text-sm text-fg font-medium">Tu solicitud fue rechazada</p>
					{#if membership.rejectionReason}
						<p class="text-xs text-mute mt-1">Motivo: {membership.rejectionReason}</p>
					{/if}
					<button type="button" onclick={handleResubmit} class="mt-3 px-4 py-2 border rounded-xs border-line text-fg text-xs font-medium hover:bg-panel transition-colors">
						Volver a solicitar
					</button>
				</div>
			</div>
		{:else if membershipStatus === 'ACTIVE'}
			<div class="flex items-center gap-2 text-xs text-mute">
				<Users size={14} class="text-signal" />
				Participás como miembro verificado
			</div>
		{/if}

		{#if commentError}
			<div class="mt-4 border rounded-xs border-rec/30 bg-rec/10 text-rec px-3 py-2 text-xs">{commentError}</div>
		{/if}

		{#if loading}
			<div class="flex justify-center py-16">
				<Loader2 size={24} class="animate-spin text-mute" />
			</div>
		{:else if error}
			<div class="text-center py-16 text-sm text-mute">{error}</div>
		{:else if posts.length === 0}
			<div class="text-center py-16">
				<MessageSquare size={36} class="mx-auto text-mute/50 mb-3" />
				<p class="text-sm text-mute">Todavía no hay publicaciones en la comunidad</p>
			</div>
		{:else}
			<div class="space-y-6 mt-6">
				{#each posts as post (post.id)}
					<article class="bg-panel border rounded-xs border-line">
						<div class="p-5 border-b border-line">
							<div class="flex items-start justify-between gap-3">
								<h2 class="text-lg font-medium text-fg leading-snug flex items-center gap-2">
									{#if post.pinned}
										<span class="text-[9px] font-semibold uppercase tracking-[0.2em] bg-fg text-base px-2 py-0.5 flex items-center gap-1 flex-shrink-0">
											<Pin size={9} /> Anuncio
										</span>
									{/if}
									{post.title}
								</h2>
							</div>
							<p class="text-xs text-mute mt-2">{communityApi.authorName(post.author)} · {formatDate(post.createdAt)}</p>
							<div class="mt-3 text-sm text-fg/90 leading-relaxed whitespace-pre-wrap">{post.content}</div>

							<!-- Encuesta -->
							<PollSection {post} canVote={canComment} onVoted={load} />
						</div>

						<div class="p-5">
							<!-- Reacciones al post -->
							<div class="flex items-center justify-between mb-4">
								<button
									type="button"
									onclick={() => toggleComments(post.id)}
									class="text-[10px] uppercase tracking-[0.3em] text-mute hover:text-fg transition-colors"
								>
									{post._count?.comments ?? 0} comentarios
								</button>
								<button
									type="button"
									onclick={() => handlePostLike(post.id)}
									disabled={!canComment || likeBusy === post.id}
									class={`flex items-center gap-1.5 text-xs transition-colors ${
										post.liked ? 'text-signal' : canComment ? 'text-mute hover:text-fg' : 'text-mute/60'
									} disabled:cursor-default`}
									title={canComment ? 'Me gusta' : 'Reacción exclusiva de miembros'}
								>
									<ThumbsUp size={13} />
									{post.likeCount ?? post._count?.reactions ?? 0}
								</button>
							</div>

							{#if openComments[post.id]}
								{#if commentsByPost[post.id] === undefined}
									<div class="flex justify-center py-4 mb-4">
										<Loader2 size={16} class="animate-spin text-mute" />
									</div>
								{:else if (commentsByPost[post.id] || []).length > 0}
									<div class="space-y-3 mb-5">
										{#each commentsByPost[post.id] as comment (comment.id)}
											<div class="border-l-2 border-line pl-3">
												<div class="flex items-center justify-between gap-2">
													<p class="text-[11px] text-mute">
														{communityApi.authorName(comment.author)} · {formatDate(comment.createdAt)}
													</p>
													<button
														type="button"
														onclick={() => handleCommentLike(post.id, comment.id)}
														disabled={!canComment || likeBusy === comment.id}
														class={`flex items-center gap-1 text-[11px] transition-colors ${
															comment.liked ? 'text-signal' : canComment ? 'text-mute hover:text-fg' : 'text-mute/60'
														} disabled:cursor-default`}
													>
														<ThumbsUp size={11} />
														{comment.likeCount ?? comment._count?.reactions ?? 0}
													</button>
												</div>
												<p class="text-sm text-fg/90 mt-1 whitespace-pre-wrap">{comment.content}</p>
											</div>
										{/each}
									</div>
								{:else}
									<p class="text-xs text-mute mb-4">Sin comentarios todavía.</p>
								{/if}

								{#if canComment}
									<div class="flex gap-2">
										<input
											type="text"
											value={commentDrafts[post.id] || ''}
											oninput={(e) => (commentDrafts = { ...commentDrafts, [post.id]: e.currentTarget.value })}
											onkeydown={(e) => e.key === 'Enter' && handleSubmitComment(post.id)}
											placeholder="Escribí un comentario..."
											class="flex-1 px-3 py-2 border rounded-xs border-line bg-base text-fg text-sm focus:outline-none focus:border-signal transition-colors"
										/>
										<button
											type="button"
											onclick={() => handleSubmitComment(post.id)}
											disabled={commentLoading === post.id || !(commentDrafts[post.id] || '').trim()}
											class="px-4 py-2 bg-signal text-base text-xs font-medium hover:bg-brand transition-colors disabled:opacity-50"
										>
											{#if commentLoading === post.id}<Loader2 size={14} class="animate-spin" />{:else}Comentar{/if}
										</button>
									</div>
								{/if}
							{/if}
						</div>
					</article>
				{/each}
			</div>
		{/if}
	</div>
</div>
