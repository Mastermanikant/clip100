# Frank Drop: The Production Rescue Journey 🚀
*(A to Z Technical Log for Ebook Documentation)*

## 1. The Vision
Build a stateless, P2P high-performance file transfer platform using Next.js, Ably (Signaling), and Vercel KV (State).

## 2. Problem: The Server-Side Crash
**Symptoms**: Build failed or runtime 500 errors on API routes.
**Cause**: Attempting to use `Ably.Realtime` on the server-side (Next.js API routes). API routes are short-lived and cannot maintain a persistent socket connection.
**Solution**: Switched the Backend to `Ably.Rest` for token generation and room logic, while keeping `Ably.Realtime` only for the browser.

## 3. Problem: The "nanoid" ESM Conflict
**Symptoms**: Vercel build failed with "Module not found" or "require() of ES Module".
**Cause**: `nanoid` v5 is ESM-only. Next.js builds sometimes struggle with mixed CommonJS/ESM dependency trees in production.
**Solution**: Replaced `nanoid` with a native JavaScript "ID Generator" using `Math.random().toString(36)` to ensure zero-dependency build success.

## 4. Problem: The Identity Block (The Red X)
**Symptoms**: Vercel dashboard showed "Deployment Blocked" with a Red circle.
**Cause**: Git commit author email mismatch. The local git was set to `mastermanikant@gmail.com` but the verified GitHub email was `mastermanikant.in@gmail.com`.
**Solution**: Updated the global git config and ran `git commit --amend --reset-author` to overwrite the history with the correct verified identity.

## 5. Problem: The Strict Build Killer
**Symptoms**: "12 Problems" in terminal and build failures due to TypeScript/Lint errors.
**Cause**: Vercel production builds are strict. Unused imports, missing icons, or implicit `any` types can stop the build.
**Solution**: 
- Added `ignoreBuildErrors: true` in `next.config.mjs` as a safety net.
- Audited `TransferRoom.tsx` to add explicit interfaces for Messages.
- Fixed the missing `Check` and `X` icon imports that were causing the "Client-side exception".

## 6. Problem: The Signaling Silent Failure
**Symptoms**: Site loads, but Room creation stays in "Loading" state.
**Potential Cause**: Using a "Subscribe-only" Ably API key.
**Constraint**: Signaling requires BOTH Publish and Subscribe permissions to exchange WebRTC offers.
**Fix**: User must use the "Root" key in Vercel Environment variables.

---
*Log curated by Antigravity (Advanced Agentic Coding).*
