# 🤖 AgentPilot — Python FastAPI Backend

> **Enterprise AI Reasoning Engine**  
> Built with FastAPI, MongoDB (Beanie), and Groq (Llama-3.3).

---

## 🛠️ Tech Stack

| Layer         | Technology                |
|--------------|---------------------------|
| Framework     | FastAPI 0.115             |
| LLM Client    | openai SDK (Groq)         |
| Auth          | PyJWT + FastAPI Depends   |
| DB ORM        | Beanie (Motor async)      |
| HTTP Client   | httpx (async)             |
| Validation    | Pydantic v2               |
| Password Hash | bcrypt library            |

---

## 🚀 Setup

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure environment
```bash
cp .env.example .env
# Fill in your GROQ_API_KEY, MONGODB_URI, JWT_SECRET, etc.
```

### 3. Run
```bash
python run.py
# OR for production:
uvicorn app.main:app --host 0.0.0.0 --port 10000
```

---

## 📡 API Endpoints (Same as Java version)

| Method | Path            | Auth | Description                          |
|--------|----------------|------|--------------------------------------|
| `GET`  | `/health`       | No   | Health check                         |
| `POST` | `/api/signup`   | No   | Register new user                    |
| `POST` | `/api/login`    | No   | Login → returns JWT                  |
| `POST` | `/api/logout`   | No   | Stateless logout                     |
| `GET`  | `/api/me`       | JWT  | Get current user from token          |
| `POST` | `/api/automate` | JWT  | Run AI agent with tool-calling       |
| `POST` | `/api/agent`    | No   | Direct LLM proxy (no tools)          |
| `POST` | `/api/webhook`  | No   | DevOps demo webhook                  |

### `/api/automate` request body:
```json
{
  "message": "Search for recent AI news",
  "agent_type": "research",
  "thread_id": "optional-thread-id"
}
```

**agent_type** options: `research`, `mongodb`, `codereview`, `workflow`, `prompt`, `api`

---

## 🧠 How the ReAct Loop Works

The agentic loop is implemented using the ReAct (Reason + Act) pattern:
1. Send message + tools to Groq LLM
2. If LLM returns tool_calls → execute each tool, append results to messages
3. Send updated messages back to LLM
4. Repeat until LLM returns plain text (no more tool calls)
5. Return final answer

---

## 📁 Project Structure

```
agentpilot_python/
├── app/
│   ├── main.py              # FastAPI app, CORS, lifespan
│   ├── core/
│   │   ├── database.py      # Motor/Beanie MongoDB setup
│   │   └── security.py      # JWT generation & verification
│   ├── models/
│   │   ├── user.py          # User Beanie document
│   │   └── schemas.py       # Pydantic request/response schemas
│   ├── services/
│   │   ├── user_service.py  # Registration, auth, BCrypt
│   │   └── agent_service.py # ReAct loop, agent prompts
│   ├── tools/
│   │   └── agent_tools.py   # All 5 tools + tool dispatcher
│   └── routers/
│       ├── auth.py          # Auth endpoints
│       └── agent.py         # Agent endpoints
├── run.py                   # Dev server entry point
├── requirements.txt
├── Dockerfile
└── .env.example
```

---

## 🔑 Key Python Concepts Used (Resume-Worthy!)

- **FastAPI** — async REST API framework
- **Beanie ODM** — async MongoDB with Pydantic models
- **OpenAI SDK** — calling Groq LLM with tool-calling
- **ReAct pattern** — manually implemented agentic loop
- **PyJWT** — stateless JWT auth
- **bcrypt** — password hashing
- **httpx** — async HTTP client
- **Pydantic v2** — request/response validation
- **asyncio** — fully async architecture
- **Motor** — async MongoDB driver

---

## 👨‍💻 Resume Bullet Points

```
• Converted enterprise Java Spring Boot AI backend to Python FastAPI,
  maintaining 100% API compatibility with the React frontend

• Implemented ReAct (Reason + Act) agentic loop from scratch using 
  OpenAI tool-calling API with Groq Llama-3.3-70b

• Built 5 AI agent tools: Tavily web search, MongoDB querying,
  HTTP requests, Slack notifications — all async with httpx

• Designed async MongoDB integration using Beanie ODM (Motor driver)
  with JWT authentication via PyJWT and bcrypt password hashing
```
