# BGIN Spellweb Styling Update Plan

## Overview

Update the BGIN spellweb (`SpellwebViewerAgentic.tsx`) to match the beautiful spellweb template while maintaining its organic, generative nature for conference use.

**Goal:** The BGIN spellweb will be dynamically built during the conference through user interactions, using the same visual template as the reference spellweb.

---

## Key Style Differences to Align

| Element | Current BGIN | Target Spellweb |
|---------|-------------|-----------------|
| Background | `#0a0a0f` | `#06060e` (darker navy) |
| Accent | `#7c6bff` (mage purple) | `#ffd700` (gold) |
| Panel BG | `#12121a` | `#0c0c18` |
| Border | `#2a2a3a` | `#1a1a30` |
| Text | `#e8e8f0` | `#c8c8d8` (lavender tint) |
| Text Dim | `#555570` | `#666680` |
| Display Font | System | Cormorant Garamond |
| Sans Font | System | IBM Plex Sans |
| Mono Font | System | JetBrains Mono |

---

## Implementation Steps

### Phase 1: Typography & Core Colors

#### 1.1 Add Google Fonts to `index.html` or `layout.tsx`
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=IBM+Plex+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

#### 1.2 Update `globals.css` CSS Variables
```css
:root {
  /* Spellweb-aligned colors */
  --bg-primary: #06060e;
  --bg-panel: #0c0c18;
  --bg-tertiary: #12121a;
  --border: #1a1a30;

  --text-primary: #c8c8d8;
  --text-dim: #666680;
  --text-bright: #e8e8f0;

  --accent: #ffd700;           /* Gold - primary accent */
  --accent-dim: #ffd70040;     /* 25% opacity gold */

  /* Domain colors (keep WG colors but add spellweb domains) */
  --swordsman: #e94560;
  --swordsman-fill: #8b1a2b;
  --mage: #7b68ee;
  --mage-fill: #3b2d7a;
  --first-person: #ffd700;
  --first-person-fill: #6b5a00;
  --shared: #00d9ff;
  --shared-fill: #0a4a5c;

  /* Fonts */
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
}
```

#### 1.3 Update Tailwind Config
```typescript
// tailwind.config.ts
extend: {
  colors: {
    background: '#06060e',
    panel: '#0c0c18',
    'panel-border': '#1a1a30',
    accent: '#ffd700',
    text: {
      DEFAULT: '#c8c8d8',
      dim: '#666680',
      bright: '#e8e8f0'
    },
  },
  fontFamily: {
    display: ['"Cormorant Garamond"', 'serif'],
    sans: ['"IBM Plex Sans"', 'sans-serif'],
    mono: ['"JetBrains Mono"', 'monospace'],
  },
}
```

---

### Phase 2: Button Styles

#### 2.1 Filter/Toggle Buttons (transparent → tinted)
**Pattern from spellweb:**
```css
/* Inactive state */
background: transparent;
border: 1px solid transparent;
color: var(--text-dim);

/* Active state */
background: ${color}15;        /* 9% opacity tint */
border: 1px solid ${color}40;  /* 25% opacity border */
color: ${color};

/* Hover */
transition: all 0.15s;
```

**Update `Button.tsx` variants:**
```typescript
const variants = {
  filter: `
    bg-transparent border border-transparent text-[var(--text-dim)]
    data-[active=true]:bg-accent/10 data-[active=true]:border-accent/25
    data-[active=true]:text-accent
    hover:border-[var(--border)] transition-all duration-150
  `,
  primary: `
    bg-accent text-[#000] font-semibold
    hover:bg-accent/90 transition-all duration-150
  `,
  secondary: `
    bg-transparent border border-[var(--border)] text-[var(--text-primary)]
    hover:border-accent/40 transition-all duration-150
  `,
  ghost: `
    bg-transparent text-[var(--text-dim)]
    hover:bg-panel hover:text-[var(--text-primary)] transition-all duration-150
  `,
};
```

#### 2.2 Action Buttons (Connect, Reflect, Cast)
```css
/* Enabled */
padding: 10px 24px;
border-radius: 6px;
background: #2ecc71;     /* Green for confirm */
color: #000;
font-weight: 600;
font-size: 12px;
cursor: pointer;

/* Disabled */
background: #2ecc7140;
color: #ffffff60;
cursor: not-allowed;

/* Cancel */
background: transparent;
border: 1px solid var(--border);
color: var(--text-dim);
```

#### 2.3 Edge Type Selector Buttons
```css
padding: 6px 12px;
border-radius: 4px;
font-family: 'JetBrains Mono', monospace;
font-size: 11px;

/* Inactive */
background: transparent;
border: 1px solid var(--border);
color: var(--text-dim);

/* Active (color-coded by type) */
background: ${edgeColor}30;   /* 19% opacity */
border: 1px solid ${edgeColor};
color: ${edgeColor};
```

---

### Phase 3: Graph Visualization Updates

#### 3.1 Add SVG Glow Filters
Add to the component's SVG defs (or canvas equivalent):
```jsx
<defs>
  {/* Standard glow */}
  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="3" result="blur" />
    <feMerge>
      <feMergeNode in="blur" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>

  {/* Strong glow for spells/highlights */}
  <filter id="glowStrong" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="6" result="blur" />
    <feMerge>
      <feMergeNode in="blur" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>
</defs>
```

For canvas rendering, simulate glow with:
```javascript
// In nodeCanvasObject
ctx.shadowColor = node.color;
ctx.shadowBlur = node.isHighlighted ? 12 : 6;
ctx.beginPath();
ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI);
ctx.fillStyle = node.color;
ctx.fill();
ctx.shadowBlur = 0; // Reset
```

#### 3.2 Edge Styling Theme
```typescript
const EDGE_STYLES = {
  defines: { color: '#00d9ff', width: 1.5, dash: null },
  proves: { color: '#e74c3c', width: 2, dash: null, arrow: true },
  implements: { color: '#7b68ee', width: 1.5, dash: null, arrow: true },
  extends: { color: '#2ecc71', width: 1.2, dash: null },
  narrates: { color: '#2ecc71', width: 1.5, dash: [4, 4] },
  follows: { color: '#2ecc71', width: 3, dash: null },
  references: { color: '#444460', width: 0.8, dash: [2, 4] },
  compresses_to: { color: '#ffd700', width: 2, dash: [6, 3] },
  contradicts: { color: '#ff4444', width: 1.5, dash: [2, 2] },
  connection: { color: '#ffd700', width: 1.5, dash: [3, 3] }, // User-drawn
  sequence: { color: '#666680', width: 1, dash: [5, 5] },
  grimoire: { color: '#444460', width: 1, dash: null },
  cluster: { color: '#444460', width: 1, dash: null },
};
```

#### 3.3 Node Visual Updates
```typescript
const NODE_VISUALS = {
  grimoire: { fill: '#1e1e3a', stroke: '#3a3a5c', size: 28 },
  spell: { fill: '#5c4a00', stroke: '#ffd700', size: 16, glow: 'strong' },
  session: { fill: '#0a4a2a', stroke: '#2ecc71', size: 20 },
  proverb: { fill: '#5c1a1a', stroke: '#e74c3c', size: 14 },
  topic: { fill: '#2a1a4a', stroke: '#a78bfa', size: 18 },
  source: { fill: '#1a1a2a', stroke: '#555570', size: 12 },
};
```

#### 3.4 Opacity States
```typescript
const OPACITY = {
  default: 0.85,
  highlighted: 1.0,
  dimmed: 0.2,
  search_match: 1.0,
  search_no_match: 0.15,
  edge_default: 0.35,
  edge_highlighted: 0.8,
  edge_dimmed: 0.05,
};
```

---

### Phase 4: Header Component

Update header to match spellweb style:

```jsx
<header style={{
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  height: 56,
  background: 'rgba(12, 12, 24, 0.9)',
  backdropFilter: 'blur(12px)',
  borderBottom: '1px solid #1a1a30',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 24px',
  zIndex: 80,
}}>
  {/* Logo */}
  <div style={{
    fontFamily: '"Cormorant Garamond", serif',
    fontSize: 18,
    fontWeight: 700,
    color: '#ffd700',
    letterSpacing: 1,
  }}>
    BGIN SPELLWEB
  </div>

  {/* Search */}
  <input style={{
    maxWidth: 400,
    flex: 1,
    margin: '0 24px',
    padding: '8px 14px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid #1a1a30',
    borderRadius: 6,
    color: '#c8c8d8',
    fontFamily: '"IBM Plex Sans", sans-serif',
    fontSize: 13,
  }} />

  {/* Stats */}
  <div style={{
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 10,
    color: '#666680',
  }}>
    {nodes.length} nodes · {links.length} edges
  </div>
</header>
```

---

### Phase 5: Side Panel / Node Inspector

```jsx
<aside style={{
  position: 'fixed',
  right: 0,
  top: 0,
  bottom: 0,
  width: 380,
  background: '#0c0c18',
  borderLeft: '1px solid #1a1a30',
  padding: 24,
  overflowY: 'auto',
  zIndex: 100,
  transform: selectedNode ? 'translateX(0)' : 'translateX(100%)',
  transition: 'transform 0.2s ease-out',
}}>
  {/* Type label */}
  <div style={{
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 11,
    color: '#666680',
    textTransform: 'uppercase',
    letterSpacing: 1,
  }}>
    {selectedNode?.type}
  </div>

  {/* Close button */}
  <button style={{
    position: 'absolute',
    top: 24,
    right: 24,
    background: 'transparent',
    border: 'none',
    color: '#666680',
    fontSize: 18,
    cursor: 'pointer',
  }}>×</button>

  {/* Title */}
  <h2 style={{
    fontFamily: '"Cormorant Garamond", serif',
    fontSize: 20,
    fontWeight: 600,
    color: '#e8e8f0',
    marginTop: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  }}>
    <span style={{ fontSize: 24 }}>{selectedNode?.emoji}</span>
    {selectedNode?.label}
  </h2>

  {/* Reflection textarea */}
  <textarea style={{
    width: '100%',
    minHeight: 120,
    marginTop: 16,
    padding: 12,
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid #1a1a30',
    borderRadius: 6,
    color: '#c8c8d8',
    fontFamily: '"IBM Plex Sans", sans-serif',
    fontSize: 13,
    resize: 'vertical',
  }} placeholder="Add your reflection..." />

  {/* Action buttons */}
  <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
    <button className="secondary">Connect</button>
    <button className="primary">Save Reflection</button>
  </div>
</aside>
```

---

### Phase 6: Legend Component

```jsx
<div style={{
  position: 'absolute',
  bottom: 24,
  right: selectedNode ? 404 : 24,
  minWidth: 280,
  padding: 16,
  background: 'rgba(12, 12, 24, 0.95)',
  border: '1px solid #1a1a30',
  borderRadius: 8,
  transition: 'right 0.2s ease-out',
}}>
  <h4 style={{
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 10,
    color: '#666680',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  }}>Legend</h4>

  {/* Node types with colored dots */}
  {/* Edge types with colored lines */}
</div>
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/app/layout.tsx` | Add Google Fonts links |
| `src/app/globals.css` | Update CSS variables |
| `tailwind.config.ts` | Add color/font extensions |
| `src/components/ui/Button.tsx` | Add filter/action variants |
| `src/components/spellbook/SpellwebViewerAgentic.tsx` | Node/edge styling, glow, opacity |
| `src/components/spellbook/SpellwebHeader.tsx` | Create new header component |
| `src/components/spellbook/SpellwebInspector.tsx` | Create new side panel component |
| `src/components/spellbook/SpellwebLegend.tsx` | Create new legend component |
| `src/styles/theme.ts` | Add spellweb theme tokens |

---

## Generative Conference Features

The BGIN spellweb will grow organically during Block 14:

1. **User Connections** - Participants draw edges between nodes, adding reflections
2. **Session Nodes** - Each conference session adds nodes to the web
3. **Constellation Mode** - Mark meaningful nodes with custom emoji
4. **Waypoint Paths** - Build journeys through the knowledge graph
5. **Export & Share** - "Path the Stars" export as markdown

All user-generated content persists in localStorage and can be aggregated.

---

## Implementation Priority

1. **Core styling** (colors, fonts) - Foundation
2. **Button styles** - User interaction quality
3. **Graph visuals** (glow, edges) - Visual impact
4. **Header & panels** - UI polish
5. **Legend** - Usability

Ready to implement when approved.
