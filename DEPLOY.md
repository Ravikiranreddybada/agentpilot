# 🚀 Deployment Guide — Render (Backend) + Vercel (Frontend)

## Overview

| Service | Platform | URL pattern |
|---|---|---|
| Backend (Node/Express) | Render.com | `https://agentpilot-backend.onrender.com` |
| Frontend (React/Vite) | Vercel | `https://agentpilot.vercel.app` |
| Database (MongoDB) | MongoDB Atlas | Free M0 cluster |

---

## Step 1 — Set Up MongoDB Atlas (Free Database)

1. Go to **https://cloud.mongodb.com** → Sign up / Log in
2. Click **"Build a Database"** → choose **M0 Free**
3. Pick a cloud provider + region (any is fine)
4. Under **"Authenticate"** → set a username & password → **Save credentials**
5. Under **"Where would you like to connect from?"** → choose **"My Local Environment"**
   - Add IP: `0.0.0.0/0` (allows all IPs — needed for Render)
6. Click **"Finish and Close"** → **"Go to Databases"**
7. Click **"Connect"** → **"Compass"** or **"Drivers"** → copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/agentpilot?retryWrites=true&w=majority
   ```
   Replace `<username>` and `<password>` with your credentials.

---

## Step 2 — Deploy Backend to Render

1. Go to **https://render.com** → Sign up / Log in (use GitHub)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo (push this project to GitHub first)
4. Configure:
   - **Name:** `agentpilot-backend`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

5. Under **"Environment Variables"**, add these key-value pairs:

   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | your MongoDB Atlas connection string |
   | `SESSION_SECRET` | any long random string (e.g. `openssl rand -hex 32`) |
   | `ANTHROPIC_API_KEY` | your key from https://console.anthropic.com |
   | `FRONTEND_URL` | leave blank for now — fill after Vercel deploy |
   | `GOOGLE_CLIENT_ID` | optional |
   | `GOOGLE_CLIENT_SECRET` | optional |

6. Click **"Create Web Service"**
7. Wait for deploy → copy your backend URL:
   ```
   https://agentpilot-backend.onrender.com
   ```

8. **Go back and set `FRONTEND_URL`** after you finish Step 3.

---

## Step 3 — Deploy Frontend to Vercel

1. Go to **https://vercel.com** → Sign up / Log in (use GitHub)
2. Click **"Add New Project"** → import your GitHub repo
3. Configure:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite (auto-detected)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. Under **"Environment Variables"**, add:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://agentpilot-backend.onrender.com` |

5. Click **"Deploy"**
6. Copy your Vercel URL:
   ```
   https://agentpilot.vercel.app
   ```

---

## Step 4 — Wire the Two Together

### 4a — Update Render FRONTEND_URL
1. Go to Render → your backend service → **Environment**
2. Set `FRONTEND_URL` = `https://agentpilot.vercel.app` (your actual Vercel URL)
3. Click **"Save Changes"** → Render redeploys automatically

### 4b — Update Google OAuth callback (if using Google login)
1. Go to Google Cloud Console → Credentials → your OAuth app
2. Add to **Authorized redirect URIs:**
   ```
   https://agentpilot-backend.onrender.com/auth/google/callback
   ```
3. Set `GOOGLE_CALLBACK_URL` in Render env:
   ```
   https://agentpilot-backend.onrender.com/auth/google/callback
   ```

---

## Step 5 — Verify Deployment

Test these URLs in your browser:

```
# Backend health check
https://agentpilot-backend.onrender.com/health
→ Should return: {"status":"ok"}

# Frontend
https://agentpilot.vercel.app
→ Should show the Agent Pilot landing page

# API
https://agentpilot-backend.onrender.com/api/home
→ Should return JSON with message
```

---

## Push to GitHub (Required Before Deploy)

```bash
# From the project root
git init
git add .
git commit -m "Initial commit — Agent Pilot with 4 AI agent tasks"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/agentpilot.git
git push -u origin main
```

Both Render and Vercel auto-deploy on every push to `main`.

---

## Environment Variables Summary

### Render (Backend)
| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | Yes | Set to `production` |
| `PORT` | No | Render sets this automatically |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `SESSION_SECRET` | Yes | Random secret for sessions |
| `ANTHROPIC_API_KEY` | Yes | From https://console.anthropic.com |
| `FRONTEND_URL` | Yes | Your Vercel URL |
| `GOOGLE_CLIENT_ID` | Optional | For Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Optional | For Google OAuth |
| `GOOGLE_CALLBACK_URL` | Optional | `https://your-render-url/auth/google/callback` |

### Vercel (Frontend)
| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | Your Render backend URL |

---

## Troubleshooting

**CORS errors in browser:**
- Make sure `FRONTEND_URL` on Render exactly matches your Vercel URL (no trailing slash)

**Sessions not persisting (login drops after refresh):**
- Check that `SESSION_SECRET` is set on Render
- Cookie `secure: true` + `sameSite: none` is already configured for production

**Render backend sleeping (free tier):**
- Free Render services sleep after 15 min inactivity → first request takes ~30s to wake
- Upgrade to paid tier or use a cron ping service like https://cron-job.org to keep it awake

**MongoDB connection refused:**
- Make sure IP whitelist on Atlas includes `0.0.0.0/0`
- Double-check the connection string username/password

**AI agents not responding:**
- Verify `ANTHROPIC_API_KEY` is set correctly on Render
- Test the proxy: `POST https://your-render-url/api/agent` (requires auth session)
