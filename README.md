<div align="center">

<br/>

```
 █████╗  ██████╗ ███████╗███╗   ██╗████████╗    ██████╗ ██╗██╗      ██████╗ ████████╗
██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝    ██╔══██╗██║██║     ██╔═══██╗╚══██╔══╝
███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║       ██████╔╝██║██║     ██║   ██║   ██║   
██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║       ██╔═══╝ ██║██║     ██║   ██║   ██║   
██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║       ██║     ██║███████╗╚██████╔╝   ██║   
╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝  ╚═╝       ╚═╝     ╚═╝╚══════╝ ╚═════╝   ╚═╝   
```

### Enterprise AI Reasoning Engine
**Autonomous Multi-Agent Workflows · ReAct Orchestration · Production-Grade RAG**

<br/>

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React_18-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactjs.org)
[![Groq](https://img.shields.io/badge/Groq_LPU-f39c12?style=flat-square&logo=openai&logoColor=white)](https://groq.com)
[![Pinecone](https://img.shields.io/badge/Pinecone-273c75?style=flat-square&logo=pinecone&logoColor=white)](https://pinecone.io)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

<br/>

[**Live Demo**](https://agentpilot-liard.vercel.app/) · [**API Docs**](https://agentpilot.onrender.com/docs) · [**Report Bug**](https://github.com/ravikiranreddybada/agentpilot/issues) · [**Request Feature**](https://github.com/ravikiranreddybada/agentpilot/issues)

<br/>

</div>

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**Agent Pilot** is a production-grade AI orchestration platform built on a **ReAct (Reason + Act)** loop. Instead of returning static, pre-trained answers, it decomposes complex requests into discrete tool calls — querying live databases, crawling the web, and executing code — before synthesizing a grounded final response.

> **Why ReAct?** Traditional RAG pipelines retrieve documents and generate answers in a single shot. ReAct agents *plan*, *act*, and *observe* in an iterative loop — meaning they can correct course, chain dependent operations, and arrive at answers that are verifiably grounded in real-world output.

### Core Capabilities

| Capability | Description |
|---|---|
| 🔍 **Live Web Research** | Autonomous browsing with real-time citations |
| 🗄️ **Natural Language → MongoDB** | Query your production database in plain English |
| 📚 **Private Document RAG** | Semantic search over uploaded PDFs and text files |
| ⚙️ **Workflow Automation** | Multi-step pipelines via Slack and HTTP integrations |
| 🧠 **Zero-Hallucination Guarantee** | Every claim is grounded in tool output or retrieved context |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENT (React 18 + Vite)                        │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │ HTTPS / REST
┌─────────────────────────────────▼───────────────────────────────────────┐
│                      FASTAPI (Uvicorn · Async)                          │
│                                                                          │
│   ┌──────────────────┐    ┌──────────────────────────────────────────┐  │
│   │  Auth Middleware  │    │           Agent Service                  │  │
│   │  JWT · Google     │    │                                          │  │
│   │  OAuth · BCrypt   │    │   Input → Thought → Action → Observe    │  │
│   └──────────────────┘    │              ↕ ReAct Loop ↕              │  │
│                            └──────────────┬───────────────────────────┘  │
└───────────────────────────────────────────┼─────────────────────────────┘
                                            │
              ┌─────────────────────────────┼────────────────────────────┐
              │                             │                            │
   ┌──────────▼──────────┐    ┌─────────────▼────────────┐  ┌───────────▼──────────┐
   │   Groq Inference    │    │    Tool Executors         │  │   Data Layer         │
   │                     │    │                           │  │                      │
   │  Llama 3.3 70B      │    │  ● Web Search             │  │  MongoDB (Motor)     │
   │  LPU Acceleration   │    │  ● MongoDB Shell          │  │  Pinecone (Vector)   │
   │  500+ tok/sec       │    │  ● Pinecone RAG            │  │  Jina Embeddings     │
   └─────────────────────┘    │  ● HTTP/Slack             │  └──────────────────────┘
                               └───────────────────────────┘
```

### ReAct Loop — Step by Step

```
User Input
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│  THOUGHT    "I need to look up live data to answer this" │
└──────────────────────────────┬──────────────────────────┘
                               │
    ▼
┌─────────────────────────────────────────────────────────┐
│  ACTION     Call Web Search Tool with query             │
└──────────────────────────────┬──────────────────────────┘
                               │
    ▼
┌─────────────────────────────────────────────────────────┐
│  OBSERVATION  Tool returns structured results           │
└──────────────────────────────┬──────────────────────────┘
                               │
    ▼  (loop until done)
┌─────────────────────────────────────────────────────────┐
│  FINAL ANSWER  Synthesized from real tool outputs only  │
└─────────────────────────────────────────────────────────┘
```

---

## Features

### 7 Specialized AI Agents

<details>
<summary><b>1. Web Research Agent</b></summary>

Autonomously crawls the live web to answer time-sensitive queries. Returns structured responses with inline citations to primary sources — no hallucinated references.

**Use cases:** Market research, competitor analysis, news summarization, real-time fact-checking.
</details>

<details>
<summary><b>2. MongoDB Data Agent</b></summary>

Translates natural language questions into valid MongoDB Shell queries, executes them against your connected cluster, and returns formatted results with the generated query visible for auditability.

**Use cases:** Ad-hoc analytics, non-technical data access, query prototyping.
</details>

<details>
<summary><b>3. Code Review Agent</b></summary>

Performs deep static analysis across multiple dimensions: correctness, performance, security vulnerabilities (OWASP), and style. Returns structured findings with severity levels and remediation suggestions.

**Use cases:** Pre-PR reviews, security audits, onboarding code walkthroughs.
</details>

<details>
<summary><b>4. Workflow Planner Agent</b></summary>

Designs multi-step automation pipelines from a plain-English description. Outputs a structured plan with dependencies, can simulate execution, and generates boilerplate integration code.

**Use cases:** ETL design, Slack bot workflows, scheduled job planning.
</details>

<details>
<summary><b>5. Prompt Engineer Agent</b></summary>

Analyzes a raw prompt for ambiguity, missing constraints, and role clarity. Outputs a production-grade rewrite with explanations for each change.

**Use cases:** Improving LLM outputs, building system prompts, prompt versioning.
</details>

<details>
<summary><b>6. API Integration Agent</b></summary>

Generates tested, runnable API integration code from an endpoint description or OpenAPI spec. Supports authentication patterns (API key, OAuth, JWT) and handles error cases.

**Use cases:** Third-party integrations, SDK scaffolding, webhook handlers.
</details>

<details>
<summary><b>7. RAG Document Agent</b></summary>

Uploads and indexes private documents (PDF, TXT) into a Pinecone namespace. Answers questions with exact passage citations, preserving confidentiality by never sending raw documents to external APIs.

**Use cases:** Internal knowledge bases, contract review, technical documentation Q&A.
</details>

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **LLM Inference** | Groq — Llama 3.3 70B Versatile | 500+ tok/sec via LPU hardware |
| **Embeddings** | Jina AI `v2-base-en` | Semantic vector generation |
| **Vector Store** | Pinecone Serverless | Similarity search at scale |
| **Backend** | FastAPI + Uvicorn | Async REST API |
| **ORM/ODM** | Beanie + Motor | Async MongoDB access |
| **Primary DB** | MongoDB Atlas | Document storage |
| **Auth** | PyJWT + Google OAuth 2.0 + BCrypt | Token-based authentication |
| **Frontend** | React 18 + Vite | SPA with Context API |
| **Styling** | Vanilla CSS (Glassmorphism) | Custom design system |
| **Fonts** | Syne + JetBrains Mono | UI typography |
| **Containerization** | Docker + Docker Compose | Local dev environment |
| **Hosting** | Render (API) + Vercel (Frontend) | Production deployment |

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker & Docker Compose (optional, for full local stack)
- Accounts and API keys for: [Groq](https://groq.com), [Pinecone](https://pinecone.io), [Jina AI](https://jina.ai), MongoDB Atlas

### 1. Clone the Repository

```bash
git clone https://github.com/ravikiranreddybada/agentpilot.git
cd agentpilot
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Open `.env` and populate all required values:

```env
# LLM
GROQ_API_KEY=your_groq_api_key

# Vector Store
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=agentpilot

# Embeddings
JINA_API_KEY=your_jina_api_key

# Database
MONGODB_URI=your_mongodb_connection_string

# Auth
SECRET_KEY=your_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
```

### 3. Backend Setup

```bash
# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the API server
python run.py
```

The API will be available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The UI will be available at `http://localhost:5173`.

### 5. Docker Compose (Full Stack)

```bash
docker compose up --build
```

This starts both the backend and frontend with hot-reloading enabled.

---

## API Reference

Full interactive documentation is available at [`/docs`](https://agentpilot.onrender.com/docs) (Swagger UI) and [`/redoc`](https://agentpilot.onrender.com/redoc).

### Key Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Obtain a JWT access token |
| `GET` | `/auth/google` | Initiate Google OAuth flow |
| `POST` | `/agents/{agent_id}/run` | Execute an agent with a prompt |
| `POST` | `/rag/upload` | Upload a document to the knowledge base |
| `GET` | `/rag/query` | Query the private document store |
| `GET` | `/health` | Service health check |

### Example: Running an Agent

```bash
curl -X POST "https://agentpilot.onrender.com/agents/web-research/run" \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What are the latest developments in Groq LPU technology?",
    "max_iterations": 5
  }'
```

**Response:**

```json
{
  "agent_id": "web-research",
  "status": "completed",
  "iterations": 3,
  "reasoning_trace": [
    { "step": "thought", "content": "I need to search for recent Groq news." },
    { "step": "action", "tool": "web_search", "query": "Groq LPU 2025 updates" },
    { "step": "observation", "content": "..." }
  ],
  "final_answer": "...",
  "citations": ["https://groq.com/blog/..."]
}
```

---

## Project Structure

```
agentpilot/
│
├── app/
│   ├── agents/                 # Agent definitions and ReAct loop
│   │   ├── base_agent.py       # Abstract ReAct orchestrator
│   │   ├── web_research.py
│   │   ├── mongodb_agent.py
│   │   ├── code_review.py
│   │   ├── workflow_planner.py
│   │   ├── prompt_engineer.py
│   │   ├── api_integration.py
│   │   └── rag_agent.py
│   │
│   ├── tools/                  # Tool implementations
│   │   ├── web_search.py
│   │   ├── mongodb_tool.py
│   │   ├── pinecone_tool.py
│   │   └── http_tool.py
│   │
│   ├── routers/                # FastAPI route handlers
│   │   ├── auth.py
│   │   ├── agents.py
│   │   └── rag.py
│   │
│   ├── models/                 # Beanie ODM documents
│   ├── services/               # Business logic layer
│   ├── core/                   # Config, security, dependencies
│   └── main.py
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── styles/
│   └── vite.config.js
│
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
└── run.py
```

---

## Deployment

### Backend — Render

1. Connect your GitHub repository to Render.
2. Set **Environment** to `Python 3.11`, **Start Command** to `python run.py`.
3. Add all environment variables from `.env.example` in the Render dashboard.
4. Deploy. The service URL will be your `VITE_API_BASE_URL` for the frontend.

### Frontend — Vercel

1. Connect your GitHub repository to Vercel.
2. Set the **Root Directory** to `frontend`.
3. Add environment variable: `VITE_API_BASE_URL=https://your-render-service.onrender.com`
4. Deploy.

---

## Contributing

Contributions are welcome. Please follow the process below:

1. Fork the repository and create a feature branch: `git checkout -b feat/your-feature`
2. Make your changes with clear, atomic commits.
3. Ensure all existing tests pass: `pytest`
4. Open a Pull Request with a detailed description of the change and its motivation.

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for the full code of conduct and contribution guidelines.

---

## License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for full text.

---

<div align="center">

Built by [**Bada Ravi Kiran Reddy**](https://ravikiranreddybada.dev)

[![GitHub](https://img.shields.io/badge/GitHub-ravikiranreddybada-181717?style=flat-square&logo=github)](https://github.com/ravikiranreddybada)
[![Portfolio](https://img.shields.io/badge/Portfolio-ravikiranreddybada.dev-0a0a0a?style=flat-square&logo=vercel)](https://ravikiranreddybada.dev)

</div>
