"""
Auth endpoints.
Mirrors AuthController.java — /api/login, /api/signup, /api/logout, /api/me, /api/webhook.
"""

from fastapi import APIRouter, Depends, HTTPException
from app.models.schemas import LoginRequest, SignupRequest
from app.core.security import generate_token, get_current_user
from app.services import user_service
from typing import Any

router = APIRouter()


@router.get("/api/me")
async def get_me(claims: dict = Depends(get_current_user)):
    """Mirrors GET /api/me — returns current user from JWT claims."""
    return {"user": claims}


@router.post("/api/login")
async def login(req: LoginRequest):
    """Mirrors POST /api/login."""
    user = await user_service.authenticate(req.username, req.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = generate_token(user)
    return {
        "token": token,
        "user": user_service.to_user_response(user),
    }


@router.post("/api/signup")
async def signup(req: SignupRequest):
    """Mirrors POST /api/signup."""
    try:
        await user_service.register(
            req.name,
            req.username,
            str(req.email),
            req.password,
            req.confirm_password,
        )
        return {"success": True, "message": "Account created! Please log in."}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/api/logout")
async def logout():
    """JWT is stateless — just tell client to delete token. Mirrors POST /api/logout."""
    return {"success": True, "message": "Logged out"}


@router.post("/api/webhook")
async def webhook(payload: Any = None):
    """DevOps demo webhook. Mirrors POST /api/webhook."""
    print(f"🔔 Webhook Payload Received: {payload}")
    return {"success": True, "message": "Webhook received successfully!"}
