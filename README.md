# Frank Drop | Next-Gen P2P Ecosystem

A world-class, real-time, cross-device file and text transfer platform by **FrankBase**. Built with the "Indian Jugad" philosophy: high-end features, zero hosting costs.

## 🚀 Live Demo & Hosting
- **Frontend**: Deploy to **Vercel** (Root: `frontend`).
- **Storage**: Enable **Vercel KV**.
- **Signaling**: Add `ABLY_API_KEY` to Vercel environment variables.

## 📱 Features
- **P2P File Transfer**: Ultra-fast direct device-to-device sharing.
- **The Notebook**: Persistent shared text space (Copy-Paste) that stays for 30 days.
- **Auto-Resume**: Connection dropped? No problem. It resumes from the exact byte it stopped.
- **Vanity URLs**: Create specific room links like `drop.frankbase.com/d/my-agency`.
- **E2EE**: End-to-end encryption for maximum privacy.

## 📲 Installing the App
### Browser (PWA)
1. Open `drop.frankbase.com` in Chrome or Safari.
2. Click **"Add to Home Screen"** or the **"Install App"** icon in the URL bar.

### Android/iOS (Native)
The native app files are located in the `frontend` folder. To build them:
1. `cd frontend`
2. `npm install`
3. `npx cap add android` or `npx cap add ios`
4. `npx cap open android`

---

## 🛠️ Developer Checklist (Push to GitHub)
Replace the URL with your private repository link.

```bash
# 1. Initialize Git & Create Local Commit
git init
git add .
git commit -m "Initialize Frank Drop Master Ecosystem"

# 2. Add your Private Repo as remote
git remote add origin https://github.com/Mastermanikant/frank-drop-.git

# 3. Push to GitHub
git branch -M main
git push -u origin main
```

---

## 📖 Usage Guide
1. **Nearby**: Open on two devices in the same Wi-Fi for **Host-level speeds**.
2. **Notebook**: Type text on PC, open the same room on Mobile, and copy it instantly.
3. **Public/Private**: Use a password for mission-critical agency transfers.

Developed by **Antigravity** for **FrankBase**.
