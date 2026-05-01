# Deploy on Render — Complete Guide

This guide walks you through deploying the Routine & Attendance full-stack app on [Render](https://render.com) using their free tier.

---

## Architecture

| Service | Render Type | Purpose |
|---------|-------------|---------|
| Backend (`server/`) | **Web Service** | Node.js + Express API |
| Frontend (`client/`) | **Static Site** | React + Vite build output |
| Database | **PostgreSQL** | Render Postgres (or Neon/Supabase) |

---

## Prerequisites

- A [Render](https://render.com) account
- Code pushed to a **GitHub/GitLab** repository

---

## Step 1: Push Code to GitHub

Make sure these recent changes are committed:

- `server/server.js` — dynamic CORS + conditional dotenv
- `client/src/api.js` — `VITE_API_URL` env support
- `client/vite.config.js` — build output config

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

---

## Step 2: Create PostgreSQL Database

### Option A: Render PostgreSQL (Easiest)

1. In Render Dashboard, click **New +** → **PostgreSQL**
2. Name it: `attendance-db`
3. Region: choose closest to your users
4. Plan: **Free**
5. Click **Create Database**
6. Once created, copy the **Internal Database URL** (or External if connecting from local)

### Option B: Neon (Recommended for Serverless)

1. Go to [Neon](https://neon.tech) and sign up / log in
2. Create a new project — name it `attendance-db`
3. Choose the region closest to your Render services (e.g., `US East` if deploying Render to Ohio)
4. Once created, go to the project dashboard → **Connection Details**
5. Copy the **Connection string** (it looks like `postgresql://user:password@host.neon.tech/dbname?sslmode=require`)
6. Paste this into your Render backend env var as `DATABASE_URL`

> **Why Neon?** Neon offers a generous free tier with serverless scaling, instant branching, and better cold-start performance than Render Postgres. Your `server/db.js` already supports Neon's SSL requirements automatically when `NODE_ENV=production`.

### Option C: Supabase (Alternative)

If you prefer, create a free Postgres instance on [Supabase](https://supabase.com) and copy the connection string.

---

## Step 3: Initialize Database Schema

You need to run `server/schema.sql` on your new database.

### Using Render Shell (Recommended)

1. Go to your PostgreSQL dashboard on Render
2. Click **Connect** → copy the PSQL command
3. Or use **Query Editor** if available

### Using psql locally

```bash
psql "YOUR_DATABASE_URL"
\i server/schema.sql
```

This creates all required tables (`users`, `subjects`, `schedules`, `attendance`, `academic_years`).

---

## Step 4: Deploy Backend (Web Service)

1. In Render Dashboard, click **New +** → **Web Service**
2. Connect your GitHub repo
3. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `attendance-backend` (or your choice) |
| **Region** | Same as database |
| **Branch** | `main` |
| **Root Directory** | `server` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | **Free** |

4. Click **Advanced** → **Add Environment Variables**:

| Key | Value | Example |
|-----|-------|---------|
| `DATABASE_URL` | Your Postgres connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Strong random string | `my-super-secret-jwt-key-2024` |
| `NODE_ENV` | `production` | `production` |
| `CLIENT_URL` | Your frontend Render URL (add later) | `https://attendance-frontend.onrender.com` |

> **Note:** Add `CLIENT_URL` after deploying the frontend (Step 5), then redeploy backend.

5. Click **Create Web Service**

Render will build and deploy your backend. Once live, note the URL:
```
https://attendance-backend.onrender.com
```

Test it:
```bash
curl https://attendance-backend.onrender.com/api/health
```

---

## Step 5: Deploy Frontend (Static Site)

1. In Render Dashboard, click **New +** → **Static Site**
2. Connect the same GitHub repo
3. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `attendance-frontend` (or your choice) |
| **Region** | Same as backend |
| **Branch** | `main` |
| **Root Directory** | `client` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |
| **Plan** | **Free** |

4. Click **Advanced** → **Add Environment Variables**:

| Key | Value | Example |
|-----|-------|---------|
| `VITE_API_URL` | Your backend URL + `/api` | `https://attendance-backend.onrender.com/api` |

5. Click **Create Static Site**

Once deployed, your frontend will be live at:
```
https://attendance-frontend.onrender.com
```

---

## Step 6: Link Frontend ↔ Backend (CORS)

Now that you have the frontend URL, go back to your **Backend Web Service**:

1. Settings → **Environment**
2. Add/Update: `CLIENT_URL=https://attendance-frontend.onrender.com`
3. Click **Save Changes**
4. Manually **Deploy Latest Commit** to apply changes

---

## Step 7: First-Time Setup

Open your frontend URL in the browser:

1. You should see the **System Setup** screen (since no HOD exists yet)
2. Register your first HOD user
3. Log in and start using the app!

---

## Environment Variables Summary

### Backend (`server/`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Secret key for JWT tokens |
| `NODE_ENV` | ✅ | Must be `production` |
| `PORT` | ❌ | Defaults to `5001` (Render overrides this) |
| `CLIENT_URL` | ✅ | Frontend URL for CORS |

### Frontend (`client/`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | ✅ | Backend API base URL (must start with `VITE_`) |

---

## Troubleshooting

### CORS Errors
- Make sure `CLIENT_URL` in backend matches exactly your frontend URL
- Check for trailing slashes — URLs should match exactly

### Database Connection Errors
- Verify `DATABASE_URL` is correct
- Ensure `NODE_ENV=production` so SSL is enabled (required by Render Postgres)

### Frontend Can't Reach Backend
- Verify `VITE_API_URL` includes `/api` at the end
- Example: `https://attendance-backend.onrender.com/api`

### Build Fails
- Make sure `client/vite.config.js` has `build: { outDir: 'dist' }`
- Ensure `client/dist` is not in `.gitignore` (it usually is — that's fine, Render builds it fresh)

### Schema Not Applied
- Run `schema.sql` against your production database before first use
- The app will crash on first API call if tables don't exist

---

## Optional: Single-Service Deployment

If you want to serve the frontend **from the backend** (simpler, fewer services):

1. Build the frontend locally: `cd client && npm run build`
2. Copy `client/dist` contents into `server/public/`
3. Add to `server/server.js`:

```js
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
```

4. Deploy only the backend as a Web Service
5. Set `CLIENT_URL` to the backend URL itself

---

## Done! 🚀

Your Routine & Attendance app is now live on Render!

