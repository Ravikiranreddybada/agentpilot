"""
JWT utilities.
Mirrors JwtUtils.java and JwtAuthFilter.java.
"""

import os
import time
from typing import Optional
import jwt
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

JWT_SECRET = os.getenv("JWT_SECRET", "fallback-secret-change-in-production")
JWT_EXPIRATION_MS = int(os.getenv("JWT_EXPIRATION_MS", 604800000))  # 7 days

bearer_scheme = HTTPBearer(auto_error=False)


def generate_token(user) -> str:
    """Generate JWT for a user. Mirrors JwtUtils.generateToken()."""
    payload = {
        "id": str(user.id),
        "username": user.username,
        "email": user.email,
        "name": user.name,
        "iat": int(time.time()),
        "exp": int(time.time()) + JWT_EXPIRATION_MS // 1000,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def decode_token(token: str) -> dict:
    """Decode and validate JWT. Raises HTTPException on failure."""
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(bearer_scheme),
) -> dict:
    """
    FastAPI dependency — extracts claims from JWT.
    Mirrors JwtAuthFilter.java (sets SecurityContext from JWT).
    Use as: claims: dict = Depends(get_current_user)
    """
    if not credentials:
        raise HTTPException(status_code=401, detail="No token provided")
    return decode_token(credentials.credentials)


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Security(bearer_scheme),
) -> Optional[dict]:
    """Optional JWT — returns None if no token (for public endpoints)."""
    if not credentials:
        return None
    try:
        return decode_token(credentials.credentials)
    except HTTPException:
        return None
