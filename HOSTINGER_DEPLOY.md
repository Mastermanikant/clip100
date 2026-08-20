# How to Make Your App Live (Hostinger Guide)

**Short Answer:** No, you cannot just upload the ZIP file directly. This is because this is a **Program** (Node.js App), not just a static HTML website.

To make it live, you have two parts to handle:

1. **The Frontend (Client)**: The visual part you see.
2. **The Backend (Server)**: The invisible part that handles real-time syncing.

Here is the best way to do it:

## Strategy: Split Deployment (Easiest & Best Performance)

We will host the backend on a specialized Node.js host (Render is free/cheap) and the frontend on Hostinger.

### Step 1: Deploy Backend (The "Brain")

Hostinger Shared Hosting often blocks "Real-time" connections (WebSockets). Use **Render.com** (Free tier available) for the backend.

1. **Unzip** the project.
2. Upload the `server` folder to a GitHub repository.
3. Go to [Render.com](https://render.com) -> New -> **Web Service**.
4. Connect your GitHub repo.
5. Settings:
    * **Runtime**: Node
    * **Build Command**: `npm install`
    * **Start Command**: `node index.js`
6. Click **Deploy**.
7. **Copy the URL** Render gives you (e.g., `https://my-app-123.onrender.com`).

### Step 2: Configure Frontend (The "Face")

Now we tell the frontend to talk to your new online backend.

1. Open `client/src/services/socket.js` in VS Code.
2. Change the line:

    ```javascript
    // OLD
    const SOCKET_URL = 'http://localhost:3001';
    
    // NEW (Paste your Render URL)
    const SOCKET_URL = 'https://my-app-123.onrender.com';
    ```

3. Save the file.

### Step 3: Build & Upload to Hostinger

Now we turn your code into a "Website" Hostinger can understand.

1. Open a terminal in the `client` folder.
2. Run: `npm install` (if you haven't).
3. Run: **`npm run build`**
    * This creates a new folder called **`dist`**. This folder contains your actual website.
4. Open **Hostinger File Manager**.
5. Go to `public_html`.
6. **Upload the contents of the `dist` folder** (index.html, assets folder, etc.) to `public_html`.

**Done!** Your site is now live on your domain, and it connects to the cloud backend for real-time text sharing.
