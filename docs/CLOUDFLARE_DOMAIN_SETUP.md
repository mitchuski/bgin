# Cloudflare Worker + Custom Domain Setup

Your Next.js app deploys as a **Cloudflare Worker** (name: `bgin-ai`). There is no separate "Pages" project—the Worker is your app. Use the steps below to get the Worker running and attach your domain.

---

## 1. Deploy the Worker

From the project root:

```bash
npm run build
npm run deploy
```

Or on Cloudflare’s build system, set:

- **Build command:** `npm run build`
- **Deploy command:** `npm run deploy`

After deploy you get a `*.workers.dev` URL. For production, use a custom domain (below).

---

## 2. Add Your Domain in Cloudflare

Your domain must be on Cloudflare (added as a zone). If it isn’t yet:

1. In [Cloudflare Dashboard](https://dash.cloudflare.com) go to **Websites** and **Add a site**.
2. Add your domain and follow the steps (nameservers, etc.) until the zone is **Active**.

---

## 3. Connect the Worker to Your Domain

Two options: **Custom Domain** (recommended) or **Route**.

### Option A: Custom Domain (recommended)

The Worker is your app’s origin. Cloudflare will create the DNS record and certificate.

**In the dashboard:**

1. Go to [Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages).
2. Open the **bgin-ai** Worker.
3. Go to **Settings** → **Domains & Routes** → **Add** → **Custom Domain**.
4. Enter the hostname, e.g.:
   - `app.yourdomain.com` (subdomain)
   - or `yourdomain.com` (apex)
5. Save. Cloudflare creates the DNS record and SSL for that hostname.

**Or in `wrangler.jsonc`** (in the project root, same level as `package.json`), add a `routes` array with `custom_domain: true`:

```jsonc
{
  // ... existing keys (main, name, assets, etc.) ...
  "routes": [
    { "pattern": "app.yourdomain.com", "custom_domain": true }
  ]
}
```

- Use **one** pattern per hostname (no `/*`).
- For apex domain: `"pattern": "yourdomain.com"`.
- Redeploy after changing: `npm run deploy`.

---

### Option B: Route (existing DNS)

Use this if you already have a proxied (orange cloud) DNS record for the hostname.

**In the dashboard:**

1. [Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages) → **bgin-ai** → **Settings** → **Domains & Routes** → **Add** → **Route**.
2. Choose the **Zone** (e.g. `yourdomain.com`).
3. Route pattern: e.g. `app.yourdomain.com/*` or `yourdomain.com/*`.
4. Select Worker **bgin-ai** and save.

**Or in `wrangler.jsonc`:**

```jsonc
"routes": [
  { "pattern": "app.yourdomain.com/*", "zone_name": "yourdomain.com" }
]
```

Use your real zone name. Find **Zone ID** in the Cloudflare dashboard under the domain’s **Overview** if you prefer `"zone_id": "..."` instead of `zone_name`.

---

## 4. DNS (for Custom Domains)

- **Custom Domain:** Cloudflare creates the record when you add the custom domain; you don’t need to add a CNAME yourself.
- **Route:** Ensure the hostname has a DNS record in that zone (A/AAAA or CNAME) and is **Proxied** (orange cloud).

---

## 5. Summary

| Goal                    | Where to do it |
|-------------------------|----------------|
| Deploy the app          | `npm run build` then `npm run deploy` (or Cloudflare build + deploy commands). |
| Use a custom domain     | Workers & Pages → bgin-ai → Settings → Domains & Routes → Add **Custom Domain**. |
| Use a route             | Same place → Add **Route** (zone + pattern), or add `routes` in `wrangler.jsonc`. |
| Domain on Cloudflare    | Websites → Add a site → complete nameserver setup. |

After adding the custom domain or route, traffic to that hostname will be served by your **bgin-ai** Worker (your Next.js app).
