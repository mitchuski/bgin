# BGIN AI Block 14 — Progress Review: Plan vs. Current State

**Document purpose:** Chronicle of progress and a working-group-ready status update.  
**Date:** February 2026  
**Audience:** BGIN working group (progress update for posting)  
**Reference:** Original planning docs in `block14_updates/` (00_IMPLEMENTATION_PLAN, 01_ARCHITECTURE, 02–13).

---

## 1. Executive summary

The BGIN AI Block 14 app is **mid-implementation**: core identity (Ceremony), Mage chat, Spellbook, Archive, and Promises are **in place and usable**. Several **key integrations from the original plan are not yet implemented** and should guide the next sprint:

- **Bonfires per Mage** — Bounded knowledge contexts per WG (spec: 11_BONFIRES_INTEGRATION). Stub only; no live Bonfires API in the chat path.
- **MyTerms data agreement system** — Bilateral agreements (SD-BASE, SD-BASE-DP, PDC-AI) and negotiation API (spec: 13_MYTERMS_AGREEMENT_LAYER). Ceremony step 4 is a UI stub; `POST /api/myterms/negotiate` exists but is not wired from the client.
- **Full BGIN knowledge base integration** — Document ingestion, vector/graph storage, and RAG so each Mage answers from real BGIN documents. Spells feed (bgin-global.org/projects) is live; ingestion script and RAG pipeline are stubbed.

This document compares the **original plan** (00_IMPLEMENTATION_PLAN + 01_ARCHITECTURE) to **current state**, records **today’s doc/README work**, and lists **prioritized next steps** for the working group.

---

## 2. Plan vs. current state (phase by phase)

### Phase 0: Foundation & infrastructure  
**Plan:** Repo setup, dependencies, env, directory structure, DB schemas (PostgreSQL, Qdrant, Neo4j).  
**Current:** ✅ Done. Next.js 14+ App Router, Dexie (IndexedDB), Ed25519, `src/lib` and `src/app` structure in place. File-based server store for dev; production DBs per 08 not yet deployed.

### Phase 1: Swordsman layer  
**Plan:** Keygen, Dexie schema (swordsmanKeys, agentCard, privacyPreferences, episodicMemory, sessionState, agreementChronicle), agent card, MyTerms chronicle, Swordsman gate.  
**Current:** ✅ Done. Keygen, storage, agent card, signedFetch/gate. MyTerms **chronicle** (client-side record storage) may be partial; **negotiation** with backend is not wired (see MyTerms below).

### Phase 2: Key ceremony UI  
**Plan:** 8-step flow, KeyGenAnimation, PrivacyConfig, MyTerms AgreementSelector (SD-BASE / SD-BASE-DP), WGSelector, key backup.  
**Current:** ✅ Done. Full 8-step ceremony, key backup, WG selection. **MyTerms step (4):** UI presents “Accept SD-BASE” but does not call `/api/myterms/negotiate`; no bilateral record creation.

### Phase 3: Backend API foundation  
**Plan:** Auth middleware (Ed25519, MyTerms validation), ceremony register, MyTerms negotiate, session/budget management.  
**Current:** ✅ Mostly done. Auth (signature verification), ceremony register, session/budget tracking in place. **MyTerms negotiate:** API route exists; not called from ceremony; no bilateral agreement record flow.

### Phase 4: Knowledge graph integration  
**Plan:** Choose provider (self-hosted Qdrant+Neo4j vs. Bonfires vs. hybrid). Ingestion script, RAG pipeline, episodic memory.  
**Current:** 🔄 **Mid–working / stubbed.**

- **Ingestion:** `src/scripts/ingest.ts` is a stub (“chunk, embed, store” not implemented). No pipeline from BGIN docs (e.g. contents/, or bgin-global.org) into vector/graph DB.
- **RAG:** `src/lib/mage/rag.ts` exists and is called from Mage chat; returns empty or stub context until a real index exists. No Bonfires API in the retrieval path.
- **Bonfires:** `src/lib/bonfires/client.ts` is a config stub (per-WG bonfireId/agentId); no Delve/agENT API calls. Plan recommends “Option C” (Bonfires for knowledge, Claude for chat); **not yet implemented.**
- **Episodic memory:** Implemented client-side (IndexedDB); used in chat for context. Server-side sync optional per plan.
- **BGIN knowledge:** Spells feed (curation) uses `src/lib/bgin/documents.ts` and bgin-global.org/projects — **live**. Full “knowledge base” (ingest + index + RAG for Mages) is **not** yet connected.

### Phase 5: Mage chat interface  
**Plan:** System prompts per WG, chat API (budget, RAG, episodic, Claude), Mage hub, chat UI, cast/sources, privacy budget indicator.  
**Current:** ✅ Done. All four WG Mages, hub (Archive), chat (full page + side panel), system prompts, inference (Anthropic / NEAR Cloud AI). RAG context is passed into the prompt but is empty until Phase 4 is completed. Cast to session / cast to spellbook works. Privacy budget enforced.

### Phase 6: Personal curation dashboard  
**Plan:** Dashboard layout, knowledge feed, daily briefing, knowledge map.  
**Current:** ✅ Done in Block 14 shape. Feed and briefing via `/api/curation/feed` and `/api/curation/briefing`; knowledge map (client-side from IndexedDB). Exposed as **Archive** (Spells, briefings, Knowledge map, Mage entry).

### Phase 7: Collaborative workspace  
**Plan:** Promise CRUD, promise board UI, document editor (Yjs), Codex agent.  
**Current:** ✅ Promises and Spellbook done. Promise board at `/promises` (all WGs); API and signed updates working. **Document editor and Codex:** Stubbed (API routes exist, UI not wired).

### Phase 8: Trust display  
**Plan:** Trust tier calculation, bilateral attestation, trust profile page, network visualization.  
**Current:** 🔄 Stubbed. Trust page and API stubs exist; no real tier calculation or attestation flow.

### Phase 9: Design system  
**Plan:** Theme, typography, UI components, layout (Header, Sidebar, etc.).  
**Current:** 🔄 In use. Theme and layout in place; can be refined (Phase 10 polish).

### Phases 10–12: Integration, testing, rollout  
**Plan:** Landing, navigation, Swordsman indicator, error handling, testing, Block #14 launch.  
**Current:** 🔄 Ongoing. Block 14 homepage (timetable, get started, feeds), nav, Mage panel. Testing and formal rollout (11–12) planned.

---

## 3. Today’s chronicle (doc and repo updates)

- **README.md** reworked to describe the whole project (Block 14, Ceremony, Archive, Spellbook, Mage, Promises), current tech stack, phase status (✅/🔄), and that implementation flow is mid–working. Pushed to `bgin` master.
- **Stale docs updated** (unchanged since Oct 2025) and pushed:
  - **BLOCK13_KNOWLEDGE_ARCHIVES.md** — Reframed for Block 14; how the app uses knowledge (Spells, Mage, Spellbook, timetable); current APIs and ingestion status.
  - **CHANGELOG.md** — New “Unreleased — Block 14 (2025–2026)” section: what’s added, changed, in progress.
  - **CONTRIBUTING.md** — Updated for BGINAI_Block14 (Next.js single app, `src/app`/`src/lib`, ceremony/Mage/Spellbook/Archive, 00_IMPLEMENTATION_PLAN).
  - **SECURITY.md** — Updated for current stack (Ceremony, Ed25519, signedFetch, file store, env keys; no JWT).
- **This progress review** — Plan vs. current state, key gaps, next steps for WG.

---

## 4. Key gaps to address next

### 4.1 Bonfires integration per Mage (high impact)

**Spec:** 11_BONFIRES_INTEGRATION.md — One Bonfire per WG (IKP, FASE, Cyber, Governance); bounded knowledge contexts; Option C: Bonfires for retrieval, Claude for chat.

**Current:** Config stub in `src/lib/bonfires/client.ts`. Mage chat does **not** call Bonfires agENT/Delve API; RAG uses local `rag.ts` only (no Bonfires).

**Next steps:**

- Obtain Bonfires API access / credentials and add to env (see 11).
- Implement Bonfires client: per-WG Bonfire or agENT query, map response into “chunks” for the existing Mage prompt builder.
- In `src/app/api/mage/[wg]/chat/route.ts`, when `KNOWLEDGE_GRAPH_PROVIDER=bonfires`, call Bonfires for context instead of (or in addition to) local RAG.
- Keep Swordsman/Mage separation; no cross-Bonfire data leakage.

### 4.2 MyTerms data agreement system (high impact)

**Spec:** 13_MYTERMS_AGREEMENT_LAYER.md — SD-BASE (and optionally SD-BASE-DP, PDC-AI); proffer in ceremony; bilateral record; server accepts and stores; both sides keep signed records.

**Current:** Ceremony step 4 shows MyTerms (e.g. “Accept SD-BASE”) but does not call `POST /api/myterms/negotiate`. Backend route exists; no client proffer, no agreement record creation, no “agreements before access” enforcement in API.

**Next steps:**

- In ceremony step 4: on “Accept”, have Swordsman build proffer payload (agreement id, version, participant signature), call `POST /api/myterms/negotiate`, persist returned record in client chronicle.
- Backend: ensure negotiate creates bilateral record and returns record id; persist in server store (or future DB).
- Auth middleware: optionally require active agreement for sensitive routes (e.g. Mage chat, feed); return 403 with “complete MyTerms” message if missing.
- Settings: add “Data portability” (SD-BASE-DP) and “Request data export” when implemented (13 spec).

### 4.3 Full BGIN knowledge base integration (high impact)

**Spec:** Phase 4 — Ingest BGIN documents (markdown, meeting reports, study papers), chunk, embed, store in vector/graph DB; RAG in Mage chat. 01_ARCHITECTURE: “Knowledge graph built from every WG’s accumulated output.”

**Current:** Spells feed = BGIN projects (bgin-global.org/projects) via `src/lib/bgin/documents.ts` and curation feed API — **live**. No ingestion of broader BGIN corpus; no vector/graph index; RAG returns no real document context.

**Next steps:**

- **Option A (self-hosted):** Implement `scripts/ingest.ts`: read from a BGIN doc source (e.g. repo clone, contents/, or API), chunk, generate embeddings, upsert to Qdrant (and optionally Neo4j for graph). Wire `lib/mage/rag.ts` to query Qdrant by WG and return chunks to chat route.
- **Option B (Bonfires):** Use Delve intake for BGIN docs; Bonfires becomes the “knowledge base” per WG (see 4.1). Then RAG context can come from Bonfires instead of self-hosted Qdrant.
- **Option C (hybrid):** Bonfires for WG-bounded retrieval; optionally sync or mirror from BGIN official sources into Bonfires. Align with 11 “Option C.”
- Ensure WG-scoping so each Mage only uses its WG’s knowledge (and cross-WG hints per spec).

---

## 5. Other items (medium / lower priority)

- **Trust display (Phase 8):** Implement tier calculation and attestation flow; connect trust profile and network viz to real data.
- **Workspace drafts & Codex:** Wire document editor and Codex agent to existing API stubs if collaborative editing is needed for Block 14.
- **Mage search:** `GET /api/mage/[wg]/search` is stubbed; implement when RAG/Bonfires is live (semantic search over same index).
- **Testing (Phase 11):** Ceremony, Mage, promises, and agreement flows once MyTerms is wired.
- **Production data:** Replace file-based store with PostgreSQL (and Qdrant/Neo4j if self-hosted) per 08_DATA_MODELS.

---

## 6. Suggested next sprint (for WG discussion)

1. **MyTerms:** Wire ceremony step 4 to `POST /api/myterms/negotiate`; persist bilateral record; add agreement check to Mage (and optionally other) routes.
2. **Bonfires:** Get API access; implement per-WG Bonfires retrieval in Mage chat (Option C); keep Claude/NEAR for conversation.
3. **BGIN knowledge:** Either (a) implement ingestion + Qdrant + RAG for a first WG (e.g. IKP), or (b) rely on Bonfires Delve as the knowledge base and integrate with (2). Document “single source of truth” for WG docs.
4. **Docs and rollout:** Keep README and PROJECT_STATUS updated; run a short internal test (Phase 12.1) when Mage has real knowledge context and MyTerms is active.

---

## 7. References in repo

| Doc | Purpose |
|-----|--------|
| **README.md** | Project overview, what’s built, phase status, tech stack |
| **docs/PROJECT_STATUS.md** | API ↔ UI map, where it can break |
| **docs/DEMO_FLOW.md** | Demo order and quick path |
| **BLOCK_14_ALIGNMENT_COMPARISON.md** | Alignment with agentprivacy / Block 14 spec |
| **BLOCK13_KNOWLEDGE_ARCHIVES.md** | Knowledge context and current usage |
| **block14_updates/00_IMPLEMENTATION_PLAN.md** | Master roadmap (Phases 0–12) |
| **block14_updates/01_ARCHITECTURE.md** | System overview, Swordsman/Mage, three graphs |
| **block14_updates/11_BONFIRES_INTEGRATION.md** | Bonfires options and Option C |
| **block14_updates/13_MYTERMS_AGREEMENT_LAYER.md** | MyTerms agreements and implementation |

---

*The plan is the promise. The execution is the proof.*  
*⚔️ ⊥ 🧙 | 🏛️*

**End of progress review.**
