# crow-clone

Port del frontend de **Crow Projects** (Next.js 16 + React 19) a **SvelteKit 3 + Svelte 5**, desplegado en **Cloudflare Pages**.

El frontend consume **directamente** la API pública `https://api.hodsoftware.com` (tienda `cursox`) desde el navegador, con `credentials: 'include'`, exactamente igual que el original: mismo origen, mismas rutas, mismos headers y payloads. **No hay proxy ni backend nuevo.**

## Stack

- SvelteKit 3 (Svelte 5, runes) + `@sveltejs/adapter-cloudflare`
- Tailwind CSS 4 (`@tailwindcss/vite`) con los tokens del sitio original (`bg-base`, `text-fg`, `border-line`, `bg-panel`, `text-mute`, `text-signal`, …)
- `@lucide/svelte`, `svelte-french-toast`, `marked` + `dompurify`, `@fontsource/*`

## Variables de entorno

En Cloudflare Pages (Settings → Environment variables) y en el `.env` local:

```bash
PUBLIC_API_URL=https://api.hodsoftware.com
PUBLIC_STORE_SLUG=cursox
PUBLIC_ORG_SLUG=cursox
```

- Las tres variables están declaradas en `src/env.js` con `public: true` y `static: true`; SvelteKit 3 solo las expone al bundle si están declaradas explícitamente.
- `PUBLIC_*` se **incrusta en tiempo de build**. En Cloudflare Pages definilas en el panel (se aplican al build) y no hace falta cambiarlas en runtime.
- `PUBLIC_API_URL` va **sin barra final** (la app concatena `/stores/...`).

## Desarrollo local

La API rechaza con 500 cualquier `Origin` con puerto o `localhost` (allowlist CORS). Para que el dev server consuma la API real hay que servirlo **en el puerto 80** y con un dominio `hodsoftware.com` resuelto a `127.0.0.1`:

```bash
# 1. Resolver el subdominio (una sola vez)
echo "127.0.0.1 crow-projects.hodsoftware.com" | sudo tee -a /etc/hosts

# 2. Permitir puertos < 1024 sin privilegios (una sola vez, hasta reiniciar)
sudo sysctl -w net.ipv4.ip_unprivileged_port_start=0

# 3. Levantar el dev server en el puerto 80
npm run dev -- --port 80 --host crow-projects.hodsoftware.com
```

Después: <http://crow-projects.hodsoftware.com> (sin puerto en la URL → el `Origin` coincide con la allowlist).

Si el puerto 80 está ocupado, liberá el proceso que lo tenga; Vite corría en el 81 y la API rechazaba ese `Origin` con puerto.

## Build y deploy (Cloudflare Pages)

| Configuración | Valor |
|---|---|
| Build command | `npm run build` |
| Build output directory | `.svelte-kit/cloudflare` |
| Runtime | Workers (Pages Functions), `nodejs_compat` habilitado en `wrangler.toml` |

El proyecto se deploya en el subdominio `crow-projects.hodsoftware.com` (CNAME administered por el usuario → Pages).

### Back URLs de pagos (MercadoPago / Nave) y OAuth de Google

El backend define los `back_urls` de MercadoPago/Nave y el `redirectTo` del login con Google. Si apuntan al dominio original, el usuario aterriza en el sitio viejo después de pagar: es un cambio de configuración **del backend**, no de este repo (ver R5 del plan).

## Estructura

```
src/
├── lib/
│   ├── api/            # wrappers de fetch: client, store, auth, checkout, organization, community, analytics
│   ├── components/     # home, layout, product(s), comunidad, contact, icons
│   ├── stores/         # cart.svelte.js (persist `econopet-cart` v2), auth.svelte.js
│   ├── api/…           # …
│   ├── branding.js     # branding data-driven desde la org
│   ├── contentFilter.js# copia 1:1 del original
│   └── utils.js        # imágenes con URL absoluta, precios, categorías
└── routes/             # home, productos, producto/[slug], cart, checkout, pedido/*, login, register,
                        # orders, wishlist, auth/callback, blog, biblioteca, turnos, comunidad,
                        # about, contacto, galeria, proyectos, privacidad, terms-and-conditions
```

## Tests

```bash
node tests/cart-persist.test.mjs
```

Verifica el formato de persistencia del carrito (idéntico al de `zustand/persist`) y su migración desde la versión 1.
