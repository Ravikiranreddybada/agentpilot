# 🚀 **Production Deployment Guide** — AgentPilot Live! 

**Live URLs:**
| Service | Status | URL |
|---|---|---|
| Backend | ✅ Render | [Health](https://agentpilot.onrender.com/health) |
| Frontend | ✅ Vercel | [Live Demo](https://agentpilot-liard.vercel.app/) |
| Database | ✅ Atlas Virginia | Virginia M0 cluster |

---

## 🎯 Exact Production Steps (Verified)

### 1. MongoDB Atlas (Virginia Cluster)
```
mongodb+srv://badaravikiranreddy_db_user:m444s95M4zep6uqp@agent.79exgov.mongodb.net/agentpilot?retryWrites=true&w=majority
```
- **Network Access**: `0.0.0.0/0` ✅
- **Database User**: `badaravikiranreddy_db_user` ✅

### 2. Render Backend (`agentpilot`)
**Environment Variables** (Copy-paste):
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://badaravikiranreddy_db_user:m444s95M4zep6uqp@agent.79exgov.mongodb.net/agentpilot?retryWrites=true&w=majority
SESSION_SECRET=your_long_random_secret
ANTHROPIC_API_KEY=sk-ant-...
FRONTEND_URL=https://agentpilot-liard.vercel.app
GOOGLE_CLIENT_ID=517648747100-9eatflldhu4mlvr9po058kb26pkubug8.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=https://agentpilot.onrender.com/auth/google/callback
```

### 3. Vercel Frontend
```
Root: frontend/
VITE_API_URL=https://agentpilot.onrender.com
```

### 4. Google OAuth ✅ **YOUR EXACT SETUP**
**Google Cloud Console → Credentials → Edit OAuth Client:**
```
Authorized redirect URIs:
✓ http://localhost:3000/auth/google/callback
✓ https://agentpilot.onrender.com/auth/google/callback
```

---

## ✅ Production Verification Checklist

```
✅ Backend: https://agentpilot.onrender.com/health → {"status":"ok"}
✅ Frontend: https://agentpilot-liard.vercel.app/ → Loads
✅ Google Auth: Sign in → Dashboard redirect
✅ CORS: Frontend → Backend API calls succeed
✅ Sessions: Login persists across tabs
✅ AI Proxy: /api/agent responds (needs Anthropic key)
```

---

## 🔄 Auto-Deploy Workflow
```
git push → Render + Vercel auto-deploy → Live in 2min
```

## 🐛 Troubleshooting (Production Verified)
| Issue | Fix |
|---|---|
| MongoDB auth | Use exact URI above |
| Google 401 | Add Render callback URI to Google Console |
| CORS | `FRONTEND_URL` exact match |
| Sleepy backend | Free tier → 30s cold start |

---

**Made with ❤️ by Bada Ravi Kiran Reddy**  
⭐ [Star on GitHub](https://github.com/Ravikiranreddybada/agentpilot)
