# Deployment Guide - What to Fill In

## Step 1: Create Database on Render

1. Go to: https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Fill in:
   - **Name:** `attendance-db` (or any name)
   - **Plan:** Free
   - **Region:** US (or closest to you)
4. Click **"Create Database"**
5. **Wait** for it to initialize (status: Available)

## Step 2: Get DATABASE_URL

1. Click on your database in Render Dashboard
2. Go to **Info** tab
3. Find **"External Database URL"** 
4. Copy the URL - it looks like:
   ```
   postgresql://postgres:PASSWORD@host.region.render.com/database?sslmode=require
   ```

## Step 3: Create Backend Web Service

1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repo: `digital-routine-attendance`
3. Fill in:
   - **Name:** `attendance-backend`
   - **Plan:** Free
   - **Build Command:** `cd server && npm install`
   - **Start Command:** `cd server && npm start`
4. Click **"Advanced"** → Add these **Environment Variables**:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Paste the URL from Step 2 |
| `JWT_SECRET` | See below |
| `CLIENT_URL` | You'll fill this later |
| `NODE_ENV` | `production` |

5. Click **"Create Web Service"**
6. **Wait** for build to complete (may take 2-3 minutes)

## Step 4: Generate JWT_SECRET

Generate a secure random string:
- **Option 1:** https://randomkeygen.com (look for "JWT Secret")
- **Option 2:** Run this command in your terminal:
  ```
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- Use the result as your `JWT_SECRET`

## Step 5: Create Frontend Static Site

1. In Render Dashboard, click **"New +"** → **"Static Site"**
2. Connect your GitHub repo: `digital-routine-attendance`
3. Fill in:
   - **Name:** `attendance-frontend`
   - **Plan:** Free
   - **Build Command:** `cd client && npm install && npm run build`
   - **Publish directory:** `client/dist`
4. Click **"Advanced"** → Add **Environment Variables**:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://attendance-backend.onrender.com/api` |

5. Click **"Create Static Site"**
6. **Wait** for build to complete

## Step 6: Update CLIENT_URL in Backend

1. After frontend deploys, copy its URL from Render Dashboard
2. Go to **Backend** service → **Environment**
3. Update `CLIENT_URL` with your frontend URL:
   - Example: `https://attendance-frontend.onrender.com`
4. Click **"Save Changes"**
5. The backend will auto-redeploy

## Step 7: Initialize the System

1. Open your frontend URL in browser
2. You'll see the registration page
3. Fill in:
   - **Name:** Your name (e.g., "Admin")
   - **Password:** Create a password (min 6 characters)
4. Click **"Register"**
5. Now you can log in!

---

## What Each Variable Does

| Variable | Where | Required For |
|----------|-------|-------------|
| `DATABASE_URL` | Backend | Connecting to PostgreSQL database |
| `JWT_SECRET` | Backend | Creating login tokens |
| `CLIENT_URL` | Backend | Allowing frontend to access API |
| `VITE_API_URL` | Frontend | Knowing where to send login requests |
| `NODE_ENV` | Backend | Enabling production mode |

---

## Troubleshooting

### Error: "Cannot POST /auth/login"
- **Cause:** VITE_API_URL not set
- **Fix:** Go to Frontend → Environment → Add `VITE_API_URL` = `https://attendance-backend.onrender.com`

### Error: "Missing DATABASE_URL"
- **Cause:** Backend doesn't have DATABASE_URL
- **Fix:** Add DATABASE_URL in Backend → Environment

### Error: "CORS blocked"
- **Cause:** CLIENT_URL doesn't match frontend URL
- **Fix:** Update CLIENT_URL in Backend environment

### White screen after login
- **Cause:** Database tables not created
- **Fix:** Run schema.sql manually or check server logs

### Server error on login
- **Cause:** Users table doesn't exist
- **Fix:** The app should auto-create tables on first connect. Check server logs in Render Dashboard → Logs

---

## Quick Reference

```
Backend URL:      https://attendance-backend.onrender.com
Frontend URL:    https://attendance-frontend.onrender.com
API Base URL:    https://attendance-backend.onrender.com/api
Login Endpoint:  https://attendance-backend.onrender.com/api/auth/login
