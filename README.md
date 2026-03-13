# 🤖 Agent Pilot — LLM-Based Agentic AI Platform

> **LLM-Based Agentic AI for Tool-Using Reasoning Workflows Automation**

A full-stack MERN application featuring **four intelligent AI agents** that automate complex enterprise workflows using LLM-based reasoning.

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-7-brightgreen)
![React](https://img.shields.io/badge/React-18-blue)
![Claude](https://img.shields.io/badge/Claude-AI-purple)

---

## 🚀 The 4 AI Agent Tasks

### Task 1 — 🔍 Web Research Agent
Breaks any research query into sub-questions, reasons through each, and synthesizes a structured answer with Key Takeaways.
**Use:** Type any research question → structured reasoning output.

### Task 2 — 🗄️ SQL Query Generator
Paste your database schema + describe what you want in plain English → get optimized SQL with reasoning steps, explanation, and performance tips.

### Task 3 — 🔬 Code Review Agent
Paste any code → agent analyzes bugs, security vulnerabilities, performance, code quality, provides refactored version + score out of 10.
**Languages:** JavaScript, Python, Java, TypeScript, SQL, Go

### Task 4 — ⚙️ Workflow Automation Planner
Describe your automation goal and available tools → step-by-step plan, LangChain/Python code skeleton, and time savings estimate.

---

## ⚡ Quick Start

```bash
# Backend
cd backend && npm install
# Create .env with MONGODB_URI, SESSION_SECRET, ANTHROPIC_API_KEY
npm run dev   # → http://localhost:3000

# Frontend (new terminal)
cd frontend && npm install && npm run dev  # → http://localhost:5173
```

### Docker
```bash
docker-compose up -d --build
```

---

## 🔑 Environment Variables

| Variable | Required |
|---|---|
| MONGODB_URI | Yes |
| SESSION_SECRET | Yes |
| ANTHROPIC_API_KEY | Yes (AI agents) |
| GOOGLE_CLIENT_ID | Optional |
| GOOGLE_CLIENT_SECRET | Optional |

---

## 👥 Team

| Member | Role |
|---|---|
| Kandukuri Eekshith Sai | Backend & DevOps |
| Veludandi Tanish | Developer & QA |
| Bada Ravi Kiran Reddy | Frontend & UI/UX |

---
ISC License
