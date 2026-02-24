# 404s for JS/CSS chunks and favicon

## What the error means

The browser loads the **HTML** page, but requests for these fail with **404 (Not Found)**:

- `main-app.js`, `app-pages-internals.js`, `layout.js`, `error.js`, `not-found.js`, `global-error.js`
- `layout.css`
- `favicon.ico`

So the **document** is served, but the **assets** (scripts, styles, favicon) are not. The app then appears broken or blank because the JavaScript never runs.

---

## Cause

### On Cloudflare (deployed Worker)

The Worker is serving the **page HTML** from the OpenNext worker, but the **static assets** (the contents of `/_next/static/...` and similar) are not being found. That usually means:

1. **OpenNext build was not run** — Only `next build` was run, so `.open-next/assets` was never created. The deploy step has nothing to serve for `/_next/*`.

2. **Fix:** In Cloudflare, set the **Build command** to **`npm run build:cloudflare`** (not `npm run build`). That runs both the Next.js build and the OpenNext build, so `.open-next/` (including `assets`) is produced and then deployed. Leave **Deploy command** as `npx wrangler deploy`.

### Locally (localhost:3000)

- **Use `npm run dev`** for local development. The URLs like `/_next/static/chunks/main-app.js?v=...` are served only by the **dev server**.
- If those assets 404:
  1. **Stop** whatever is running on port 3000 (Ctrl+C in the terminal where `npm run dev` is running).
  2. **Delete the cache:** from the project root run `Remove-Item -Recurse -Force .next` (PowerShell) or `rm -rf .next` (bash).
  3. **Start dev again:** `npm run dev`.
  4. Open **http://localhost:3000** in a **new tab** or an incognito window (to avoid stale HTML).
- Do **not** mix dev and production: if you run **`npm run start`** (production), chunk names are hashed and different; the HTML from a dev session won’t match. Use either `npm run dev` or `npm run build` + `npm run start`, and refresh after switching.

### Favicon

The app had no `favicon.ico`, so the browser’s default request for `/favicon.ico` returns 404. Adding one in `app/` (or `public/`) removes that 404; the rest of the app can work without it.

---

## Summary

| Where        | Fix |
|-------------|-----|
| **Cloudflare** | Build command: **`npm run build:cloudflare`**. Deploy: **`npx wrangler deploy`**. |
| **Local dev**  | Use **`npm run dev`** and open **http://localhost:3000**. |
| **Favicon 404** | Add `app/favicon.ico` (or `app/icon.png` / `icon.tsx`). |
