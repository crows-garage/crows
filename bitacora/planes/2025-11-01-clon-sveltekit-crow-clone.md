# Plan: Port de `cursox` (Next.js) → SvelteKit en Cloudflare Pages — crow-clone

> Fuente: `hod-svr:/home/debian/demo-ecommerce/cursox` (~10.196 líneas, 84 archivos en `src/`)
> Destino: `/home/mori/Projects/HOD-software/crow-clone` (vacío, solo `.git`)
> Deploy objetivo: **Cloudflare Pages** + CNAME `*.hodsoftware.com` (DNS lo maneja el usuario)
> Alcance fase 1: **lógica 1:1, estilos mínimos** (restyling va en fase 2)

---

## 1. Objetivo

Reimplementar **solo el frontend** de `cursox` (Next.js 16 App Router + React 19) como aplicación **SvelteKit 2 + Svelte 5** desplegada en **Cloudflare Pages**, consumiendo la **misma API externa** (`https://api.hodsoftware.com`, tienda `cursox`) **de la misma manera** que el original: `fetch` desde el navegador con `credentials: 'include'`, mismas rutas, headers y payloads. **Sin proxy, sin backend nuevo.** La carpeta `src/lib/api/` del clon es el equivalente de los `src/lib/*.js` del original (wrappers de fetch que ya viven en el frontend). Lo único que cambia es el framework de vistas y el runtime de deploy.

### Condiciones de red (verificadas empíricamente contra la API real)

| Contexto | `Origin` | Resultado |
|---|---|---|
| curl / fetch server-side | (sin Origin) | 200 |
| Prod esperado | `https://crow.hodsoftware.com` (CNAME → Pages) | 200 + `access-control-allow-origin` + `allow-credentials: true` |
| Patrón allowlist | cualquier `*.hodsoftware.com` **sin puerto** | 200 |
| `http://crow.hodsoftware.com:5173` (con puerto) | — | **500** (crashea) |
| `http://localhost:*` / `127.0.0.1:*` | — | **500** (crashea) |

Conclusiones que moldean el plan:

1. **Prod funciona directo**: el clon servido bajo un subdominio `hodsoftware.com` consume la API igual que el original (same-site → cookies SameSite=Lax viajan sin problema; CORS con credenciales confirmado).
2. **Dev local sin proxy** (decisión del usuario): la allowlist rechaza puertos → el dev server debe correr en **puerto 80** y accederse por un dominio `hodsoftware.com` resuelto a `127.0.0.1` vía `/etc/hosts`. Así el navegador envía `Origin: http://crow.hodsoftware.com` (sin puerto) → 200. Cero código de proxy.
3. Cookies: si el backend setea `Domain=.hodsoftware.com` o cookies host-only en `api.hodsoftware.com`, en ambos casos viajan bien desde el subdominio (same-site).

## 2. Hallazgos del relevamiento

### 2.1 Arquitectura del original (todo frontend)

| Capa | Archivo original | Función |
|---|---|---|
| API tienda | `src/lib/api.js` | store, categories, products (+paged, +bySlug), brands, collections, labels, faqs, attributes, ctas, locals, blog, newsletter |
| Auth cliente | `src/lib/authApi.js` | login/register (header `X-Store-Id`), refresh-token automático con cookies (`credentials: 'include'`), profile, orders, wishlist, Google OAuth, forgot/reset password |
| Checkout | `src/lib/checkoutApi.js` | config de tienda, crear orden, preferencia MercadoPago, intención Nave, status de pago |
| Organización | `src/lib/organizationApi.js` | perfil org, events, reports, authorities, galleries, projects, library, blog, turneros + slots. Des-envuelve `{data, pagination}` → array |
| Comunidad | `src/lib/communityApi.js` | posts, comentarios, encuestas, reacciones, miembros, reservas de turnero, solicitud de asociación |
| Analytics | `src/lib/analytics.js` | trackEvent → `/analytics/track` (sessionId en localStorage, device type, búsquedas) |
| Branding | `src/lib/siteBranding.js` | nombre/desc/logo data-driven desde org (fallback store) |
| Filtro contenido | `src/lib/contentFilter.js` | regex bloquea contenido (justicia/judicial/mendoza…). **Copiar tal cual** |
| Carrito | `src/store/cartStore.js` | Zustand + persist localStorage: items compuestos (product+variant), addItem/removeItem/updateQuantity/syncItem/validateStock/clearCart + selectores. Key = `productId` o `productId-variantId`. Persist key: `econopet-cart` v2 con migrate |
| Auth estado | `src/hooks/useAuth.js` (usado; `contexts/AuthContext.jsx` es duplicado obsoleto) | user/loading/error, login, register, googleLogin, logout, updateProfile, checkAuth |

### 2.2 Flujo de checkout (crítico)

1. Wizard de 4 pasos (Datos → Entrega → Pago → Confirmar) con validaciones por paso.
2. Carga `/stores/{slug}/config` (delivery/takeaway/métodos de pago/costos) con defaults si falla.
3. Cupones: `POST /stores/{slug}/coupons/validate` con subtotal + items (categoryId, brandId, labelIds, collectionIds). Tipos: monto fijo y `FREE_SHIPPING` (anula envío).
4. Cálculo: `total = subtotal - descuento + envío` (envío gratis si `total >= freeShippingMinTotal` o cupón FREE_SHIPPING).
5. Crear orden `POST /stores/{slug}/orders` → `clearCart()` → según método:
   - MERCADOPAGO → `POST /payments/create-preference` → redirect `initPoint || sandboxInitPoint`
   - NAVE → `POST /payments/create-nave-intention` → redirect `checkout_url`
   - CASH/TRANSFER → `/pedido/success?orderId=…`
6. Páginas `pedido/success|failure|pending`: leen `orderId|external_reference`, `collection_status|status`, `payment_id|collection_id` de la query; consultan `GET /payments/status/{orderId}`; failure tiene retry (si CANCELLED → checkout, sino re-crear preferencia).

### 2.3 Renderizado

- **Server (RSC con fetch + `revalidate`)**: home, productos (fetch inicial), producto/[slug], blog, blog/[slug], biblioteca, turnos (wrapper), galería, proyectos, about, contacto, legales. Todos con `generateMetadata`.
- **Client**: cart, checkout, pedido/*, login, register, orders, wishlist, comunidad, ProductsClient (filtros/búsqueda/paginación), TurnosClient, auth/callback.
- Layout: fetch global de store/categories/collections/labels/locals/org → Navbar + Footer + WhatsApp + AnalyticsTracker + AuthProvider. `dynamic = 'force-dynamic'` → en SvelteKit: SSR siempre, nada prerenderizado (excepto legales si conviene).

## 3. Mapeo de tecnologías

| Next.js / React | SvelteKit / Svelte | Nota |
|---|---|---|
| `next start` / VPS+PM2 | **Cloudflare Pages + `@sveltejs/adapter-cloudflare`** | SSR corre en Pages Functions (Workers) |
| RSC async fetch en page | `+page.server.js` → `load()` | fetch de Workers no envía Origin → API responde 200 |
| `generateMetadata` | `<svelte:head>` con datos del load | |
| `'use client'` | todo componente Svelte | trivial |
| `useRouter` / `useSearchParams` / `notFound()` | `$app/navigation`, `page.url.searchParams`, `error(404)` | |
| Zustand + persist | `writable` + sync manual con `localStorage` | ~40 líneas; respetar key `econopet-cart` v2 |
| React Context (AuthProvider) | store Svelte (`auth.svelte.js`) iniciado desde `+layout.svelte` | checkAuth on mount |
| `next/image` | `<img loading="lazy">` | fase 1 sin optimizador |
| `next/font` | `@fontsource` (oswald, inter, ibm-plex-mono) | |
| rewrites `/uploads` | URLs absolutas `${PUBLIC_API_URL}${img}` en `utils.js` | sin rewrites posibles en Pages; el favicon ya se arma así en el original |
| `lucide-react` | `@lucide/svelte` | |
| `react-hot-toast` | `svelte-french-toast` | |
| `embla-carousel-react` | `embla-carousel-svelte` | |
| `react-markdown`+remark-gfm+rehype-raw | `marked` + DOMPurify | blog con HTML crudo |
| Tailwind 4 + `globals.css` | Tailwind 4 + CSS global copiado | tokens (`bg-base`, `text-fg`, `border-line`, `bg-panel`, `text-mute`, `text-signal`) se conservan |

## 4. Estructura destino

```
crow-clone/
├── .env                          # PUBLIC_API_URL, PUBLIC_STORE_SLUG=cursox, PUBLIC_ORG_SLUG=cursox
├── wrangler.toml                 # config Pages (name, compatibility_date, nodejs_compat)
├── svelte.config.js              # adapter-cloudflare
├── src/
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.js         # fetchJSON/postJSON + request con refresh (base común)
│   │   │   ├── store.js          # ≙ api.js
│   │   │   ├── auth.js           # ≙ authApi.js
│   │   │   ├── checkout.js       # ≙ checkoutApi.js
│   │   │   ├── organization.js   # ≙ organizationApi.js
│   │   │   ├── community.js      # ≙ communityApi.js
│   │   │   └── analytics.js
│   │   ├── stores/
│   │   │   ├── cart.svelte.js    # ≙ cartStore.js (misma forma de datos y selectores)
│   │   │   └── auth.svelte.js    # ≙ useAuth.js
│   │   ├── branding.js           # ≙ siteBranding.js (para loads)
│   │   ├── contentFilter.js      # copia 1:1
│   │   └── utils.js              # ≙ utils.js (getAllImages → URLs absolutas API, formateo…)
│   ├── routes/
│   │   ├── +layout.server.js     # fetch global tienda/org (≙ layout.js)
│   │   ├── +layout.svelte        # Navbar/Footer/WhatsApp/Toaster + branding head
│   │   ├── +page.svelte          # home (secciones en src/lib/components/home/)
│   │   ├── productos/…           # +page.server.js + ProductosClient + FilterSidebar + ProductCard
│   │   ├── producto/[slug]/…     # detalle + galería + variantes + related + reviews
│   │   ├── cart/ checkout/ pedido/{success,failure,pending}/
│   │   ├── login/ register/ orders/ wishlist/ auth/callback/
│   │   ├── blog/ blog/[slug]/ biblioteca/ turnos/ comunidad/
│   │   ├── about/ contacto/ galeria/ proyectos/ privacidad/ terms-and-conditions/
│   │   └── +error.svelte         # ≙ not-found
│   └── app.css                   # ≙ globals.css (adaptado)
```

## 5. Pasos concretos

### Fase 0 — Scaffolding + setup Cloudflare
- [ ] `npx sv create` (Svelte 5, JS como el original) + Tailwind 4.
- [ ] `@sveltejs/adapter-cloudflare` en `svelte.config.js`; `wrangler.toml` con `compatibility_date` y flag `nodejs_compat`.
- [ ] `.env`: `PUBLIC_API_URL=https://api.hodsoftware.com`, `PUBLIC_STORE_SLUG=cursox`, `PUBLIC_ORG_SLUG=cursox` (mismas vars en el dashboard de Pages al crear el proyecto).
- [ ] **Dev local sin proxy**: entrada en `/etc/hosts` → `127.0.0.1 crow.hodsoftware.com`; dev server en puerto 80 (`vite dev --port 80`, requiere privilegios o `sysctl net.ipv4.ip_unprivileged_port_start=0`). Verificación: cargar la home con datos reales desde `http://crow.hodsoftware.com`.
- [ ] Copiar `globals.css` → `src/app.css` (tokens incluidos).
- [ ] Deploy de humo a Pages (branch preview) para validar el pipeline antes de portar código.

### Fase 1 — Capa de lógica (traducción 1:1 de los wrappers de fetch)
- [ ] `client.js`: base con `credentials: 'include'` a `${PUBLIC_API_URL}` (idéntico al original) + refresh-token una sola vez al 401 (excluye `/refresh-token` y `/logout`).
- [ ] `store.js`, `organization.js` (con `unwrap` de `{data,pagination}`), `checkout.js`, `analytics.js`, `contentFilter.js`, `utils.js` (getAllImages con base absoluta), `branding.js`.
- [ ] `auth.js`: `getStoreId()` desde `/stores/{slug}`, header `X-Store-Id`, wishlist, Google redirect.
- [ ] `cart.svelte.js`: writable + persist localStorage (key `econopet-cart`, versión 2, migrate igual). Exportar acciones + derivados `total/count/uniqueCount/storeSlug/orderItems`. SSR-safe.
- [ ] `auth.svelte.js`: `user/loading/error/login/register/googleLogin/logout/updateProfile/checkAuth`.

### Fase 2 — Layout global
- [ ] `+layout.server.js`: fetch paralelo store/categories/filterEducationalContent/collections/labels/locals/org profile.
- [ ] `+layout.svelte`: Navbar (búsqueda con sugerencias, badge carrito, estado auth), Footer, WhatsAppButton, Toaster, AnalyticsTracker, init auth.
- [ ] `+error.svelte` (404).
- [ ] Toggle dark mode con store simple.

### Fase 3 — Núcleo e-commerce (prioridad)
- [ ] Home: Hero, FeaturedCourses, CategoriesGrid, BlogShowcase, GalleryShowcase, FAQ, CTA, Newsletter, Services, Projects, Purpose, AgendaStrip.
- [ ] `/productos`: server load inicial + ProductosClient (filtros, orden, búsqueda, paginación) + FilterSidebar + ProductCard (port del archivo de 800 líneas).
- [ ] `/producto/[slug]`: `findProductBySlug` con fallback a lista completa, galería, ProductInfo (variantes → addToCart), AttributeTable, Related, Reviews/Questions, tracker de vista.
- [ ] `/cart`: items, cantidades, sync de stock, totales, validación.
- [ ] `/checkout`: wizard 4 pasos + cupones + config + creación de orden + redirecciones MP/Nave (§2.2 es la especificación exacta).
- [ ] `/pedido/success|failure|pending`: query params, status, retry de pago.

### Fase 4 — Cuenta
- [ ] `/login`, `/register` (formulario de 519 líneas: validaciones, asociación), `/auth/callback` (Google).
- [ ] `/orders`, `/wishlist` (toggle + listar).

### Fase 5 — Módulo organización
- [ ] `/blog` + `/blog/[slug]` (marked + DOMPurify), `/biblioteca` (+ DownloadButton con auth), `/turnos` (TurnosClient: slots, reserve/cancel, mis reservas), `/comunidad` (posts, comentarios, encuestas, reacciones).
- [ ] `/about`, `/contacto` (+ WhatsApp), `/galeria`, `/proyectos`, `/privacidad`, `/terms-and-conditions`.

### Fase 6 — Deploy y QA
- [ ] CNAME del subdominio elegido → proyecto Pages (DNS del usuario); dominio custom activo en Pages.
- [ ] Verificar con 1 curl que la API acepta el `Origin: https://<subdominio>` (esperado: sí, patrón `*.hodsoftware.com`).
- [ ] Vars `PUBLIC_*` en producción; build por Git integration (build: `npm run build`, output: `.svelte-kit/cloudflare`).
- [ ] Recorrer todas las rutas; comparar payloads con el original (`hod-svr:8806`).
- [ ] Flujo completo: carrito → checkout (cupón) → orden → MP/Nave → retorno a `/pedido/*` (validar `back_urls` del backend, ver R5).
- [ ] Metadata por página, 404s, carrito persistente, login → wishlist → orders.

## 6. Riesgos potenciales

| # | Riesgo | Mitigación |
|---|---|---|
| R1 | Allowlist de Origin: puertos y `localhost` → 500 (verificado). Dev estándar (`localhost:5173`) no puede consumir la API | Dev por `/etc/hosts` + puerto 80 (misma forma de Origin que prod). Alternativa: validar contra el preview de Pages. En prod con CNAME `*.hodsoftware.com` no aplica |
| R2 | Subdominio nuevo no contemplado en la allowlist del backend (si el match no es wildcard `*`) | Verificación con curl post-CNAME (Fase 6). Si fallara: agregar el subdominio en la config CORS del backend (1 línea allá, no acá) |
| R3 | Runtime Workers (Pages Functions): sin APIs de Node completas | `adapter-cloudflare` + flag `nodejs_compat`; deps elegidas (marked, dompurify, embla) son compatibles. Lo pesado corre client-side igual que el original |
| R4 | Carrito persistido: hidratación SSR vs localStorage (mismatch) | Cargar items con guard `browser`; esqueletos hasta hidratar |
| R5 | **`back_urls` de MercadoPago/Nave y redirect de Google OAuth**: los configura el backend y pueden apuntar al dominio original → tras pagar, el usuario aterriza en el sitio viejo | Probar en Fase 6; si confirma, es cambio de config en el backend (apuntar al subdominio nuevo) o aceptar el comportamiento en fase 1 |
| R6 | Cookies de sesión: manejo manual de cookies en el original con restos de otro proyecto (`domain=.economicopet.com`, dead code) | Portar el logout simplificado (llamada al backend + limpiar estado); las cookies httpOnly las controla la API y same-site funciona |
| R7 | `contentFilter` y textos con referencias específicas (regex "mendoza") | Copiar 1:1 sin "arreglar"; es comportamiento requerido |
| R8 | Alcance: 84 archivos / 10k líneas | Fases 0–3 son el MVP (≈60% del valor); 4–5 particionables en PRs |
| R9 | Caché ISR del original (`revalidate`) no replicada → más tráfico al backend | Caché en memoria TTL 60s en loads si hiciera falta (no en fase 1) |
| R10 | Doble implementación de auth en el original (`contexts/AuthContext.jsx` vs `hooks/useAuth.js`) | Portar solo `hooks/useAuth.js` (la que usa `ClientLayout`) |

## 7. Dependencias del proyecto nuevo

```
devDeps: @sveltejs/kit, @sveltejs/adapter-cloudflare, wrangler, svelte@5, vite, tailwindcss@4, @tailwindcss/vite
deps:    @lucide/svelte, svelte-french-toast, embla-carousel-svelte, embla-carousel-autoplay,
         marked, dompurify, @fontsource/oswald, @fontsource/inter, @fontsource/ibm-plex-mono
```

## 8. Criterios de aceptación

1. Las 20+ rutas del original existen y renderizan con datos reales de `api.hodsoftware.com` (tienda `cursox`).
2. **Cero código de API nueva y cero proxy**: todo request sale hacia `PUBLIC_API_URL` con las mismas rutas, headers y payloads que el original.
3. Carrito persistente con misma key/formato `econopet-cart` v2.
4. Flujo completo en prod (Pages + subdominio): carrito → checkout (cupón) → orden → MP/Nave → `/pedido/*`.
5. Login/register/logout + wishlist + orders con el mismo esquema de cookies (same-site subdominio).
6. Turnos: ver slots, reservar y cancelar. Comunidad: posts, comentarios, votos, likes.
7. Filtro de contenido activo en categories/products/faqs/blog (idéntico al original).
8. Dev local funcional vía hosts + puerto 80, documentado en el README del repo.
