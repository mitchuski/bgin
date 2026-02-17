# BGIN AI — Block 14

Governance intelligence for the BGIN constellation: **Three Graphs, One Identity**. Sovereign participant identity sits at the intersection of knowledge, promises, and trust. This app is the Block 14–oriented frontend and API layer—ceremony, Mages, Spellbook, promises, and Archive—with the implementation flow **mid–in progress**.

---

## What this is

- **Block 14** — Homepage with timetable (March 1–2, 2026), links into sessions and Spellbook; Get started and promise/cast feeds on the side.
- **Ceremony** — 8-step key ceremony: keygen, privacy preferences, MyTerms, working-group selection, agent card. Completing it gives you a Swordsman-style identity and unlocks Mages, Spellbook, and promises.
- **Archive** — Knowledge tab: Talk to a Mage (by WG), Block 14 briefings, Knowledge map, and **Spells** (BGIN publications & projects from [bgin-global.org/projects](https://bgin-global.org/projects)), sorted by most recent.
- **Spellbook** — Promises, **Sessions** (cast by timetable session), **Spellbooks** (by working group), and **Recent casts**; all sections expandable. Casts come from Mage chat (Cast to session / Cast to spellbook).
- **Mage** — WG-specific chat (IKP, FASE, Cyber, Governance). Open via the **🧙** header button (side panel) or from Archive. One cast per response (to a session or to a WG spellbook).
- **Promises** — Single `/promises` page for all WGs; voluntary commitments and assessment flows.

The **implementation flow** (phases from the master plan) is **mid–working**: core ceremony, Mage chat, Spellbook, promises, and Archive are in place; trust graph, full MyTerms wiring, and some integrations are still in progress or stubbed.

---

## Master plan and specs

The step-by-step roadmap is **`00_IMPLEMENTATION_PLAN.md`** (Phases 0–12). All work in this repo aligns with it. Specs live in **`block14_updates/`** (sibling to `BGINAI`, or your local copy). Suggested reading order:

1. **00_IMPLEMENTATION_PLAN.md** — Full roadmap, phases, priorities  
2. **01_ARCHITECTURE.md** — System overview, Swordsman/Mage duality  
3. **09_MIGRATION.md** — What to keep, add, directory structure  
4. **07_API_SPEC.md** — API surface  
5. **08_DATA_MODELS.md** — PostgreSQL, Qdrant, Neo4j, IndexedDB  
6. Component and integration specs (02–06, 10–13) as you build

---

## Implementation phases (from 00)

| Phase | Focus | Status |
|-------|--------|--------|
| 0 | Foundation & infra | ✅ |
| 1 | Swordsman layer | ✅ |
| 2 | Key ceremony UI | ✅ |
| 3 | Backend API | ✅ (auth, register, sessions, spellbook, promises) |
| 4 | Knowledge graph | 🔄 Ingress/RAG mid–working |
| 5 | Mage chat | ✅ (hub, chat, panel, cast to session/spellbook) |
| 6 | Personal dashboard | ✅ (feed, briefing, knowledge map → Archive) |
| 7 | Collaborative workspace | ✅ (promises, spellbook; codex/drafts stubbed) |
| 8 | Trust display | 🔄 Stubs in place |
| 9 | Design system | 🔄 Theme and layout in use |
| 10 | Integration & polish | 🔄 Ongoing |
| 11–12 | Testing & rollout | Planned |

---

## Core principles (do not violate)

- The **gap between Swordsman and Mage is sacred** — no feature collapses it.
- **Agreements before access** — no data exchange without bilateral MyTerms.
- **Promises, not impositions** — all commitments voluntary.
- **Personal first, collaborative second** — value from Mages before workspace.
- **Local-first data sovereignty** — participant device first, sync optional.

---

## Tech stack

- **Framework:** Next.js 14+ (TypeScript), App Router  
- **AI:** Anthropic (Claude) or NEAR Cloud AI for Mage; set `ANTHROPIC_API_KEY` or `NEAR_AI_API_KEY` in `.env`  
- **Key management:** WebCrypto API (Ed25519)  
- **Local storage:** IndexedDB via Dexie.js  
- **Server state:** File-based (`.data/store.json`, `.data/collaborative-sessions.json`) for dev; PostgreSQL etc. per 08 for production  
- **Vector/graph:** Qdrant, Neo4j (per plan); ingestion and RAG mid–working  

---

## Project structure

```
src/
  app/                    # Next.js App Router
    page.tsx              # Block 14 home (timetable, get started, cast/promise feeds)
    ceremony/             # Key ceremony
    mage/, mage/[wg]/     # Archive hub + WG chat
    spellbook/            # Sessions, by-WG spellbooks, recent casts, promises strip
    promises/             # All-WG promises
    dashboard/            # Briefing, knowledge map (also linked from Archive)
    workspace/, profile/, trust/, settings/
    api/                  # ceremony/register, mage/[wg]/chat, spellbook/entries, promises, etc.
  lib/
    ceremony/             # keygen, agentCard, privacy, wgSelection
    storage/              # local (Dexie), server-store, collaborative-sessions
    mage/                 # systemPrompts, rag, episodicMemory, privacyBudget
    auth/                 # signature verification
    swordsman/            # gate, sign, signedFetch
    bgin/                  # BGIN documents (Spells)
    block14/               # Block 14 timetable sessions
  components/
    ceremony/, mage/, layout/, dashboard/, workspace/, shared/, ui/
  contexts/
    MagePanelContext.tsx  # Side panel open state for Mage chat
```

---

## Commands

```bash
npm install
cp .env.example .env   # then set ANTHROPIC_API_KEY or NEAR_AI_API_KEY
npm run dev            # http://localhost:3000
npm run build
npm run start
```

---

## Docs in this repo

- **docs/PROJECT_STATUS.md** — What’s connected, API ↔ UI map, where it can break  
- **docs/DEMO_FLOW.md** — Demo order and quick path  
- **docs/README.md** — Pointer to block14_updates and 00  
- **BLOCK_14_ALIGNMENT_COMPARISON.md** — Alignment with agentprivacy / Block 14 spec  
- **BLOCK13_KNOWLEDGE_ARCHIVES.md** — Knowledge base context for ingestion  

---

*The plan is the promise. The execution is the proof.*  
*⚔️ ⊥ 🧙 | 🏛️*
