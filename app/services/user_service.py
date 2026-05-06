"""
User service for handling registration and authentication.
"""

from typing import Optional
import bcrypt
from app.models.user import User


async def authenticate(username: str, password: str) -> Optional[User]:
    """
    Verify username/password.
    Mirrors UserService.authenticate() — uses BCrypt comparison.
    """
    user = await User.find_one(User.username == username.lower())
    if not user or not user.password:
        return None
    if bcrypt.checkpw(password.encode(), user.password.encode()):
        return user
    return None


async def register(
    name: str,
    username: str,
    email: str,
    password: str,
    confirm_password: str,
) -> User:
    """
    Create new user account.
    Mirrors UserService.register() with validation.
    """
    if password != confirm_password:
        raise ValueError("Passwords do not match")

    username = username.lower()
    email = email.lower()

    existing = await User.find_one(
        (User.username == username) | (User.email == email)
    )
    if existing:
        if existing.username == username:
            raise ValueError("Username already taken")
        raise ValueError("Email already registered")

    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    user = User(name=name, username=username, email=email, password=hashed)
    await user.insert()
    return user


def to_user_response(user: User) -> dict:
    return {
        "id": str(user.id),
        "name": user.name,
        "username": user.username,
        "email": user.email,
        "avatar": user.avatar,
        "google_id": user.google_id,
    }


async def get_by_email(email: str) -> Optional[User]:
    return await User.find_one(User.email == email.lower())


async def create_oauth_user(email: str, name: str, google_id: str, avatar: str) -> User:
    username = email.split("@")[0].lower()
    existing = await User.find_one(User.username == username)
    if existing:
        username = f"{username}_{google_id[:5]}"

    user = User(
        name=name,
        username=username,
        email=email.lower(),
        google_id=google_id,
        avatar=avatar,
    )
    await user.insert()
    return user
