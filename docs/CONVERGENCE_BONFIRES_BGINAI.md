# Convergence Document: Bonfires-Webapp + BGIN AI Integration

## Executive Summary

This document outlines the strategic convergence between **BGIN AI (Block 14)** and the **Bonfires-Webapp** platform, with a focus on knowledge graph visualization integration. The Bonfires platform provides production-ready Sigma.js/Graphology visualization capabilities that can directly enhance BGIN AI's currently stub-based graph rendering components.

---

## Repository Comparison Matrix

| Aspect | BGIN AI (Block 14) | Bonfires-Webapp |
|--------|-------------------|-----------------|
| **Framework** | Next.js 14+ / React 18 | Next.js 16 / React 19 |
| **Graph Visualization** | Grid-based cards (stub for D3) | Sigma.js 3.0 + Graphology |
| **Data Structure** | KnowledgeNode/KnowledgeMap interfaces | Graphology graph data model |
| **Storage** | IndexedDB (Dexie.js) local-first | React Query + server state |
| **State Management** | React Context | Zustand 5.x + React Query |
| **Web3** | None (cryptographic identity only) | RainbowKit + Wagmi + Viem |
| **AI Integration** | Claude API direct | agENT companions per Bonfire |
| **Architecture** | Three-graph, one-identity | Data rooms + Knowledge Network |

---

## Knowledge Graph Visualization: Current State

### BGIN AI — Current Implementation

**Location:** `src/components/dashboard/KnowledgeGraph.tsx`

The current implementation renders episodic memory as a **grid of topic cards**:

```typescript
interface KnowledgeNode {
  id: string;
  topic: string;
  workingGroup: string;
  depth: number;           // interaction count
  firstExplored: string;
  lastExplored: string;
  relatedNodes: string[];
}
```

**Rendering:** Static CSS grid layout with WG badges and depth indicators. No interactive graph traversal.

**Trust Network (`NetworkViz.tsx`):** Currently a placeholder stub awaiting D3 implementation.

### Bonfires-Webapp — Sigma.js Implementation

**Location:** `src/components/graph/`

The Bonfires platform provides a mature graph visualization stack:

| Component | Purpose |
|-----------|---------|
| `SigmaGraph.tsx` | Sigma.js canvas rendering engine |
| `GraphVisualization.tsx` | Core visualization orchestration |
| `GraphExplorer.tsx` | Navigation and traversal UI |
| `NodeContextMenu.tsx` | Node interaction context menus |
| `ChatPanel.tsx` | Inline chat with graph context |
| `WikiPanel.tsx` | Node detail information panel |
| `Timeline.tsx` | Temporal evolution display |

**Technology:** Sigma.js 3.0 for WebGL rendering, Graphology 0.26.0 for graph data structures.

---

## Integration Opportunities

### 1. Replace Grid View with Interactive Sigma.js Graph

**Current Pain Point:** BGIN AI's `KnowledgeGraph.tsx` displays topics as static cards. Users cannot visually trace relationships or explore the graph structure interactively.

**Bonfires Solution:** Port `SigmaGraph.tsx` and `GraphVisualization.tsx` components to render BGIN AI's `KnowledgeMap` data as an interactive node-link diagram.

**Implementation Path:**
```
1. Add dependencies: sigma@3.0.0, graphology@0.26.0
2. Create adapter: KnowledgeMap → Graphology graph
3. Port SigmaGraph component with BGIN theme tokens
4. Wire WG-based node coloring (IKP=blue, FASE=purple, etc.)
5. Connect node click → Mage chat navigation
```

**Benefit:** Visual exploration of episodic memory as a force-directed graph with WG clustering.

---

### 2. Implement Trust Network Visualization

**Current Pain Point:** `NetworkViz.tsx` is a stub with no actual visualization.

**Bonfires Solution:** Adapt the multi-panel graph explorer architecture for trust network display.

**Data Mapping:**
```typescript
// Trust network as Graphology graph
interface TrustNode {
  id: string;              // Anonymized participant ID
  tier: 'observer' | 'contributor' | 'reviewer' | 'steward';
  workingGroups: string[];
  bonfireScore?: number;   // If Bonfires integration active
}

interface TrustEdge {
  source: string;
  target: string;
  agreementType: 'myterms' | 'promise' | 'attestation';
  timestamp: string;
}
```

**Visualization Features from Bonfires:**
- Force-directed layout with WG clustering
- Tier-based node sizing/coloring
- Edge highlighting on hover
- Context menu for attestation actions

---

### 3. Graph Explorer for Bonfire Knowledge

**When using Bonfires as knowledge graph provider (Option C from `11_BONFIRES_INTEGRATION.md`):**

Embed the Bonfires Graph Explorer directly:
- `https://graph.bonfires.ai/embed/{bonfireId}`
- Or use Bonfires Graph API to render locally with Sigma.js

**Integration Architecture:**
```
BGIN AI Dashboard
├── Personal Knowledge Map (local episodic memory → Sigma.js)
├── WG Knowledge Graph (Bonfires API → Sigma.js)
│   ├── IKP Bonfire Explorer
│   ├── FASE Bonfire Explorer
│   ├── Cyber Bonfire Explorer
│   └── Governance Bonfire Explorer
└── Trust Network (promise/attestation graph → Sigma.js)
```

---

### 4. Episodic Knowledge Graph Feature

As noted in the original request, Bonfires is building an **episodic knowledge graph** feature. This aligns directly with BGIN AI's episodic memory system.

**Convergence Points:**

| BGIN AI Concept | Bonfires Equivalent | Integration |
|-----------------|---------------------|-------------|
| Episodic Memory (IndexedDB) | Stigmergic Traces | Sync local traces to Bonfires |
| Topic Co-occurrence Edges | Knowledge Network edges | Build from interaction patterns |
| Depth (interaction count) | Stigmergic Depth | Paths deepen with use |
| WG-scoped memories | Bonfire-bounded contexts | Graph-level separation |

**Suggested Implementation:**

```typescript
// lib/bonfires/episodicSync.ts

export async function syncEpisodicToBonfire(
  localMap: KnowledgeMap,
  bonfireId: string
): Promise<void> {
  const traces = localMap.nodes.map(node => ({
    topic: node.topic,
    depth: node.depth,
    lastExplored: node.lastExplored,
    connections: node.relatedNodes,
  }));

  await fetch(`${BONFIRES_API}/bonfires/${bonfireId}/traces`, {
    method: 'POST',
    body: JSON.stringify({ traces }),
  });
}
```

This creates a bidirectional flow:
- **Local → Bonfires:** Personal episodic traces feed community knowledge network
- **Bonfires → Local:** Community stigmergic paths inform personal exploration

---

## Component Migration Checklist

### Phase 1: Dependencies & Infrastructure

- [ ] Add Sigma.js and Graphology to `package.json`
- [ ] Create `src/components/graph/` directory structure
- [ ] Port base `SigmaGraph.tsx` with BGIN theme variables
- [ ] Create Graphology adapter for `KnowledgeMap` type

### Phase 2: Personal Knowledge Graph

- [ ] Replace `KnowledgeGraph.tsx` grid with Sigma.js canvas
- [ ] Implement WG-based node coloring
- [ ] Add depth-based node sizing
- [ ] Connect node interactions to Mage navigation
- [ ] Preserve fallback grid view for accessibility

### Phase 3: Trust Network

- [ ] Implement `NetworkViz.tsx` with Sigma.js
- [ ] Create trust tier visual encoding
- [ ] Add anonymized node display
- [ ] Wire attestation actions to context menu

### Phase 4: Bonfires Integration

- [ ] Embed Graph Explorer iframe for WG Bonfires
- [ ] Implement episodic sync to Bonfires API
- [ ] Display stigmergic depth from Bonfires traces
- [ ] Show cross-Bonfire references in graph

---

## Code Snippets for Integration

### Graphology Adapter

```typescript
// lib/graph/adapter.ts
import Graph from 'graphology';
import type { KnowledgeMap } from '@/lib/curation/localMap';

const WG_COLORS: Record<string, string> = {
  ikp: '#3B82F6',      // Blue
  fase: '#8B5CF6',     // Purple
  cyber: '#10B981',    // Green
  governance: '#F59E0B', // Amber
};

export function knowledgeMapToGraphology(map: KnowledgeMap): Graph {
  const graph = new Graph();

  for (const node of map.nodes) {
    graph.addNode(node.id, {
      label: node.topic,
      size: Math.min(20, 5 + node.depth * 2),
      color: WG_COLORS[node.workingGroup] ?? '#6B7280',
      x: Math.random() * 100,
      y: Math.random() * 100,
      workingGroup: node.workingGroup,
      depth: node.depth,
    });
  }

  for (const edge of map.edges) {
    if (graph.hasNode(edge.source) && graph.hasNode(edge.target)) {
      graph.addEdge(edge.source, edge.target, {
        weight: edge.strength,
      });
    }
  }

  return graph;
}
```

### Sigma.js Component Skeleton

```typescript
// components/graph/EpisodicGraph.tsx
'use client';

import { useEffect, useRef } from 'react';
import Graph from 'graphology';
import Sigma from 'sigma';
import { knowledgeMapToGraphology } from '@/lib/graph/adapter';
import type { KnowledgeMap } from '@/lib/curation/localMap';

interface EpisodicGraphProps {
  knowledgeMap: KnowledgeMap;
  onNodeClick?: (nodeId: string, workingGroup: string) => void;
}

export default function EpisodicGraph({ knowledgeMap, onNodeClick }: EpisodicGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<Sigma | null>(null);

  useEffect(() => {
    if (!containerRef.current || knowledgeMap.nodes.length === 0) return;

    const graph = knowledgeMapToGraphology(knowledgeMap);

    sigmaRef.current = new Sigma(graph, containerRef.current, {
      renderEdgeLabels: false,
      defaultNodeColor: '#6B7280',
      defaultEdgeColor: '#E5E7EB',
    });

    sigmaRef.current.on('clickNode', ({ node }) => {
      const attrs = graph.getNodeAttributes(node);
      onNodeClick?.(node, attrs.workingGroup);
    });

    return () => {
      sigmaRef.current?.kill();
    };
  }, [knowledgeMap, onNodeClick]);

  if (knowledgeMap.nodes.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--border)] p-6 bg-[var(--bg-secondary)] min-h-[400px] flex items-center justify-center">
        <p className="text-[var(--text-muted)] text-sm">
          No topics yet. Chat with a Mage to build your knowledge map.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] min-h-[400px]"
    />
  );
}
```

---

## Architectural Alignment

### Graph-Level Separation Maintained

Both systems enforce structural boundaries:

| Boundary | BGIN AI | Bonfires |
|----------|---------|----------|
| WG isolation | Separate Mage agents | Separate Bonfire instances |
| Privacy | Swordsman mediates | Bounded knowledge contexts |
| Data sovereignty | IndexedDB local-first | agENT can't traverse absent edges |

The Sigma.js visualization can render **multiple graph layers** without collapsing these boundaries:
- Personal episodic graph (local)
- WG knowledge graph (Bonfires-bounded)
- Trust network (anonymized)

### Three-Graph Model Visualization

```
┌─────────────────────────────────────────────────────────────┐
│                    BGIN AI Dashboard                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ KNOWLEDGE    │  │   PROMISE    │  │    TRUST     │       │
│  │    GRAPH     │  │    GRAPH     │  │    GRAPH     │       │
│  │  (Sigma.js)  │  │  (Sigma.js)  │  │  (Sigma.js)  │       │
│  │              │  │              │  │              │       │
│  │ Local        │  │ Voluntary    │  │ Anonymized   │       │
│  │ Episodic +   │  │ Commitments  │  │ Bilateral    │       │
│  │ Bonfires WG  │  │ + Assessments│  │ Agreements   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                          ∩                                   │
│                      IDENTITY                                │
│                 (Swordsman layer)                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Recommendations

### Immediate Actions

1. **Install Sigma.js/Graphology** in BGIN AI
2. **Port `SigmaGraph.tsx`** from Bonfires as base component
3. **Create adapter** from `KnowledgeMap` → Graphology
4. **Replace grid view** in dashboard with interactive graph

### Medium-Term Integration

5. **Implement trust network** visualization with anonymization
6. **Add Bonfires API client** for knowledge retrieval
7. **Embed Graph Explorer** for WG Bonfire navigation
8. **Implement episodic sync** to Bonfires stigmergic traces

### Long-Term Convergence

9. **Bidirectional stigmergic flow** between local and Bonfires
10. **Cross-Bonfire references** surfaced in personal graph
11. **Bonfire Score** integration with trust tier calculation
12. **$KNOW token** mechanics for knowledge economy (optional)

---

## Summary

The Bonfires-Webapp provides a production-ready Sigma.js/Graphology visualization stack that directly addresses BGIN AI's current visualization gaps. The episodic knowledge graph feature being built by Bonfires aligns with BGIN AI's episodic memory system, creating natural integration points.

**Key Integration Value:**
- Replace stub components with interactive graph visualization
- Maintain graph-level separation (structural, not prompt-based)
- Enable visual exploration of the three-graph identity model
- Bridge local-first episodic memory with community knowledge network

The convergence preserves BGIN AI's core principles (Swordsman/Mage separation, local-first sovereignty, voluntary commitments) while gaining Bonfires' mature visualization and knowledge network infrastructure.

---

## Spellweb: Graph Navigation for the Spellbook

### Concept Overview

The **Spellweb** is a new navigation tab within the Spellbook that transforms the linear cast/entry view into an interactive knowledge graph visualization. Built on Bonfires' Sigma.js/Graphology stack, the Spellweb maps the relationships between casts, sessions, working groups, and cross-WG references as a navigable web.

**Location:** `/spellbook/spellweb` (new route)

### Terminology Mapping: Bonfires → BGIN AI Spellweb

| Bonfires Concept | Spellweb Equivalent | Description |
|------------------|---------------------|-------------|
| **Bonfire** | **Grimoire** | A WG-scoped collection of knowledge (IKP Grimoire, FASE Grimoire, etc.) |
| **Engram** | **Spell** | A single cast entry — the atomic unit of captured knowledge |
| **agENT** | **Mage** | The WG-specific AI companion that retrieves and generates spells |
| **Knowledge Network** | **Spellweb** | The graph connecting all spells across grimoires |
| **Stigmergic Trace** | **Thread** | A path through the graph that deepens with repeated traversal |
| **Stigmergic Depth** | **Thread Strength** | How many times a particular connection has been followed |
| **Hyperblog** | **Living Scroll** | A document that tracks its own retrieval and evolution |
| **Graph Explorer** | **Spellweb Navigator** | The interactive Sigma.js visualization interface |
| **Node** | **Glyph** | A visual element representing a spell, topic, or session |
| **Edge** | **Strand** | A connection between glyphs (co-occurrence, cross-WG ref, source) |
| **Delve** | **Scry** | The process of ingesting and indexing new knowledge |
| **Data Room** | **Sanctum** | A tokenized/permissioned knowledge space |
| **Bonfire Score** | **Arcane Resonance** | A measure of knowledge value/engagement |

### Spellweb Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SPELLBOOK                                    │
├─────────────────────────────────────────────────────────────────────┤
│  [🤝 Promises] [📅 Sessions] [📚 Grimoires] [🕸️ Spellweb] [✨ Recent] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                     SPELLWEB NAVIGATOR                         │ │
│  │                      (Sigma.js Canvas)                         │ │
│  │                                                                 │ │
│  │     🔐 IKP                              💎 FASE                │ │
│  │      ╭───╮                               ╭───╮                 │ │
│  │     │ ● │───────────────────────────────│ ● │                 │ │
│  │      ╰─┬─╯                               ╰─┬─╯                 │ │
│  │        │ thread                            │                   │ │
│  │        │                                   │                   │ │
│  │      ╭─┴─╮         ╭───╮                 ╭─┴─╮                 │ │
│  │     │ ● │────────│ ● │────────────────│ ● │                 │ │
│  │      ╰───╯         ╰───╯                 ╰───╯                 │ │
│  │       Spell        Session               Cross-WG              │ │
│  │                                                                 │ │
│  │     🛡️ Cyber                           🏛️ Governance          │ │
│  │      ╭───╮                               ╭───╮                 │ │
│  │     │ ● │                               │ ● │                 │ │
│  │      ╰───╯                               ╰───╯                 │ │
│  │                                                                 │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────────┐│
│  │ Glyph Inspector │ │ Thread Traces   │ │ Grimoire Filter         ││
│  │ (WikiPanel)     │ │ (Timeline)      │ │ [x] IKP [x] FASE        ││
│  │                 │ │                 │ │ [x] Cyber [x] Governance││
│  └─────────────────┘ └─────────────────┘ └─────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

### Data Model: Spellweb Graph

```typescript
// lib/spellweb/types.ts

/** A glyph is a node in the Spellweb */
export type GlyphType =
  | 'spell'      // A cast entry (SpellbookEntry)
  | 'session'    // A Block 14 session
  | 'topic'      // An extracted topic/concept
  | 'source'     // A referenced document
  | 'grimoire';  // A working group container

export interface Glyph {
  id: string;
  type: GlyphType;
  label: string;
  grimoire: string;          // Working group ID
  arcaneResonance: number;   // Engagement/value score
  firstScried: string;       // When first indexed
  lastInvoked: string;       // When last accessed
  metadata: {
    // Type-specific metadata
    query?: string;          // For spell glyphs
    sessionId?: string;      // For spell/session glyphs
    documentTitle?: string;  // For source glyphs
  };
}

/** A strand is an edge in the Spellweb */
export type StrandType =
  | 'cast_to'         // Spell → Session
  | 'cross_wg'        // Spell → Spell (cross-WG reference)
  | 'cites'           // Spell → Source
  | 'co_occurs'       // Topic → Topic (temporal co-occurrence)
  | 'contains'        // Grimoire → Spell
  | 'thread';         // Any repeated traversal path

export interface Strand {
  id: string;
  source: string;         // Glyph ID
  target: string;         // Glyph ID
  type: StrandType;
  threadStrength: number; // How many times traversed
  firstWoven: string;     // When edge created
  lastTraversed: string;  // When last followed
}

export interface SpellwebGraph {
  glyphs: Glyph[];
  strands: Strand[];
}
```

### Building the Spellweb from SpellbookEntries

```typescript
// lib/spellweb/builder.ts

import type { SpellbookEntry } from '@/app/spellbook/page';
import type { SpellwebGraph, Glyph, Strand } from './types';

export function buildSpellweb(entries: SpellbookEntry[]): SpellwebGraph {
  const glyphs: Map<string, Glyph> = new Map();
  const strands: Strand[] = [];
  const now = new Date().toISOString();

  // Create grimoire glyphs (one per WG)
  const grimoires = ['ikp', 'fase', 'cyber', 'governance'];
  for (const wg of grimoires) {
    glyphs.set(`grimoire:${wg}`, {
      id: `grimoire:${wg}`,
      type: 'grimoire',
      label: wg.toUpperCase(),
      grimoire: wg,
      arcaneResonance: 0,
      firstScried: now,
      lastInvoked: now,
      metadata: {},
    });
  }

  // Create session glyphs and spell glyphs
  const sessionGlyphs: Set<string> = new Set();

  for (const entry of entries) {
    // Spell glyph
    const spellId = `spell:${entry.id}`;
    glyphs.set(spellId, {
      id: spellId,
      type: 'spell',
      label: entry.mageQuery.slice(0, 40) + (entry.mageQuery.length > 40 ? '…' : ''),
      grimoire: entry.workingGroup,
      arcaneResonance: (entry.sources?.length ?? 0) + (entry.crossWgRefs?.length ?? 0),
      firstScried: entry.addedAt,
      lastInvoked: entry.addedAt,
      metadata: {
        query: entry.mageQuery,
        sessionId: entry.sessionId,
      },
    });

    // Session glyph (deduplicated)
    const sessionId = `session:${entry.sessionId}`;
    if (!sessionGlyphs.has(sessionId)) {
      sessionGlyphs.add(sessionId);
      glyphs.set(sessionId, {
        id: sessionId,
        type: 'session',
        label: entry.sessionTitle,
        grimoire: entry.workingGroup,
        arcaneResonance: 0,
        firstScried: entry.addedAt,
        lastInvoked: entry.addedAt,
        metadata: { sessionId: entry.sessionId },
      });
    }

    // Strand: Grimoire → Spell (contains)
    strands.push({
      id: `strand:contains:${entry.workingGroup}:${entry.id}`,
      source: `grimoire:${entry.workingGroup}`,
      target: spellId,
      type: 'contains',
      threadStrength: 1,
      firstWoven: entry.addedAt,
      lastTraversed: entry.addedAt,
    });

    // Strand: Spell → Session (cast_to)
    strands.push({
      id: `strand:cast:${entry.id}:${entry.sessionId}`,
      source: spellId,
      target: sessionId,
      type: 'cast_to',
      threadStrength: 1,
      firstWoven: entry.addedAt,
      lastTraversed: entry.addedAt,
    });

    // Strand: Spell → Source (cites)
    for (const source of entry.sources ?? []) {
      const sourceId = `source:${source.documentTitle}`;
      if (!glyphs.has(sourceId)) {
        glyphs.set(sourceId, {
          id: sourceId,
          type: 'source',
          label: source.documentTitle,
          grimoire: entry.workingGroup,
          arcaneResonance: 0,
          firstScried: entry.addedAt,
          lastInvoked: entry.addedAt,
          metadata: { documentTitle: source.documentTitle },
        });
      }
      strands.push({
        id: `strand:cites:${entry.id}:${source.documentTitle}`,
        source: spellId,
        target: sourceId,
        type: 'cites',
        threadStrength: 1,
        firstWoven: entry.addedAt,
        lastTraversed: entry.addedAt,
      });
    }

    // Strand: Spell → Cross-WG Spell (cross_wg)
    for (const ref of entry.crossWgRefs ?? []) {
      // Create a topic glyph for the cross-WG reference
      const topicId = `topic:${ref.workingGroup}:${ref.topic}`;
      if (!glyphs.has(topicId)) {
        glyphs.set(topicId, {
          id: topicId,
          type: 'topic',
          label: ref.topic,
          grimoire: ref.workingGroup,
          arcaneResonance: 0,
          firstScried: entry.addedAt,
          lastInvoked: entry.addedAt,
          metadata: {},
        });
      }
      strands.push({
        id: `strand:cross:${entry.id}:${ref.workingGroup}:${ref.topic}`,
        source: spellId,
        target: topicId,
        type: 'cross_wg',
        threadStrength: 1,
        firstWoven: entry.addedAt,
        lastTraversed: entry.addedAt,
      });
    }
  }

  // Update grimoire arcane resonance
  for (const strand of strands) {
    if (strand.type === 'contains') {
      const grimoire = glyphs.get(strand.source);
      if (grimoire) grimoire.arcaneResonance++;
    }
  }

  return {
    glyphs: Array.from(glyphs.values()),
    strands,
  };
}
```

### Graphology Adapter for Spellweb

```typescript
// lib/spellweb/adapter.ts

import Graph from 'graphology';
import type { SpellwebGraph } from './types';

const GRIMOIRE_COLORS: Record<string, string> = {
  ikp: '#3B82F6',        // Blue
  fase: '#8B5CF6',       // Purple
  cyber: '#10B981',      // Green
  governance: '#F59E0B', // Amber
};

const GLYPH_SIZES: Record<string, number> = {
  grimoire: 25,
  session: 15,
  spell: 10,
  topic: 8,
  source: 6,
};

export function spellwebToGraphology(web: SpellwebGraph): Graph {
  const graph = new Graph();

  for (const glyph of web.glyphs) {
    graph.addNode(glyph.id, {
      label: glyph.label,
      size: GLYPH_SIZES[glyph.type] + Math.min(5, glyph.arcaneResonance),
      color: GRIMOIRE_COLORS[glyph.grimoire] ?? '#6B7280',
      x: Math.random() * 100,
      y: Math.random() * 100,
      type: glyph.type,
      grimoire: glyph.grimoire,
      arcaneResonance: glyph.arcaneResonance,
    });
  }

  for (const strand of web.strands) {
    if (graph.hasNode(strand.source) && graph.hasNode(strand.target)) {
      try {
        graph.addEdge(strand.source, strand.target, {
          type: strand.type,
          weight: strand.threadStrength,
          color: strand.type === 'cross_wg' ? '#EF4444' : '#E5E7EB',
        });
      } catch {
        // Edge already exists, increment weight
        const existing = graph.getEdgeAttributes(strand.source, strand.target);
        graph.setEdgeAttribute(strand.source, strand.target, 'weight', existing.weight + 1);
      }
    }
  }

  return graph;
}
```

### Spellweb Navigator Component

```typescript
// components/spellbook/SpellwebNavigator.tsx
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Graph from 'graphology';
import Sigma from 'sigma';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import { spellwebToGraphology } from '@/lib/spellweb/adapter';
import { buildSpellweb } from '@/lib/spellweb/builder';
import type { SpellbookEntry } from '@/app/spellbook/page';
import type { Glyph } from '@/lib/spellweb/types';

interface SpellwebNavigatorProps {
  entries: SpellbookEntry[];
  onGlyphSelect?: (glyph: Glyph | null) => void;
  grimoireFilter?: string[];
}

export default function SpellwebNavigator({
  entries,
  onGlyphSelect,
  grimoireFilter,
}: SpellwebNavigatorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<Sigma | null>(null);
  const [hoveredGlyph, setHoveredGlyph] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || entries.length === 0) return;

    const spellweb = buildSpellweb(entries);

    // Filter by grimoire if specified
    const filteredGlyphs = grimoireFilter
      ? spellweb.glyphs.filter(g =>
          g.type === 'grimoire' || grimoireFilter.includes(g.grimoire)
        )
      : spellweb.glyphs;

    const filteredIds = new Set(filteredGlyphs.map(g => g.id));
    const filteredStrands = spellweb.strands.filter(
      s => filteredIds.has(s.source) && filteredIds.has(s.target)
    );

    const graph = spellwebToGraphology({
      glyphs: filteredGlyphs,
      strands: filteredStrands,
    });

    // Apply force-directed layout
    forceAtlas2.assign(graph, {
      iterations: 100,
      settings: {
        gravity: 1,
        scalingRatio: 2,
        barnesHutOptimize: true,
      },
    });

    sigmaRef.current = new Sigma(graph, containerRef.current, {
      renderEdgeLabels: false,
      defaultNodeColor: '#6B7280',
      defaultEdgeColor: '#E5E7EB',
      labelRenderedSizeThreshold: 8,
    });

    // Node hover
    sigmaRef.current.on('enterNode', ({ node }) => {
      setHoveredGlyph(node);
    });

    sigmaRef.current.on('leaveNode', () => {
      setHoveredGlyph(null);
    });

    // Node click
    sigmaRef.current.on('clickNode', ({ node }) => {
      const glyph = spellweb.glyphs.find(g => g.id === node);
      onGlyphSelect?.(glyph ?? null);
    });

    // Click on empty space
    sigmaRef.current.on('clickStage', () => {
      onGlyphSelect?.(null);
    });

    return () => {
      sigmaRef.current?.kill();
    };
  }, [entries, grimoireFilter, onGlyphSelect]);

  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--border)] p-6 bg-[var(--bg-secondary)] min-h-[400px] flex items-center justify-center">
        <p className="text-[var(--text-muted)] text-sm">
          No spells yet. Cast from a Mage chat to weave your Spellweb.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] min-h-[500px]"
      />
      {hoveredGlyph && (
        <div className="absolute bottom-4 left-4 bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm">
          <span className="text-[var(--text-muted)]">Glyph:</span>{' '}
          <span className="font-medium">{hoveredGlyph}</span>
        </div>
      )}
    </div>
  );
}
```

### Spellweb Page Route

```typescript
// app/spellbook/spellweb/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getParticipantId } from '@/lib/swordsman/signedFetch';
import SpellwebNavigator from '@/components/spellbook/SpellwebNavigator';
import GlyphInspector from '@/components/spellbook/GlyphInspector';
import { BLOCK14_WORKING_GROUPS } from '@/lib/block14/sessions';
import type { Glyph } from '@/lib/spellweb/types';

export default function SpellwebPage() {
  const router = useRouter();
  const [entries, setEntries] = useState([]);
  const [selectedGlyph, setSelectedGlyph] = useState<Glyph | null>(null);
  const [grimoireFilter, setGrimoireFilter] = useState<string[]>(
    BLOCK14_WORKING_GROUPS.map(g => g.id)
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getParticipantId().then((id) => {
      if (!id) router.replace('/ceremony');
    });
  }, [router]);

  useEffect(() => {
    fetch('/api/spellbook/entries')
      .then(res => res.json())
      .then(data => setEntries(data.entries ?? []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  const toggleGrimoire = (wg: string) => {
    setGrimoireFilter(prev =>
      prev.includes(wg)
        ? prev.filter(g => g !== wg)
        : [...prev, wg]
    );
  };

  return (
    <main className="min-h-screen p-6 md:p-8 max-w-7xl mx-auto">
      <Link href="/spellbook" className="text-sm text-[var(--text-muted)] hover:text-[var(--mage)] mb-4 inline-block">
        ← Spellbook
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">🕸️ Spellweb</h1>
        <p className="text-[var(--text-secondary)] text-sm">
          Navigate the threads between spells, sessions, and grimoires
        </p>
      </div>

      {/* Grimoire Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {BLOCK14_WORKING_GROUPS.map(g => (
          <button
            key={g.id}
            type="button"
            onClick={() => toggleGrimoire(g.id)}
            className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
              grimoireFilter.includes(g.id)
                ? 'border-[var(--mage)] bg-[var(--mage)]/10 text-[var(--text-primary)]'
                : 'border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-muted)]'
            }`}
          >
            {g.emoji} {g.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Spellweb Canvas */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="rounded-lg border border-[var(--border)] p-6 bg-[var(--bg-secondary)] min-h-[500px] flex items-center justify-center">
              <p className="text-[var(--text-muted)]">Weaving the Spellweb…</p>
            </div>
          ) : (
            <SpellwebNavigator
              entries={entries}
              onGlyphSelect={setSelectedGlyph}
              grimoireFilter={grimoireFilter}
            />
          )}
        </div>

        {/* Glyph Inspector Panel */}
        <div className="lg:col-span-1">
          <GlyphInspector glyph={selectedGlyph} />
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)]">
        <h3 className="text-sm font-semibold mb-3">Legend</h3>
        <div className="grid gap-2 sm:grid-cols-2 text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[#3B82F6]" /> IKP Grimoire
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[#8B5CF6]" /> FASE Grimoire
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[#10B981]" /> Cyber Grimoire
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[#F59E0B]" /> Governance Grimoire
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 bg-[#EF4444]" /> Cross-WG Thread
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 bg-[#E5E7EB]" /> Standard Strand
          </div>
        </div>
      </div>
    </main>
  );
}
```

### Glyph Inspector Component

```typescript
// components/spellbook/GlyphInspector.tsx
'use client';

import Link from 'next/link';
import type { Glyph } from '@/lib/spellweb/types';

interface GlyphInspectorProps {
  glyph: Glyph | null;
}

const GLYPH_ICONS: Record<string, string> = {
  grimoire: '📚',
  session: '📅',
  spell: '✨',
  topic: '💡',
  source: '📄',
};

export default function GlyphInspector({ glyph }: GlyphInspectorProps) {
  if (!glyph) {
    return (
      <div className="rounded-lg border border-[var(--border)] p-6 bg-[var(--bg-secondary)] min-h-[300px] flex items-center justify-center">
        <p className="text-[var(--text-muted)] text-sm text-center">
          Select a glyph in the Spellweb to inspect its threads
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-tertiary)]">
        <div className="flex items-center gap-2">
          <span className="text-xl">{GLYPH_ICONS[glyph.type]}</span>
          <div>
            <h3 className="font-semibold text-sm">{glyph.label}</h3>
            <p className="text-xs text-[var(--text-muted)] capitalize">{glyph.type} · {glyph.grimoire.toUpperCase()}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <p className="text-xs text-[var(--text-muted)] mb-1">Arcane Resonance</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--mage)] rounded-full"
                style={{ width: `${Math.min(100, glyph.arcaneResonance * 10)}%` }}
              />
            </div>
            <span className="text-sm font-medium">{glyph.arcaneResonance}</span>
          </div>
        </div>

        <div className="grid gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">First Scried</span>
            <span>{new Date(glyph.firstScried).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Last Invoked</span>
            <span>{new Date(glyph.lastInvoked).toLocaleDateString()}</span>
          </div>
        </div>

        {glyph.type === 'spell' && glyph.metadata.query && (
          <div>
            <p className="text-xs text-[var(--text-muted)] mb-1">Query</p>
            <p className="text-sm text-[var(--text-secondary)]">{glyph.metadata.query}</p>
          </div>
        )}

        {glyph.type === 'spell' && glyph.metadata.sessionId && (
          <Link
            href={`/spellbook?session=${glyph.metadata.sessionId}`}
            className="inline-block text-xs text-[var(--mage)] hover:underline"
          >
            View in Spellbook →
          </Link>
        )}

        {glyph.type === 'grimoire' && (
          <Link
            href={`/mage/${glyph.grimoire}`}
            className="inline-block text-xs text-[var(--mage)] hover:underline"
          >
            Chat with {glyph.grimoire.toUpperCase()} Mage →
          </Link>
        )}
      </div>
    </div>
  );
}
```

### Navigation Integration

Add the Spellweb tab to the existing Spellbook page:

```typescript
// In app/spellbook/page.tsx, add a navigation header:

<div className="flex gap-2 mb-6 border-b border-[var(--border)] pb-4">
  <Link
    href="/spellbook"
    className="px-4 py-2 rounded-lg bg-[var(--mage)]/10 border border-[var(--mage)] text-sm font-medium"
  >
    📜 List View
  </Link>
  <Link
    href="/spellbook/spellweb"
    className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm font-medium text-[var(--text-secondary)] hover:border-[var(--mage)] hover:text-[var(--mage)] transition-colors"
  >
    🕸️ Spellweb
  </Link>
</div>
```

### Thread Strengthening (Stigmergic Behavior)

When a user traverses a connection in the Spellweb (clicking through from one glyph to another), log the traversal to strengthen that thread:

```typescript
// lib/spellweb/threads.ts

export async function strengthenThread(
  sourceId: string,
  targetId: string
): Promise<void> {
  await fetch('/api/spellweb/threads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source: sourceId,
      target: targetId,
      traversedAt: new Date().toISOString(),
    }),
  });
}
```

This creates organic paths through the knowledge graph — threads that many participants follow become "brighter" and more prominent in the visualization.

### Bonfires Sync for Spellweb

When Bonfires episodic knowledge graph is integrated:

```typescript
// lib/bonfires/spellwebSync.ts

import type { SpellwebGraph } from '@/lib/spellweb/types';
import { BONFIRES_CONFIG } from './client';

export async function syncSpellwebToBonfire(
  web: SpellwebGraph,
  bonfireId: string
): Promise<void> {
  // Convert glyphs to engrams
  const engrams = web.glyphs
    .filter(g => g.type === 'spell')
    .map(glyph => ({
      id: glyph.id,
      content: glyph.metadata.query ?? glyph.label,
      labels: [glyph.grimoire, glyph.type],
      arcaneResonance: glyph.arcaneResonance,
    }));

  // Convert strands to network edges
  const edges = web.strands.map(strand => ({
    source: strand.source,
    target: strand.target,
    type: strand.type,
    strength: strand.threadStrength,
  }));

  const config = BONFIRES_CONFIG.bonfires[bonfireId];
  await fetch(`${config.apiEndpoint}/episodic`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ engrams, edges }),
  });
}
```

---

*Generated for BGIN AI Block 14 integration planning*
