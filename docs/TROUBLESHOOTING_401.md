# Understanding 401 errors (Promises, Mage chat, etc.)

When you see **401** on `/api/promises`, `/api/mage/ikp/chat`, or other protected routes, the server is rejecting the request because **authentication failed**. This doc explains why and what to do.

---

## How auth works

Protected APIs expect **signed requests**:

1. You complete the **ceremony** (keygen, agent card, etc.) so the app has your **participant id** and **Ed25519 keys** in the browser (IndexedDB).
2. You **register** by submitting your agent card to the server (POST `/api/ceremony/register`). The server stores your participant id and public key.
3. When the app calls `/api/promises` or `/api/mage/…/chat`, it uses **signedFetch**: it adds headers `X-Participant-Id`, `X-Timestamp`, `X-Signature` (signature over `participantId:timestamp:body`).
4. The server looks up your participant, checks the timestamp, and verifies the signature. If anything fails → **401**.

So a 401 means one of the following.

---

## 1. Participant not registered (most common)

**Cause:** The server has no record of your participant id (e.g. you never called register, or the server lost it).

- **Local:** After the ceremony you must **register**. The app usually does this when you finish the ceremony; if you cleared server data (e.g. deleted `.data/store.json`) or never hit register, the server won’t have you.
- **Production (Cloudflare):** The server store is **in-memory** only. After a cold start or on another Worker instance, all registrations are gone. So 401 here is expected until you add a **persistent store** (e.g. KV/D1). See [MAGE_DEPLOYMENT.md](./MAGE_DEPLOYMENT.md) and server-store.

**What to do:** Complete the ceremony, then ensure **Register** runs (finish the flow that POSTs to `/api/ceremony/register`). In production, implement persistent participant storage so registrations survive cold starts.

---

## 2. No agent card / keys in the browser

**Cause:** The browser has no participant id or keys (ceremony not done, or IndexedDB cleared).

Then `signedFetch` throws before sending (“No agent card: complete ceremony first”). If you still see 401, the request is being sent with headers, so this usually isn’t the case unless a different code path calls the API without signedFetch.

**What to do:** Complete the **BGIN Ceremony** in this browser so an agent card and keys exist. Don’t use a different device/browser and expect the same identity unless you’ve restored keys there.

---

## 3. Missing auth headers

**Cause:** The request was sent without `X-Participant-Id`, `X-Timestamp`, or `X-Signature` (e.g. plain `fetch` instead of `signedFetch`).

**What to do:** Use `signedFetch` from `@/lib/swordsman/signedFetch` for these APIs so the correct headers are added.

---

## 4. Timestamp expired or invalid

**Cause:** Server clock and client clock differ a lot, or the request was delayed and the timestamp window (e.g. 5 minutes) expired.

**What to do:** Sync device time; retry soon after building the request.

---

## 5. Invalid signature

**Cause:** Signature verification failed (e.g. wrong key, body changed, or header/body mismatch).

**What to do:** Ensure the same keys used to sign are the ones the server has for that participant. Re-register after completing the ceremony again if needed.

---

## Quick checklist

- **401 on promises / Mage chat**
  - Completed the ceremony in this browser?
  - Did the app register you (POST to `/api/ceremony/register`)?
  - **Production:** Is participant storage persistent (KV/D1)? If not, 401 after cold start is expected.
- **Response body:** The API returns JSON like `{ "error": "…", "message": "…" }`. Use the `message` (e.g. “Participant not registered”) to confirm the reason.

---

---

## Chrome extension message

**"A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received"** — This comes from a **browser extension** (e.g. ad blocker, password manager, React DevTools), not from the app. You can ignore it or disable extensions on this site if it bothers you. It does not cause 401 or break Mage chat.

---

See also: [MAGE_DEPLOYMENT.md](./MAGE_DEPLOYMENT.md) (Mage in production), [CLOUDFLARE_DOMAIN_SETUP.md](./CLOUDFLARE_DOMAIN_SETUP.md) (env and domain).
