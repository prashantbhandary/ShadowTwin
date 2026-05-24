from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from motor.motor_asyncio import AsyncIOMotorClient
from redis.asyncio import Redis
from app.core.config import settings
from typing import AsyncGenerator
import logging

logger = logging.getLogger(__name__)


# PostgreSQL (SQLAlchemy async)
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_size=10,
    max_overflow=20,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# MongoDB
class MongoDB:
    client: AsyncIOMotorClient = None
    db = None

    async def connect(self):
        self.client = AsyncIOMotorClient(settings.MONGO_URL)
        self.db = self.client[settings.MONGO_DB]
        logger.info("Connected to MongoDB")

    async def disconnect(self):
        if self.client:
            self.client.close()
            logger.info("Disconnected from MongoDB")

    def get_collection(self, name: str):
        return self.db[name]


mongodb = MongoDB()


# Redis
class RedisClient:
    client: Redis = None

    async def connect(self):
        self.client = Redis.from_url(settings.REDIS_URL, decode_responses=True)
        logger.info("Connected to Redis")

    async def disconnect(self):
        if self.client:
            await self.client.close()

    async def get(self, key: str):
        return await self.client.get(key)

    async def set(self, key: str, value: str, expire: int = None):
        await self.client.set(key, value, ex=expire)

    async def delete(self, key: str):
        await self.client.delete(key)

    async def publish(self, channel: str, message: str):
        await self.client.publish(channel, message)


redis_client = RedisClient()


async def init_db():
    """Initialize all databases."""
    try:
        async with engine.begin() as conn:
            from app.models.user import User
            from app.models.identity import IdentityProfile
            from app.models.alert import Alert
            await conn.run_sync(Base.metadata.create_all)
        logger.info("PostgreSQL tables created")
    except Exception as e:
        logger.warning(f"PostgreSQL init failed (running without DB): {e}")

    try:
        await mongodb.connect()
    except Exception as e:
        logger.warning(f"MongoDB connection failed (running without MongoDB): {e}")

    try:
        await redis_client.connect()
    except Exception as e:
        logger.warning(f"Redis connection failed (running without Redis): {e}")
