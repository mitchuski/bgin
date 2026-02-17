# BGIN AI — Block 14 (`BGINAI_Block14`)

Governance intelligence platform: **Three Graphs, One Identity**. Sovereign participant identity emerges from the intersection of knowledge, promises, and trust.

## Master plan — start here

**Read `00_IMPLEMENTATION_PLAN.md` first.** It is the step-by-step master roadmap (Phases 0–12) and defines implementation order, deliverables, and priorities. All work in this repo should align with it.

Spec docs live in **`block14_updates/`** (sibling folder in `BGINAI`, or your local copy). Reading order:

1. **00_IMPLEMENTATION_PLAN.md** — **START HERE** — full roadmap with phases and priorities
2. **01_ARCHITECTURE.md** — system overview, data flow, Swordsman/Mage duality
3. **09_MIGRATION.md** — what to keep, add, and directory structure
4. **08_DATA_MODELS.md** — PostgreSQL, Qdrant, Neo4j, IndexedDB
5. **07_API_SPEC.md** — API surface
6. **13_MYTERMS_AGREEMENT_LAYER.md** — agreement layer beneath all three graphs
7. Component specs (02–06) as you build each feature
8. **11_BONFIRES_INTEGRATION.md** — optional Bonfires.ai knowledge graph
9. **12_SOULBAE_CASE_STUDY.md** — case study for Bonfires
10. **10_DESIGN_SYSTEM.md** — reference throughout

## Implementation phases (from 00)

| Phase | Focus | Key deliverables |
|-------|--------|-------------------|
| 0 | Foundation & infra | Dependencies, env, `src/` structure, DB schemas |
| 1 | Swordsman layer | keygen, Dexie storage, agent card, MyTerms chronicle, gate |
| 2 | Key ceremony UI | 8-step flow, KeyGenAnimation, PrivacyConfig, WGSelector, backup |
| 3 | Backend API | Auth middleware, ceremony register, MyTerms negotiate, sessions |
| 4 | Knowledge graph | Ingest script, RAG pipeline, episodic memory |
| 5 | Mage chat | System prompts, chat API, Mage hub & chat UI, budget indicator |
| 6 | Personal dashboard | Feed, briefing, knowledge map |
| 7 | Collaborative workspace | Promises, promise board, document editor, Codex |
| 8 | Trust display | Tier calculation, attestation, profile, network viz |
| 9 | Design system | Theme, typography, UI/layout components (can run parallel) |
| 10 | Integration & polish | Landing, navigation, Swordsman indicator, errors, perf |
| 11–12 | Testing & rollout | Validation, soft launch, Block #14 launch |

## Core principles (do not violate)

- The **gap between Swordsman and Mage is sacred** — no feature collapses it.
- **Agreements before access** — no data exchange without bilateral MyTerms.
- **Promises, not impositions** — all commitments voluntary.
- **Personal first, collaborative second** — value from Mages before workspace.
- **Local-first data sovereignty** — participant device first, sync optional.

## Tech stack

- **Framework:** Next.js 14+ (TypeScript), App Router
- **AI:** Claude API (Anthropic) for Mage interfaces
- **Vector DB:** Qdrant (self-hosted) or Bonfires.ai
- **Graph DB:** Neo4j
- **Key management:** WebCrypto API (Ed25519)
- **Local storage:** IndexedDB via Dexie.js
- **Collaboration:** Yjs (CRDTs)

## Project structure (aligned with 00 & 09)

```
src/
  app/                    # Next.js App Router
    page.tsx              # Landing — Begin Ceremony / Enter Mages
    ceremony/, mage/, mage/[wg]/, dashboard/, workspace/, workspace/[wg]/, trust/, settings/
    api/                  # ceremony/register, mage/[wg]/chat, etc.
  lib/
    ceremony/             # keygen, agentCard, privacy
    storage/local.ts      # Dexie IndexedDB
    mage/                 # systemPrompts, rag, episodicMemory, privacyBudget
    auth/                 # signature verification (middleware)
    swordsman/            # gate, sign (per 00)
    myterms/              # chronicle (per 00)
  components/
    ceremony/, mage/, dashboard/, workspace/, trust/, myterms/, shared/, ui/, layout/
  scripts/
    ingest.ts             # Document ingestion pipeline
```

## Commands

```bash
npm install
npm run dev    # http://localhost:3000
npm run build
npm run start
```

## Reference docs (in repo)

- **BLOCK_14_ALIGNMENT_COMPARISON.md** — alignment with Block 14 spec
- **BLOCK13_KNOWLEDGE_ARCHIVES.md** — knowledge base context for ingestion

---

*The plan is the promise. The execution is the proof.*  
*⚔️ ⊥ 🧙 | 🏛️*
