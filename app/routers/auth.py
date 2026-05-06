"""
Auth endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
import os
import httpx
from app.models.schemas import LoginRequest, SignupRequest
from app.core.security import generate_token, get_current_user
from app.services import user_service
from typing import Any

router = APIRouter()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_CALLBACK_URL = os.getenv("GOOGLE_CALLBACK_URL", "http://localhost:3000/auth/google/callback")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


@router.get("/auth/google")
async def google_login():
    """Redirects to Google OAuth consent screen."""
    url = f"https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id={GOOGLE_CLIENT_ID}&redirect_uri={GOOGLE_CALLBACK_URL}&scope=openid%20email%20profile&access_type=offline"
    return RedirectResponse(url)


@router.get("/auth/google/callback")
async def google_callback(code: str):
    """Handles Google OAuth callback, exchanges code for token, and authenticates user."""
    async with httpx.AsyncClient() as client:
        token_url = "https://oauth2.googleapis.com/token"
        data = {
            "code": code,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": GOOGLE_CALLBACK_URL,
            "grant_type": "authorization_code",
        }
        token_res = await client.post(token_url, data=data)
        if token_res.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to retrieve token from Google")
        
        access_token = token_res.json().get("access_token")
        
        user_info_res = await client.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        if user_info_res.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to retrieve user info from Google")
            
        user_info = user_info_res.json()
        
    email = user_info.get("email")
    name = user_info.get("name")
    google_id = user_info.get("sub")
    avatar = user_info.get("picture", "")
    
    user = await user_service.get_by_email(email)
    if not user:
        user = await user_service.create_oauth_user(email, name, google_id, avatar)
    else:
        if not user.google_id:
            user.google_id = google_id
            await user.save()
            
    token = generate_token(user)
    return RedirectResponse(f"{FRONTEND_URL}/?token={token}")


@router.get("/api/me")
async def get_me(claims: dict = Depends(get_current_user)):
    """Returns current user from JWT claims."""
    return {"user": claims}


@router.post("/api/login")
async def login(req: LoginRequest):
    """Logs in a user and returns a JWT."""
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
    """Registers a new user."""
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
    """JWT is stateless — just tell client to delete token."""
    return {"success": True, "message": "Logged out"}


@router.post("/api/webhook")
async def webhook(payload: Any = None):
    """DevOps demo webhook."""
    print(f"🔔 Webhook Payload Received: {payload}")
    return {"success": True, "message": "Webhook received successfully!"}
