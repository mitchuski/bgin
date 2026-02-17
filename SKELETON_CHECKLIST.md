# Skeleton checklist (00_IMPLEMENTATION_PLAN)

This file tracks the **skeleton** created for BGINAI_Block14. Each item is a file or deliverable from 00; implement logic per the referenced doc.

## Phase 0 — Foundation
- [x] Directory structure under `src/` (lib, app, components, scripts, styles)
- [x] Dependencies in package.json (Next.js, Dexie, uuid, @anthropic-ai/sdk, yjs)
- [x] .env.example
- [ ] Database schemas (PostgreSQL, Qdrant, Neo4j) — add when backend infra ready

## Phase 1 — Swordsman layer
- [x] `src/lib/ceremony/keygen.ts` — implemented
- [x] `src/lib/ceremony/agentCard.ts` — implemented (createAgentCard + signData)
- [x] `src/lib/ceremony/privacy.ts` — types + DEFAULT_PRIVACY
- [x] `src/lib/ceremony/signData.ts` — signData + verifySignature
- [x] `src/lib/ceremony/storeKeys.ts` — storeSwordsmanKeys, loadSwordsmanKeys
- [x] `src/lib/ceremony/backup.ts` — generateKeyBackup (passphrase encrypt)
- [x] `src/lib/ceremony/wgSelection.ts` — WORKING_GROUPS
- [x] `src/lib/storage/local.ts` — Dexie BGINLocalDB (all tables)
- [x] `src/lib/myterms/chronicle.ts` — storeAgreement, getActiveAgreements
- [x] `src/lib/swordsman/gate.ts` — stub
- [x] `src/lib/swordsman/sign.ts` — signRequest (timestamp + body)

## Phase 2 — Key ceremony UI
- [x] `src/app/ceremony/page.tsx` — full 8-step flow (welcome → keygen → privacy → myterms stub → WG → agent card → backup → complete)
- [x] `src/components/ceremony/KeyGenAnimation.tsx` — placeholder
- [x] `src/components/ceremony/PrivacyConfig.tsx` — full form (attribution, toggles, budget, memory)
- [x] `src/components/ceremony/WGSelector.tsx` — four WG cards, multi-select
- [x] `src/components/myterms/AgreementSelector.tsx` — stub
- [x] Key backup flow — step 7 (passphrase, download, skip)

## Phase 3 — Backend API foundation
- [x] `src/lib/auth/middleware.ts` — verifyRequest(request, bodyText), verifyRequestNoBody(request)
- [x] `src/lib/auth/verify.ts` — verifySignature(publicKeyHex, payload, signatureHex), isTimestampValid
- [x] `src/lib/storage/server-store.ts` — JSON file store: participants, agreementRecords, sessions; getOrCreateSession for Mage
- [x] `src/app/api/ceremony/register/route.ts` — verify agent card self-signature, upsert participant
- [x] `src/app/api/myterms/negotiate/route.ts` — auth required; accept SD-BASE, store agreement, return platform sig
- [x] `src/app/api/sessions/route.ts` — GET with auth, return sessions for participant
- [x] Ceremony page calls POST /api/ceremony/register after creating agent card
- [x] `src/lib/swordsman/signedFetch.ts` — signedFetch(url, options) for authenticated API calls

## Phase 4 — Knowledge graph
- [x] `src/scripts/ingest.ts` — stub (wire to vector DB when ready)
- [x] `src/lib/mage/rag.ts` — stub (retrieveContext returns empty until Qdrant/Bonfires)
- [x] `src/lib/mage/episodicMemory.ts` — client-side IndexedDB: updateEpisodicMemory, getEpisodicContextForPrompt
- [x] `src/lib/bonfires/client.ts` — optional stub

## Phase 5 — Mage chat
- [x] `src/lib/mage/systemPrompts.ts` — implemented
- [x] `src/lib/mage/privacyBudget.ts` — server-side sessions, maxQueriesPerSession
- [x] `src/app/api/mage/[wg]/chat/route.ts` — auth, budget, RAG stub, Claude, episodic update in response
- [x] `src/app/api/mage/[wg]/search/route.ts` — stub
- [x] `src/app/mage/page.tsx`, `src/app/mage/[wg]/page.tsx` — hub + MageChat with signedFetch, messages, sources, cross-WG, budget
- [x] `src/components/mage/*` (MageChat, MessageBubble, SourceReference, CrossWgHint, PrivacyBudgetIndicator)

## Phase 6 — Personal dashboard
- [x] `src/app/dashboard/page.tsx` — feed (signedFetch), trust stub, nav to briefing/map/mage
- [x] `src/app/dashboard/briefing/page.tsx` — signed GET briefing, per-WG sections, “Prepare with Mage” links
- [x] `src/app/dashboard/knowledge-map/page.tsx` — local map from `buildLocalKnowledgeMap()`, KnowledgeGraph
- [x] `src/app/api/curation/feed/route.ts` — auth (verifyRequestNoBody), stub FeedItems by participant WGs
- [x] `src/app/api/curation/briefing/route.ts` — auth, stub briefing with agenda per WG
- [x] `src/lib/curation/localMap.ts` — buildLocalKnowledgeMap() from IndexedDB episodic memory (client-only)
- [x] `src/components/dashboard/FeedCard.tsx` — WG badge, relevance, type, action link
- [x] `src/components/dashboard/KnowledgeGraph.tsx` — nodes + edges props, card grid, “Explore with Mage” links

## Phase 7 — Collaborative workspace
- [x] `src/lib/promises/types.ts` — PromiseType, PromiseStatus, PromiseRecord
- [x] `src/lib/promises/client.ts` — createPromise, updatePromiseStatus, assessPromise (signed)
- [x] `src/lib/storage/server-store.ts` — PromiseRow, listPromises, getPromise, addPromise, updatePromise, addPeerAssessment
- [x] `src/app/api/promises/route.ts` — GET (auth, by wg/status), POST (auth + body signature, canonical payload)
- [x] `src/app/api/promises/[id]/route.ts` — GET one, PATCH status (owner only, signature)
- [x] `src/app/api/promises/[id]/assess/route.ts` — POST peer assessment (verified|partial|not_verified, signature)
- [x] `src/app/api/workspace/[wg]/documents/route.ts`, `codex/route.ts` — stubs
- [x] `src/app/workspace/page.tsx` — hub with WG cards, auth redirect
- [x] `src/app/workspace/[wg]/page.tsx` — links to Promise Board, Drafts
- [x] `src/app/workspace/[wg]/promises/page.tsx` — PromiseBoard, auth redirect
- [x] `src/app/workspace/[wg]/drafts/page.tsx` — stub list; `drafts/[id]/page.tsx` — editor stub
- [x] `src/components/workspace/PromiseBoard.tsx` — fetch by wg, 4 columns, New Promise modal, status change
- [x] `src/components/workspace/PromiseCard.tsx` — type, description, due, WG, verified count, Start/Mark complete
- [x] DocumentEditor.tsx, CodexAssist.tsx — stubs

## Phase 8 — Trust display
- [x] `src/lib/trust/tierCalculation.ts` — stub
- [x] `src/app/api/trust/profile/route.ts`, `attest/route.ts`, `network/route.ts`
- [x] `src/app/trust/page.tsx`, `trust/network/page.tsx`
- [x] `src/components/trust/TrustProfile.tsx`, TierBadge.tsx, ProgressBar.tsx, NetworkViz.tsx

## Phase 9 — Design system
- [x] `src/styles/theme.ts`
- [x] `src/components/ui/*` (Button, Card, Input, Badge, Modal, Tooltip, ProgressBar, Avatar)
- [x] `src/components/layout/Header.tsx`, Sidebar.tsx, Footer.tsx, Container.tsx

## Phase 10 — Integration
- [x] Landing page (app/page.tsx)
- [x] `src/components/shared/SwordsmanIndicator.tsx`, WGBadge.tsx, AuthGuard.tsx
- [ ] Wire Header + SwordsmanIndicator into layout
- [ ] Error boundaries, offline handling

---
Next: implement Phase 1–2 (ceremony + storage + UI) so you can run through onboarding; then Phase 3–5 for Mage chat.
