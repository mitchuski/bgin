# Letter to BGIN

**From:** Mitchell Travers — privacymage  
**Co-Chair, IKP Working Group | Builder, agentprivacy.ai**

**To:** BGIN Steering Committee, Working Group Co-Chairs, and the Block 14 Community

**Date:** February 17, 2026  
**Subject:** This Is Why I'm Here — And What I've Built

---

## How We Got Here

I should start with the pathway, because the pathway is the architecture.

I joined BGIN as a participant in the Identity, Key Management & Privacy Working Group. I stayed because the room held something I hadn't found elsewhere: regulators and cypherpunks in the same breakout, finding common language for a shared problem. I became co-chair of IKP because the problems being discussed were the same problems I was trying to solve — and BGIN's multi-stakeholder structure meant the solutions had to survive contact with every perspective, not just the one I happened to hold.

I first walked into a BGIN room at Block 8 in Croatia. Between Block 8 and Block 13, the architecture that would become 0xagentprivacy crystallised. Not from a whiteboard. From listening. From the IKP sessions where we explored how key management intersects with identity, how privacy requirements conflict with compliance obligations, how the governance patterns emerging in blockchain systems foreshadow the governance patterns AI agents will need.

The core problem: how do humans delegate authority to AI agents without surrendering the sovereignty that makes delegation meaningful? This is the privacy-delegation paradox. Single agents cannot resolve it — they violate Promise Theory's autonomy axiom by promising in both protection and delegation domains simultaneously. The dual-agent architecture (Swordsman and Mage) resolves it through mathematical separation, not policy promises. Two conditionally independent agents whose information-theoretic bounds guarantee a reconstruction ceiling: R < 1. Perfect reconstruction of the human's complete private state is impossible by design.

That's the theory. This letter is about the practice.

---

## What I Proposed — And What Happened Next

In January 2026, I submitted a formal collaborative framework proposal to BGIN: a three-pillar structure linking the agentprivacy governance framework, IEEE 7012-aligned data contribution agreements, and a Foundation ↔ Labs ↔ DAO sustainability model. The Incident Response Agent was the case study — demonstrating how privacy-preserving multi-agent architectures enable secure information sharing between organisations while maintaining stakeholder sovereignty.

That proposal laid out the three-graph architecture (provenance, knowledge, promise), the MyTerms agreement tiers (SD-BASE for service relationships, PDC variants for data contributions), the Block-aligned contribution lifecycle, and the pathways to Ethereum Foundation grants in Privacy Pools and privacy authentication research. It mapped how NEC/Cybersmart's provenance graph infrastructure, BGIN's collective knowledge graph, and agentprivacy's promise graph overlay to create a value discovery mechanism no single participant could build alone.

The proposal was a governance document. What I'm presenting now is the thing itself.

---

## What I've Built

BGIN AI is the implementation of that proposal — the proof that governance intelligence can be built privacy-first from day one. It is a working Next.js application with forty-three commits on master, implementing the agentprivacy dual-agent architecture mapped onto BGIN's four working groups.

I want to be precise about what exists and what doesn't, because the honest assessment matters more than the vision statement.

**What's working:**

The key ceremony is complete. Eight steps — keygen (Ed25519 via WebCrypto), privacy preferences, MyTerms acceptance, working group selection, agent card generation, key backup. No email. No OAuth. No session tokens. Every API request signed by the participant's own key. Loss of key means new identity. This is sovereignty, not convenience.

Mage chat is live across all four working groups — IKP, FASE, Cyber, Governance. Each Mage has tailored system prompts, is constrained by privacy budgets, and runs through Anthropic or NEAR Cloud AI (the same trusted execution environment used in the agentprivacy master project). The Relationship Proverb Protocol is implemented: check a box, and the Mage prefaces its response with a proverb connecting the participant's context to the knowledge domain. That proverb becomes an inscribable artifact.

The Spellbook captures casts — knowledge contributions tied to Block 14 sessions and working groups. Casts can receive proverb inscriptions from other participants. Promises — voluntary commitments with optional connected proverbs — have full CRUD with signed updates. The promise graph is the strongest of the three graphs.

The Archive surfaces BGIN's publications, briefings, and a knowledge map. Profile, settings, key management, and the Block 14 timetable are in place.

**What's partial:**

MyTerms bilateral agreement negotiation — the ceremony presents the UI but doesn't yet wire to the backend negotiate endpoint. The route exists. The client call doesn't. This is the SD-BASE implementation from the original proposal, mid-circuit.

Knowledge graph integration — RAG context is structurally present in every Mage prompt but returns empty until the ingestion pipeline connects real BGIN documents. The Bonfires integration (bounded knowledge contexts per working group) is configured but not yet calling the API. The knowledge graph origination offered in the original proposal as an in-kind contribution is architecturally ready but awaiting its content.

Trust display — stubs exist for trust profile, attestation, and network visualisation, but the tier calculation and bilateral VRC formation flow aren't implemented. This is Phase 8 of a 12-phase plan.

**What this means:**

The First Person layer (human sovereignty) is dense. The Agent layer (Swordsman gate, Mage chat) is architecturally complete but needs knowledge. The Trust Spanning Protocol layer — where bilateral agreements and VRCs crystallise — is the construction frontier. The system has built top-down from sovereignty. This is deliberate. You pour the human layer before you pour the trust layer, because trust without sovereignty is surveillance with extra steps.

---

## Why BGIN — Specifically

The agentprivacy dual-agent body of work is unique. It occupies its own category — not a wallet, not a credential issuer, not a data store, but the governance framework and agreement layer upon which those systems can build. And it is finding its way. Every time the architecture meets a new project — a federated knowledge commons, a universal data reference system, a civic privacy infrastructure, a standards alliance, a blockchain privacy roadmap — the protocol improves. Sometimes in knowledge. Sometimes in system design and governance around privacy. Each convergence study sharpens the definitions, surfaces new edge cases, and reveals primitives that compose in ways I hadn't predicted.

This is by design. There will be many types of mages — knowledge agents, guide agents, governance agents, incident response agents — each shaped by the domain they serve. There will be many types of swordsmen — browser extensions, key managers, privacy gates, consent enforcers — each shaped by the human they protect. The implementations will fracture and multiply. What persists is the duality itself: the mathematical separation between protection and projection, the gap where sovereignty lives, the reconstruction ceiling that makes perfect surveillance structurally impossible.

The duality is what matters. The specific implementations are expressions of it.

BGIN is different from all of these interactions. BGIN is where the architecture *came from*.

The IKP sessions taught me that key management without governance is cryptography in a vacuum. The FASE discussions showed me that financial privacy without compliance frameworks is a regulatory dead end. The Cyber working group demonstrated that incident response requires information sharing between organisations who don't trust each other — the exact problem dual-agent architecture solves. The Governance working group modelled the multi-stakeholder coordination patterns that the promise graph formalises.

BGIN's structure — working groups with distinct knowledge domains, multi-stakeholder participation, voluntary commitments, open process — is the natural topology for this system. Four working groups become four Mages. Bilateral exchanges between participants become trust graph edges. Promises made in working group sessions become signed commitments with proverb-linked proofs of understanding. The Block-to-Block development cycle becomes the contribution lifecycle.

This isn't adaptation. This is homecoming.

---

## How This Propagates

The architecture is designed as a **template that any multi-stakeholder governance body can fork.**

**Within BGIN:** Block 14 runs as a live demonstration. Participants experience the ceremony, talk to Mages, inscribe proverbs, make promises. The trust graph begins forming from real bilateral exchanges. After Block 14, the system persists — not as a conference app, but as BGIN's ongoing governance intelligence layer, accumulating knowledge and trust across blocks.

**As documentation infrastructure:** The repository contains fourteen specification documents designed for consumption by coding agents and implementation teams. Architecture, key ceremony, Mage agents, personal curation, collaborative workspace, trust display, API spec, data models, migration patterns, design system, Bonfires integration, case study, MyTerms agreement layer, and the alignment comparison. Any governance body can fork this package and adapt it. Replace "IKP, FASE, Cyber, Governance" with any working group structure and the system holds.

**Into the agent economy:** The protocols being tested here — ERC-8004 for trustless agent identity, Privacy Pools for compliant private transactions, x402 for HTTP-native payments, First Person VRCs for trust without biometrics — are composable primitives. They work for governance intelligence. They also work for any context where humans need to delegate to agents without being consumed by the delegation.

**Through the original proposal's sustainability model:** The Foundation ↔ Labs ↔ DAO structure, the Block-aligned contribution lifecycle, the progressive decentralisation pathway — these remain the governance scaffolding for how the work sustains itself. Contribution recognition through verifiable credentials. Merit-based reciprocity. The plan is the promise.

---

## What I'm Asking

I'm not asking for permission to build. I've already built.

I'm asking for the working group participation, the knowledge base access, and the Block 14 deployment venue to test this system with the community that inspired it. I'm asking for the same thing the original proposal requested: a proving ground where privacy-preserving governance intelligence can be validated by the people who understand what it means.

The companion documents to this letter are a technical convergence study mapping every layer of the BGIN AI system against the agentprivacy protocol stack, and an infrastructure execution document that traces the thread from the original proposal through to the working codebase and forward into what completes the architecture.

This letter says: here's who I am and why I'm here.

The convergence study says: here's the technical proof.

The infrastructure document says: here's how it executes.

Together they say: the plan was always the promise. This is the proof.

---

**Mitchell Travers**  
privacymage | Co-Chair, IKP Working Group  
mage@agentprivacy.ai

*"Agents can only promise their own behaviour."*  
*⚔️ ⊥ 🧙 | 🏛️*

---

**References:**
- [agentprivacy.ai](https://agentprivacy.ai)
- [github.com/mitchuski/bgin](https://github.com/mitchuski/bgin)
- [github.com/mitchuski/agentprivacy-docs](https://github.com/mitchuski/agentprivacy-docs)
- [sync.soulbis.com](https://sync.soulbis.com) — Living documentation
- [intel.agentkyra.ai](https://intel.agentkyra.ai) — Intelligence layer
