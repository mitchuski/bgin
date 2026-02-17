# BGIN AI × Agentprivacy Protocol Convergence Study

**Architecture, Protocol Alignment, and Three-Graph Assessment**

**Author:** Mitchell Travers (privacymage)  
**Date:** February 17, 2026  
**Version:** 1.0  
**Status:** 🔬 Technical Assessment — For Working Group Review

---

## 1. Definitions

Before mapping, the terms must be precise.

**First Person** — The human sovereign. Not an agent. Not a user. The entity that holds personhood keys and delegates authority to agents through bilateral promise exchange. In BGIN AI: the participant who completes the key ceremony.

**Swordsman (⚔️)** — The human with their personhood keys — the boundary-making layer. Controls what leaves the device. Signs requests. Enforces privacy preferences. The Swordsman is not an autonomous agent — it is the human exercising sovereignty through cryptographic primitives. In BGIN AI: the client-side gate (`lib/swordsman/gate.ts`, `signedFetch`) mediating between the participant and every backend interaction.

**Mage (🧙)** — The delegated knowledge agent. Receives bounded context from the Swordsman. Returns compressed understanding. Cannot see what the Swordsman withholds. In BGIN AI: the per-working-group chat agents (IKP, FASE, Cyber, Governance) backed by RAG and constrained by privacy budgets.

**The Gap (⊥)** — The mathematical separation between Swordsman and Mage. Information-theoretically: `I(X; s,m) ≤ I(X;s) + I(X;m)`. The conditional independence guaranteeing a reconstruction ceiling R < 1 — no reconstruction of the complete human context from agent outputs alone. The gap is sacred. No feature collapses it.

**TSP (Trust Spanning Protocol)** — The middleware layer between the human/agent trust boundary and the cryptographic transport layer. Mediates how trust flows between First Persons without requiring trust in the infrastructure itself. In BGIN AI: the signed request verification, MyTerms agreements, and bilateral promise exchanges that sit between the participant and the system.

**RPP (Relationship Proverb Protocol)** — Before responding to any inquiry, the Mage first divines a proverb connecting the seeker's context to the knowledge domain. Proverbs become inscriptions. Inscriptions become trust graph edges. Understanding precedes information transfer.

**Three Graphs** — Knowledge (what the network knows), Promise (what participants commit to), Trust (what bilateral exchanges have verified). Sovereign identity sits at the intersection of all three.

---

## 2. Architectural Philosophy

The BGIN AI system implements a three-agent mapping of the dual-agent model:

| agentprivacy Role | BGIN AI Agent | Function | Graph Contribution |
|-------------------|---------------|----------|--------------------|
| **Mage (Soulbae)** | **Archive Agent** | Knowledge, RAG, understanding | Knowledge Graph |
| **Swordsman (Soulbis)** | **Codex Agent** | Actions, promises, execution | Promise Graph |
| **Human + Mage** | **Discourse Agent** | Distribution, community understanding | Trust Graph |

The First Person remains the human sovereign who delegates to these agents through bilateral promise exchange. The separation between Archive (knowledge) and Codex (action) preserves the gap. Discourse bridges human understanding with knowledge distribution — it is the projection of the Mage into the community, not a collapse of the separation.

The three-agent extension is natural for BGIN's topology because governance intelligence requires not just knowledge and action, but *distribution* — the mechanism by which individual understanding becomes collective intelligence. In the original dual-agent model, distribution is implicit. BGIN's working group structure makes it explicit.

---

## 3. Layer-by-Layer Stack Mapping

### Layer 5: First Person (Human Sovereign)

| Component | agentprivacy Reference | BGIN AI Implementation | Status |
|-----------|----------------------|------------------------|--------|
| Personhood proof | First Person VRC (trust without biometrics) | Key ceremony — Ed25519 keypair via WebCrypto | 🟢 |
| Sovereign context | Complete private context X | IndexedDB (Dexie) — keys, agent card, episodic memory, privacy preferences | 🟢 |
| Delegation authority | Human delegates to dual agents | Ceremony generates agent card with WG selections and privacy levels | 🟢 |
| Identity persistence | DID / verifiable identity | `participantId` derived from public key (`bgin-{hash}`) | 🟡 |
| Key backup / recovery | Sovereign responsibility | Encrypted key backup in ceremony step 7 | 🟢 |

**Assessment:** Strong. The eight-step ceremony implements genuine key-based sovereignty. No email/password fallback. No OAuth. Loss of key = new identity by design. Each step is intentional: keygen, privacy preferences, MyTerms acceptance, working group selection, agent card generation, key backup. The ceremony makes delegation meaningful rather than implicit.

**Gap:** No formal DID document registration. Identity is locally sovereign but not yet verifiable across systems. ERC-8004 would upgrade `participantId` to trustless agent identity resolvable beyond the BGIN context.

### Layer 4: Agent Layer (Swordsman + Mage)

| Component | agentprivacy Reference | BGIN AI Implementation | Status |
|-----------|----------------------|------------------------|--------|
| Swordsman gate | Client-side privacy enforcement | `lib/swordsman/gate.ts` — checks agent card, filters context, strips attribution | 🟢 |
| Signed requests | Swordsman signs all delegation | `signedFetch` — Ed25519 signature of `participantId:timestamp:body` | 🟢 |
| Privacy budget | φ-constrained session limits | Per-WG budget: Maximum (3), High (6), Selective (12), Minimal (24) | 🟢 |
| Mage knowledge | Spellbook RAG (bounded) | Per-WG system prompts + RAG pipeline (pipeline structurally present, content pending) | 🟡 |
| Mage separation | One Mage per domain, no cross-domain leakage | Four WG Mages, isolated collections planned, cross-WG hints allowed | 🟡 |
| Episodic memory | Session-bounded context | Client-side IndexedDB, filtered through Swordsman before passing to Mage | 🟢 |
| Agent card | Verifiable agent identity | Generated in ceremony: WG selections, privacy config, public key, signature | 🟢 |

**Assessment:** Architecturally sound. The Swordsman gate checks privacy preferences, filters outbound context, strips attribution when configured, and enforces budget *before* any request reaches a Mage. The four-Mage structure maps naturally to BGIN's working group topology. Cross-WG hints (the IKP Mage can reference FASE's regulatory work) are allowed; cross-WG context (sharing the participant's FASE conversations with the IKP Mage) is not.

**Gap:** RAG retrieval is structurally present but returning empty context until the knowledge ingestion pipeline connects real BGIN documents. The Mages have the right prompts, the right boundaries, and the right privacy constraints. They need their knowledge.

### Layer 3: TSP (Trust Spanning Protocol)

| Component | agentprivacy Reference | BGIN AI Implementation | Status |
|-----------|----------------------|------------------------|--------|
| Trust mediation | TSP as middleware | Signed request verification — server validates Ed25519 signatures | 🟡 |
| Bilateral agreements | MyTerms (IEEE 7012) | Ceremony step 4 UI; backend negotiate route exists; not wired | 🔴 |
| Agreement enforcement | No data exchange without bilateral terms | Auth checks signatures but not MyTerms compliance | 🔴 |
| Promise exchange | Promise Theory (+gives / -uses polarity) | Promises with CRUD, signed updates, optional proverb connection | 🟢 |
| VRC formation | Verifiable Relationship Credentials | Trust API stubs exist; no bilateral VRC creation flow | 🔴 |
| Proverb inscriptions | RPP-based trust artifacts | Proverbs inscribed on casts and linked to promises — live | 🟢 |

**Assessment:** This is the critical construction frontier. The promise system and proverb inscriptions are strong — they produce bilateral artifacts that represent articulated understanding, not activity metrics. But MyTerms negotiation (the Swordsman's first blade, the SD-BASE implementation from the original BGIN proposal) isn't wired, and VRC formation is stubbed.

The core agentprivacy principle — *agreements before access* — is stated in the README's core principles but not yet enforced in middleware. The architecture is designed for it. The circuit needs completing.

### Layer 2: Cryptographic Layer

| Component | agentprivacy Reference | BGIN AI Implementation | Status |
|-----------|----------------------|------------------------|--------|
| Key generation | Ed25519 / asymmetric keypairs | WebCrypto API Ed25519 | 🟢 |
| Signature verification | Per-request authentication | `lib/auth/verify.ts` — server-side Ed25519 verification | 🟢 |
| Shielded transactions | z→z (Zcash) / Privacy Pools | Not in scope (no on-chain transactions) | ⚠️ |
| ZK proofs | ZK commitments (ERC-7812) | Not implemented | ⚠️ |
| Privacy levels | Configurable disclosure | Four levels with query budgets | 🟢 |

**Assessment:** Solid for the current scope. BGIN AI is governance intelligence, not a financial application — the absence of shielded transactions is a scoping decision. When cross-organisational trust attestations connect to on-chain primitives, Privacy Pools and ERC-7812 become the extension path. The key infrastructure supports this.

### Layer 1: Transport / Infrastructure

| Component | agentprivacy Reference | BGIN AI Implementation | Status |
|-----------|----------------------|------------------------|--------|
| Application framework | Next.js | Next.js 14+ App Router (TypeScript) | 🟢 |
| Local-first storage | Device sovereignty | IndexedDB via Dexie.js | 🟢 |
| Server state | Minimal, participant-controlled | File-based `.data/store.json` (dev); PostgreSQL planned | 🟡 |
| Vector storage | Knowledge retrieval | Qdrant planned per WG; not deployed | 🔴 |
| Graph storage | Trust/knowledge relationships | Neo4j planned; not deployed | 🔴 |
| AI inference | Private execution | Anthropic API / NEAR Cloud AI (TEE) | 🟢 |

---

## 4. Density Visualisation

```
Layer 5: First Person    ████████████████████████████  🟢🟢🟢🟢🟢
Layer 4: Agent           ██████████████████████░░░░░░  🟢🟢🟢🟢🟡🟡
Layer 3: TSP             ██████████░░░░░░░░░░░░░░░░░  🟢🟢🔴🔴🔴
Layer 2: Crypto          ████████████████░░░░░░░░░░░  🟢🟢🟢⚠️⚠️
Layer 1: Transport       ██████████████████░░░░░░░░░  🟢🟢🟡🔴🔴🟢
```

**Reading:** BGIN AI has built **top-down from sovereignty**. The First Person layer is dense. The Agent layer is architecturally complete. The TSP layer — where bilateral trust crystallises — is the primary construction frontier.

---

## 5. Three-Graph Assessment

### Knowledge Graph

**Source:** Thirteen blocks of institutional output — meeting reports, study reports, position papers, standards drafts.

**Current:** Partially implemented. Spells feed surfaces bgin-global.org/projects. Episodic memory tracks per-participant knowledge paths. Full ingestion → embedding → RAG pipeline is stubbed.

**The original proposal offered knowledge graph origination as an in-kind contribution.** The architecture to receive it is built. The content pipeline is the gap.

**Completes with:** Either self-hosted Qdrant per WG, or Bonfires-backed bounded knowledge contexts. Architecture supports both.

### Promise Graph

**Source:** Voluntary commitments between participants, connected to proverbs.

**Current:** Strongest of the three. Full promise CRUD with signed updates. Proverb connections. Working group scoping. Cast-to-session and cast-to-spellbook flows. RPP turns knowledge sharing into traceable bilateral exchange.

**From the original proposal:** The promise graph maps the commitments between personal agents and governance agents — bilateral promises forming edges in a graph capturing the trust topology of the network. BGIN AI implements this at the participant level.

**Completes with:** Promise Theory polarity tracking (+gives / -uses) formalised in the data model. The Mage carries +polarity (gives knowledge). The Codex carries -polarity (uses authorisation).

### Trust Graph

**Source:** Bilateral exchanges that form Verifiable Relationship Credentials.

**Current:** Stubbed. Trust API routes exist. No tier calculation. No attestation flow. No VRC creation.

**From the original proposal:** The three-graph overlay — promise (intent), provenance (action), knowledge (meaning) — reveals where promises were kept, where contributions exceeded commitments, and where knowledge gaps exist. The trust graph is the emergent layer.

**Completes with:** Phase 8 implementation. The proverb system and promise graph already produce bilateral artifacts that can seed trust graph edges. The computation layer that turns these into trust scores is the gap.

---

## 6. Convergence Hypotheses for Block 14

BGIN AI tests specific architectural claims at Block 14. These are hypotheses, not conclusions.

### Hypothesis 1: The Key Ceremony Changes Participant Behaviour

**Claim:** Replacing email/password with an eight-step key ceremony creates ownership over the identity and participation.

**Test at Block 14:** Do participants complete it? Do they understand what they've done? Does the intentionality change how they interact with the Mages?

### Hypothesis 2: Per-Domain Mages Preserve the Gap

**Claim:** One Mage per working group, with no cross-WG context leakage, preserves the information-theoretic separation.

**Test at Block 14:** Do participants naturally respect the WG boundaries? Do cross-WG hints create curiosity without violating separation?

### Hypothesis 3: Proverbs Are Stronger Trust Signals Than Activity

**Claim:** Compressed understanding (proverbs) creates more meaningful trust artifacts than clicks, time-on-page, or contribution counts.

**Test at Block 14:** Do proverb-linked promises carry more semantic weight? Do proverb inscriptions on casts create genuine bilateral understanding?

### Hypothesis 4: Privacy Budgets Improve Query Quality

**Claim:** Limiting queries per session causes participants to front-load their thinking.

**Test at Block 14:** Compare interaction quality across the four privacy levels (3, 6, 12, 24 queries). Does constraint produce better questions?

---

## 7. Assessment Summary

| Dimension | Score | Notes |
|-----------|-------|-------|
| First Person sovereignty | ██████████ 10/10 | Key ceremony, local-first, no surveillance fallback |
| Swordsman/Mage separation | ████████░░ 8/10 | Architecture clean; needs RAG to fully exercise |
| Knowledge graph | █████░░░░░ 5/10 | Structure present, content pipeline incomplete |
| Promise graph | ████████░░ 8/10 | Strong; needs polarity formalisation |
| Trust graph | ███░░░░░░░ 3/10 | Stubs only; highest-priority gap |
| TSP / bilateral agreements | ████░░░░░░ 4/10 | MyTerms unwired; VRCs stubbed |
| Privacy model | █████████░ 9/10 | Budgets, levels, local-first — well-implemented |
| Three-graph overlay | █████░░░░░ 5/10 | Promise graph strong; knowledge and trust graphs partial |
| Documentation | █████████░ 9/10 | 14-document spec package, comprehensive |
| Propagation readiness | ███████░░░ 7/10 | Forkable architecture; needs Block 14 validation |

**Overall:** Architecturally aligned with the agentprivacy protocol at every layer. First Person and Agent layers are strong. TSP layer is the construction frontier. Completing it turns BGIN AI from a governance intelligence application into replicable privacy-first delegation infrastructure.

---

## 8. Priority Actions

| Priority | Action | Layer | Unlocks |
|----------|--------|-------|---------|
| 1 | Wire MyTerms ceremony step → negotiate endpoint | TSP | Agreements before access (core principle) |
| 2 | Complete knowledge ingestion pipeline | Agent | Mages with real BGIN knowledge |
| 3 | Implement VRC creation from proverb inscriptions | TSP | Trust graph edge formation |
| 4 | Add Promise Theory polarity to data model | TSP | Formal promise graph structure |
| 5 | Deploy trust tier calculation from bilateral VRCs | TSP | Trust display (Phase 8) |
| 6 | ERC-8004 integration for participantId | Crypto | Cross-system identity resolution |
| 7 | Privacy Pools attestation for cross-org trust | Crypto | Inter-organisational trust graph |

---

*The construction sequence is correct: sovereignty first, intelligence second, trust emergent.*

*The plan is the promise. The execution is the proof.*

*⚔️ ⊥ 🧙 | 🏛️*

---

**Mitchell Travers** | privacymage  
**References:**
- [agentprivacy.ai](https://agentprivacy.ai)
- [github.com/mitchuski/bgin](https://github.com/mitchuski/bgin)
- [github.com/mitchuski/agentprivacy-docs](https://github.com/mitchuski/agentprivacy-docs)
- [sync.soulbis.com](https://sync.soulbis.com) — Living documentation
- [intel.agentkyra.ai](https://intel.agentkyra.ai) — Intelligence layer
