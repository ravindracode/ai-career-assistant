import os

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

load_dotenv()

_client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        uri = os.getenv("MONGODB_URI")
        if not uri:
            raise RuntimeError("MONGODB_URI is not set")
        _client = AsyncIOMotorClient(uri)
    return _client


def get_database() -> AsyncIOMotorDatabase:
    name = os.getenv("MONGODB_DB", "ai_career_assistant")
    return get_client()[name]


async def connect_to_mongo() -> None:
    await get_client().admin.command("ping")


def close_mongo_connection() -> None:
    global _client
    if _client is not None:
        _client.close()
        _client = None
