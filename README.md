# ClipSync - Real-time Clipboard Application

A premium, real-time text sharing tool (CopyPaste.me clone). securely share text between devices using a Room Code or QR Code.

## 🚀 Quick Start (Local Development)

You need **Node.js** installed on your machine.

### 1. Setup Server

Open a terminal in the `server` folder:

```bash
cd server
npm install
npm run dev
```

*Server will run on <http://localhost:3001>*

### 2. Setup Client

Open a **new** terminal in the `client` folder:

```bash
cd client
npm install
npm run dev
```

*Client will run on <http://localhost:5173> (usually)*

### 3. Usage

- Open the Client URL.
- Click **Create New Room**.
- Scan the QR code with your phone or share the URL.
- Type in one device, see it appear instantly on the other!

## 📦 Deployment

### Deploying to Render / Heroku / Vercel

#### Option 1: VPS (DigitalOcean / EC2) - Recommended for WebSockets

1. Copy the entire `clipboard_app` folder to your server.
2. Install dependencies (`npm install` in both server/client).
3. Build the client: `cd client && npm run build`.
4. Serve the `client/dist` folder using Nginx.
5. Run the server using `pm2` or `node`.

#### Option 2: Separate Hosting

- **Backend (Render/Railway)**: Upload `server` folder. Set environment variable `PORT=3000`.
- **Frontend (Vercel/Netlify)**: Upload `client` folder.
  - **IMPORTANT**: Update `client/src/services/socket.js` to point to your deployed Backend URL instead of `localhost:3001`.

## 🛠 Features

- **Real-time Sync**: < 50ms latency text updates.
- **Premium UI**: Glassmorphism, Dark Mode, Animations.
- **Mobile First**: Responsive design with touch support.
- **QR Code**: Instant mobile sharing.
