# Project status — what’s connected and where it can break

Quick reference for where the UI hits APIs and what can fail.

## Flow order (recommended)

1. **Home** (`/`) → links to Ceremony and Mages (no API).
2. **Ceremony** (`/ceremony`) → 8 steps, then **POST /api/ceremony/register** with `{ agentCard }` (plain `fetch`, no auth). Registers participant in `.data/store.json`.
3. After ceremony you have: keys + agent card in IndexedDB, participant on server.
4. **Mages** (`/mage`), **Dashboard** (`/dashboard`), **Workspace** (`/workspace`) all require agent card; they redirect to `/ceremony` if `getParticipantId()` is null. They use **signedFetch** (auth headers from keys in IndexedDB).

---

## API ↔ UI map

| UI | API / action | Auth | Notes |
|----|----------------|------|--------|
| **Ceremony** (step 6 complete) | POST `/api/ceremony/register` | No | Body: `{ agentCard }`. Must complete before other flows. |
| **Dashboard** | GET `/api/curation/feed?workingGroups=...&limit=10&offset=0` | Yes (signedFetch) | Redirects to ceremony if no agent card. |
| **Dashboard → Briefing** | GET `/api/curation/briefing?meetingId=...` | Yes | Stub sections per WG. |
| **Dashboard → Knowledge map** | None (client-only) | No | Uses `buildLocalKnowledgeMap()` from IndexedDB. |
| **Mage chat** | POST `/api/mage/[wg]/chat` | Yes | Uses **NEAR Cloud AI** (preferred) or Anthropic. Set `NEAR_AI_API_KEY` or `ANTHROPIC_API_KEY` in `.env`. |
| **Workspace → Promise board** | GET `/api/promises?wg=...` | Yes | Lists promises. |
| **Promise board** | POST `/api/promises`, PATCH `/api/promises/[id]`, POST `/api/promises/[id]/assess` | Yes | Via `lib/promises/client.ts` (signed body + auth headers). |
| **Trust** (`/trust`) | None in UI | — | Page is static; Phase 8 stubs exist at `/api/trust/*`. |

---

## Where the interface can break

1. **No ceremony done**  
   Dashboard, Mage chat, Workspace, Briefing, Knowledge map all assume agent card + keys in IndexedDB. If you open them first, they redirect to `/ceremony`. If redirect fails or is slow, you might see loading forever (e.g. PromiseBoard when `getParticipantId()` is null — see fix below).

2. **signedFetch and GET**  
   Authenticated GETs (feed, briefing, promises list) use `signedFetch(url, { method: 'GET' })`. The client signs `participantId:timestamp:''` (empty body). Server uses `verifyRequestNoBody(request)`. If keys are missing, `signedFetch` throws before the request; catch and show error or redirect.

3. **Ceremony register**  
   Register expects `body.agentCard` with `participantId`, `publicKeyHex`, `signature`, `workingGroups`, `privacy`. Ceremony page sends that. If the server store (`.data/store.json`) is missing or read-only, register can fail.

4. **Mage chat**  
   Needs `NEAR_AI_API_KEY` (recommended, same private inference as agentprivacy_master) or `ANTHROPIC_API_KEY` in `.env`. If neither is set, the chat API returns 502 with message "No inference provider configured".

5. **Trust / Settings**  
   Dashboard links to `/trust`. Trust page does not call any API. `/api/trust/profile`, `/api/settings/privacy`, etc. are stubs and not required for the main flow.

6. **Promise board**  
   If there is no participant id, `fetchPromises` returned early without calling `setLoading(false)`, so the board could stay on “Loading promises…”. Fixed by setting loading false when `!pid`.

---

## APIs that exist but are not used by the current UI

- `GET /api/sessions` — could be used to show active Mage sessions.
- `POST /api/myterms/negotiate` — ceremony step 4 (MyTerms) is a stub; not wired to this API from the UI.
- `GET /api/trust/profile`, `POST /api/trust/attest`, `GET /api/trust/network` — stubs for Phase 8.
- `GET/POST /api/workspace/[wg]/documents`, `POST /api/workspace/[wg]/codex` — stubs; drafts/codex UI not wired.
- `GET /api/mage/[wg]/search` — stub.

---

## Suggested iteration order

1. Run ceremony end-to-end; confirm `.data/store.json` has your participant.
2. Open Dashboard → feed should load (stub items); briefing and knowledge map should work.
3. Open a Mage → send a message (set `ANTHROPIC_API_KEY` if you want real replies).
4. Open Workspace → pick a WG → Promise board; create a promise and move it (e.g. to “In progress”).

If something breaks, check the browser console and Network tab for the failing request and the response body; that usually points to auth (401), missing env (500), or a bad body shape (400).
