# 🤖 **AgentPilot** — Production LLM Agentic AI Platform ![Live](https://img.shields.io/badge/Live-Demo-brightgreen) ![Stars](https://img.shields.io/github/stars/Ravikiranreddybada/agentpilot?style=social) 

[![Backend](https://img.shields.io/badge/Backend-Render-blue)](https://agentpilot.onrender.com/health) [![Frontend](https://img.shields.io/badge/Frontend-Vercel-orange)](https://agentpilot-liard.vercel.app/) [![MongoDB](https://img.shields.io/badge/DB-Atlas%20Virginia-green)](https://cloud.mongodb.com)

**Production MERN stack** with **4 Claude-powered AI agents** for enterprise workflows. Auth: Google OAuth + Local. Docker ready.

## 🎥 Live Demo
| Home | Dashboard | AI Agents |
|---|---|---|
| ![Home](https://via.placeholder.com/400x200/blue/white?text=Live+Home) | ![Dashboard](https://via.placeholder.com/400x200/green/white?text=Dashboard) | ![Agents](https://via.placeholder.com/400x200/purple/white?text=AI+Agents) |

## 🚀 4 Production AI Agents

| Agent | Use Case | Input → Output |
|---|---|---|
| **🔍 Web Research** | Complex research | \"Market analysis for EVs\" → Structured report |
| **🗄️ SQL Generator** | Natural language → SQL | Schema + \"Top customers last month\" → Optimized query |
| **🔬 Code Review** | Code analysis | Paste JS/Python → Bugs + refactored code + score |
| **⚙️ Workflow Planner** | Automation planning | \"Automate invoice processing\" → LangChain code |

## 🛠 Tech Stack

```mermaid
graph TB
  A[React/Vite Frontend] --> B[Express REST API Backend]
  B --> C[MongoDB Atlas Virginia]
  B --> D[Claude 3.5 Sonnet]
  E[Google OAuth] --> B
  F[Docker] --> B
  G[GitHub Actions] --> H[Render Backend]
  G --> I[Vercel Frontend]
```

## 🔥 Live URLs
- **Backend API**: https://agentpilot.onrender.com/health `{"status":"ok"}`
- **Frontend**: https://agentpilot-liard.vercel.app/
- **Repo**: https://github.com/Ravikiranreddybada/agentpilot

## ⚡ 2-Minute Deploy

**Backend (Render)**:
```bash
# Auto-deploy from GitHub → Render
# Add env vars: MONGODB_URI, SESSION_SECRET, ANTHROPIC_API_KEY
# + GOOGLE_CLIENT_ID/SECRET for auth
```

**Frontend (Vercel)**:
```bash
vercel --prod  # Auto-detects Vite
```

## 🔑 Production Environment
```
MONGODB_URI=mongodb+srv://...@agent.79exgov.mongodb.net/agentpilot
GOOGLE_CLIENT_ID=517648747100-9eatflldhu4mlvr9po058kb26pkubug8.apps.googleusercontent.com  
ANTHROPIC_API_KEY=your_key
FRONTEND_URL=https://agentpilot-liard.vercel.app
```

## 👨‍💻 Team
**Bada Ravi Kiran Reddy** - Fullstack Architect & Deploy Maestro

[![Made with Claude](https://img.shields.io/badge/Powered%20by-Claude%203.5-purple)](https://anthropic.com/claude)

---

⭐ **Star us on GitHub!** Production-ready Agentic AI platform.
