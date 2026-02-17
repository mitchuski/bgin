# BGIN AI Block 14 Alignment: AgentPrivacy Architecture Comparison

**Document Version:** 1.0
**Date:** 2026-02-16
**Purpose:** Technical comparison between agentprivacy_master and BGIN AI frontends, mapping the dual-agent model to Archive/Codex/Discourse agent system for Block 14 deployment.

---

## Executive Summary

This document provides a technical comparison for aligning BGIN AI with the agentprivacy architecture. The core insight is mapping the **Mage/Swordsman dual-agent model** to BGIN's **three-agent system**:

| AgentPrivacy Role | BGIN Agent | Function | Primitive |
|-------------------|------------|----------|-----------|
| **Mage (Soulbae)** | **Archive Agent** | Knowledge, RAG, understanding | Knowledge Graph |
| **Swordsman (Soulbis)** | **Codex Agent** | Actions, promises, execution | Trust Primitives |
| **Human + Mage** | **Discourse Agent** | Distribution, community understanding | Trust Graph Distribution |

The **First Person** remains the human sovereign who delegates to these agents through bilateral promise exchange.

---

## 1. Architectural Philosophy Comparison

### AgentPrivacy: Dual-Agent Model

```
                    ┌─────────────────┐
                    │   FIRST PERSON   │
                    │       (Human)    │
                    └────────┬────────┘
                             │
                 (Complete Private Context X)
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
            ┌───────────────┐ ┌──────────────┐
            │  SWORDSMAN ⚔️  │ │   MAGE 🧙    │
            │  (Actions)    │ │  (Knowledge) │
            └───────────────┘ └──────────────┘
                    │                │
         THE GAP: s ⊥ m | X (Conditional Independence)
```

**Key Properties:**
- Information-theoretic separation: `I(X; s,m) ≤ I(X;s) + I(X;m)`
- Reconstruction ceiling: `R < 1`
- Promise polarity: Mage (+gives), Swordsman (-uses)

### BGIN AI: Three-Agent Model (Block 14 Target)

```
                    ┌─────────────────┐
                    │   FIRST PERSON   │
                    │       (Human)    │
                    └────────┬────────┘
                             │
                 (Sovereign Context with DIDs)
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  ARCHIVE 🧙   │   │  CODEX ⚔️     │   │  DISCOURSE 🌐 │
│  (Knowledge)  │   │  (Actions)    │   │  (Trust Dist) │
│  Blue Theme   │   │  Purple Theme │   │  Green Theme  │
└───────────────┘   └───────────────┘   └───────────────┘
        │                    │                    │
        └────────────────────┴────────────────────┘
                             │
              Trust Graph Primitives Formation
```

**Proposed Properties:**
- Separation maintained between knowledge (Archive) and execution (Codex)
- Discourse bridges human understanding with knowledge distribution
- Trust graph emerges from bilateral exchanges across all three

---

## 2. Agent Role Mapping

### Archive Agent = Mage (Knowledge)

| Aspect | AgentPrivacy Mage | BGIN Archive Agent |
|--------|-------------------|-------------------|
| **Core Function** | Helps craft proverbs, narrates understanding | RAG queries, document analysis, knowledge discovery |
| **Model** | NEAR Cloud AI (gpt-oss-120b) in TEE | Multi-provider (Anthropic, OpenAI, Ollama) |
| **Knowledge Source** | 5 Spellbooks (Story, Zero, Canon, Society, Plurality) | BGIN Working Group documents, research archives |
| **Privacy** | Session-bounded (6 queries), no storage | Privacy levels (Maximum, High, Selective, Minimal) |
| **Output** | `[RPP Proverb: ...]` format | Structured research insights, citations |
| **Theme Color** | Primary (Blue) | Blue |

**Alignment Actions:**
1. Adopt session-bounded privacy budget concept (φ-constrained queries)
2. Implement proverb-like "insight compression" for knowledge artifacts
3. Add TEE attestation display for model transparency
4. Integrate spellemoji-style semantic notation for BGIN concepts

### Codex Agent = Swordsman (Actions/Promises)

| Aspect | AgentPrivacy Swordsman | BGIN Codex Agent |
|--------|------------------------|------------------|
| **Core Function** | Controls transactions, executes on authorization | Policy analysis, compliance checking, verification |
| **Control** | User's wallet (Zashi) | Standards enforcement, governance actions |
| **Privacy** | z→z shielded transactions | Privacy-preserving verification |
| **Promise Polarity** | − (uses delegation) | − (executes validated policies) |
| **Never Sees** | What Mage says, oracle responses | Raw document content (only policy conclusions) |
| **Theme Color** | Secondary (Orange) | Purple |

**Alignment Actions:**
1. Implement promise theory primitives (+gives, -uses polarity)
2. Add "action authorization" flow similar to SwordsmanPanel
3. Create policy commitment format analogous to Zcash memo
4. Separate policy execution from knowledge retrieval

### Discourse Agent = Human + Mage (Distribution)

| Aspect | AgentPrivacy Concept | BGIN Discourse Agent |
|--------|---------------------|---------------------|
| **Core Function** | VRC formation, bilateral trust | Community collaboration, consensus building |
| **Trust Building** | Proverb → Inscription → VRC | Forum integration, knowledge graph distribution |
| **Graph Formation** | Single proverb compressed understanding | Multi-party trust network visualization |
| **Distribution** | Oracle broadcasts inscriptions | BGIN Discourse forum, community channels |
| **Theme Color** | Accent (Purple) | Green |

**Alignment Actions:**
1. Implement VRC (Verifiable Relationship Credential) concept
2. Add trust graph visualization with proverb-like compressed insights
3. Create bilateral exchange tracking between participants
4. Bridge forum activity to trust graph primitives

---

## 3. Frontend Architecture Comparison

### Technology Stack

| Aspect | AgentPrivacy | BGIN AI | Recommendation |
|--------|--------------|---------|----------------|
| **Framework** | Next.js 16 + React 19 | React 18 + Vite | Consider Next.js migration for SSR/ISR |
| **Styling** | Tailwind + CSS Variables | Tailwind | Adopt CSS variable theming pattern |
| **Animation** | Framer Motion | (None observed) | Add Framer Motion for polish |
| **State** | useState + localStorage | Zustand + Context | Keep Zustand, add localStorage persistence |
| **Markdown** | react-markdown | react-markdown | Consistent |
| **Types** | TypeScript 5 | TypeScript 5 | Consistent |

### Component Structure Comparison

**AgentPrivacy Pattern:**
```
src/
├── app/                    # Next.js pages
│   ├── mage/page.tsx       # Chat interface
│   ├── story/page.tsx      # Knowledge display
│   └── proverbs/page.tsx   # Inscriptions
├── components/
│   ├── SwordsmanPanel.tsx  # Fixed side panel, 3-step flow
│   ├── ChatMessage.tsx     # RPP format detection
│   ├── AttestationBadge.tsx
│   └── UAddressDisplay.tsx
└── lib/
    ├── soulbae.ts          # Mage chat logic
    └── zcash-memo.ts       # Transaction formatting
```

**BGIN AI Current:**
```
frontend/src/
├── components/
│   ├── BGINMultiAgentInterface.tsx  # 112KB monolith
│   ├── MainInterface.tsx            # Tab routing
│   ├── WorkingGroups.tsx
│   └── TrustNetwork.tsx
├── contexts/
│   ├── AgentContext.tsx
│   ├── AuthContext.tsx
│   └── PrivacyContext.tsx
└── services/
    └── localApiService.ts
```

**Recommended BGIN AI Structure (Block 14):**
```
frontend/src/
├── app/                           # Consider Next.js migration
├── components/
│   ├── agents/
│   │   ├── ArchivePanel.tsx       # Mage-style: knowledge chat + insight compression
│   │   ├── CodexPanel.tsx         # Swordsman-style: action authorization
│   │   └── DiscoursePanel.tsx     # VRC-style: trust distribution
│   ├── chat/
│   │   ├── AgentMessage.tsx       # RPP-style format detection
│   │   ├── InsightBadge.tsx       # Compressed knowledge display
│   │   └── AttestationBadge.tsx   # TEE/model transparency
│   ├── trust/
│   │   ├── TrustGraph.tsx         # Trust primitive visualization
│   │   ├── VRCDisplay.tsx         # Verifiable Relationship Credentials
│   │   └── PromiseFlow.tsx        # Promise exchange tracking
│   ├── knowledge/
│   │   ├── WorkingGroupCard.tsx   # Spellbook-style containers
│   │   ├── DocumentProcessor.tsx
│   │   └── RAGQueryInterface.tsx
│   └── layout/
│       ├── SidePanel.tsx          # SwordsmanPanel-style fixed panel
│       ├── Navigation.tsx
│       └── FirstPersonHeader.tsx
├── lib/
│   ├── archive.ts                 # Mage-equivalent chat logic
│   ├── codex.ts                   # Promise/action authorization
│   ├── discourse.ts               # VRC formation
│   └── trust-primitives.ts        # Trust graph operations
└── contexts/
    ├── FirstPersonContext.tsx     # Sovereign identity state
    ├── TrustGraphContext.tsx      # Trust primitive state
    └── PrivacyBudgetContext.tsx   # Session-bounded queries
```

---

## 4. UI/UX Pattern Adoption

### Side Panel Pattern (from SwordsmanPanel)

**Current AgentPrivacy:**
```tsx
// Fixed right-side panel with toggle
<motion.button className="fixed right-0 top-1/2 z-[60]">
  <div className="bg-primary/90 px-4 py-6 rounded-l-lg">
    <span>⚔️</span> Swordsman
  </div>
</motion.button>

<motion.div className="fixed right-0 top-0 h-full w-96 bg-surface">
  {/* 3-step flow */}
</motion.div>
```

**Recommended for BGIN (Agent Panel):**
```tsx
// Unified panel for active agent
<AgentPanel
  agent="archive" // or "codex" or "discourse"
  icon="🧙"
  title="Archive Agent"
  subtitle="Your knowledge companion"
>
  <InsightFlow />      {/* Step 1: Query/Learn */}
  <CompressFlow />     {/* Step 2: Compress understanding */}
  <CommitFlow />       {/* Step 3: Commit to trust graph */}
</AgentPanel>
```

### Chat Message Pattern (RPP Format → Insight Format)

**AgentPrivacy ChatMessage.tsx:**
```tsx
// Detects [RPP Proverb: ...] format
const rppMatch = content.match(/\[RPP\s+Proverb\s*:\s*([^\]]+)\]/i);
if (rppMatch) {
  return (
    <div className="bg-primary/20 border border-primary/30 rounded-lg p-3">
      <span className="text-xs text-primary/60">Proverb:</span>
      <p className="text-text font-medium">{rppMatch[1]}</p>
    </div>
  );
}
```

**Recommended for BGIN (Insight Format):**
```tsx
// Detects [BGIN Insight: ...] format for Archive Agent
// Detects [BGIN Action: ...] format for Codex Agent
// Detects [BGIN Trust: ...] format for Discourse Agent

const insightMatch = content.match(/\[BGIN\s+(Insight|Action|Trust)\s*:\s*([^\]]+)\]/i);
if (insightMatch) {
  const type = insightMatch[1].toLowerCase();
  const colors = {
    insight: 'blue',   // Archive
    action: 'purple',  // Codex
    trust: 'green',    // Discourse
  };
  return (
    <InsightBadge type={type} color={colors[type]}>
      {insightMatch[2]}
    </InsightBadge>
  );
}
```

### Privacy Budget Pattern

**AgentPrivacy (Mage Page):**
```tsx
const MAX_QUERIES = 6; // φ-constrained privacy budget

// Persisted per tale/session
const [privacyBudget, setPrivacyBudget] = useState(MAX_QUERIES);

// On query
setPrivacyBudget(prev => prev - 1);

// Display
<div className="text-xs text-text-muted">
  Queries remaining: {privacyBudget}/{MAX_QUERIES}
</div>
```

**Recommended for BGIN:**
```tsx
// Privacy budget per working group / session
const PRIVACY_BUDGETS = {
  maximum: 3,    // High privacy, limited queries
  high: 6,       // Balanced
  selective: 12, // More queries, selective disclosure
  minimal: 24,   // Full disclosure mode
};

// Context for First Person
const [budgets, setBudgets] = useState<Record<string, number>>({});

// Per-agent budget tracking
const getAgentBudget = (agentId: string, sessionId: string) => {
  return budgets[`${agentId}-${sessionId}`] ?? PRIVACY_BUDGETS[privacyLevel];
};
```

---

## 5. Trust Graph Primitives

### Core Concepts to Implement

**1. Verifiable Relationship Credentials (VRCs)**
```typescript
interface VRC {
  id: string;
  from: string;           // DID of initiator
  to: string;             // DID of recipient (agent or human)
  type: 'insight' | 'action' | 'trust';
  content: string;        // Compressed understanding
  timestamp: number;
  bilateral: boolean;     // true if reciprocated
  confidence: number;     // 0.0 - 1.0
  agent: 'archive' | 'codex' | 'discourse';
}
```

**2. Promise Exchange**
```typescript
interface Promise {
  agent: 'archive' | 'codex' | 'discourse';
  polarity: '+' | '-';    // +gives or -uses
  intent: string;
  condition?: string;
  consequence?: string;
  fulfilled: boolean;
}

// Archive (Mage): + polarity, gives knowledge
// Codex (Swordsman): - polarity, uses authorization
// Discourse: Bridges both, forms VRCs
```

**3. Trust Graph Node**
```typescript
interface TrustNode {
  id: string;                           // DID
  type: 'first-person' | 'archive' | 'codex' | 'discourse';
  insights: string[];                   // Compressed understandings
  vrcs: VRC[];                          // Bilateral relationships
  trustScore: number;                   // Computed from VRCs
  lastActivity: number;
}
```

### Trust Graph Formation Flow

```
1. First Person queries Archive Agent
   → Archive compresses knowledge into [BGIN Insight: ...]
   → First Person confirms understanding ("Learn" button)
   → VRC created: { from: firstPerson, to: archive, type: 'insight' }

2. First Person requests Codex action
   → Codex validates policy compliance
   → Creates [BGIN Action: ...] commitment
   → First Person authorizes execution
   → VRC created: { from: firstPerson, to: codex, type: 'action' }

3. Discourse distributes to community
   → Aggregates insights + actions
   → Forms [BGIN Trust: ...] summary
   → Community members acknowledge
   → Bilateral VRCs form trust graph edges
```

---

## 6. Specific Component Changes

### BGINMultiAgentInterface.tsx Refactoring

**Current State:** 112KB monolithic component

**Recommended Split:**

```
components/chat/
├── MultiAgentChat.tsx           # Main orchestrator (lean)
├── AgentSelector.tsx            # Agent switching UI
├── MessageList.tsx              # Message rendering
├── MessageInput.tsx             # Input with privacy budget
└── SessionManager.tsx           # Session/privacy state

components/agents/
├── ArchiveAgent/
│   ├── ArchiveChat.tsx          # Mage-style chat
│   ├── InsightExtractor.tsx     # [BGIN Insight: ...] detection
│   ├── KnowledgePanel.tsx       # Working group context
│   └── RAGQueryForm.tsx         # Query interface
├── CodexAgent/
│   ├── CodexChat.tsx            # Policy chat
│   ├── ActionCommit.tsx         # [BGIN Action: ...] creation
│   ├── PolicyValidator.tsx      # Compliance checking
│   └── AuthorizationFlow.tsx    # 3-step authorization
└── DiscourseAgent/
    ├── DiscourseChat.tsx        # Community chat
    ├── TrustDistribution.tsx    # VRC distribution
    ├── ConsensusBuilder.tsx     # Bilateral exchanges
    └── ForumIntegration.tsx     # BGIN forum bridge
```

### MainInterface.tsx Updates

**Add:**
1. First Person header with DID display
2. Trust graph summary widget
3. Privacy budget indicators per agent
4. VRC notification system

**Modify:**
- Tab system → Agent-centric navigation
- Knowledge Archives → Archive Agent interface
- First Person Agent → First Person Dashboard (not an agent, the sovereign)

---

## 7. Data Flow Alignment

### AgentPrivacy Flow (Reference)

```
User reads tale → Chats with Soulbae → Derives proverb
→ Pastes in SwordsmanPanel → Formats Zcash memo
→ Sends z→z transaction → Oracle verifies
→ Inscription created → VRC formed
```

### BGIN AI Flow (Block 14 Target)

```
First Person selects Working Group → Queries Archive Agent
→ Archive returns [BGIN Insight: compressed knowledge]
→ First Person confirms understanding (like "Learn" button)
→ Insight stored in trust graph

First Person needs policy action → Queries Codex Agent
→ Codex validates against governance framework
→ Returns [BGIN Action: policy commitment]
→ First Person authorizes (like "Copy Memo to Zashi")
→ Action recorded with promise primitives

Discourse Agent aggregates → Distributes to community
→ Community members acknowledge insights/actions
→ Bilateral VRCs form → Trust graph edges created
→ Trust scores computed
```

---

## 8. Implementation Priorities

### Phase 1: Foundation (Week 1)

1. **Refactor BGINMultiAgentInterface.tsx**
   - Split into agent-specific components
   - Implement SwordsmanPanel-style side panel pattern
   - Add Framer Motion animations

2. **Add Privacy Budget System**
   - Per-session query limits
   - localStorage persistence
   - Privacy level configuration

3. **Implement Insight Format**
   - `[BGIN Insight: ...]` for Archive
   - `[BGIN Action: ...]` for Codex
   - `[BGIN Trust: ...]` for Discourse

### Phase 2: Trust Primitives (Week 2)

4. **VRC Implementation**
   - Data structures
   - Creation flow
   - Bilateral confirmation

5. **Promise Theory Integration**
   - Polarity tracking (+gives/-uses)
   - Fulfillment status
   - Promise graph visualization

6. **Trust Graph Visualization**
   - Node/edge rendering
   - Real-time updates
   - First Person perspective view

### Phase 3: Integration (Pre-Block 14)

7. **First Person Dashboard**
   - Sovereign identity display
   - Trust score overview
   - VRC history

8. **Agent Coordination**
   - Multi-agent synthesis
   - Cross-agent VRC flow
   - Unified trust graph

---

## 9. API Endpoint Alignment

### New/Modified Endpoints

```typescript
// Trust Graph Endpoints
POST /api/trust/vrc                    // Create VRC
GET  /api/trust/vrc/:id                // Get VRC
POST /api/trust/vrc/:id/confirm        // Bilateral confirmation
GET  /api/trust/graph/:did             // Get trust graph for DID

// Insight Endpoints (Archive Agent)
POST /api/agents/archive/insight       // Create compressed insight
GET  /api/agents/archive/insights      // List insights for session
POST /api/agents/archive/learn         // Confirm understanding

// Action Endpoints (Codex Agent)
POST /api/agents/codex/action          // Create action commitment
POST /api/agents/codex/authorize       // Authorize action
GET  /api/agents/codex/policies        // List applicable policies

// Distribution Endpoints (Discourse Agent)
POST /api/agents/discourse/distribute  // Distribute to community
GET  /api/agents/discourse/consensus   // Check consensus status
POST /api/agents/discourse/acknowledge // Acknowledge insight/action
```

---

## 10. Summary: Key Alignment Points

| Concept | AgentPrivacy | BGIN AI Block 14 |
|---------|--------------|------------------|
| **Sovereign** | First Person | First Person |
| **Knowledge Agent** | Mage (Soulbae) | Archive Agent |
| **Action Agent** | Swordsman (Soulbis) | Codex Agent |
| **Distribution** | Oracle + Inscriptions | Discourse Agent |
| **Knowledge Format** | `[RPP Proverb: ...]` | `[BGIN Insight: ...]` |
| **Action Format** | Zcash Memo | `[BGIN Action: ...]` |
| **Trust Format** | VRC via Inscription | `[BGIN Trust: ...]` + VRC |
| **Privacy** | z→z shielded | Privacy levels + budget |
| **Trust Graph** | Proverb-based | Multi-primitive based |
| **UI Pattern** | SwordsmanPanel | AgentPanel (unified) |
| **Chat Pattern** | Mage Page | Agent-specific chat |

---

## Appendix A: Spellemoji → BGIN Notation

**AgentPrivacy Spellemoji Example:**
```
📖💰 → 🐉⏳ → ⚔️🔮
(Story + Value → Drake's Teaching → Blade's Magic)
```

**Proposed BGIN Notation:**
```
🗃️📊 → 📜✓ → 🌐🤝
(Archive Knowledge → Codex Validation → Discourse Distribution)

Working Group Specific:
IKP: 🔑🆔 → 🔒✓ → 🤝📡
Privacy: 🛡️🔐 → 📋✓ → 🌍📢
Governance: ⚖️📜 → ✅🏛️ → 🗳️🔗
```

---

## Appendix B: File Reference

### AgentPrivacy Key Files
- `src/components/SwordsmanPanel.tsx` - Side panel pattern
- `src/app/mage/page.tsx` - Chat interface with privacy budget
- `src/components/ChatMessage.tsx` - RPP format detection
- `src/lib/soulbae.ts` - Mage chat logic
- `src/lib/zcash-memo.ts` - Transaction formatting

### BGIN AI Key Files to Modify
- `frontend/src/components/BGINMultiAgentInterface.tsx` - Split into agents
- `frontend/src/components/MainInterface.tsx` - Add trust graph
- `frontend/src/contexts/*.tsx` - Add trust/privacy contexts
- `backend/src/agents/*.ts` - Add insight/action/trust endpoints

---

*This document serves as a technical roadmap for aligning BGIN AI with the agentprivacy architecture for Block 14. The core mapping of Mage→Archive (knowledge), Swordsman→Codex (actions), and Human+Mage→Discourse (distribution) provides the conceptual foundation for trust graph primitive formation.*
