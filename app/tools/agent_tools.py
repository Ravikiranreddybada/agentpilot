"""
Agent tools definitions.

Each function is a tool that the LLM can call via the OpenAI tool-calling API.
Tool schemas are defined as JSON schema dicts for use with the Groq/OpenAI API.
"""

import os
import json
import asyncio
import httpx
from typing import Any
import motor.motor_asyncio

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY", "")
TAVILY_URL = os.getenv("TAVILY_URL", "https://api.tavily.com/search")
SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL", "")
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://127.0.0.1:27017/toolforge")


# ─── Tool Definitions (JSON Schema for Groq/OpenAI) ──────────────────────────

TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "search_web",
            "description": (
                "Searches the web for current, real-time information using Tavily. "
                "ONLY use this when the user explicitly asks for current events, live prices, "
                "today's news, or real-time web data. Do NOT use for general knowledge questions."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "The search query string"},
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_collection_names",
            "description": (
                "Returns all collection names in the MongoDB database. "
                "Always call this first before querying to discover available data."
            ),
            "parameters": {"type": "object", "properties": {}},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "execute_mongo_query",
            "description": (
                "Executes a find query on a MongoDB collection and returns up to 5 documents. "
                "collectionName is the collection to query. "
                'queryJson is a JSON filter string e.g. {} for all docs or {"status":"active"}.'
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "collection_name": {"type": "string", "description": "The collection to query"},
                    "query_json": {
                        "type": "string",
                        "description": 'JSON filter string, e.g. {} or {"status":"active"}',
                    },
                },
                "required": ["collection_name"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "execute_http_request",
            "description": (
                "Makes a real HTTP GET request to a public API URL and returns the actual response data. "
                "Use this when you need to call an external REST API."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "url": {"type": "string", "description": "The full API URL to call"},
                },
                "required": ["url"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "send_slack_notification",
            "description": "Sends a Slack notification to the team. Input is the message text to post.",
            "parameters": {
                "type": "object",
                "properties": {
                    "message": {"type": "string", "description": "The text message to post to Slack"},
                },
                "required": ["message"],
            },
        },
    },
]


# ─── Tool Implementations ─────────────────────────────────────────────────────

async def search_web(query: str) -> str:
    """Mirrors TavilyTools.searchWeb()"""
    if not TAVILY_API_KEY:
        return "TAVILY_API_KEY not configured. Cannot perform web search."
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                TAVILY_URL,
                json={
                    "api_key": TAVILY_API_KEY,
                    "query": query,
                    "max_results": 3,
                    "include_answer": True,
                },
            )
            data = response.json()
            parts = []
            if "answer" in data:
                parts.append(f"Answer: {data['answer']}\n")
            if "results" in data:
                parts.append("Sources:")
                for r in data["results"]:
                    content = r.get("content", "")[:200]
                    parts.append(f"- {r.get('title')}: {r.get('url')}\n  {content}...")
            return "\n".join(parts)
    except Exception as e:
        return f"Web search failed: {e}"


async def get_collection_names() -> str:
    """Mirrors MongoTools.getCollectionNames()"""
    try:
        client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URI)
        db_name = MONGODB_URI.rsplit("/", 1)[-1].split("?")[0] or "toolforge"
        db = client[db_name]
        names = await db.list_collection_names()
        client.close()
        return json.dumps(names)
    except Exception as e:
        return f"MongoDB Error: {e}"


async def execute_mongo_query(collection_name: str, query_json: str = "{}") -> str:
    """Mirrors MongoTools.executeMongoQuery()"""
    try:
        client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URI)
        db_name = MONGODB_URI.rsplit("/", 1)[-1].split("?")[0] or "toolforge"
        db = client[db_name]
        collection = db[collection_name]
        filter_doc = json.loads(query_json or "{}")
        cursor = collection.find(filter_doc).limit(5)
        results = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            results.append(doc)
        client.close()
        return json.dumps(results, default=str) if results else "No documents found."
    except Exception as e:
        return f"MongoDB Error: {e}"


async def execute_http_request(url: str) -> str:
    """Mirrors HttpTools.executeHttpRequest()"""
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(url)
            if response.status_code < 200 or response.status_code >= 300:
                return f"Request failed with status: {response.status_code}"
            data = response.json()
            if isinstance(data, list) and len(data) > 5:
                data = data[:5]
            return json.dumps(data, indent=2)
    except Exception as e:
        return f"HTTP Request failed: {e}"


async def send_slack_notification(message: str) -> str:
    """Mirrors SlackTools.sendSlackNotification()"""
    if not SLACK_WEBHOOK_URL:
        return "SLACK_WEBHOOK_URL not configured."
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            await client.post(
                SLACK_WEBHOOK_URL,
                json={
                    "text": message,
                    "username": "ToolForge Bot",
                    "icon_emoji": ":robot_face:",
                },
            )
        return "Slack notification sent successfully!"
    except Exception as e:
        return f"Failed to send Slack notification: {e}"


# ─── Tool Dispatcher ──────────────────────────────────────────────────────────

async def call_tool(tool_name: str, arguments: dict) -> str:
    """
    Routes a tool call by name to the correct implementation.
    Used by the agent reasoning loop in AgentService.
    """
    if tool_name == "search_web":
        return await search_web(arguments["query"])
    elif tool_name == "get_collection_names":
        return await get_collection_names()
    elif tool_name == "execute_mongo_query":
        return await execute_mongo_query(
            arguments["collection_name"],
            arguments.get("query_json", "{}"),
        )
    elif tool_name == "execute_http_request":
        return await execute_http_request(arguments["url"])
    elif tool_name == "send_slack_notification":
        return await send_slack_notification(arguments["message"])
    else:
        return f"Unknown tool: {tool_name}"
