# Deploying ThinkEasy React

This is a static single-page app (Vite build output) that talks to the
existing Flask API — there's nothing server-side to deploy here besides
static files.

## Build

```bash
npm install
npm run build      # outputs to dist/
npm run preview    # sanity-check the production build locally
```

## Environment variables

Copy `.env.example` to `.env` and adjust:

| Variable | Required | Purpose |
|---|---|---|
| `VITE_API_URL` | No (has a working default) | Base URL of the Flask API, including `/api` |
| `VITE_GA_MEASUREMENT_ID` | No | Enables Google Analytics 4 if set |
| `VITE_CLARITY_PROJECT_ID` | No | Enables Microsoft Clarity if set |

Vite only exposes variables prefixed with `VITE_` to client code — this
is intentional and matches Vite's security model (never put secrets in
`VITE_*` vars, since they end up in the shipped JS bundle).

## Vercel

`vercel.json` is included: it rewrites all paths to `index.html` (required
for client-side routing — otherwise refreshing `/business/42` 404s) and
sets baseline security headers. Just point a Vercel project at this repo;
no extra configuration needed. Set env vars in the Vercel dashboard under
Project → Settings → Environment Variables.

## Render (static site)

- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Add a rewrite rule (Render dashboard → Redirects/Rewrites): `/*` → `/index.html` (rewrite, not redirect) — `public/_redirects` is also included for hosts that read that file directly.

## Railway

Railway can serve this as a static site (via a simple `serve`/`nginx`
buildpack) or as a Node service running `npm run preview` behind Railway's
port binding. For a static deploy: build command `npm run build`, then
serve the `dist/` folder with any static file server that supports SPA
fallback (e.g. `npx serve -s dist`).

## Security headers

`vercel.json` sets `X-Content-Type-Options`, `X-Frame-Options`,
`Referrer-Policy`, and a conservative `Permissions-Policy`. If deploying
elsewhere (Render/Railway/nginx), replicate these at the server/proxy
level — Vite's static output has no way to set response headers itself.

## SEO artifacts

`public/robots.txt` and `public/sitemap.xml` are static. `sitemap.xml`
only lists the fixed routes (`/`, `/feedback`, `/login`) — the dynamic
business/product URLs aren't in it, since generating those requires
either a small build-time script that calls the Flask API for the full
business/product list, or a backend-served sitemap route. Both are
reasonable next steps but out of scope here since the brief asked not to
touch the backend and there's no existing build-time data-fetch step in
this project.
