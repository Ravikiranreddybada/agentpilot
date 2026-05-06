"""
Agent endpoints.
Mirrors AgentController.java — /api/automate, /api/agent.
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Any, Optional
from app.core.security import get_current_user
from app.services.agent_service import agent_service
from openai import AsyncOpenAI
import os

router = APIRouter()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
MODEL = "llama-3.3-70b-versatile"


class AutomateRequest(BaseModel):
    """Mirrors AgentDto.AutomateRequest."""
    message: str
    agent_type: str
    thread_id: Optional[str] = None


class GroqMessage(BaseModel):
    role: str
    content: str


class GroqRequest(BaseModel):
    """Mirrors AgentDto.GroqRequest."""
    system: Optional[str] = None
    messages: Optional[list[dict]] = None
    max_tokens: Optional[int] = 1000


@router.post("/api/automate")
async def automate(
    req: AutomateRequest,
    claims: dict = Depends(get_current_user),
):
    """
    Mirrors POST /api/automate.
    Runs the selected agent type with tool-calling (ReAct loop).
    """
    if not req.message or not req.agent_type:
        raise HTTPException(status_code=400, detail="Missing message or agent_type")

    thread_id = req.thread_id or f"user-{claims.get('id')}-{req.agent_type}"

    try:
        result = await agent_service.run_agent(req.message, req.agent_type, thread_id)
        return result
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/agent")
async def agent_proxy(req: GroqRequest):
    """
    Direct LLM proxy (no tools).
    Mirrors POST /api/agent in auth.js — returns { content: [{ type, text }] }.
    """
    try:
        client = AsyncOpenAI(
            api_key=GROQ_API_KEY,
            base_url="https://api.groq.com/openai/v1",
        )

        messages = []
        if req.system:
            messages.append({"role": "system", "content": req.system})

        user_content = "Hello"
        if req.messages:
            user_msgs = [m for m in req.messages if m.get("role") == "user"]
            if user_msgs:
                user_content = user_msgs[-1].get("content", "Hello")
        messages.append({"role": "user", "content": user_content})

        response = await client.chat.completions.create(
            model=MODEL,
            messages=messages,
            max_tokens=req.max_tokens or 1000,
        )
        text = response.choices[0].message.content or ""

        # Mirror original response shape
        return {"content": [{"type": "text", "text": text}]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
