"""
Pydantic schemas for request/response validation.
"""

from typing import Optional
from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    username: str
    password: str


class SignupRequest(BaseModel):
    name: str
    username: str
    email: EmailStr
    password: str
    confirm_password: str


class UserResponse(BaseModel):
    id: str
    name: str
    username: str
    email: str
    avatar: str
    google_id: Optional[str] = None


class AuthResponse(BaseModel):
    token: str
    user: UserResponse
