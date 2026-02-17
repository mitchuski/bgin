# Security Policy — BGIN AI Block 14

## Security overview

The BGIN AI Block 14 project is designed with privacy-by-design and sovereign identity in mind. This document outlines security-relevant behavior, how to report vulnerabilities, and configuration guidance for the **current** stack (Next.js, WebCrypto/Ed25519, ceremony, Mage, Spellbook, Archive, Promises). It should be read together with **README.md** and **docs/PROJECT_STATUS.md**.

## Supported versions

| Focus              | Supported |
|--------------------|-----------|
| Current `master`   | ✅ Yes    |
| Block 14 spec (00) | ✅ Aligned |
| Older Block 13 MVP | ❌ Not maintained in this repo |

## Reporting a vulnerability

**Do not** report security issues in public issues.

1. **Preferred**: [GitHub Security Advisories](https://github.com/mitchuski/bgin/security/advisories) for this repository (or the repo you forked from).
2. **Alternative**: Email [security@bgin-global.org](mailto:security@bgin-global.org) with subject **"Security Vulnerability — BGIN AI Block 14"**.

Include: description, steps to reproduce, impact, and suggested fix if any.

- **Initial response**: Within 48 hours  
- **Status update**: Within 7 days  
- **Resolution**: Depends on severity; target within 30 days for critical issues  

## Security-relevant behavior (current app)

### Authentication and identity
- **Ceremony**: 8-step key ceremony produces Ed25519 keypair; keys and agent card stored in **IndexedDB** (Dexie) on the client. Participant is registered with the server via `POST /api/ceremony/register` (agent card in body).
- **Signed requests**: Authenticated calls use **signedFetch** (signature over `participantId:timestamp:body` with client’s private key). Server verifies using stored public key. No JWT; no session cookies for API auth.
- **Gating**: Dashboard, Mage chat, Spellbook, Promises, and related APIs expect a completed ceremony; missing identity redirects to Ceremony or returns 401.

### Data protection
- **Secrets**: No secrets in repo. Use **environment variables** (e.g. `ANTHROPIC_API_KEY`, `NEAR_AI_API_KEY`) in `.env`; never commit `.env`.
- **Server state (dev)**: File-based (`.data/store.json`, `.data/collaborative-sessions.json`). Treat as sensitive; ensure read/write permissions and backup handling are safe. Production will use proper DB per **08_DATA_MODELS.md**.
- **Transport**: Use HTTPS in production; API is same-origin in dev.

### AI and privacy
- **Mage**: Chat is sent to Anthropic or NEAR Cloud AI per config. No feature should collapse the **Swordsman/Mage gap** (knowledge vs. action). Privacy budget and RAG behavior are per spec (e.g. **03_MAGE_AGENTS.md** in `block14_updates/`).

### Network and API
- **CORS**: Configure appropriately for your deployment.
- **Input validation**: Validate and sanitize all API inputs; avoid leaking stack traces or internals in error responses.
- **Rate limiting**: Consider adding for public or high-traffic deployments.

## Configuration (environment)

```bash
# Required for Mage chat (at least one)
ANTHROPIC_API_KEY=...   # Claude
NEAR_AI_API_KEY=...     # NEAR Cloud AI (e.g. TEE)

# Environment
NODE_ENV=production     # in production
```

Do **not** commit these. Use `.env.example` (without real keys) to document required variables.

## Security checklist (deployment)

- [ ] No secrets or API keys in repo or client bundle
- [ ] HTTPS in production
- [ ] Ceremony and signed request flow tested
- [ ] `.data/` (or production DB) access restricted and backed up securely
- [ ] Dependencies reviewed and updated; run `npm audit` (or equivalent)
- [ ] Error responses do not expose internal paths or stack traces to clients

## References

- **README.md** — Tech stack, principles, project structure  
- **docs/PROJECT_STATUS.md** — API ↔ UI map, where things can break  
- **block14_updates/01_ARCHITECTURE.md** — System and Swordsman/Mage separation  
- **block14_updates/03_MAGE_AGENTS.md** — Mage privacy and behavior  

---

**Last updated**: February 2026  
**App**: BGIN AI Block 14 (implementation flow mid–working)  
**Next review**: As needed for production rollout (Phases 11–12)

---

*This policy reflects the current Block 14 implementation. For broader BGIN security and privacy principles, see [bgin-global.org](https://bgin-global.org) and the BGIN Agentic Framework Archive Codex.*
