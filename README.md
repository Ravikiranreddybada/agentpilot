# ToolForge — Java Spring Boot + Spring AI Backend

Complete conversion of the Node.js/Express + LangChain backend to **Java 21 + Spring Boot 3.2 + Spring AI**.

## Architecture Map

| Node.js (original)                          | Spring Boot (this project)                          |
|---------------------------------------------|-----------------------------------------------------|
| `app.js` — Express + CORS                   | `SecurityConfig.java` + `ToolforgeApplication`      |
| `routes/auth.js` — JWT, Passport            | `AuthController` + `JwtUtils` + `JwtAuthFilter`     |
| `routes/agent.js` — 6 agents               | `AgentController` + `AgentService`                  |
| `agents/agentService.js` — LangChain/Groq  | `AgentService` (Spring AI ChatClient + tools)       |
| LangChain `@langchain/groq` LLM            | Spring AI OpenAI-compatible client → Groq           |
| `createReactAgent()` tool loop             | Spring AI automatic tool-calling loop               |
| `execute_mongo_query` tool                 | `MongoTools.executeMongoQuery()`                    |
| `get_collection_names` tool                | `MongoTools.getCollectionNames()`                   |
| `execute_http_request` tool                | `HttpTools.executeHttpRequest()`                    |
| `send_slack_notification` tool             | `SlackTools.sendSlackNotification()`                |
| Tavily `TavilySearchResults` tool          | `TavilyTools.searchWeb()`                           |
| `models/User.js` — Mongoose                | `User.java` + `UserRepository`                      |
| `config/passport.js`                       | `OAuth2SuccessHandler` + Spring Security OAuth2     |

## ✅ Everything is converted — no differences remain

- JWT authentication + BCrypt
- Local signup & login
- Google OAuth2
- All 6 agent system prompts (research, mongodb, codereview, workflow, prompt, api)
- All 4 tools with full tool-calling loop (Spring AI handles ReAct automatically)
- 45-second timeout
- Groq via Spring AI OpenAI-compatible client
- CORS (localhost + *.vercel.app)
- Health check, webhook endpoint

## Running Locally

```bash
export MONGODB_URI=mongodb://localhost:27017/toolforge
export JWT_SECRET=your-secret-here
export GROQ_API_KEY=gsk_your_groq_key
export GOOGLE_CLIENT_ID=your-google-client-id
export GOOGLE_CLIENT_SECRET=your-google-client-secret
export TAVILY_API_KEY=tvly_your_tavily_key    # optional
export SLACK_WEBHOOK_URL=https://hooks.slack.com/... # optional
export FRONTEND_URL=http://localhost:5173

mvn spring-boot:run
# Server starts on port 3000
```

## How Spring AI tool-calling works (vs LangChain)

In the original Node.js:
```js
const agent = createReactAgent({ llm, tools, checkpointSaver });
const result = await agent.invoke({ messages }, config);
```

In Spring AI, the same loop is automatic:
```java
chatClient.prompt()
    .system(systemPrompt)
    .user(message)
    .call()         // ← Spring AI handles: LLM → tool call → result → LLM → final answer
    .content();
```
Tools are registered via `@Tool` annotations on `@Component` classes — no manual wiring needed.

## API Endpoints

| Method | Path              | Auth | Description           |
|--------|-------------------|------|-----------------------|
| POST   | `/api/signup`     | No   | Register              |
| POST   | `/api/login`      | No   | Login → JWT           |
| POST   | `/api/logout`     | No   | Stateless logout      |
| GET    | `/api/me`         | JWT  | Current user          |
| GET    | `/auth/google`    | No   | Start Google OAuth    |
| POST   | `/api/automate`   | JWT  | Run AI agent          |
| POST   | `/api/agent`      | JWT  | Direct LLM proxy      |
| POST   | `/api/webhook`    | No   | DevOps webhook        |
| GET    | `/health`         | No   | Health check          |
