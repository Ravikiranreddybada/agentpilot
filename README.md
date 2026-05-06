<div align="center">

# 🤖 Agent Pilot

### **The Enterprise AI Reasoning Engine**

*Autonomous Multi-Agent Workflows powered by Llama 3.3 & FastAPI*

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org)
[![Groq](https://img.shields.io/badge/Groq-f39c12?style=for-the-badge&logo=openai&logoColor=white)](https://groq.com)
[![Pinecone](https://img.shields.io/badge/Pinecone-273c75?style=for-the-badge&logo=pinecone&logoColor=white)](https://pinecone.io)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)

[Explore Demo](https://agentpilot-liard.vercel.app/) • [API Reference](https://agentpilot.onrender.com/docs) • [Report Bug](https://github.com/ravikiranreddybada/agentpilot/issues)

</div>

---

## 📖 Overview

**Agent Pilot** is a production-grade AI orchestration platform that enables autonomous agentic workflows. Unlike traditional chatbots, Agent Pilot uses a **ReAct (Reason + Act)** loop to decompose complex user requests into actionable steps, executing real-world tools—from MongoDB queries to web research—before synthesizing a final answer.

### The Problem
Most AI interfaces are limited to static knowledge or simple RAG. They cannot "act" on your data, query your production databases, or plan multi-step automation.

### The Solution
Agent Pilot provides a suite of **7 specialized AI Agents** that can:
- 🔍 **Research** the live web.
- 🗄️ **Query** MongoDB using natural language.
- 📚 **Chat** with private PDF documents via a high-performance RAG pipeline.
- ⚙️ **Automate** workflows via Slack and HTTP integrations.

---

## 🌐 Live Links

| Service | URL |
| :--- | :--- |
| **🚀 Frontend (Vercel)** | [https://agentpilot-liard.vercel.app/](https://agentpilot-liard.vercel.app/) |
| **📡 Backend (Render)** | [https://agentpilot.onrender.com](https://agentpilot.onrender.com) |
| **🎥 Demo Video** | [Watch on Loom](https://www.loom.com/share/your-demo-link) *(Add your link here)* |

---

## 🛠️ Tech Stack

<details open>
<summary><b>Backend & AI</b></summary>

- **Language**: Python 3.11+
- **Framework**: FastAPI (Async, Pydantic v2)
- **LLM**: Groq (Llama 3.3 70B Versatile)
- **Embeddings**: Jina AI (v2-base-en)
- **Vector DB**: Pinecone (Serverless)
- **Auth**: JWT (PyJWT), Google OAuth 2.0, BCrypt
</details>

<details open>
<summary><b>Frontend</b></summary>

- **Library**: React 18
- **Build Tool**: Vite
- **State Management**: React Context API
- **Styling**: Vanilla CSS (Custom Glassmorphism Design System)
- **Typography**: Syne & JetBrains Mono (Google Fonts)
</details>

<details>
<summary><b>Database & DevOps</b></summary>

- **Primary DB**: MongoDB (Beanie ODM / Motor)
- **Hosting**: Render (Backend), Vercel (Frontend)
- **Containerization**: Docker & Docker Compose
</details>

---

## ✨ Features

### 🤖 7 Specialized AI Agents
1. **Web Research Agent**: Autonomously browses the live web for current events and citations.
2. **MongoDB Data Agent**: Generates and executes MongoDB Shell queries from natural language.
3. **Code Review Agent**: Performs deep static analysis and identifies security vulnerabilities.
4. **Workflow Planner**: Designs and tests multi-step automation pipelines.
5. **Prompt Engineer**: Optimizes raw prompts into production-grade instructions.
6. **API Integration Agent**: Generates and tests real-time API integration code.
7. **RAG Document Agent**: Private knowledge base support (PDF/Text) with semantic search.

### 🧠 ReAct Reasoning Engine
Every agent follows a manual **ReAct** loop:
`Input` → `Thought` → `Action (Tool Call)` → `Observation` → `Final Answer`.

This approach ensures:
- ✅ **Zero Hallucination**: Every answer is grounded in real-world tool output or retrieved context.
- ✅ **LPU Hardware Acceleration**: Blazing fast inference (500+ tokens/sec) via Groq LPUs.
- ✅ **Autonomous Planning**: The AI decides which tools to use and in what order.

---

## 🏗️ Architecture & Workflow

```text
[ Client (React) ] 
       │
       ▼
[ FastAPI (Uvicorn) ] ───▶ [ Auth / Middleware ] 
       │
       ▼
[ Agent Service (ReAct Loop) ] ◀───▶ [ Groq Llama 3.3 LLM ]
       │
       ├─▶ [ Web Search Tool ]
       ├─▶ [ MongoDB Tool ]
       ├─▶ [ Pinecone RAG Tool ] ◀───▶ [ Jina Embeddings ]
       └─▶ [ HTTP/Slack Tools ]
```

---

## 📸 Demo Preview

<div align="center">
  <img src="https://via.placeholder.com/800x450.png?text=Agent+Pilot+Dashboard+Preview" alt="Dashboard Preview" width="800">
  <p><i>Premium Dark Mode Dashboard with Real-time ReAct Agent Execution steps.</i></p>
</div>

---

## 🔑 Resume Bullet Points (Technical Deep-Dive)

*   **The ReAct Innovation**: Implemented a custom **ReAct (Reason + Act) orchestration loop** in Python, enabling agents to autonomously decompose complex tasks into tool calls.
*   **High-Performance RAG**: Engineered a RAG pipeline using **Jina AI embeddings** and **Pinecone**, achieving strict grounded retrieval and **Zero Hallucination** responses.
*   **Hardware Acceleration**: Leveraged **Groq LPU hardware** for Llama 3.3 70B inference, delivering sub-second response times for complex reasoning tasks.
*   **Async Scalability**: Developed a fully asynchronous backend with **FastAPI** and **Motor (MongoDB)**, capable of handling concurrent multi-agent missions without blocking.

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/ravikiranreddybada/agentpilot.git
cd agentpilot
```

### 2. Backend Setup
```bash
cp .env.example .env
pip install -r requirements.txt
python run.py
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 📄 License
This project is licensed under the MIT License.

---

## 👤 Author
**Bada Ravi Kiran Reddy** - *Full Stack Developer*
[GitHub](https://github.com/ravikiranreddybada) | [Portfolio](https://ravikiranreddybada.dev)
