"""
MongoDB async connection using Motor.
Mirrors Spring Data MongoDB configuration.
"""

import os
import motor.motor_asyncio
from beanie import init_beanie
from app.models.user import User

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://127.0.0.1:27017/toolforge")

client: motor.motor_asyncio.AsyncIOMotorClient = None


async def init_db():
    global client
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URI)
    db_name = MONGODB_URI.rsplit("/", 1)[-1].split("?")[0] or "toolforge"
    await init_beanie(database=client[db_name], document_models=[User])


def get_raw_client() -> motor.motor_asyncio.AsyncIOMotorClient:
    return client


def get_db_name() -> str:
    uri = MONGODB_URI
    return uri.rsplit("/", 1)[-1].split("?")[0] or "toolforge"
