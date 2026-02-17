# Block 13 → Block 14 Knowledge Archives

## Overview

This document describes the knowledge-archive context used for ingestion and RAG in the BGIN AI app. The app has evolved from **Block 13** conference sessions and tracks to **Block 14** (March 1–2, 2026): timetable-driven sessions, Mage chat by working group, Spellbook (casts by session and by WG), and the **Spells** feed (BGIN publications and projects). The knowledge base supports the same working groups and is aligned with the current implementation.

## Working Groups (Block 13 & Block 14)

### 1. Identity, Key Management & Privacy (IKP)
- **Focus**: Cryptographic identity, key management, privacy-preserving tech
- **Sessions (Block 13)**: Offline Key Management, ZKP and Privacy Enhanced Authentication, Crypto Agility and PQC Migration
- **Key Documents**: Offline Key Management Best Practices, Zero-Knowledge Proof Authentication Framework, privacy-preserving systems

### 2. FASE (Financial and Social Economies)
- **Focus**: Policy and financial applications of blockchain
- **Sessions (Block 13)**: Information Sharing Framework Standard, Practical Stablecoin Implementation, Harmonization (Crypto-asset, Stablecoin, Tokenized Deposit)
- **Key Documents**: Information Sharing Framework Standard, Practical Stablecoin Implementation Guide

### 3. Cyber Security
- **Focus**: Blockchain security, threat analysis, supply chain
- **Sessions (Block 13)**: Governance of Security Supply Chain, Security Target and Protection Profile, Forensics & Analysis, Common Lexicon for Harmful On-Chain Activities
- **Key Documents**: Governance Framework for Blockchain Security Supply Chains, Security Targets and Protection Profiles

### 4. Governance (General)
- **Focus**: Cross-cutting governance, metrics, accountability
- **Sessions (Block 13)**: Technical Metrics to Evaluate Decentralization, Accountable Wallet, Security Gathering
- **Key Documents**: Technical Metrics for Decentralization, governance frameworks

### 5. BGIN Agent / Hack (Block 13)
- **Focus**: Multi-agent systems, AI governance research
- **Key Documents**: Multi-Agent System Architecture, AI Agent Governance Framework

## How the Current App Uses Knowledge

### Archive & Spells
- **Archive** (`/mage`): Talk to a Mage (by WG), Block 14 briefings, Knowledge map.
- **Spells**: BGIN publications and projects from [bgin-global.org/projects](https://bgin-global.org/projects), served by `GET /api/curation/feed`, sorted by date (newest first). Implemented in `src/lib/bgin/documents.ts` and `src/app/api/curation/feed/route.ts`.

### Mage Chat & RAG
- **Mage** (side panel or `/mage/[wg]`): WG-specific chat; `POST /api/mage/[wg]/chat`. RAG and document ingestion are **mid–working** (see Phase 4 in README and `00_IMPLEMENTATION_PLAN.md`).

### Spellbook & Casts
- **Spellbook** (`/spellbook`): Sessions (Block 14 timetable), spellbooks by WG, recent casts. Casts are stored via spellbook entries API; session list from `src/lib/block14/sessions.ts`.

## Document Metadata (for ingestion)

When ingesting or tagging documents, the system can use:
- **Working group**: IKP, FASE, Cyber, Governance
- **Tags**: Keywords for search and filtering
- **Privacy level**: Maximum, High, Selective, Minimal (per spec)
- **Source**: e.g. bgin-global.org/projects, conference briefings

## Integration Points (current and planned)

### Current
- **Spells feed**: BGIN projects/documents; curation feed API.
- **Block 14 timetable**: Single source in `src/lib/block14/sessions.ts` (March 1–2, 2026).
- **Ceremony**: Participant identity and working-group selection; keys in IndexedDB.

### Planned / mid–working
- **Document ingestion pipeline**: Scripts and RAG pipeline per Phase 4; see `00_IMPLEMENTATION_PLAN.md` and `08_DATA_MODELS.md`.
- **Vector/graph**: Qdrant, Neo4j per plan; knowledge graph and episodic memory in progress.
- **Full MyTerms**: Agreement layer and API wiring (stubs exist).

## Usage for developers

### Loading / seeding data
- **Spells**: Fetched or derived from BGIN projects; see `src/lib/bgin/documents.ts`.
- **Sessions**: Edit `src/lib/block14/sessions.ts` for Block 14 timetable.
- **Ingestion**: When implemented, follow `00_IMPLEMENTATION_PLAN.md` Phase 4 and any `scripts/` ingest steps; DB and env per `08_DATA_MODELS.md`.

### Querying (current APIs)
- **Curation feed**: `GET /api/curation/feed?workingGroups=...&limit=...&offset=...` (auth via signedFetch after ceremony).
- **Briefing**: `GET /api/curation/briefing?meetingId=...`
- **Mage chat**: `POST /api/mage/[wg]/chat` (body and auth per `07_API_SPEC.md`).

## References

- **README.md** — Project overview, phases, and current status.
- **docs/PROJECT_STATUS.md** — API ↔ UI map and where things can break.
- **BLOCK_14_ALIGNMENT_COMPARISON.md** — Alignment with Block 14 / agentprivacy architecture.
- **block14_updates/** — Full spec (00_IMPLEMENTATION_PLAN, 01_ARCHITECTURE, 07_API_SPEC, 08_DATA_MODELS, etc.).

---

*This document bridges the Block 13 knowledge-archive model with the current Block 14 app. For questions or contributions, see CONTRIBUTING.md and the BGIN working groups.*
