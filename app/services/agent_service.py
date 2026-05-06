"""
Agent service for the ReAct tool-calling loop.

The tool-calling loop is manually implemented here
using the openai Python SDK pointing at Groq's base URL.
"""

import os
import json
import asyncio
import logging
from typing import Any

from openai import AsyncOpenAI
from app.tools.agent_tools import TOOL_DEFINITIONS, call_tool

logger = logging.getLogger(__name__)

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_BASE_URL = "https://api.groq.com/openai/v1"
MODEL = "llama-3.3-70b-versatile"
MAX_TOKENS = 2048
TIMEOUT_SECONDS = 45

# Agent Prompts Map
AGENT_PROMPTS: dict[str, str] = {
    "research": """
You are a Web Research Agent powered by Groq Llama 3.3.
For MOST questions, answer directly from your training knowledge.
ONLY call the search_web tool when the user explicitly asks for current events,
live prices, today's news, or real-time web information.
Give thorough, well-structured answers. If you use search, cite the sources briefly.""",

    "mongodb": """
You are a MongoDB Query Generator Agent powered by Groq Llama 3.3.
When the user asks to query data, FIRST call get_collection_names to discover collections,
THEN call execute_mongo_query with the collection and filter.
ALWAYS show the equivalent MongoDB Shell query in your final answer using:
```mongodb
db.collection.find({...})
```
For date ranges use: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
For general MongoDB questions (no actual query needed), answer from knowledge without calling tools.""",

    "codereview": """
You are an expert Code Review Agent powered by Groq Llama 3.3.
Analyze the provided code carefully. Identify bugs, security vulnerabilities,
performance issues, and bad practices.
Structure your response as: 1) Summary 2) Issues Found 3) Improved Code 4) Explanation.
Answer directly from your deep programming knowledge.""",

    "workflow": """
You are a Workflow Automation Planner powered by Groq Llama 3.3.
Help users design step-by-step automation workflows for their business goals.
You can call execute_http_request to test live API endpoints if needed.
You can call send_slack_notification to send team alerts as part of a workflow demo.
Structure your response as: 1) Workflow Overview 2) Step-by-Step Plan 3) Tools/Services 4) Pseudocode.""",

    "prompt": """
You are an expert Prompt Engineering Agent powered by Groq Llama 3.3.
Transform the user's raw prompt into a highly structured, production-grade optimized prompt.
Do NOT include any analysis, explanations, or variations. ONLY output the final optimized prompt.""",

    "api": """
You are an API Integration Expert powered by Groq Llama 3.3.
Generate complete, production-ready API integration code with error handling and retry logic.
You can call execute_http_request to test a live endpoint and show real response data.
Structure your response as: 1) Overview 2) Full Code Example 3) Error Handling 4) Testing Instructions.""",
}

BASE_SYSTEM = (
    "You are a highly capable AI agent. When calling tools, ensure your arguments are complete and valid. "
    "Do not cut off your response early. Complete the full answer after using tools."
)


class AgentService:
    """
    Implements the ReAct (Reason + Act) agentic loop with tool calling.
    
    We implement the tool-calling loop explicitly:
    LLM → may call tools → tool executes → result fed back → LLM continues → final answer.
    """

    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=GROQ_API_KEY,
            base_url=GROQ_BASE_URL,
        )

    async def run_agent(self, message: str, agent_type: str, thread_id: str) -> dict:
        """
        Mirrors AgentService.runAgent().
        
        Runs the selected agent with a 45-second timeout.
        Returns {"output": str, "steps": list}.
        """
        agent_system_prompt = AGENT_PROMPTS.get(
            agent_type, "You are a helpful AI assistant."
        )
        full_system_prompt = BASE_SYSTEM + "\n\n" + agent_system_prompt.strip()

        logger.debug("Running agent type=%s thread_id=%s", agent_type, thread_id)

        try:
            result = await asyncio.wait_for(
                self._react_loop(full_system_prompt, message),
                timeout=TIMEOUT_SECONDS,
            )
            return result
        except asyncio.TimeoutError:
            raise RuntimeError(
                "Agent timed out after 45 seconds. The LLM may be overloaded — try again."
            )

    async def _react_loop(self, system_prompt: str, user_message: str) -> dict:
        """
        The ReAct tool-calling loop.
        Keeps calling the LLM until it produces a final text response (no more tool calls).
        """
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ]
        steps = []

        while True:
            response = await self.client.chat.completions.create(
                model=MODEL,
                messages=messages,
                tools=TOOL_DEFINITIONS,
                tool_choice="auto",
                max_tokens=MAX_TOKENS,
                temperature=0.0,
            )

            choice = response.choices[0]
            message = choice.message

            # Append assistant message to history
            messages.append(message.model_dump(exclude_none=True))

            # If no tool calls — we have the final answer
            if not message.tool_calls:
                return {
                    "output": message.content or "",
                    "steps": steps,
                }

            # Execute each tool call and feed results back
            for tool_call in message.tool_calls:
                tool_name = tool_call.function.name
                try:
                    arguments = json.loads(tool_call.function.arguments)
                except json.JSONDecodeError:
                    arguments = {}

                logger.info("Tool call: %s(%s)", tool_name, arguments)
                tool_result = await call_tool(tool_name, arguments)

                steps.append({
                    "tool": tool_name,
                    "input": arguments,
                    "output": tool_result[:500],  # truncate for response
                })

                # Feed tool result back into conversation
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": tool_result,
                })


# Singleton instance
agent_service = AgentService()
