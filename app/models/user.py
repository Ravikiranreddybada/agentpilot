"""
User document model.
Mirrors User.java (MongoDB @Document with Spring Data).
Uses Beanie ODM for async MongoDB.
"""

from typing import Optional
from datetime import datetime, timezone
from beanie import Document
from pydantic import Field


class User(Document):
    name: str
    username: str  # unique, lowercase
    email: str     # unique, lowercase
    phone: str = ""
    password: Optional[str] = None   # BCrypt hash; None for Google-only accounts
    google_id: Optional[str] = None  # Populated for Google OAuth sign-ins
    avatar: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "users"
        indexes = [
            [("username", 1)],
            [("email", 1)],
        ]
