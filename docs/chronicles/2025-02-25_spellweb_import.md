# Chronicle: Spellweb Import from AgentPrivacy Master

**Date**: February 25, 2025
**Author**: Claude (assisted)
**Type**: Feature Import

---

## Summary

Imported the Spellweb knowledge graph visualization from `agentprivacy_master` into `BGINAI_Block14`. This brings the mature, feature-rich force-directed graph visualization to the BGIN AI platform, complementing the existing session-based web view.

## Motivation

The `agentprivacy_master` Spellweb was identified as the best version of the web visualization, featuring:

- **Richer type system**: Guild colors, maturity sizing, complexity shapes, 6-dimensional profiles
- **Pure D3.js/SVG rendering**: Cleaner than canvas-based react-force-graph-2d
- **Semantic edge styling**: Dashed lines for echoes, gradients for guild bridges, arrows for principle extends
- **Static data model**: JSON-based nodes/edges for reproducible constellation mapping

The BGINAI version had a different focus (session-based, dynamic data) but lacked the visual polish and semantic richness of the AgentPrivacy implementation.

## What Was Imported

### Files Created

| File | Source | Description |
|------|--------|-------------|
| `src/lib/spellweb/kg-types.ts` | Adapted from `agentprivacy_master/src/lib/spellweb/kg-types.ts` | Knowledge graph types (Guild, Maturity, NodeType, EdgeType, SpellwebKGNode, SpellwebKGEdge) |
| `src/lib/spellweb/kg-loader.ts` | Adapted from `agentprivacy_master/src/lib/spellweb/loader.ts` | Static JSON loader with validation |
| `src/components/spellbook/ForceGraphKG.tsx` | Adapted from `agentprivacy_master/src/app/spellweb/components/ForceGraph.tsx` | D3 force-directed graph with polygon shapes, guild colors |
| `src/app/spellweb/page.tsx` | New, based on `agentprivacy_master/src/app/spellweb/page.tsx` | Spellweb page with NodeDetail panel |
| `public/spellweb/nodes.json` | Copied from `agentprivacy_master/public/spellweb/nodes.json` | 16 nodes (tales, protocols, standards) |
| `public/spellweb/edges.json` | Copied from `agentprivacy_master/public/spellweb/edges.json` | 15 edges (principle_extends, implements, etc.) |
| `docs/SPELLWEB.md` | Adapted from `agentprivacy_master/SPELLWEB.md` | Documentation with BGINAI context |

### Key Adaptations

1. **Renamed loader**: `loader.ts` → `kg-loader.ts` to avoid conflict with existing BGINAI loader
2. **Component naming**: `ForceGraph.tsx` → `ForceGraphKG.tsx` to distinguish from agentic viewer
3. **Path prefixes**: All imports use `@/lib/spellweb/kg-*` pattern
4. **BGINAI integration**: Added link to `/web` (session web) from spellweb page header
5. **Hover tooltip**: Enhanced with node summary display

## Architecture After Import

BGINAI now has **two complementary graph views**:

```
/spellweb   →  ForceGraphKG (D3/SVG)
               Static JSON data
               Tales, protocols, standards
               Guild/maturity/complexity encoding

/web        →  SpellwebViewerAgentic (Canvas/react-force-graph-2d)
               API-driven dynamic data
               Sessions, casts, proverbs
               WG filtering, draw mode
```

Both views share the `src/lib/spellweb/` directory but use different type systems:
- `kg-types.ts` + `kg-loader.ts` for static knowledge graph
- `types.ts` + `types-agentic.ts` + `builder-agentic.ts` for session web

## Visual Encoding Reference

| Feature | Encoding |
|---------|----------|
| Guild | Color (amber=swordsman, violet=mage, bronze=emergent, jade=bridge) |
| Maturity | Size (8px concept → 28px deployed) |
| Complexity | Shape (circle=1, triangle=3, ..., hexagon=6) |
| Edge type | Style (dashed=echo/dependency, arrow=extends, gradient=guild_bridge) |

## Data Model

### SpellwebKGNode
```typescript
{
  id: string;
  label: string;
  type: 'tale' | 'protocol' | 'standard' | 'primitive';
  guild: 'swordsman' | 'mage' | 'emergent' | 'bridge';
  protocolFamily: string;
  dimensions: { d1Hide, d2Commit, d3Prove, d4Connect, d5Reflect, d6Delegate };
  privacyDelegationPosition: number; // 0=privacy, 1=delegation
  dimensionalScale: number;
  complexity: 1-6;
  maturity: 'concept' | 'spec' | 'implementation' | 'deployed';
  inscriptions: string[];
  summary: string;
  standards: string[];
  taleUrl?: string;
  externalUrl?: string;
}
```

### SpellwebKGEdge
```typescript
{
  source: string;
  target: string;
  type: 'inscription_echo' | 'principle_extends' | 'implements' | 'guild_bridge' | 'dependency';
  strength: number;
}
```

## Next Steps

1. **Expand node dataset**: Add remaining tales (7-9, 11-14, 16-30) and more protocols/standards
2. **Paradox Plane mode**: Implement scatter plot view with privacy-delegation X-axis and dimensional Y-axis
3. **Cross-linking**: Connect spellweb nodes to session web nodes where relevant
4. **RPP-gated edges**: Some connections visible only after demonstrating understanding

## Infrastructure Cleanup

After the import, a redundancy analysis identified unused Sigma.js infrastructure that was superseded by the react-force-graph-2d implementation. The following files were removed:

### Files Deleted

| File | Reason |
|------|--------|
| `src/components/spellbook/SpellwebNavigator.tsx` | Sigma.js lazy-loader wrapper — not imported by any page |
| `src/components/spellbook/SpellwebNavigatorCanvas.tsx` | Sigma.js canvas viewer — superseded by `SpellwebViewerAgentic` |
| `src/lib/spellweb/adapter.ts` | Graphology converter — only used by deleted Sigma viewer |

### Files Refactored

| File | Change |
|------|--------|
| `src/lib/spellweb/builder.ts` | Removed `buildSpellweb()` function (only used by Sigma viewer); kept `SpellbookEntryInput` interface (still used by `/web` page and `builder-agentic.ts`) |

### Final File Structure

```
src/lib/spellweb/
├── kg-types.ts        # Knowledge graph types (new)
├── kg-loader.ts       # KG JSON loader (new)
├── types.ts           # Session web types (Glyph, Strand) — kept for GlyphInspector
├── types-agentic.ts   # Agentic node/link types
├── builder.ts         # SpellbookEntryInput interface only (refactored)
├── builder-agentic.ts # Agentic graph builder
└── dummyData.ts       # Fallback demo data

src/components/spellbook/
├── ForceGraphKG.tsx           # D3 KG visualization (new)
├── GlyphInspector.tsx         # Node detail panel (unchanged)
└── SpellwebViewerAgentic.tsx  # react-force-graph viewer (unchanged)
```

### Dependencies Removed

The following npm packages may now be unused and could be removed from `package.json`:
- `sigma` (Sigma.js WebGL graph renderer)
- `graphology` (graph data structure for Sigma)
- `graphology-layout-forceatlas2` (ForceAtlas2 layout algorithm)

Run `npm ls sigma graphology` to verify before removing.

---

*"The gap is the feature."*

⚔️🧙📖∞
