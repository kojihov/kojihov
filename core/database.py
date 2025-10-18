# core/database.py
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from mongomock_motor import AsyncMongoMockClient

from .config import settings
from .logger import log


class Database:
    client: AsyncIOMotorClient | AsyncMongoMockClient | None = None
    db: AsyncIOMotorDatabase | None = None
    using_mock: bool = False

    async def connect(self):
        log.info("Initializing MongoDB connection...")
        try:
            self.client = AsyncIOMotorClient(
                settings.MONGO_URI,
                serverSelectionTimeoutMS=5000,
            )
            await self.client.admin.command("ismaster")
            self.db = self.client[settings.MONGO_DB_NAME]
            self.using_mock = False
            log.info(
                "✅ MongoDB connection successful. Connected to database '%s'.",
                settings.MONGO_DB_NAME,
            )
        except Exception as e:
            log.critical(f"❌ Could not connect to MongoDB: {e}")
            if self.client:
                self.client.close()
            log.warning(
                "Falling back to in-memory MongoDB via mongomock_motor for this session."
            )
            self.client = AsyncMongoMockClient()
            self.db = self.client[settings.MONGO_DB_NAME]
            self.using_mock = True
            log.info(
                "✅ MongoDB mock connection established. Using in-memory storage '%s'.",
                settings.MONGO_DB_NAME,
            )

    async def close(self):
        if self.client:
            self.client.close()
            if self.using_mock:
                log.info("MongoDB mock connection closed.")
            else:
                log.info("MongoDB connection closed.")

    def get_collection(self, name: str):
        if not self.db:
            raise RuntimeError("Database is not connected. Call connect() first.")
        return self.db[name]


# Create a single instance of the Database class
db_manager = Database()

# Example of how to get a collection
# from .database import db_manager
# some_collection = db_manager.get_collection("some_collection_name")
