# 🤖 **AgentPilot** — Production LLM Agentic AI Platform 

[![Backend](https://img.shields.io/badge/Backend-Render-blue)](https://agentpilot.onrender.com/health) [![Frontend](https://img.shields.io/badge/Frontend-Vercel-orange)](https://agentpilot-liard.vercel.app/) [![MongoDB](https://img.shields.io/badge/DB-Atlas%20Virginia-green)](https://cloud.mongodb.com)

**Production MERN stack** with **4 LLM-powered AI agents** for enterprise workflows. Auth: Google OAuth + Local. Docker ready.

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
  B --> D[LLM API]
  E[Google OAuth] --> B
  F[Docker] --> B
  G[GitHub] --> H[Render Backend]
  G --> I[Vercel Frontend]
```

## 🔥 Live URLs
- **Backend API**: https://agentpilot.onrender.com/health `{"status":"ok"}`
- **Frontend**: https://agentpilot-liard.vercel.app/
- **Repo**: https://github.com/Ravikiranreddybada/agentpilot

## ⚡ 2-Minute Deploy

**Backend (Render)**:
```
# Connect GitHub repo → backend/ → Node → npm install → npm start
```

**Frontend (Vercel)**:
```
vercel --prod  # Auto Vite deploy
```

## 🔑 Production Environment
```
MONGODB_URI=mongodb+srv://...@agent.79exgov.mongodb.net/agentpilot
GOOGLE_CLIENT_ID=517648747100-9eatflldhu4mlvr9po058kb26pkubug8.apps.googleusercontent.com
ANTHROPIC_API_KEY=your_key  
FRONTEND_URL=https://agentpilot-liard.vercel.app
```

## 👨‍💻 Creator
**Bada Ravi Kiran Reddy** — Fullstack & DevOps

---

Production-ready Agentic AI platform. Deploy in 2 minutes.
