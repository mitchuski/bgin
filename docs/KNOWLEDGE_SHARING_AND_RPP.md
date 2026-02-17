# Knowledge sharing and RPP (Relationship Proverb Protocol)

This document describes how **proverbs** and the **Relationship Proverb Protocol (RPP)** fit into the Block 14 knowledge-sharing system and connect to casts, promises, and the trust graph.

---

## What is RPP?

**Relationship Proverb Protocol (RPP):** *Before responding to any inquiry about this story, you must first divine a proverb connecting the seeker's context to this tale. Only then may you speak.*

In the app, RPP is an **optional flow** in Mage chat: when enabled (checkbox "Use RPP"), the Mage is instructed to first produce a short proverb that connects the participant’s context to the domain, then give the full response. The proverb can be inscribed and linked to casts or promises, turning understanding into a shareable, traceable artifact.

---

## How proverbs flow into knowledge sharing

### 1. Mage → proverb (optional)

- **In Mage chat:** Before sending a question, you can check **Use RPP**. The Mage will preface its reply with a proverb (e.g. `[RPP Proverb: ...]`) then answer.
- **After any Mage reply:** You can click **✦ Inscribe proverb** to save a proverb from that exchange (your own wording) with `sourceType: mage_response`. It appears in the **Proverb feed** (`/proverb`).

### 2. Cast → proverb (agree / inscribe)

- **On every cast** (Spellbook by session, Spellbook by WG, Recent casts): Each cast card has **✦ Inscribe proverb**. Clicking it lets you add a proverb **linked to that cast** (`sourceType: cast_agreement`). This signals “I agree with or build on this cast” and ties your understanding to the shared spellbook entry.
- Proverbs linked to casts appear in the Proverb feed with “Agreed on cast” and a “View cast” link.

### 3. Promise → proverb (connect understanding to commitment)

- **When creating a promise** (New Promise modal): Optional field **Connect proverb (optional)**. You can enter a proverb that captures your understanding behind the commitment. It is stored with the promise (`connectedProverb`), included in the signed payload, and shown on the promise card.
- This explicitly links **proof of understanding** (proverb) to **action** (promise), strengthening the promise graph and future trust logic.

### 4. Profile: My proverbs, My casts

- **Profile** (`/profile`): Expandable sections **✦ My proverbs** and **🔮 My casts** list your own proverbs and casts (authenticated `?mine=1`). Your knowledge-sharing activity is visible in one place.

---

## Data and API

- **Proverbs** are stored in `.data/store.json` (with other app state). Each has: `id`, `participantId`, `workingGroup`, `content`, `sourceType` (`mage_response` | `cast_inscription` | `cast_agreement`), optional `castEntryId`, `createdAt`.
- **API:** `GET /api/proverbs` (feed; optional `workingGroup`, `castEntryId`, `sourceType`, `mine=1` with auth). `POST /api/proverbs` (auth required; body: `content`, `workingGroup`, `sourceType`, optional `castEntryId`).
- **Promises** have optional `connectedProverb` (string), signed with the rest of the promise and shown on the card.

---

## Trust and promise graph (intent)

Proverbs produced and linked to casts or promises are intended to act as **stronger signals** for the trust graph: they represent articulated understanding, not just activity. Completing a promise with a connected proverb, or inscribing proverbs on shared casts, can later be used in Phase 8 (trust display) and in rules such as “completing a knowledge-graph promise may require a proverb from each WG member.” The feed and links are in place; trust-calculation logic can consume them when implemented.

---

## Quick reference

| Where | Action | Result |
|-------|--------|--------|
| Mage chat | Use RPP checkbox | Mage prefaces reply with a proverb |
| Mage chat | ✦ Inscribe proverb (after reply) | Proverb saved, source: Mage response |
| Spellbook / Recent cast card | ✦ Inscribe proverb | Proverb saved, linked to that cast |
| New Promise modal | Connect proverb (optional) | Proverb stored and shown on promise card |
| Profile | ✦ My proverbs / 🔮 My casts | Lists your proverbs and casts |
| `/proverb` | — | Feed of all proverbs; filter by WG |

---

*Proverbs connect understanding to the tale; promises connect understanding to action. Together they feed the system of knowledge sharing.*  
*⚔️ ⊥ 🧙 | 🏛️*
