# Contributing to BGIN AI — Block 14

We welcome contributions to the BGIN AI Block 14 project. This app implements governance intelligence for the BGIN constellation (Ceremony, Mages, Spellbook, Archive, Promises) and follows the principles in the [BGIN Agentic Framework Archive Codex](https://sync.soulbis.com/s/bgin-agentic-framework-archive-codex) and the **Block 14** spec in `block14_updates/`. All work should align with **`00_IMPLEMENTATION_PLAN.md`** (Phases 0–12).

## How to Contribute

### 1. Clone and branch

```bash
git clone https://github.com/mitchuski/bgin.git
cd bgin   # or your clone of BGINAI_Block14

git checkout -b feature/short-description
# or
git checkout -b fix/bug-description
```

*(Remotes may also be named `bgin` or `origin` depending on your setup.)*

### 2. Follow development guidelines

#### Code standards
- **TypeScript**: Use TypeScript; keep types accurate.
- **ESLint**: Follow project ESLint config.
- **Privacy-by-design**: No feature may collapse the Swordsman/Mage gap; agreements before access; promises, not impositions.

#### Architecture principles (do not violate)
- **Gap between Swordsman and Mage is sacred** — no feature collapses it.
- **Agreements before access** — no data exchange without bilateral MyTerms.
- **Promises, not impositions** — all commitments voluntary.
- **Personal first, collaborative second** — value from Mages before workspace.
- **Local-first data sovereignty** — participant device first, sync optional.

### 3. Development setup

#### Prerequisites
- Node.js 18+
- npm (or equivalent)
- Git

#### Installation

```bash
npm install
cp .env.example .env
# Set ANTHROPIC_API_KEY and/or NEAR_AI_API_KEY for Mage chat
```

#### Commands

```bash
npm run dev     # http://localhost:3000
npm run build
npm run start
npm run lint    # if configured
```

### 4. Where to make changes

This repo is a **single Next.js 14+ App Router** application (no separate frontend/backend).

| Area | Location | Notes |
|------|----------|--------|
| **Pages** | `src/app/` | `page.tsx` (Block 14 home), `ceremony/`, `mage/`, `mage/[wg]/`, `spellbook/`, `promises/`, `dashboard/`, etc. |
| **API routes** | `src/app/api/` | `ceremony/register`, `mage/[wg]/chat`, `curation/feed`, `curation/briefing`, `spellbook/entries`, `spellbook/sessions`, `promises`, `sessions`, etc. |
| **Components** | `src/components/` | `ceremony/`, `mage/`, `layout/` (Header, MagePanel), `dashboard/`, `workspace/`, `shared/`, `ui/` |
| **Contexts** | `src/contexts/` | e.g. `MagePanelContext.tsx` (side panel state) |
| **Lib** | `src/lib/` | `ceremony/`, `storage/`, `mage/`, `auth/`, `swordsman/`, `bgin/` (documents), `block14/` (sessions) |
| **Block 14 timetable** | `src/lib/block14/sessions.ts` | Single source for March 1–2, 2026 sessions |
| **Spells / BGIN docs** | `src/lib/bgin/documents.ts` | BGIN publications and projects for curation feed |

#### Aligning with the plan
- Read **`00_IMPLEMENTATION_PLAN.md`** (in `block14_updates/`) for phases and priorities.
- **01_ARCHITECTURE.md**, **07_API_SPEC.md**, **08_DATA_MODELS.md** define system and APIs.
- **docs/PROJECT_STATUS.md** — API ↔ UI map and where the interface can break.

### 5. Testing your changes

- Run **Ceremony** end-to-end; confirm `.data/store.json` has your participant.
- **Mage**: Open side panel (🧙), pick a WG, send a message (requires `ANTHROPIC_API_KEY` or `NEAR_AI_API_KEY`).
- **Spellbook**: Cast from Mage to a session or WG spellbook; check Spellbook page.
- **Promises**: Create/move a promise on `/promises`.
- See **docs/DEMO_FLOW.md** for a full demo path.

### 6. Commit and pull request

#### Commit format (conventional)
```
type(scope): short description
```
- **Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- **Examples**: `feat(spellbook): add cast to session`, `docs(readme): update status`, `fix(ceremony): redirect when no keys`

#### Before submitting a PR
- [ ] Code aligns with `00_IMPLEMENTATION_PLAN.md` and core principles
- [ ] No collapse of Swordsman/Mage gap; agreements before access
- [ ] Docs/README updated if you changed surface or flow
- [ ] Manual check of affected flow (ceremony, Mage, Spellbook, promises, or Archive)

## Project structure (current)

```
BGINAI_Block14/
├── src/
│   ├── app/              # Next.js App Router (pages + api)
│   ├── components/       # ceremony, mage, layout, dashboard, workspace, shared, ui
│   ├── contexts/         # MagePanelContext, etc.
│   └── lib/              # ceremony, storage, mage, auth, swordsman, bgin, block14
├── docs/                 # PROJECT_STATUS.md, DEMO_FLOW.md, README pointer
├── block14_updates/      # Spec (sibling or local): 00_IMPLEMENTATION_PLAN, 01–13
├── README.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── SECURITY.md
└── package.json
```

## Resources

- **README.md** — Project overview, what’s implemented, phases, tech stack.
- **docs/PROJECT_STATUS.md** — What’s connected, API ↔ UI, where it can break.
- **docs/DEMO_FLOW.md** — Demo order and quick path.
- **BLOCK_14_ALIGNMENT_COMPARISON.md** — Alignment with Block 14 / agentprivacy.
- **BLOCK13_KNOWLEDGE_ARCHIVES.md** — Knowledge base context for Block 14.
- [BGIN Community](https://bgin.discourse.group/)
- [BGIN Agentic Framework Archive Codex](https://sync.soulbis.com/s/bgin-agentic-framework-archive-codex)

---

Thank you for contributing. The plan is the promise; the execution is the proof. ⚔️ ⊥ 🧙 | 🏛️
