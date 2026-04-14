# Product Requirement Document (PRD): Frank Drop Ecosystem

## 1. Vision
Build a hybrid data transfer ecosystem combining the best of CopyPaste.me, Snapdrop, and WeTransfer with a Cyberpunk aesthetic.

## 2. Core Pillars (The 5 Pillars)
- **A. Hybrid Data Transfer (P2P + Cloud):** WebRTC for local/fast, R2 Buffer for offline/remote.
- **B. Universal Clipboard:** Real-time text/link sync using Ably.
- **C. "Burn After Reading" & Expiry:** 1 View, 10 min, 1 hour, or Window Close.
- **D. Progress Persistence:** Resume feature using IndexedDB to track chunks.
- **E. Zero-Installation PWA:** Cyberpunk themed "Add to Home Screen" support.

## 3. Detailed Features
- **Project 1: Frank Link (Instant Sync)**
    - Custom IDs with Availability Check (✅/❌).
    - Send button for cost optimization.
    - Auto-Copy Toggle (Browser friendly).
    - Auto-Delete & Auto-Clear Clipboard settings.
    - E2EE (End-to-End Encryption) for Password Mode.
- **Project 2: Frank Nearby (Local Peer)**
    - mDNS/Same Network Discovery.
    - Highest possible speeds.
    - Auto-resume logic.
- **Project 3: Frank Notes (Smart Notebook)**
    - Persistent text with passwords.
    - Messenger UI.

## 4. Technical Stack
- **Frontend:** Next.js (App Router), Framer Motion (Animations).
- **Backend:** Ably (Realtime), Vercel KV (Redis), Cloudflare R2 (Storage).
- **Security:** AES-256 (Web Crypto API - Client-side).
- **Persistence:** IndexedDB (for resume chunks).

## 5. UI/UX Style
- **Theme:** Cyberpunk (Neon Borders, Glowing Effects, Glitch Animations).
- **Icons:** Cyberpunk-themed PNGs/SVGs.
- **Feedback:** Sound notifications, self-destruct timers.
