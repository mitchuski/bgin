# SPELLWEB.md

> *"Serendipity shapes more than strategy. Constellations illuminate more than spotlights. Promise builds in the gap between."*

## What is the Spellweb?

The Spellweb is an interactive knowledge graph — a navigable constellation of tales, protocols, standards, and the relationships between them, rendered as an explorable force-directed graph.

This implementation was imported from **agentprivacy_master** and adapted for the BGINAI Block 14 context.

## Two Visualization Modes

BGINAI now has **two complementary graph views**:

### 1. Spellweb (`/spellweb`)
- **Purpose**: Tales, protocols, standards as a constellation
- **Data source**: Static JSON (`/public/spellweb/nodes.json`, `edges.json`)
- **Features**: Guild colors, maturity sizing, complexity shapes, dimensional profiles
- **Best for**: Exploring the privacy-preserving agent ecosystem architecture

### 2. Session Web (`/web`)
- **Purpose**: Block 14 sessions, casts, and proverbs as a dynamic web
- **Data source**: API-driven (spellbook entries, proverbs)
- **Features**: Working group filtering, draw mode, saved maps
- **Best for**: Navigating Block 14 governance discussions and insights

## The Knowledge Graph Schema

Every node in the Spellweb carries scored features:

- **Guild** (Swordsman / Mage / Emergent / Bridge) → color
- **Maturity** (concept / spec / implementation / deployed) → size
- **Cryptographic complexity** (1-6) → shape (triangle → hexagon)
- **Privacy–Delegation position** (0.0-1.0) → X-axis in scatter mode
- **Dimensional scale** (d₁–d₆) → Y-axis in scatter mode

### Dimensions

| Dimension | Range | Meaning |
|-----------|-------|---------|
| d₁ Hide | 0.0–0.17 | Basic concealment |
| d₂ Commit | 0.17–0.33 | Binding commitments |
| d₃ Prove | 0.33–0.50 | Verification without revelation |
| d₄ Connect | 0.50–0.67 | Relational, connecting |
| d₅ Reflect | 0.67–0.83 | Self-referential, recursive |
| d₆ Delegate | 0.83–1.0 | Non-local, agent delegation |

### Edge Types

- **inscription_echo** — Two nodes share a core principle (dashed line)
- **principle_extends** — One node builds on another (arrow)
- **implements** — Protocol realizes a standard (solid line)
- **guild_bridge** — Spans the Swordsman–Mage boundary (gradient)
- **dependency** — Technical dependency (dashed, lower opacity)

## How to Contribute

### Adding Nodes

The graph data lives in `/public/spellweb/nodes.json` and `/public/spellweb/edges.json`. To add a new node:

1. Create an entry in `nodes.json` following the schema in `src/lib/spellweb/kg-types.ts`
2. Score it on the feature axes
3. Add edges to `edges.json` connecting it to related nodes
4. Open a PR with your additions

### Scoring Guide

**privacyDelegationPosition** (0.0 – 1.0)
- 0.0 = pure privacy primitive (hiding, concealing, shielding)
- 0.5 = balanced / bridges both domains
- 1.0 = pure delegation primitive (projecting, authorizing, connecting)

**complexity** (1–6)
- Count the number of distinct cryptographic or protocol components involved
- A simple hash commitment = 1–2
- A full ZK proof system with multiple rounds = 4–5
- A complete agent delegation ceremony with multiple standards = 6

**maturity**
- `concept` = described in narrative or whitepaper only
- `spec` = formal specification exists
- `implementation` = code exists, may be prototype
- `deployed` = running in production somewhere

## File Structure

```
src/
├── app/
│   ├── spellweb/
│   │   └── page.tsx          # Knowledge graph page (imported from agentprivacy)
│   └── web/
│       └── page.tsx          # Session web page (Block 14 dynamic data)
├── components/
│   └── spellbook/
│       ├── ForceGraphKG.tsx  # D3 force graph for knowledge graph
│       └── SpellwebViewerAgentic.tsx  # Canvas graph for session web
└── lib/
    └── spellweb/
        ├── kg-types.ts       # Knowledge graph types (imported from agentprivacy)
        ├── kg-loader.ts      # Static JSON loader (imported from agentprivacy)
        ├── types.ts          # Session web types (Glyph, Strand)
        ├── types-agentic.ts  # Agentic node/link types
        ├── builder.ts        # Session web builder
        └── builder-agentic.ts # Agentic graph builder

public/
└── spellweb/
    ├── nodes.json            # Knowledge graph nodes
    └── edges.json            # Knowledge graph edges
```

## Design Principles

**The gap is the feature.** The Spellweb doesn't try to collapse the Swordsman and Mage into a single view. The visual separation between amber and violet clusters IS the architecture.

**Emergence over arrangement.** Force-directed graphs produce topology from data, not from manual layout. The clusters that form are discovered, not designed.

**Constellations, not encyclopedias.** The Spellweb is for navigation and discovery. It should feel like looking at a night sky and recognizing patterns.

## Acknowledgments

The Spellweb approach is directly inspired by the **Landscape of Consciousness** visualization work by Deniz Cem Önduygu, with feature scoring by Eser Aygün and Amaç Herdağdelen, built on Robert Lawrence Kuhn's taxonomy.

---

*Privacy is Value. Understanding is Key.*

⚔️🧙📖∞
