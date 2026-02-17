# Trust, Identity, Privacy & Technical Infrastructure

**From Proposal to Codebase to Deployment**

**Author:** Mitchell Travers (privacymage)  
**Date:** February 17, 2026  
**Version:** 1.0  
**Status:** 🔧 Implementation in Progress — Block 14 Target

---

## 1. Thread of Continuity

This document traces a single thread: from the collaborative framework proposal submitted to BGIN in January 2026, through the codebase that implements it, and forward into what completes the architecture for Block 14 and beyond.

The proposal established three pillars: (1) validating the agentprivacy governance framework through practical implementation, (2) establishing IEEE 7012-aligned data contribution agreements for agentic systems, and (3) creating a sustainable Foundation ↔ Labs ↔ DAO model for merit-based reciprocity. What follows is the technical execution of those pillars — what's been built, what's been learned, and what remains.

---

## 2. Identity: The Key Ceremony as Sovereign Onboarding

### What the Proposal Said

The agentprivacy framework formalises the duality between projection (sharing, collaborating, contributing) and protection (privacy, sovereignty, consent) at the protocol level. Identity pluralism — where multiple identity systems participate in the same governance framework — requires a foundation that is protocol-agnostic but sovereignty-first.

### What the Codebase Implements

**Route:** `/ceremony` — 8-step flow  
**Implementation:** `src/app/ceremony/page.tsx` + `src/lib/ceremony/`

The ceremony generates the participant's Swordsman identity — their cryptographic boundary layer:

**Step 1: Welcome** — Explains what BGIN AI is and how it differs from a traditional platform. No skip button.

**Step 2: Key Generation** — Ed25519 keypair via WebCrypto API. Private key stored in IndexedDB. Never leaves the device. Never transmitted. The participant generates their own sovereignty.

**Step 3: Privacy Preferences** — Four levels (Maximum, High, Selective, Minimal) determining query budgets and disclosure scope. These are the Swordsman's standing orders — what to withhold, what to share, under what conditions.

**Step 4: MyTerms Acceptance** — The IEEE 7012 bilateral agreement from the proposal. UI presents SD-BASE acceptance. *This is where the circuit is incomplete:* the client doesn't yet call `POST /api/myterms/negotiate`. The backend route exists. The bilateral record creation doesn't fire.

**Step 5: Working Group Selection** — IKP, FASE, Cyber, Governance. Determines which Mages the participant can access. This maps to the proposal's concept of bounded organisational permissions.

**Step 6: Agent Card Generation** — Combines public key, privacy preferences, WG selections, and timestamp into a signed identity document. The agent card is the participant's verifiable credential within the system.

**Step 7: Key Backup** — Encrypted export of the private key. The participant is responsible for their own sovereignty. Loss of key = new identity. This is deliberate.

**Step 8: Completion** — Participant registered via `POST /api/ceremony/register` with signed agent card.

**Authentication model:** No session tokens. No cookies. Every authenticated request is signed: `signedFetch(url, { body })` constructs `participantId:timestamp:body`, signs it with the private key, sends it as auth headers. Server verifies via `lib/auth/verify.ts`. This is TSP-style trust mediation: the infrastructure doesn't trust the participant's session — it verifies every request against their key.

### What Completes It

**MyTerms wiring (Priority 1):** Ceremony step 4 must call `POST /api/myterms/negotiate`. The backend creates a bilateral record. Both sides persist signed copies. The middleware then checks MyTerms compliance before granting access to Mage chat and other sensitive routes — enforcing the proposal's principle that no data exchange occurs without bilateral agreement.

**DID registration:** The `participantId` (derived from public key hash) should register as a formal DID document, enabling cross-system resolution. ERC-8004 is the target standard.

**Personhood credential integration:** The proposal referenced World ID and similar verification as identity anchors. The ceremony architecture supports pluggable personhood providers — the governance framework decides which are accepted, not the protocol.

---

## 3. Privacy: The Swordsman Gate and Budget System

### What the Proposal Said

User sovereignty means individuals control how their data contributes to collective goods, with agents as enforcement mechanisms rather than intermediaries requiring trust.

### What the Codebase Implements

**Swordsman Gate:** `src/lib/swordsman/gate.ts`

Before any navigation to a protected route (Dashboard, Mage, Workspace), the gate checks:
1. Does the participant have an agent card in IndexedDB?
2. Are their privacy preferences loaded?
3. Is their key material accessible?

If any check fails, the participant is redirected to the ceremony. This is not authentication — it's sovereignty verification.

**Privacy Budget:** `src/lib/mage/privacyBudget.ts`

Each Mage session is query-limited based on the participant's privacy level:

| Level | Budget | Philosophy |
|-------|--------|-----------|
| Maximum | 3 queries | High privacy. Think before you ask. |
| High | 6 queries | Balanced. The golden ratio constraint. |
| Selective | 12 queries | More interaction, selective disclosure. |
| Minimal | 24 queries | Full engagement, minimal privacy bounds. |

The budget is enforced server-side in the Mage chat API. When exhausted, the Mage stops responding. The participant must start a new session — which resets the budget but not the episodic memory (if permitted by their privacy preferences).

**Episodic Memory:** `src/lib/mage/episodicMemory.ts`

Client-side (IndexedDB). Tracks topics explored, knowledge edges traversed, and session summaries. Passed to the Mage as filtered context — filtered by the Swordsman gate based on privacy preferences. The Mage receives what the Swordsman permits. Nothing more.

**Privacy in the Mage Chat API:** `src/app/api/mage/[wg]/chat/route.ts`

The chat route receives the participant's message, checks auth (signed request), checks budget, retrieves RAG context (currently empty — pipeline pending), constructs the system prompt with WG-specific instructions, and calls inference (Anthropic or NEAR Cloud AI). The participant's privacy level determines what episodic context, if any, is included in the prompt.

### What Completes It

**Cross-WG isolation enforcement:** Currently architectural (separate Mage routes, separate system prompts). Needs runtime enforcement — a participant's IKP session context must be structurally inaccessible from the FASE Mage, even if the same participant is active in both.

**Privacy budget persistence:** Currently per-session. The proposal's SD-BASE-DP (data portability) variant would allow participants to export their episodic memory and budget history as portable data.

---

## 4. Trust: The Three-Graph Architecture in Code

### What the Proposal Said

The three-graph overlay creates a value discovery mechanism: promise graph (intent), provenance graph (action), knowledge graph (meaning). Their intersection reveals where promises were kept, where contributions exceeded commitments, and where collaboration opportunities exist.

### What the Codebase Implements

**4.1 Promise Graph — Live**

**Routes:** `/promises`, `/spellbook`, `/proverb`  
**API:** `POST/GET/PATCH /api/promises`, `GET/POST /api/spellbook/entries`, `GET/POST /api/proverbs`

Promises are voluntary commitments. Each promise has:
- Working group scope
- Status progression (proposed → in progress → complete)
- Signed updates (every state change is authenticated)
- Optional connected proverb (proof of understanding linked to commitment)

The Spellbook captures casts — contributions tied to Block 14 sessions and working groups. Each cast can receive proverb inscriptions from other participants, creating bilateral artifacts.

Proverbs flow through three paths:
1. **Mage → Proverb** — RPP mode: Mage prefaces response with a proverb. Participant can inscribe it.
2. **Cast → Proverb** — Inscribe a proverb on another participant's cast (agreement signal).
3. **Promise → Proverb** — Connect a proverb when creating a promise (proof of understanding behind commitment).

This is the promise graph from the proposal, implemented at the participant level. The bilateral nature of proverb inscriptions (one participant inscribes on another's cast) is the seed of VRC formation.

**4.2 Knowledge Graph — Partial**

**Routes:** `/mage`, `/mage/[wg]`, `/dashboard`  
**API:** `POST /api/mage/[wg]/chat`, `GET /api/curation/feed`, `GET /api/curation/briefing`

The knowledge graph has three tiers:

*Tier 1 — BGIN Publications (live):* `src/lib/bgin/documents.ts` surfaces projects from bgin-global.org. The curation feed and briefing generator draw from this. This is the "Spells" layer — BGIN's accumulated published output.

*Tier 2 — Per-WG Mage Knowledge (structurally present, content pending):* The RAG pipeline (`src/lib/mage/rag.ts`) is called in every Mage chat interaction. It returns empty context until the ingestion pipeline processes real BGIN documents (meeting reports, study reports, position papers) into vector storage. The architecture is ready for Qdrant per WG or Bonfires-backed bounded contexts.

*Tier 3 — Episodic Knowledge (live):* Per-participant knowledge map built from their Mage interactions, stored in IndexedDB, visualised at `/dashboard/knowledge-map`. This is personal knowledge — the paths each participant has traversed through the institutional intelligence.

**The proposal offered knowledge graph origination as an in-kind contribution.** The architecture to receive it (Mage prompts, RAG pipeline, curation feed, vector storage schema) is built. The content needs to flow.

**4.3 Trust Graph — Stubbed**

**Routes:** `/trust`, `/trust/network`  
**API:** `/api/trust/profile`, `/api/trust/attest`, `/api/trust/network` — all stubs

The trust graph is Phase 8 of the implementation plan. Stubs exist at every layer: routes, API endpoints, data model definitions. No trust tier calculation. No bilateral attestation flow. No VRC creation.

But the foundation is real: proverb inscriptions on casts create bilateral artifacts. Promises with connected proverbs link understanding to commitment. Signed updates on promises create auditable trails. These are the raw materials from which trust graph edges form. The computation layer is the gap.

### What Completes It

**VRC formation from proverbs (Priority 3):** When participant A inscribes a proverb on participant B's cast, this bilateral exchange should generate a VRC — a verifiable relationship credential linking two First Persons through demonstrated mutual understanding. The data exists. The VRC creation flow doesn't.

**Promise Theory polarity (Priority 4):** The data model needs +gives / -uses polarity on promises. The Archive Mage carries +polarity (gives knowledge). The Codex carries -polarity (uses authorisation). Polarity turns the promise collection into a formal graph with directional edges.

**Trust tier calculation (Priority 5):** Blade → Light → Heavy → Dragon (or equivalent BGIN-specific tiers). Computed from accumulated VRCs, fulfilled promises, and proverb activity. Progressive trust unlocks capabilities — a Dragon-tier participant might moderate, a Blade-tier participant observes. Trust is earned through demonstrated behaviour, not assigned by authority.

**Provenance graph integration:** The original proposal specified NEC/Cybersmart provenance graph infrastructure for cryptographic audit trails. This is the third graph in the overlay — recording who did what, when, with what authorisation. Currently not in scope for the codebase but architecturally accommodated by the signed-request model (every API interaction has a verifiable provenance trail in the server logs).

---

## 5. IEEE 7012 Agreement Layer: SD-BASE to PDC

### What the Proposal Said

Two tiers of agreements: SD-BASE (ongoing service relationships) and PDC variants (specific data contributions). All BGIN infrastructure touchpoints require SD-BASE. Data contributions require specific PDC agreements.

### What the Codebase Implements

**Ceremony Step 4:** UI presents MyTerms acceptance. The participant sees the agreement terms and can accept SD-BASE.

**Backend:** `POST /api/myterms/negotiate` exists as a route. Expects a proffer payload (agreement ID, version, participant signature). Returns a bilateral record.

**The gap:** The client doesn't call the backend. No proffer is built. No bilateral record is created. No agreement chronicle is persisted in IndexedDB.

### What Completes It

This is Priority 1 because it enforces the core principle: *agreements before access*.

**Wiring sequence:**
1. Ceremony step 4: on "Accept", Swordsman builds proffer payload (agreement ID, version, participant public key, signature of terms)
2. Client calls `POST /api/myterms/negotiate` with proffer
3. Backend creates bilateral record, signs its side, returns record ID and server signature
4. Client persists record in IndexedDB (agreement chronicle)
5. Auth middleware: check for active SD-BASE agreement on sensitive routes (Mage chat, promises, spellbook). Return 403 with "complete MyTerms" if missing.

**PDC expansion (post-Block 14):**
- PDC-AI: governs how Mage interactions contribute to collective knowledge improvement
- PDC-GOOD: enables incident data sharing for ecosystem-wide security (the original case study)
- PDC-INTENT: allows participants to express governance preferences through their agents

Each PDC agreement is a separate bilateral exchange, layered on top of the SD-BASE relationship.

---

## 6. The Incident Response Case Study — Where It Lives Now

The original proposal used the BGIN Incident Response Agent as the proving ground. The case study demonstrated how the Archive Agent (encrypted historical incident data with selective disclosure), the Codex Agent (response protocols and compliance rules), and the Discourse Agent (stakeholder communication preserving confidentiality) map onto the agentprivacy dual-agent model.

In the current codebase, this maps directly:

- **Archive Agent = Cyber Mage.** The Cyber working group's Mage, when backed by real incident data through the RAG pipeline, becomes the Archive Agent for incident intelligence. Privacy budgets constrain how much can be queried per session.
- **Codex Agent = Promise-based response protocols.** The promise system already supports voluntary commitments with signed updates. An incident response promise ("I will share indicators within 24 hours of detection, scoped to STIX format, under PDC-GOOD terms") is a natural extension.
- **Discourse Agent = Proverb-mediated coordination.** The proverb inscription system allows participants to demonstrate understanding of incident patterns without revealing organisational vulnerabilities. A proverb inscribed on a shared cast signals "I understand this threat pattern" without disclosing "this happened to us."

The case study isn't a separate system to build. It's a specific *use* of the system that's already being built — activated when the Cyber Mage gets its knowledge and the MyTerms PDC-GOOD agreement enables incident data sharing.

---

## 7. Sustainability: Foundation ↔ Labs ↔ DAO

### The Model from the Proposal

| Entity | Role | Value Flow |
|--------|------|-----------|
| BGIN (Foundation) | Governance, standards, convening, legitimacy | Membership network effects; contribution recognition |
| agentprivacy Labs | Development, maintenance, commercialisation | Revenue from enterprise implementations; open-source stewardship |
| Contributor DAO | Merit tracking, contribution recognition, governance | Verifiable credentials; participant ownership |
| Sustaining Orgs | Infrastructure, expertise, regional presence | Grant distribution; governance participation |

### How the Codebase Supports It

**Contribution tracking:** Every interaction in BGIN AI creates a signed, verifiable artifact — ceremony completion, Mage queries, promise creation, proverb inscriptions, cast contributions. These are the raw credentials for the Contributor DAO.

**Block-aligned lifecycle:** The system's structure (Block 14 timetable, session-scoped casts, working group boundaries) naturally maps to the Block-to-Block contribution cycle proposed: contribute during a Block → aggregate between Blocks → commit at Block review.

**Progressive decentralisation:** The trust tier system (when implemented) provides the governance weight mechanism. Participants who demonstrate sustained understanding (through proverbs), fulfilled commitments (through promises), and bilateral trust (through VRC formation) earn governance authority — determined by the community, not by the platform.

### What Completes It

**Verifiable credential export:** Participants should be able to export their contribution history as portable credentials — ceremony completion, promise fulfilment, proverb inscriptions, trust tier attestations. These credentials persist across organisational changes.

**Grant pathway activation:** The proposal identified Ethereum Foundation (Privacy Pools, privacy authentication), Protocol Labs, and World Foundation as grant targets. The working codebase demonstrates the governance framework these grants would fund.

---

## 8. Technical Implementation Status

### Phase Status (from the 12-phase plan)

| Phase | Focus | Status | Key Files |
|-------|-------|--------|-----------|
| 0 | Foundation & infra | ✅ | `package.json`, `next.config.mjs`, `tsconfig.json` |
| 1 | Swordsman layer | ✅ | `lib/swordsman/gate.ts`, `lib/swordsman/sign.ts` |
| 2 | Key ceremony UI | ✅ | `app/ceremony/page.tsx`, `lib/ceremony/*` |
| 3 | Backend API | ✅ | `app/api/ceremony/`, `app/api/mage/`, `app/api/promises/` |
| 4 | Knowledge graph | 🔄 | `lib/mage/rag.ts` (stub), `lib/bonfires/client.ts` (config only) |
| 5 | Mage chat | ✅ | `app/mage/[wg]/`, `lib/mage/systemPrompts.ts` |
| 6 | Personal curation | ✅ | `app/dashboard/`, `app/mage/page.tsx` (Archive) |
| 7 | Collaborative workspace | ✅ | `app/promises/`, `app/spellbook/`, `app/proverb/` |
| 8 | Trust display | 🔴 | `app/trust/` (stubs), `app/api/trust/` (stubs) |
| 9 | Design system | 🔄 | Theme and layout in use; refinement ongoing |
| 10 | Integration & polish | 🔄 | Block 14 homepage, navigation, Mage panel |
| 11-12 | Testing & rollout | ⏳ | Planned for pre-Block 14 |

### Architecture

```
src/
  app/                    # Next.js App Router
    page.tsx              # Block 14 home (timetable, feeds)
    ceremony/             # 8-step key ceremony
    mage/, mage/[wg]/     # Archive hub + WG-specific Mage chat
    spellbook/            # Sessions, WG spellbooks, recent casts
    proverb/              # Proverbs feed (RPP)
    promises/             # All-WG promise board
    dashboard/            # Briefing, knowledge map
    profile/              # Identity, proverbs, casts
    trust/                # Trust display (stubs)
    api/                  # All backend routes
  lib/
    ceremony/             # keygen, agentCard, privacy, wgSelection
    swordsman/            # gate, sign, signedFetch
    mage/                 # systemPrompts, rag, episodicMemory, privacyBudget
    auth/                 # Ed25519 signature verification
    storage/              # Dexie (IndexedDB), server store
    bgin/                 # BGIN documents (Spells)
    block14/              # Block 14 timetable sessions
    bonfires/             # Bonfires client (config stub)
    promises/             # Promise client operations
  components/
    ceremony/, mage/, layout/, dashboard/, workspace/, shared/, ui/
```

### Core Principles (enforced in code)

1. **The gap between Swordsman and Mage is sacred** — no feature collapses it
2. **Agreements before access** — no data exchange without bilateral MyTerms *(partially enforced — see Priority 1)*
3. **Promises, not impositions** — all commitments voluntary
4. **Personal first, collaborative second** — value from Mages before workspace
5. **Local-first data sovereignty** — participant device first, sync optional

---

## 9. Execution Priorities for Block 14

| # | Action | Impact | Effort | Dependency |
|---|--------|--------|--------|------------|
| 1 | Wire MyTerms ceremony → negotiate endpoint | Enables "agreements before access" | Medium | None |
| 2 | Connect knowledge ingestion pipeline (Bonfires or Qdrant) | Mages answer from real BGIN documents | High | API access |
| 3 | Implement VRC creation from proverb inscriptions | Trust graph edges form | Medium | None |
| 4 | Add promise polarity (+gives / -uses) | Formal promise graph | Low | None |
| 5 | Build trust tier calculation from VRCs + promises | Trust display goes live | Medium | #3, #4 |
| 6 | Test ceremony end-to-end with real participants | Block 14 readiness | Low | #1 |
| 7 | Deploy to production environment | Block 14 availability | Medium | All above |

### The Sprint for Block 14 (March 1-2)

**Week 1:** Priorities 1 and 4 — MyTerms wiring and promise polarity. These are the lowest-effort, highest-principle items. They enforce the governance foundations.

**Week 2:** Priorities 2 and 3 — Knowledge pipeline and VRC creation. These are the highest-impact items. They give the Mages their knowledge and the trust graph its first real edges.

**Pre-Block 14:** Priorities 5, 6, 7 — Trust calculation, end-to-end testing, deployment. The system should be live and testable before participants arrive.

---

## 10. After Block 14: The Propagation Path

**Block 14 → Block 15:** The system persists. Contributions accumulate. The knowledge graph grows with each working group interaction. The trust graph densifies with each bilateral exchange. The Block-aligned contribution lifecycle begins.

**Cross-organisational deployment:** The fourteen-document specification package enables any governance body to fork and adapt. The architecture is topology-independent. The first external deployment validates the template.

**Grant applications:** Working codebase + Block 14 deployment data = concrete evidence for Ethereum Foundation (Privacy Pools, privacy authentication), Protocol Labs (decentralised knowledge infrastructure), and other funders. The proposal identified these pathways. The codebase provides the proof.

**Protocol composability:** ERC-8004 for trustless agent identity. Privacy Pools for compliant private transactions. x402 for HTTP-native payments. First Person VRCs for trust without biometrics. Each composes independently. Each extends the system's reach without requiring the system to change.

**Progressive decentralisation:** As sustaining organisations contribute and the Contributor DAO matures, governance authority distributes. The system begins to govern itself — not through imposed rules, but through the emergent properties of kept promises, bilateral trust, and demonstrated understanding.

---

*The proposal said: start with the agreement layer, because governance foundations enable everything else.*

*The codebase says: the agreement layer is built. The governance foundations are in place. The knowledge needs to flow. The trust needs to crystallise.*

*Block 14 is where both claims are tested.*

*⚔️ ⊥ 🧙 | 🏛️*

---

**Mitchell Travers** | privacymage  
mage@agentprivacy.ai

**References:**
- [agentprivacy.ai](https://agentprivacy.ai) — Project home
- [github.com/mitchuski/bgin](https://github.com/mitchuski/bgin) — BGIN AI codebase
- [github.com/mitchuski/agentprivacy-docs](https://github.com/mitchuski/agentprivacy-docs) — Whitepapers, research papers, protocol specifications
- [sync.soulbis.com](https://sync.soulbis.com) — Living documentation
- [intel.agentkyra.ai](https://intel.agentkyra.ai) — Intelligence layer
- [bgin-global.org](https://bgin-global.org) — BGIN homepage
