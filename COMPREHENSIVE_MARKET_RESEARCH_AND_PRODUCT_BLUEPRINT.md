# 🚀 ClipSync (clipboard.frankbase.com & clip.frankbase.com) - Master Product Specification, Market Research & Architecture Blueprint

**Document Version:** 4.0.0  
**Project:** `15_clipboard.frankbase.com` (ClipSync)  
**Parent Ecosystem:** FrankBase Digital Network (`frankbase.com` & `mastermanikant.com`)  
**Author & Founder:** Master Manikant Yadav (मास्टर मणिकान्त यादव)  
**GitHub Repository:** [https://github.com/Mastermanikant/clip100](https://github.com/Mastermanikant/clip100)  
**Date:** August 21, 2026  

---

## 1. Domain & Subdomain Architecture Strategy

### Canonical & Short Vanity URLs
1. **Primary Canonical Domain:** `clipboard.frankbase.com`
   - Used for main web app, SEO blog hub (`/blog`), brand trust pages (`/about`, `/contact`, `/privacy`, `/terms`), and official indexing.
2. **Ultra-Short Mobile Alias Domain:** `clip.frankbase.com`
   - Added as a secondary custom domain in Cloudflare Pages pointing to the identical frontend.
   - **Benefit:** Allows users to type `clip.frankbase.com/mani100` in 2 seconds on mobile browsers without typing long domain names.
3. **Backend WebSocket API Subdomain:** `api.clipboard.frankbase.com` (or `api.clip.frankbase.com`)
   - Routed directly to the Node.js WebSocket engine on VPS with TLS 1.3 encryption.

---

## 2. Infrastructure & Synchronization Status

| Layer | Platform | Current Status | Connection Details |
| :--- | :--- | :--- | :--- |
| **Source Code & Git** | **GitHub** | ✅ **100% Synced & Pushed** | Repository: [`Mastermanikant/clip100`](https://github.com/Mastermanikant/clip100) (Branch: `main`). |
| **Frontend Edge CDN** | **Cloudflare Pages** | 🟡 **Ready for 1-Click Link** | Target Repo: `Mastermanikant/clip100`, Root: `client`, Framework: `Vite`, Build: `npm run build`, Output: `dist`. |
| **Custom Domains** | **Cloudflare DNS** | 🟡 **DNS Assignment** | `clipboard.frankbase.com` (Primary) + `clip.frankbase.com` (Short Alias) + `api.clipboard.frankbase.com` (Node/WSS). |
| **Backend Service** | **Hostinger VPS / Node** | 🟡 **Ready for Launch** | `server/index.js` managed via PM2 on Port `3015`. |

---

## 3. Core Feature Specification & User Capabilities

### A. 24-Hour Custom Memorable Links (The Killer Alternative to CopyPaste.me)
- **Problem with Competitors:** CopyPaste.me forces random 6-character room codes every time. If a tab closes or Wi-Fi reconnects, a new code is generated, forcing fresh QR scans.
- **ClipSync Solution:** Users can create a **Custom Memorable Link** (e.g. `clip.frankbase.com/mani100`, `clip.frankbase.com/room1`, `clip.frankbase.com/link100`).
- **Validation Rules:** Strictly lowercase alphanumeric characters and hyphens (`^[a-z0-9_-]{3,25}$`).
- **Lifecycle:** Stays active and reserved for the user's devices for **24 hours** by default. Bookmarked on phone and PC for zero-reconnection instant sharing.

---

### B. Multi-Device Simultaneous Synchronization
- **Scope:** Unlimited connected devices per room (Phone + Laptop + Office PC + iPad/Tablet + Smart TV).
- **Direction:** **100% Bi-directional.** Any device can type, edit, or delete; all connected screens update character-by-character in sub-50ms latency.

---

### C. File Sharing & Screenshot Handling (vs ToffeeShare P2P)
- **What is Supported:**
  1. **Direct Screenshot Paste (`Ctrl + V` Image):** Users capture a screenshot using Snipping Tool / PrintScreen and hit `Ctrl+V` inside ClipSync; the image appears instantly on the phone screen with a 1-tap Download button.
  2. **Small Files & PDFs:** Drag-and-drop support for images, PDFs, text docs, and code archives up to **10 MB**.
- **Hard Limit:** **Maximum 10 MB per file.**
  - *Reason:* 10MB keeps WebSocket transfer instantaneous and maintains 0% server CPU strain.
- **Why ToffeeShare-style Multi-GB P2P is Excluded:**
  - ToffeeShare is built for 2GB–10GB video streams requiring complex WebRTC signaling and transfer progress bars.
  - Putting multi-GB transfers into ClipSync causes feature bloat and slows down the 1-second text clipboard utility. Large file transfers are reserved for **FrankDrop (`frankdrop.com`)**.

---

### D. Google Sign-In & Personal Cloud Diary (Permanent Vanity Rooms)
1. **Anonymous / Guest Mode:**
   - No login required.
   - Auto-generated random room or 24-hour custom link (`/mani100`).
   - Max 3 guest rooms per device.
   - Auto-deletes after 7 days of inactivity.
2. **Authenticated Mode (Sign in with Google):**
   - 1-Click Google OAuth.
   - Claim a **Permanent Custom Vanity Username** (e.g. `clip.frankbase.com/mastermanikant`).
   - Protected by an optional **4-digit Secret PIN / Master Password**.
   - Accessible from any cyber cafe, airport kiosk, or friend's device worldwide.
   - **Data Retention:** Stored permanently in Cloudflare D1 Edge database until explicitly deleted by the user.

---

### E. Data Retention & Grace Period Governance
- **Cost Efficiency:** Cloudflare D1 provides **5 GB of storage (~50 Lakh text notes) completely free**.
- **Retention Rule:** User notes are never prematurely deleted.
- **Inactivity Handling:** If an account is inactive for 12 months, send an automated email notice to the user's verified Google email and provide a **60-day (2-month) grace period** before archiving.

---

## 4. 4-Stage Step-by-Step Implementation Roadmap

```
[ Stage 1: Custom Alphanumeric URLs + Multi-Device Rooms ] ──> (Easy: 1-2 Days)
                           │
[ Stage 2: 4-Digit PIN Security + Auto-Destruct Timers ]   ──> (Medium: 2 Days)
                           │
[ Stage 3: Direct Screenshot & Image Paste (Max 10MB) ]    ──> (Medium: 2 Days)
                           │
[ Stage 4: Google Auth + Cloudflare D1 Cloud Diary + PWA ] ──> (Advanced: 3-4 Days)
```

### Detailed Stage Breakdown & Complexity Rating

| Stage | Feature Description | Complexity | Server Load Impact | Quality & Bug Testing Plan |
| :--- | :--- | :---: | :---: | :--- |
| **Stage 1** | • Custom Alphanumeric URLs (`/mani100`, `/link1`).<br>• Multi-device WebSockets broadcast.<br>• 24-Hour Active In-Memory Session. | 🟢 **Easy** | 0% (RAM micro-entry) | Simultaneous multi-device typing test across Chrome, Safari, and Firefox. |
| **Stage 2** | • Optional 4-Digit Room PIN Lock.<br>• Auto-Destruct Timers (5m, 1h, 24h, Burn-after-copy).<br>• Client-side WebCrypto AES-GCM-256 Encryption. | 🟡 **Medium** | 0% (Client Hardware Crypto) | Test invalid PIN lockouts, hash key derivation, and instant timer wipe. |
| **Stage 3** | • Direct Clipboard Screenshot Paste (`Ctrl+V` on canvas).<br>• Drag-and-drop Image / PDF / Doc upload (Max 10MB).<br>• One-touch Image Download button on Mobile. | 🟡 **Medium** | Low (Ephemeral Base64/Chunk) | Test 1MB, 5MB, 10MB file transfer latency and memory cleanup. |
| **Stage 4** | • 1-Click Google OAuth 2.0 Sign-In.<br>• Cloudflare D1 Edge Database schema for permanent diary notes.<br>• Progressive Web App (PWA) manifest & ServiceWorker offline caching. | 🔴 **Advanced** | 0% on VPS (Serverless Edge D1) | End-to-end OAuth callback verification, D1 query speed test (<15ms), PWA install prompt. |

---

## 5. Comprehensive Summary of All Completed Pages & Assets

1. **Home Page (`/`):** Hero room creator, 4-step user guide, pro shortcuts cheatsheet, use cases, interactive FAQ accordion.
2. **Live Room (`/room/:roomId`):** Real-time live bi-directional editor, QR modal, device counter, word/char count, one-touch copy, RAM wipe.
3. **About Us (`/about`):** Authoritative brand mission, in-memory zero-log architecture, Master Manikant Yadav founder attribution.
4. **Contact Us (`/contact`):** Interactive inquiry desk, bug bounty form, official emails (`support@frankbase.com`, `connect@mastermanikant.com`).
5. **Privacy Policy (`/privacy`):** Zero-Log RAM-Only policy, TLS 1.3 transport encryption, absence of database ad tracking.
6. **Terms of Service (`/terms`):** Acceptable use policy and temporary utility legal terms.
7. **SEO Blog Hub (`/blog` & `/blog/:slug`):** Directory with live search, 4 category filters, and 4 in-depth articles.
8. **Universal Standards:** Dual Day/Night Theme Engine (WCAG 2.1 AA), `llms.txt`, and `llms-full.txt`.
