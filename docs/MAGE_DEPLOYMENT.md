# Mage (NEAR AI) and deployment

How the NEAR AI Mage agent works when the app is deployed to Cloudflare, and what to configure so it keeps working.

---

## How deployment works

- The app is built and deployed as a **Cloudflare Worker** named **bginai** using **OpenNext** (`npm run build:cloudflare` / `npm run deploy`).
- All routes, including **API routes**, run inside that Worker (no separate Node server).
- The Mage chat UI calls **POST /api/mage/[wg]/chat**, which runs on the Worker and calls `runMageInference()` in `src/lib/mage/inference.ts`.
- Inference reads **server-side** env:
  - **NEAR_AI_API_KEY** → NEAR Cloud AI (preferred)
  - **ANTHROPIC_API_KEY** → Anthropic fallback

So for the Mage to work in production, those keys must be available **at runtime** inside the Worker.

---

## What you must set (production)

1. **Cloudflare Dashboard**  
   [Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages) → **bginai** → **Settings** → **Variables and Secrets**.

2. **Add at least one of:**
   - **NEAR_AI_API_KEY** — NEAR Cloud AI key (from [cloud.near.ai](https://cloud.near.ai) → API Keys, with credits), **or**
   - **ANTHROPIC_API_KEY** — Anthropic API key (e.g. for Claude).

3. **Optional (same place):**
   - **NEAR_AI_MODEL** — e.g. `openai/gpt-oss-120b` (default)
   - **ANTHROPIC_MAGE_MODEL** — e.g. `claude-sonnet-4-20250514` (default)
   - **NEXT_PUBLIC_NEAR_PROXY_URL** — only if you use a different proxy URL (default: `https://near-ai-proxy.privacymage.workers.dev`)

4. **Redeploy** after changing Variables and Secrets so the Worker picks them up.

---

## Why it works on Cloudflare

- **wrangler.jsonc** sets:
  - **nodejs_compat**
  - **nodejs_compat_populate_process_env**
- So the Worker’s **Variables and Secrets** are copied into **process.env** at runtime.  
  `inference.ts` only reads `process.env.NEAR_AI_API_KEY` and `process.env.ANTHROPIC_API_KEY`, so no code changes are needed for deployment.

---

## If you use Workers Builds (CI/CD)

- **Build variables and secrets** in the build configuration are for the **Next.js build** (e.g. `NEXT_PUBLIC_*` inlined into the client bundle).
- **Runtime** keys (NEAR_AI_API_KEY, ANTHROPIC_API_KEY) must still be set in the **Worker’s** Variables and Secrets in the dashboard (or via Wrangler secrets). They are not taken from build env at request time.
- Use **Deploy** → **Variables and Secrets** for the **bginai** Worker so they are available when `/api/mage/[wg]/chat` runs.

---

## Quick checks when Mage fails

| Symptom | Likely cause |
|--------|----------------|
| **502** on `/api/mage/.../chat` | No inference key in Worker env, or key invalid/expired. Set **NEAR_AI_API_KEY** or **ANTHROPIC_API_KEY** in Cloudflare → bginai → Variables and Secrets and redeploy. |
| **401** on chat | Usually **request auth** (ceremony/identity), not server env. User must complete ceremony and send signed request. |
| **Timeout** | NEAR/Anthropic slow or cold start. Inference uses 30s timeout and 2 retries; optional: increase timeout in `inference.ts` if needed. |

---

## Local vs production

- **Local:** Use `.env.local` (or `.env`). Next.js loads it and `process.env` is set when you run `next dev` or `wrangler dev`.
- **Production:** No `.env` on Cloudflare. Set variables in the dashboard (or Wrangler secrets) as above.

See also: [CLOUDFLARE_DOMAIN_SETUP.md](./CLOUDFLARE_DOMAIN_SETUP.md) (env summary in section 1b).
