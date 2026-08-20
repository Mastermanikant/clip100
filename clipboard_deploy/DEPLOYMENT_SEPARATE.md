# LiveClipboard - Deployment Guide (Separate Frontend/Backend)

You asked for separate folders to deploy to services like Vercel. This is the professional way to do it.

## 📂 Folder Structure

We have split your app into two folders in `clipboard_deploy`:

1. **`backend`**: The Node.js Server (Upload to **GitHub** -> Deploy to **Render**).
2. **`frontend`**: The React Website (Upload to **GitHub** -> Deploy to **Vercel**).

---

## 🚀 Phase 1: Deploy the Backend (Render)

We do this first because the Frontend needs the Backend's URL to work.

1. **Create a GitHub Repository** (e.g., `liveclipboard-backend`).
2. Open the `backend` folder in your terminal.
3. Push to GitHub:

    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/liveclipboard-backend.git
    git push -u origin main
    ```

4. Go to [Render.com](https://render.com) (Log in with GitHub).
5. Click **New +** -> **Web Service**.
6. Select your `liveclipboard-backend` repo.
7. **Settings**:
    * **Runtime**: Node
    * **Build Command**: `npm install`
    * **Start Command**: `node index.js`
8. Click **Deploy Web Service**.
9. **WAIT** for it to finish. Copy the URL (e.g., `https://liveclipboard-backend.onrender.com`).

---

## 🌐 Phase 2: Deploy the Frontend (Vercel)

1. **Create a GitHub Repository** (e.g., `liveclipboard-frontend`).
2. Open the `frontend` folder in your terminal.
3. Push to GitHub:

    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/liveclipboard-frontend.git
    git push -u origin main
    ```

4. Go to [Vercel.com](https://vercel.com) (Log in with GitHub).
5. Click **Add New...** -> **Project**.
6. Import your `liveclipboard-frontend` repo.
7. **Environment Variables** (Important!):
    * Click "Environment Variables".
    * **Name**: `VITE_SERVER_URL`
    * **Value**: Paste your Render Backend URL (e.g., `https://liveclipboard-backend.onrender.com`)
    * *Note: Do not add a trailing slash `/` at the end.*
8. Click **Deploy**.

---

## ✅ Phase 3: Testing

Once Vercel finishes, you will get a domain (e.g., `liveclipboard-frontend.vercel.app`).
Open it, create a room, and it should connect to your Render backend automatically!
