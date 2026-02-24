# SpellWeb Integration Plan: agentprivacy_master → BGINAI Block14

## Overview

**Goal:** Incorporate the SpellWeb visualization from `agentprivacy_master` into the BGINAI Block14 application, replacing/enhancing the existing Sigma.js-based implementation with the react-force-graph-2d approach that visualizes agentic experiences.

## Key Differences Between Implementations

| Aspect | agentprivacy_master (Source) | BGINAI Block14 (Target) |
|--------|------------------------------|-------------------------|
| **Library** | react-force-graph-2d | Sigma.js + Graphology |
| **Layout** | D3 force-directed | ForceAtlas2 |
| **Node Types** | grimoire, spell, skill, persona, ceremony | spell, session, topic, source, grimoire |
| **Styling** | Canvas-based with emoji rendering | Sigma.js node programs |
| **Data Source** | Grimoire baked data + local storage | Spellbook entries API |

## Integration Strategy

Adopt the **react-force-graph-2d** approach from agentprivacy_master because:
1. More visually polished with emoji rendering and glow effects
2. Better hover interactions and fullscreen mode
3. Semantic link styling (dashed sequences, constellation paths)
4. Already complete and tested

---

## Phase 1: Install Dependencies

### Files to Modify
- `package.json`

### Tasks
1. Add `react-force-graph-2d` dependency (v1.29.x)
2. Ensure D3 is available (usually bundled with react-force-graph-2d)

```bash
npm install react-force-graph-2d
```

---

## Phase 2: Port SpellWeb Types

### Files to Create
- `src/lib/spellweb/types-agentic.ts` (new agentic types alongside existing)

### Tasks
1. Port `SpellwebNode` interface from agentprivacy:
   - `id`, `type`, `emoji`, `label`, `fullTitle`, `name`
   - `val` (size), `color`, `group`
   - `isLit`, `isOnPath`, `sequenceNumber`

2. Port `SpellwebLink` interface:
   - `source`, `target`, `type` (grimoire, sequence, cluster, constellation)

3. Port `SpellwebData` wrapper:
   - `nodes: SpellwebNode[]`, `links: SpellwebLink[]`

4. Map BGINAI concepts to agentprivacy concepts:
   | BGINAI Concept | → | Agentprivacy Equivalent |
   |----------------|---|-------------------------|
   | Working Group (IKP, FASE, etc.) | → | Grimoire |
   | Spellbook Entry (spell) | → | Spell node |
   | Session | → | Ceremony (hub node) |
   | Topic | → | Skill node |
   | Source/Document | → | Source node |

---

## Phase 3: Port Builder Logic

### Files to Create
- `src/lib/spellweb/builder-agentic.ts`

### Files to Reference
- `agentprivacy_master/src/lib/spellweb/builder.ts`
- `agentprivacy_master/src/lib/spellweb/labels.ts`

### Tasks
1. Create `buildAgenticSpellweb()` function that:
   - Takes BGINAI spellbook entries as input
   - Creates Working Group hub nodes (IKP 🔵, FASE 🟣, Cyber 🟢, Governance 🟠)
   - Creates spell nodes for each spellbook entry
   - Creates session nodes as connecting hubs
   - Links spells to their WG and session
   - Adds sequential connections for spells cast in order

2. Port grimoire/WG color and emoji mappings:
   ```typescript
   const WG_CONFIG = {
     ikp: { emoji: '🔵', color: '#3B82F6', label: 'IKP' },
     fase: { emoji: '🟣', color: '#8B5CF6', label: 'FASE' },
     cyber: { emoji: '🟢', color: '#10B981', label: 'Cyber' },
     governance: { emoji: '🟠', color: '#F59E0B', label: 'Governance' },
   };
   ```

3. Port label generation utilities from `labels.ts`:
   - Short labels for nodes (Roman numerals, numbers)
   - Sequence number extraction for ordering

4. Implement link type logic:
   - `grimoire` links: WG hub → spell (tight distance)
   - `sequence` links: spell → next spell in session
   - `cluster` links: session hub → spells in session
   - `constellation` links: cross-WG references (future)

---

## Phase 4: Create New Viewer Component

### Files to Create
- `src/components/spellbook/SpellwebViewerAgentic.tsx`

### Files to Reference
- `agentprivacy_master/src/components/spellweb/SpellwebViewer.tsx`

### Tasks
1. Create client-only component with dynamic import:
   ```typescript
   'use client';
   import dynamic from 'next/dynamic';

   const ForceGraph2D = dynamic(
     () => import('react-force-graph-2d'),
     { ssr: false }
   );
   ```

2. Port key features:
   - **Node rendering**: Canvas-based with emoji, labels, glow effects
   - **Link rendering**: Dashed lines for sequences, solid for constellations
   - **Hover tooltip**: Show fullTitle in corner overlay
   - **Fullscreen mode**: Expand with Esc to exit
   - **Legend**: WG colors and link types

3. Port D3 force configuration:
   ```typescript
   d3AlphaDecay: 0.02
   d3VelocityDecay: 0.3
   cooldownTicks: 100
   linkDistance: grimoire/cluster → 110, sequence → 220
   chargeStrength: -95
   ```

4. Port canvas rendering functions:
   - `nodeCanvasObject`: Draw circles with emoji, labels, gradient fills
   - `linkCanvasObject`: Draw styled lines with dashing patterns

5. Implement BGINAI-specific interactions:
   - Click node → open GlyphInspector (existing component)
   - Click spell → option to view in Mage chat context
   - Highlight "my" spells vs others

---

## Phase 5: Integrate with Existing Page

### Files to Modify
- `src/app/spellbook/spellweb/page.tsx`
- `src/components/spellbook/SpellwebNavigator.tsx`

### Tasks
1. Update SpellwebNavigator to use new viewer:
   - Keep existing Sigma.js version as fallback option
   - Add toggle or replace entirely based on preference

2. Update data fetching in spellweb page:
   - Fetch spellbook entries from `/api/spellbook/entries`
   - Transform through `buildAgenticSpellweb()`
   - Pass to new viewer component

3. Integrate with existing filters:
   - WG toggle filters (already exist)
   - Session filter
   - "My spells" filter

4. Preserve GlyphInspector integration:
   - Pass selected node to inspector
   - Show spell details, links, timestamps

---

## Phase 6: Add Agentic Experience Features

### Files to Create
- `src/lib/spellweb/journey.ts`

### Tasks
1. Implement "journey" tracking:
   - Track which spells user has cast/viewed
   - Mark nodes as `isLit` when part of user's journey
   - Create `isOnPath` connections for sequential exploration

2. Add constellation path logic:
   - Connect related spells across WGs
   - Use cross-WG references from MageChat as edges
   - Style as golden/highlighted "constellation" lines

3. Implement inscribed markers:
   - Allow user to set custom emoji on their spells
   - Store in local IndexedDB
   - Display custom emoji instead of default WG emoji

---

## Phase 7: Polish and Enhancement

### Tasks
1. **Responsive design**:
   - Mobile: simplified view with larger touch targets
   - Desktop: full interactive features
   - Fullscreen: optimized for exploration

2. **Performance**:
   - Memoize graph data construction
   - Limit visible nodes at low zoom
   - Use web workers for layout calculation if needed

3. **Accessibility**:
   - Keyboard navigation between nodes
   - Screen reader announcements for selected node
   - High contrast mode support

4. **Persistence**:
   - Save view state (zoom, pan position)
   - Remember last selected node
   - Cache graph layout for faster re-render

---

## File Summary

### New Files to Create
| Path | Purpose |
|------|---------|
| `src/lib/spellweb/types-agentic.ts` | Agentic node/link type definitions |
| `src/lib/spellweb/builder-agentic.ts` | Graph construction from spellbook entries |
| `src/lib/spellweb/labels-bgin.ts` | BGIN-specific label formatting |
| `src/lib/spellweb/journey.ts` | Journey/constellation tracking |
| `src/components/spellbook/SpellwebViewerAgentic.tsx` | react-force-graph-2d visualization |

### Files to Modify
| Path | Changes |
|------|---------|
| `package.json` | Add react-force-graph-2d |
| `src/app/spellbook/spellweb/page.tsx` | Wire up new viewer |
| `src/components/spellbook/SpellwebNavigator.tsx` | Use new viewer component |
| `src/components/spellbook/GlyphInspector.tsx` | Handle agentic node properties |

### Files to Reference (copy logic from)
| agentprivacy_master Path | Content to Port |
|--------------------------|-----------------|
| `src/components/spellweb/SpellwebViewer.tsx` | Full viewer component |
| `src/lib/spellweb/types.ts` | Type definitions |
| `src/lib/spellweb/builder.ts` | Graph building logic |
| `src/lib/spellweb/labels.ts` | Label utilities |

---

## Success Criteria

1. ✅ SpellWeb renders with react-force-graph-2d
2. ✅ WG hub nodes display with correct emoji/colors
3. ✅ Spellbook entries appear as connected spell nodes
4. ✅ Sessions create cluster relationships
5. ✅ Sequential casting creates path connections
6. ✅ Hover shows tooltip with spell details
7. ✅ Click opens GlyphInspector
8. ✅ Fullscreen mode works
9. ✅ Filters by WG work
10. ✅ User's journey is highlighted

---

## Estimated Complexity

- **Phase 1**: Low (dependency installation)
- **Phase 2**: Low (type definitions)
- **Phase 3**: Medium (builder logic adaptation)
- **Phase 4**: High (component port with customization)
- **Phase 5**: Medium (integration)
- **Phase 6**: Medium (agentic features)
- **Phase 7**: Low-Medium (polish)

---

## Notes

- The existing Sigma.js implementation in BGINAI is functional but less visually polished
- react-force-graph-2d provides better canvas control for emoji and glow effects
- Both implementations use force-directed layouts, so the transition should feel natural
- Key value-add: the "journey" visualization showing user's agentic path through knowledge
