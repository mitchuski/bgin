# Spellweb: Data Requirements & Bonfires Knowledge Graph Integration

This document describes what the **Spellweb** page (`/spellbook/spellweb`) needs to work and how it is intended to coordinate with Bonfires knowledge graph work. Use it when wiring live data or integrating with Bonfires.

---

## 1. What the Spellweb Page Needs

### 1.1 Data source

- **Primary:** `GET /api/spellbook/entries` returning a JSON array of spellbook entries.
- **Fallback:** When the API returns no entries or the request fails, the page uses **dummy data** from `src/lib/spellweb/dummyData.ts` so the graph always renders. A short notice (“Showing demo data…”) is shown in that case.

### 1.2 Required entry shape (SpellbookEntryInput)

Each item in `entries` must match the shape expected by the Spellweb builder. This is the same shape as the Spellbook list view and the spellbook API:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique entry ID (e.g. UUID). |
| `sessionId` | string | Yes | Block 14 session id (e.g. `opening-plenary`, `ikp-accountable-wallet`). |
| `sessionTitle` | string | Yes | Human-readable session title. |
| `workingGroup` | string | Yes | One of: `ikp`, `fase`, `cyber`, `governance`. |
| `mageQuery` | string | Yes | The user/Mage query (cast question). |
| `mageResponse` | string | No | Mage response text. |
| `addedAt` | string | Yes | ISO 8601 date (e.g. `new Date().toISOString()`). |
| `sources` | array | No | `[{ documentTitle: string, documentDate?: string, relevanceScore?: number }]`. Used to create **source** glyphs and **cites** strands. |
| `crossWgRefs` | array | No | `[{ workingGroup: string, topic: string, hint?: string }]`. Used to create **topic** glyphs and **cross_wg** strands. |

Example minimal entry:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "sessionId": "ikp-accountable-wallet",
  "sessionTitle": "IKP: Accountable Wallet",
  "workingGroup": "ikp",
  "mageQuery": "What are the key design goals for accountable wallets?",
  "mageResponse": "Accountable wallets balance privacy with auditability…",
  "addedAt": "2026-02-16T12:00:00.000Z",
  "sources": [
    { "documentTitle": "BGIN Accountable Wallet Spec", "documentDate": "2025-01" }
  ],
  "crossWgRefs": [
    { "workingGroup": "governance", "topic": "Regulatory compliance" }
  ]
}
```

### 1.3 Client-only rendering (Sigma.js)

- The graph is rendered with **Sigma.js** and **graphology** in the browser only. These libraries are **not** SSR-safe.
- **Two-layer loading:** (1) The spellweb page loads `SpellwebNavigator` via `next/dynamic` with `ssr: false`. (2) `SpellwebNavigator` is a thin wrapper that dynamically imports `SpellwebNavigatorCanvas` (which contains Sigma/graphology) with `ssr: false`. So sigma/graphology are never executed on the server or in the initial bundle. Do not remove these dynamic imports or add top-level imports of `SpellwebNavigatorCanvas`, `sigma`, or `graphology` in server-rendered code.
- **If you see 500 on `/` or fallback chunks:** clear the Next cache and restart the dev server: `Remove-Item -Recurse -Force .next; npm run dev`. Ensure no other code path imports sigma/graphology at the top level.

### 1.4 Auth

- The page gates on participant identity (redirect to `/ceremony` if no identity). It uses the same pattern as other app pages (`getParticipantId()`). The **API** `/api/spellbook/entries` may optionally filter by participant; the Spellweb page does not currently require a signed request for the GET.

---

## 2. Files Involved

| Path | Purpose |
|------|--------|
| `src/app/spellbook/spellweb/page.tsx` | Spellweb route; fetches entries, merges dummy data when empty, renders navigator + inspector. |
| `src/components/spellbook/SpellwebNavigator.tsx` | Sigma.js canvas; builds graph from entries, runs layout, handles click/hover. Loaded with `ssr: false`. |
| `src/components/spellbook/GlyphInspector.tsx` | Side panel for selected glyph (spell/session/grimoire/source/topic). |
| `src/lib/spellweb/types.ts` | Glyph, Strand, SpellwebGraph types. |
| `src/lib/spellweb/builder.ts` | `buildSpellweb(entries)` → glyphs + strands from spellbook entries. |
| `src/lib/spellweb/adapter.ts` | `spellwebToGraphology(web)` → Graphology graph for Sigma. |
| `src/lib/spellweb/dummyData.ts` | Dummy entries used when API returns no data. |

---

## 3. Coordination with Bonfires Knowledge Graph Work

The Spellweb is designed to align with Bonfires’ knowledge graph and episodic features. Use this section when integrating.

### 3.1 Terminology mapping (Spellweb ↔ Bonfires)

| Spellweb | Bonfires | Notes |
|----------|----------|--------|
| Grimoire | Bonfire | WG-scoped collection. |
| Spell | Engram | Single cast/entry. |
| Strand | Edge | Connection in the graph. |
| Thread strength | Stigmergic depth | Traversal count / path strength. |
| Arcane resonance | Engagement / Bonfire score | Value/usage signal. |

### 3.2 What to implement for full integration

1. **Live Spellbook API**
   - Ensure `GET /api/spellbook/entries` returns the shape above (already the case if using the existing Spellbook storage). Then the Spellweb can drop dummy data when real data exists.

2. **Thread strengthening (stigmergic behavior)**
   - When a user traverses a connection (e.g. clicks from one glyph to another), call an API to record the traversal and increment thread strength.
   - See convergence doc: `POST /api/spellweb/threads` with `{ source, target, traversedAt }`. Persist and feed back into `buildSpellweb` / adapter so stronger threads can be visualized (e.g. thicker or brighter edges).

3. **Bonfires sync (optional)**
   - When Bonfires episodic/knowledge graph API is available, sync the Spellweb graph (glyphs → engrams, strands → edges) so that:
     - Local casts feed into the Bonfire knowledge network.
     - Community stigmergic paths can be read back and reflected in the Spellweb (e.g. thread strengths, suggested links).
   - See convergence doc: `lib/bonfires/spellwebSync.ts` and episodic sync.

4. **Data from Bonfires**
   - If part of the graph data (e.g. cross-WG links, topic co-occurrence) will come from Bonfires instead of only from spellbook entries, add a data layer that:
     - Fetches from Bonfires API (or a BGIN proxy).
     - Maps Bonfires nodes/edges to the same `Glyph` / `Strand` model (or extends it).
     - Merges with spellbook-derived glyphs/strands in the builder or in the page before calling `buildSpellweb`.

### 3.3 Reference

- **Convergence and Spellweb spec:** `docs/CONVERGENCE_BONFIRES_BGINAI.md` (Spellweb section: data model, builder, adapter, thread strengthening, Bonfires sync).

---

## 4. Checklist for Production

- [ ] `GET /api/spellbook/entries` returns entries in the required shape (already true if using current Spellbook backend).
- [ ] Spellweb page uses real entries when available; dummy data only when API is empty or fails.
- [ ] `SpellwebNavigator` remains loaded with `next/dynamic` and `ssr: false`.
- [ ] (Optional) Thread-strengthening API and wiring in the UI.
- [ ] (Optional) Bonfires sync and/or Bonfires-sourced graph data mapped to Spellweb types.

---

*Last updated for Block 14 Spellweb implementation. Dummy data and this doc exist so the page works before live data and Bonfires integration are complete.*
