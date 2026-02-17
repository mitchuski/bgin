# Changelog

All notable changes to the BGIN AI Block 14 project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] — Block 14 (2025–2026)

### Summary

Implementation flow **mid–working**: Block 14 homepage, Ceremony, Mage (side panel + WG chat), Spellbook (sessions, by-WG, recent casts), Archive (Spells, briefings, Knowledge map), and Promises are in place. Trust graph, full MyTerms wiring, and RAG/ingestion are in progress or stubbed.

### Added

- **Block 14 homepage**: Timetable (March 1–2, 2026), Get started, promise feed, cast feed; links to Spellbook by session.
- **Ceremony**: 8-step key ceremony (keygen, privacy, MyTerms, WG selection, agent card); keys and identity in IndexedDB; `POST /api/ceremony/register`.
- **Archive** (`/mage`): Talk to a Mage by WG (IKP, FASE, Cyber, Governance), Block 14 briefings, Knowledge map, **Spells** (BGIN publications/projects from bgin-global.org/projects, newest first).
- **Spellbook** (`/spellbook`): Promises strip; Cast to session (timetable); Spellbook by working group; Recent casts; all expandable. **✦ Inscribe proverb** on each cast to agree or add a proverb linked to that cast. Single timetable source in `src/lib/block14/sessions.ts`.
- **Mage**: Side panel (🧙 in header) with WG selector and MageChat; one cast per response (to session or to WG spellbook). **RPP (Relationship Proverb Protocol)**: optional “Use RPP” checkbox—Mage first divines a proverb connecting context to the tale, then responds. **✦ Inscribe proverb** after any reply. Full-page Mage at `/mage/[wg]`.
- **Proverbs** (`/proverb`): Proverbs feed; filter by WG. Proverbs from Mage inscriptions or inscribed on casts; connect proof of understanding to knowledge sharing. **docs/KNOWLEDGE_SHARING_AND_RPP.md** describes the RPP flow and how proverbs feed the trust graph.
- **Promises** (`/promises`): Single page for all WGs; promise board and assessment flows. **Connect proverb** when creating a promise (optional)—links understanding to the commitment; shown on promise card and signed with the promise. Signed API.
- **Profile**: Expandable **✦ My proverbs** and **🔮 My casts** (authenticated); Community (Discourse); Settings.
- **APIs**: `/api/ceremony/register`, `/api/mage/[wg]/chat`, `/api/curation/feed`, `/api/curation/briefing`, `/api/spellbook/entries`, `/api/spellbook/sessions`, `/api/proverbs` (GET/POST, optional `mine=1`), `/api/promises`, `/api/sessions`, collaborative session contribute.
- **Auth**: signedFetch with Ed25519 (WebCrypto); ceremony-gated flows; file-based store (`.data/store.json`, `.data/collaborative-sessions.json`) for dev.

### Changed

- **Stack**: Next.js 14+ App Router (single app), TypeScript; no separate frontend/backend repos in this folder.
- **AI**: Mage uses Anthropic (Claude) or NEAR Cloud AI; `ANTHROPIC_API_KEY` or `NEAR_AI_API_KEY` in `.env`.
- **Structure**: `src/app`, `src/lib`, `src/components`, `src/contexts` (e.g. MagePanelContext); docs in `docs/`, spec in `block14_updates/`.
- **README**: Reworked for whole project and mid-implementation state; points to PROJECT_STATUS, DEMO_FLOW, BLOCK_14_ALIGNMENT_COMPARISON.

### In progress / stubbed

- Knowledge graph and RAG pipeline (Phase 4); ingestion scripts.
- Trust display (Phase 8); API stubs.
- Full MyTerms negotiate wiring; codex/drafts in workspace.
- Design system polish (Phase 9–10).

### References

- Master plan: `00_IMPLEMENTATION_PLAN.md` (in `block14_updates/`).
- Status: `docs/PROJECT_STATUS.md`, `docs/DEMO_FLOW.md`, `BLOCK_14_ALIGNMENT_COMPARISON.md`.

---

## [1.0.0] - 2025-10-07

### 🎯 **Block 13 Conference Integration & Multi-Agent Architecture**

This major release implements comprehensive Block 13 conference session management, track-based organization, and Multi Agent Hub system for collaborative AI interactions.

### ✨ **Added**

#### **Backend Features**
- **Conference Track System**: 5 working groups (BGIN Agent Hack, IKP, Cyber Security, FASE, General)
- **Conference Session Management**: 19 detailed Block 13 sessions with metadata
- **New API Endpoints**:
  - `GET /api/conference/tracks` - Retrieve all conference tracks
  - `GET /api/conference/tracks/:trackId/sessions` - Get sessions by track
  - `GET /api/conference/sessions` - Retrieve all conference sessions
  - `GET /api/conference/sessions/:sessionId` - Get specific session details
  - `POST /api/conference/sessions/:sessionId/init` - Initialize session chat
- **Chat Persistence System**: Session-specific chat history with project containers
- **Discourse Integration**: Publish insights to public forums
- **Ollama Integration**: Local LLM processing with `llama3.2:3b-instruct-q4_0`
- **Phala Cloud Integration**: Ready for future confidential compute deployment

#### **Frontend Features**
- **Conference Sessions Browser**: Full-screen modal with filtering capabilities
- **Multi Agent Hub System**: Collaborative conference discussions
- **Track-Based Sidebar**: Conference tracks instead of old session categories
- **Enhanced Message System**: Visual indicators for different session types
- **Session Management**: Track vs Multi Agent Hub distinction
- **Visual Indicators**: Network, Target, and Lock icons for session types

#### **Architecture Improvements**
- **Session Hierarchy**: Individual Sessions → Conference Tracks → Agent Interactions
- **Multi Agent Hub System**: Conference Sessions → Multi Agent Hub → Collaborative Chat
- **Project Container System**: "multi-agent-hub" vs "shared-project" containers
- **Visual Distinction**: Clear indicators for different session types

### 🔧 **Changed**

#### **FASE Track Update**
- **Definition**: Changed from "Forensics, Analysis, Standards, Evaluation" to "Financial and Social Economies"
- **Focus Areas**: Updated all FASE sessions to focus on policy and financial applications
- **Session Metadata**: Updated focus areas to reflect financial and economic themes

#### **LLM Integration Strategy**
- **Primary**: Ollama Local Model (`llama3.2:3b-instruct-q4_0`)
- **Fallback**: Phala Cloud (confidential compute)
- **Secondary Fallback**: OpenAI API (if configured)
- **Reasoning**: Local-first approach for development speed, cost efficiency, and privacy control

### 🐛 **Fixed**

#### **JavaScript Errors**
- **TypeError**: Fixed "Cannot read properties of undefined (reading 'name')" error
- **Null Safety**: Added comprehensive null safety checks for `currentSession` object
- **Fallback Objects**: Added fallback objects for Multi Agent Hub sessions

#### **Session Management**
- **Start Session Button**: Fixed breaking issue with session initialization
- **Session Initialization**: Updated to create Multi Agent Hub instead of individual sessions
- **Error Handling**: Added proper error handling for missing session data

#### **Frontend Issues**
- **Multi-Agent Chat History**: Fixed separate chat history for multi-agent mode
- **Message Storage**: Corrected message key logic for different session types
- **Visual Indicators**: Added clear visual cues for active modes and message counts

### 🏗️ **Architecture Changes**

#### **Session Management**
- **Before**: Static session categories in sidebar
- **After**: Dynamic conference track system with filtering and session browser

#### **Multi-Agent Collaboration**
- **Before**: Single agent interactions only
- **After**: Multi Agent Hub for collaborative conference discussions

#### **Visual Clarity**
- **Before**: Generic session indicators
- **After**: Clear visual distinction between track sessions and Multi Agent Hub

### 📊 **Data Structure Updates**

#### **Conference Tracks**
```javascript
{
  id: 'track-id',
  name: 'Track Name',
  description: 'Track description',
  color: '#HEX_COLOR',
  icon: 'EMOJI',
  workingGroup: 'Working Group Name'
}
```

#### **Conference Sessions**
```javascript
{
  id: 'session-id',
  title: 'Session Title',
  date: 'October 17, 2025',
  time: '9:00 - 10:30',
  room: 'Room Name',
  description: 'Session description',
  agents: ['archive', 'codex', 'discourse'],
  track: 'track-id',
  workingGroup: 'Working Group',
  focus: 'Focus areas'
}
```

### 🚀 **Technical Improvements**

#### **API Integration**
- Complete conference data API endpoints
- Track-based session filtering
- Session initialization and management

#### **State Management**
- Conference sessions and tracks state
- Multi Agent Hub session handling
- Track vs Multi Agent Hub distinction

#### **UI Components**
- Conference sessions browser modal
- Track filtering components
- Enhanced message display with indicators

### 📈 **Performance & Reliability**

#### **Error Prevention**
- Null safety checks throughout components
- Fallback objects for missing data
- Graceful error handling for API failures

#### **User Feedback**
- Visual indicators for different session types
- Clear project container labels
- Descriptive welcome messages for Multi Agent Hub sessions

### 🔮 **Future Considerations**

#### **Phala Cloud Integration Path**
- **Architecture Ready**: System designed to easily switch to Phala Cloud
- **Confidential Compute**: TEE integration available for production deployment
- **Privacy Enhancement**: Ready for privacy-preserving multi-query processing
- **Scalability**: Cloud deployment path prepared for conference scale

#### **Production Deployment**
- **Local Development**: Current Ollama-based system for development and testing
- **Conference Ready**: Self-contained system for Block 13 event
- **Post-Conference**: Phala Cloud integration for production privacy requirements

#### **Future Confidential Compute Per Session**
> **📝 Note**: Future integration will implement **confidential compute per session** when the system is more integrated online. This will enable:
> - **Session-Specific Privacy**: Each conference session will have its own confidential compute environment
> - **Isolated Processing**: Session data and AI interactions will be processed in separate TEE instances
> - **Enhanced Security**: Multi-tenant privacy with session-level data isolation
> - **Scalable Privacy**: Per-session confidential compute for production conference deployments
> - **Compliance Ready**: Session-specific privacy controls for regulatory requirements

### 🎉 **Summary**

This major update transforms the BGIN AI MVP from a simple multi-agent chat system into a comprehensive conference management platform. The new architecture supports both individual track-based interactions and collaborative Multi Agent Hub sessions, providing a complete solution for Block 13 conference participants to engage with AI agents in contextually appropriate ways.

**Key Achievements:**
- ✅ Complete Block 13 conference integration
- ✅ Multi Agent Hub architecture implementation  
- ✅ Track-based organization system
- ✅ Enhanced user experience with filtering and browsing
- ✅ Robust error handling and visual indicators
- ✅ FASE track correction to Financial and Social Economies focus
- ✅ Local-first LLM strategy with cloud-ready architecture
- ✅ Phala Cloud integration foundation for future privacy requirements
- ✅ Future-ready architecture for per-session confidential compute

---

## [0.9.0] - 2025-09-30

### 🚀 **Ollama Integration & Local LLM Support**

#### **Added**
- **Ollama Integration**: Local LLM processing with `llama3.2:3b-instruct-q4_0`
- **Local-First Architecture**: Ollama as primary LLM with cloud fallbacks
- **LLM Fallback Chain**: Ollama → Phala Cloud → OpenAI
- **Local API Service**: Frontend service for local backend communication
- **Environment Configuration**: Ollama-specific environment variables

#### **Changed**
- **LLM Priority**: Ollama now primary, Phala Cloud as fallback
- **Development Focus**: Local-first approach for faster iteration
- **Cost Efficiency**: Eliminated external API costs during development

#### **Fixed**
- **Frontend Integration**: Fixed local API service integration
- **TypeScript Errors**: Resolved type safety issues
- **Build Process**: Fixed frontend build and deployment

---

## [0.8.0] - 2025-09-15

### 🏗️ **Multi-Agent Architecture Foundation**

#### **Added**
- **Three-Agent System**: Archive, Codex, and Discourse agents
- **Privacy-Preserving Features**: DID-based identity and trust networks
- **BGIN Integration**: Community forum and governance research
- **Open WebUI Inspiration**: Modern interface design patterns

#### **Changed**
- **Architecture**: Moved from single-agent to multi-agent system
- **Privacy Focus**: Implemented privacy-by-design principles
- **Community Integration**: Added BGIN Discourse community support

---

## [0.1.0] - 2025-09-01

### 🎉 **Initial Release**

#### **Added**
- **Project Foundation**: Basic React + Node.js architecture
- **Documentation**: Initial README and setup guides
- **License**: MIT License
- **Repository**: GitHub repository setup

#### **Background**
- **Framework Published**: August 2025 - BGIN Agentic Framework Archive Codex
- **Collaboration Found**: September 2025 - Development partnership established
- **Development Period**: September-October 2025 - Active coding and implementation

---

## 🔗 **References**

### **Core Framework**
- [BGIN Agentic Framework Archive Codex](https://sync.soulbis.com/s/bgin-agentic-framework-archive-codex) - Comprehensive framework for sovereign AI agents
- [BGIN Official Website](https://bgin-global.org/) - Blockchain Governance Initiative Network
- [BGIN Discourse Community](https://bgin.discourse.group/) - BGIN Community Forum and Working Groups

### **Integration Technologies**
- [Kwaai Privacy Platform](https://kwaai.org/) - Privacy-preserving analytics and insights
- [First Person Project (FPP)](https://static1.squarespace.com/static/6834ee7c55c6376908871a6d/t/68cc3a8c99a9e21f398ea782/1758214796847/The+First+Person+Project+White+Paper+V1.0.pdf) - Dignity-based data sovereignty
- [Trust over IP (ToIP) Foundation](https://trustoverip.org/) - Trust framework for digital ecosystems
- [Privacy Pools](https://docs.privacypools.com/) - Privacy-preserving financial transactions

### **Technical Standards**
- [W3C DID Specification](https://www.w3.org/TR/did-core/) - Decentralized Identifiers
- [W3C Verifiable Credentials](https://www.w3.org/TR/vc-data-model/) - Verifiable Credentials
- [Open WebUI](https://github.com/open-webui/open-webui) - Interface inspiration

---

**Built with ❤️ for the BGIN Community**

*This project implements the principles of distributed consciousness, privacy by design, dignity-based economics, and real-time sovereignty enforcement as outlined in the BGIN Agentic Framework Archive Codex. The Block 13 MVP showcases the integration of Kwaai privacy platform, First Person Project (FPP) compliance, Trust over IP (ToIP) framework, and Privacy Pools to create a comprehensive agentic framework for blockchain governance research and collaboration.*
