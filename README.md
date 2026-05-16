# GK NEET MOCK - Deployment Guide

This repository contains the source code for the GK NEET MOCK examination platform, split into a React-Vite `frontend` and an Express-MongoDB `backend`.

The application is currently configured and optimized for production deployment on platforms like Render, Vercel, or Heroku.

---

## 1. Environment Variables

### Backend (`/backend/.env`)
Create a `.env` file in the `backend` folder containing the following:
```
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.ryqaah7.mongodb.net/gk-neet?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key
```

### Frontend (`/frontend/.env` - Optional)
The frontend uses `https://gk-neet-backend.onrender.com/api` as a fallback base URL. 
If you deploy your backend to a different URL, create a `.env` file in the `frontend` folder:
```
VITE_API_URL=https://your-new-backend-url.com/api
```

---

## 2. Deployment on Render (Recommended)

### Backend Deployment (Web Service)
1. Go to your Render Dashboard and click **New+ > Web Service**.
2. Connect your GitHub repository.
3. Use the following settings for the backend:
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Go to the **Environment** tab and add the environment variables (`MONGO_URI`, `JWT_SECRET`).
5. Click **Create Web Service**. 
*(Note your newly generated backend URL, e.g., `https://gk-neet-backend.onrender.com`)*

### Frontend Deployment (Static Site or Vercel)
**Option A: Vercel (Fastest for Frontend)**
1. Go to Vercel and import your repository.
2. Framework Preset: `Vite`
3. Root Directory: `frontend`
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Add Environment Variable: `VITE_API_URL` (Set it to your Render backend URL, e.g., `https://gk-neet-backend.onrender.com/api`)
7. Click **Deploy**.

**Option B: Render (Static Site)**
1. Create a **New Static Site** on Render.
2. Root Directory: `frontend`
3. Build Command: `npm install && npm run build`
4. Publish Directory: `dist`
5. Add the `VITE_API_URL` environment variable.
6. Click **Create Static Site**.
*(Note: If using Render for frontend routing, ensure you set rewrite rules to catch all paths `/*` to `/index.html` to support React Router).*

---

## 3. Server Configuration (Advanced)
If you want to host both the frontend and backend on the **same server/instance**, you can configure the Express server to serve the frontend build:
1. Run `npm run build` in the `frontend` directory.
2. Copy the `frontend/dist` folder into the `backend` folder.
3. Update `backend/server.js` to serve static files:
```javascript
const path = require('path');
// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, 'dist', 'index.html')));
}
```

## 4. Final Security Checklist
- [x] CORS is enabled in `backend/server.js`.
- [x] Helmet and Rate Limiting are active.
- [x] JWT Secret is strong and not exposed.
- [x] MongoDB user strictly has access only to the `gk-neet` database.
- [x] PWA generation succeeds via `vite-plugin-pwa`.
