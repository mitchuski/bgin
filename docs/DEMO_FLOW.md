# Demo flow — BGIN Block 14

Use this order to demo the frontend end-to-end.

## 1. Home (http://localhost:3000)

- **Header**: Home, Ceremony, Mages, Dashboard, 🔮 Spellbook, Workspace.
- **Collaborative sessions**: Four Block 14 sessions (IKP, FASE, Cyber, Governance). Click one → Spellbook with that session open.
- **Get started**: Links to Ceremony, Mages, Dashboard, Workspace, Spellbook.

## 2. Ceremony (required for Mages, Dashboard, Workspace)

1. Click **Ceremony** (or **Begin Ceremony** on home).
2. **Step 1**: Key Ceremony → click **Begin**.
3. **Step 2**: Key generation animation → **Continue**.
4. **Step 3**: Privacy preferences → set options → **Continue**.
5. **Step 4**: MyTerms → **Accept SD-BASE (continue)**.
6. **Step 5**: Working groups → select at least one (e.g. IKP, FASE) → **Connect to these Mages →**.
7. **Step 6**: **Create agent card**.
8. **Step 7**: (Optional) Passphrase + **Download backup**, or **Skip** → **Enter BGIN AI →**.
9. **Step 8**: Complete → **Go to Home** / **Enter Mages** / **Dashboard**.

Identity and keys are now in IndexedDB; the server has your participant in `.data/store.json`.

## 3. Mages

1. Click **Mages** in the header or from home.
2. Pick a working group (e.g. **IKP**).
3. Type a question and **Send**. Reply comes from NEAR Cloud AI (ensure `NEAR_AI_API_KEY` is in `.env`).
4. Under the Mage reply, click **🔮 Cast to session**.
5. Choose a session (e.g. Block 14 — IKP) → the reply is added to that session and to the Spellbook.

## 4. Spellbook

1. Click **🔮 Spellbook** in the header or from home.
2. Four session cards show entry counts.
3. Click a session → see all cast Mage Q&As (query, response, sources, cross-WG refs).
4. From **Home**, clicking a collaborative session card opens Spellbook with that session selected.

## 5. Dashboard (after Ceremony)

- **Dashboard**: Personalized feed (stub items), trust summary stub, links to Briefing and Knowledge map.
- **Briefing**: Pre-meeting briefing (stub) per WG.
- **Knowledge map**: Built from your local episodic memory (from Mage chats).

## 6. Workspace (after Ceremony)

- **Workspace**: Four WG cards → Promise board and drafts.
- **Promise board**: Create a promise, move it (Active → In progress → Completed). Uses signed API.

## Quick demo path (5 min)

1. **Home** → **Ceremony** → complete steps 1–8 (skip backup if needed).
2. **Mages** → IKP → ask “What is privacy in the context of BGIN?” → **Send**.
3. Under the reply → **🔮 Cast to session** → choose **Block 14 — IKP**.
4. **Home** → click **Block 14 — IKP** under Collaborative sessions → Spellbook opens with that session and your cast entry.
5. **Dashboard** → see feed and links.
6. **Spellbook** → open any session to show all cast entries.

## Env

- `NEAR_AI_API_KEY` in `.env` for Mage replies.
- Server data: `.data/store.json` (participants, sessions, promises, spellbook entries) and `.data/collaborative-sessions.json` (session list + contributions).
