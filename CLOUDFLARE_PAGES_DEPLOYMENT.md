# BGIN.ai Cloudflare Pages Deployment Guide

> **Project**: BGINAI Block14
> **Domain**: bgin.ai
> **Method**: GitHub + Cloudflare Pages
> **Framework**: Next.js 14 (App Router)

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites & Accounts](#prerequisites--accounts)
3. [Phase 1: Code Preparation](#phase-1-code-preparation)
4. [Phase 2: GitHub Setup](#phase-2-github-setup)
5. [Phase 3: Cloudflare Pages Setup](#phase-3-cloudflare-pages-setup)
6. [Phase 4: Environment Variables](#phase-4-environment-variables)
7. [Phase 5: Custom Domain (bgin.ai)](#phase-5-custom-domain-bginai)
8. [Phase 6: Database Migration](#phase-6-database-migration)
9. [Phase 7: Testing & Verification](#phase-7-testing--verification)
10. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    bgin.ai (Cloudflare)                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              Cloudflare Pages                        │   │
│   │                                                      │   │
│   │   ┌─────────────┐      ┌─────────────────────────┐  │   │
│   │   │   Static    │      │   Pages Functions       │  │   │
│   │   │   Assets    │      │   (Edge Runtime)        │  │   │
│   │   │             │      │                         │  │   │
│   │   │  React UI   │ ───► │  /api/* routes          │  │   │
│   │   │  .next/     │      │  - /api/mage/chat       │  │   │
│   │   │  static/    │      │  - /api/ceremony        │  │   │
│   │   │             │      │  - /api/promises        │  │   │
│   │   └─────────────┘      │  - /api/spellbook       │  │   │
│   │                        └───────────┬─────────────┘  │   │
│   └────────────────────────────────────┼────────────────┘   │
│                                        │                     │
│                                        ▼                     │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              External Services                       │   │
│   │                                                      │   │
│   │   • NEAR Cloud AI (inference)                       │   │
│   │   • Neon/Supabase PostgreSQL (optional)             │   │
│   │   • Qdrant Cloud (vector DB - optional)             │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Good News**: Next.js 14 works natively with Cloudflare Pages! Your API routes run as Pages Functions (edge runtime).

---

## Prerequisites & Accounts

### Accounts You Need

| Service | Purpose | URL | Action Required |
|---------|---------|-----|-----------------|
| **GitHub** | Code repository | github.com | ⬜ Verify access |
| **Cloudflare** | DNS + Pages hosting | dash.cloudflare.com | ⬜ Verify access |
| **NEAR Cloud AI** | LLM inference | cloud.near.ai | ⬜ Get API key (already have) |
| **Neon** (optional) | PostgreSQL | neon.tech | ⬜ Create account if needed |

### API Keys to Gather

```
⬜ NEAR_AI_API_KEY     - Already in your .env
⬜ ANTHROPIC_API_KEY   - Optional backup for Mage
```

---

## Phase 1: Code Preparation

### Step 1.1: Update next.config.mjs for Cloudflare

Edit `C:\Users\mitch\BGINAI\BGINAI_Block14\next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Required for Cloudflare Pages
  output: 'standalone',

  // Disable image optimization (not supported on Cloudflare Pages)
  images: {
    unoptimized: true,
  },

  // Ensure trailing slashes are consistent
  trailingSlash: false,
};

export default nextConfig;
```

### Step 1.2: Create Cloudflare Pages Configuration

Create `C:\Users\mitch\BGINAI\BGINAI_Block14\wrangler.toml`:

```toml
name = "bgin"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[vars]
NEXT_PUBLIC_APP_URL = "https://bgin.ai"

# Production environment
[env.production.vars]
NEXT_PUBLIC_APP_URL = "https://bgin.ai"

# Preview environment
[env.preview.vars]
NEXT_PUBLIC_APP_URL = "https://preview.bgin.ai"
```

### Step 1.3: Update .gitignore

Ensure these are in `.gitignore`:

```gitignore
# Dependencies
node_modules/

# Next.js
.next/
out/

# Environment (NEVER commit secrets)
.env
.env.local
.env.production.local

# Development data
.data/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
```

### Step 1.4: Create Environment Template

Update `C:\Users\mitch\BGINAI\BGINAI_Block14\.env.example`:

```env
# ===========================================
# BGINAI Block14 - Environment Variables
# ===========================================
# Copy this to .env and fill in values
# NEVER commit .env to git!

# AI Inference (required - pick one or both)
NEAR_AI_API_KEY=sk-your-near-api-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# Database (optional - for production)
# DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Vector DB (optional)
# QDRANT_URL=https://your-cluster.cloud.qdrant.io:6333
# QDRANT_API_KEY=your-qdrant-api-key

# Public URL (set by Cloudflare)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 1.5: Fix Data Storage for Production

The current `.data/` file-based storage won't work on Cloudflare. For the MVP demo, you have two options:

**Option A: Use Cloudflare KV (Simplest)**

This requires minimal code changes. I can help implement this if needed.

**Option B: Keep file storage for demo**

The app will work but data won't persist between deployments. Acceptable for demos.

### Step 1.6: Test Build Locally

```bash
cd "C:\Users\mitch\BGINAI\BGINAI_Block14"
npm install
npm run build
```

Verify:
- ⬜ Build completes without errors
- ⬜ `.next/` directory is created
- ⬜ No TypeScript errors

---

## Phase 2: GitHub Setup

### Step 2.1: Initialize Git (if not already)

```bash
cd "C:\Users\mitch\BGINAI\BGINAI_Block14"

# Check if already a git repo
git status

# If not, initialize
git init
git add .
git commit -m "Initial commit - BGINAI Block14"
```

### Step 2.2: Create GitHub Repository

1. ⬜ Go to https://github.com/new
2. ⬜ Repository name: `bginai-block14` (or your preference)
3. ⬜ Set to **Private** (recommended - contains API integration code)
4. ⬜ Do NOT initialize with README (you already have files)
5. ⬜ Click **Create repository**

### Step 2.3: Push to GitHub

```bash
# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/bginai-block14.git

# Push
git branch -M main
git push -u origin main
```

### Step 2.4: Verify Upload

- ⬜ Visit your repo on GitHub
- ⬜ Confirm all files are present
- ⬜ Confirm `.env` is NOT uploaded (only `.env.example`)

---

## Phase 3: Cloudflare Pages Setup

### Step 3.1: Access Cloudflare Pages

1. ⬜ Log in to https://dash.cloudflare.com
2. ⬜ Select your account
3. ⬜ Click **Workers & Pages** in sidebar
4. ⬜ Click **Create application**
5. ⬜ Select **Pages** tab
6. ⬜ Click **Connect to Git**

### Step 3.2: Connect GitHub

1. ⬜ Click **Connect GitHub**
2. ⬜ Authorize Cloudflare (if first time)
3. ⬜ Select repository: `bginai-block14`
4. ⬜ Click **Begin setup**

### Step 3.3: Configure Build Settings

| Setting | Value |
|---------|-------|
| **Project name** | `bgin` |
| **Production branch** | `main` |
| **Framework preset** | `Next.js` |
| **Build command** | `npm run build` |
| **Build output directory** | `.next` |
| **Root directory** | `/` (leave empty) |

### Step 3.4: Add Environment Variables (Build Time)

Click **Add variable** for each:

| Variable Name | Value | Type |
|--------------|-------|------|
| `NODE_VERSION` | `18` | Plain text |
| `NEAR_AI_API_KEY` | `sk-your-key` | **Encrypt** |
| `ANTHROPIC_API_KEY` | `sk-ant-your-key` | **Encrypt** |
| `NEXT_PUBLIC_APP_URL` | `https://bgin.ai` | Plain text |

### Step 3.5: Deploy

1. ⬜ Click **Save and Deploy**
2. ⬜ Wait for build (3-5 minutes first time)
3. ⬜ Note preview URL: `https://bgin.pages.dev`

### Step 3.6: Verify Deployment

- ⬜ Visit `https://bgin.pages.dev`
- ⬜ Check browser console for errors
- ⬜ Test ceremony flow
- ⬜ Test Mage chat (requires API key)

---

## Phase 4: Environment Variables

### Production Variables (Cloudflare Dashboard)

Go to **Workers & Pages** → **bgin** → **Settings** → **Environment Variables**

#### Variables for BOTH Production & Preview:

| Variable | Value | Encrypted? |
|----------|-------|------------|
| `NODE_VERSION` | `18` | No |
| `NEAR_AI_API_KEY` | Your NEAR API key | **Yes** |
| `ANTHROPIC_API_KEY` | Your Anthropic key | **Yes** |

#### Production-only Variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_APP_URL` | `https://bgin.ai` |

#### Preview-only Variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_APP_URL` | `https://preview.bgin.pages.dev` |

### How to Add Variables

1. ⬜ Go to project **Settings** → **Environment Variables**
2. ⬜ Click **Add variable**
3. ⬜ Enter name and value
4. ⬜ Select environment (Production / Preview / Both)
5. ⬜ Check **Encrypt** for secrets
6. ⬜ Click **Save**

**After adding variables**: Trigger a new deployment for changes to take effect.

---

## Phase 5: Custom Domain (bgin.ai)

### Step 5.1: Ensure Domain is on Cloudflare

If bgin.ai is NOT already managed by Cloudflare:

1. ⬜ Go to Cloudflare Dashboard → **Add a Site**
2. ⬜ Enter `bgin.ai`
3. ⬜ Select **Free** plan
4. ⬜ Cloudflare scans existing DNS records
5. ⬜ **Update nameservers** at your registrar:
   - Cloudflare will show you the nameservers to use
   - Go to your domain registrar (GoDaddy, Namecheap, etc.)
   - Update nameservers to Cloudflare's
6. ⬜ Wait for propagation (usually 5-30 minutes, can take up to 24 hours)

### Step 5.2: Connect Domain to Pages

1. ⬜ Go to **Workers & Pages** → **bgin** project
2. ⬜ Click **Custom domains** tab
3. ⬜ Click **Set up a custom domain**
4. ⬜ Enter: `bgin.ai`
5. ⬜ Click **Continue**
6. ⬜ Cloudflare will automatically:
   - Add required DNS records
   - Provision SSL certificate (automatic)
7. ⬜ Click **Activate domain**

### Step 5.3: Add www Redirect (Optional)

1. ⬜ Go to **bgin.ai** zone → **Rules** → **Redirect Rules**
2. ⬜ Create rule:
   - **If**: Hostname equals `www.bgin.ai`
   - **Then**: Dynamic redirect to `https://bgin.ai${http.request.uri.path}`
   - **Status**: 301 (Permanent)
3. ⬜ Deploy

### Step 5.4: Verify SSL

1. ⬜ Go to **SSL/TLS** → **Overview**
2. ⬜ Set mode to **Full (strict)**
3. ⬜ Enable **Always Use HTTPS**

---

## Phase 6: Database Migration

### Current State (Development)

Your app currently uses file-based storage:
- `.data/store.json` - Participant registry
- `.data/collaborative-sessions.json` - Session data

**This won't persist on Cloudflare Pages** (serverless = no filesystem).

### Options for Production

#### Option A: Cloudflare D1 (SQLite) - Recommended for Simple Data

1. ⬜ Create D1 database in Cloudflare dashboard
2. ⬜ Update storage code to use D1
3. ⬜ Bind D1 to Pages project

#### Option B: Neon PostgreSQL - Recommended for Full Features

1. ⬜ Sign up at https://neon.tech (free tier: 0.5GB)
2. ⬜ Create database
3. ⬜ Copy connection string
4. ⬜ Add `DATABASE_URL` to Cloudflare env vars
5. ⬜ Update storage code to use PostgreSQL

#### Option C: Demo Mode - No Database

For conference demos, the app works without persistence:
- Keys stored in browser IndexedDB
- Server data resets on each deployment
- Acceptable for short-term demos

**I can help implement any of these options if needed.**

---

## Phase 7: Testing & Verification

### Deployment Checklist

After deployment, verify each feature:

#### Core Functionality
- ⬜ **Home page loads** - Visit https://bgin.ai
- ⬜ **No console errors** - Check browser DevTools
- ⬜ **Ceremony works** - Complete 8-step key ceremony
- ⬜ **Keys generated** - Verify Ed25519 keys created
- ⬜ **Profile saved** - Check profile page shows your data

#### Mage Chat
- ⬜ **Chat loads** - Navigate to /mage
- ⬜ **Messages send** - Type and submit a message
- ⬜ **AI responds** - Verify NEAR AI inference works
- ⬜ **No 502 errors** - Check API key is set correctly

#### Other Features
- ⬜ **Timetable displays** - Block 14 schedule shows
- ⬜ **Spellbook works** - Cast board loads
- ⬜ **Promises work** - Can create/view promises

### Common Test Commands

```bash
# Test API health
curl https://bgin.ai/api/curation/feed

# Test from browser console
fetch('/api/curation/feed').then(r => r.json()).then(console.log)
```

---

## Troubleshooting

### Build Failures

| Error | Solution |
|-------|----------|
| `Module not found` | Run `npm install` locally, commit `package-lock.json` |
| `Type errors` | Run `npm run build` locally first to catch errors |
| `Node version` | Add `NODE_VERSION=18` to environment variables |

### Runtime Errors

| Error | Solution |
|-------|----------|
| **502 Bad Gateway** on `/api/mage/chat` | Check `NEAR_AI_API_KEY` or `ANTHROPIC_API_KEY` is set |
| **CORS errors** | Add `NEXT_PUBLIC_APP_URL` with correct domain |
| **404 on routes** | Verify Next.js build succeeded, check `.next` output |

### Domain Issues

| Issue | Solution |
|-------|----------|
| **DNS not resolving** | Wait for propagation (up to 24 hours) |
| **SSL certificate error** | Wait for Cloudflare to provision (up to 15 minutes) |
| **"Too many redirects"** | Set SSL mode to "Full (strict)" not "Flexible" |

### Debug Commands

```bash
# Check DNS
nslookup bgin.ai

# Check SSL certificate
curl -vI https://bgin.ai 2>&1 | grep -i ssl

# View Cloudflare Pages logs
# Go to Dashboard → Workers & Pages → bgin → Deployments → View logs
```

---

## Quick Reference: Action Items

### Before Deployment

1. ⬜ Update `next.config.mjs` (Step 1.1)
2. ⬜ Test local build: `npm run build`
3. ⬜ Push to GitHub
4. ⬜ Gather API keys

### Cloudflare Setup

5. ⬜ Connect GitHub repo to Cloudflare Pages
6. ⬜ Configure build settings (Framework: Next.js)
7. ⬜ Add environment variables:
   - `NODE_VERSION` = `18`
   - `NEAR_AI_API_KEY` = your key (encrypted)
   - `NEXT_PUBLIC_APP_URL` = `https://bgin.ai`
8. ⬜ Deploy and verify on `.pages.dev` URL

### Domain Setup

9. ⬜ Add bgin.ai to Cloudflare (if not already)
10. ⬜ Connect custom domain in Pages settings
11. ⬜ Wait for SSL provisioning
12. ⬜ Test https://bgin.ai

---

## Files Modified/Created for Deployment

| File | Action | Purpose |
|------|--------|---------|
| `next.config.mjs` | Modify | Add `output: 'standalone'`, disable image optimization |
| `wrangler.toml` | Create | Cloudflare Pages configuration |
| `.gitignore` | Verify | Ensure `.env` and `.data/` excluded |
| `.env.example` | Update | Document required variables |

---

## Support

- **Cloudflare Pages Docs**: https://developers.cloudflare.com/pages/framework-guides/nextjs/
- **Next.js on Cloudflare**: https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-nextjs-site/
- **Cloudflare Discord**: https://discord.cloudflare.com

---

*Last updated: February 2026*
