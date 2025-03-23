from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

class MongoDB:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MongoDB, cls).__new__(cls)
            cls._instance.initialized = False
        return cls._instance

    def __init__(self):
        if self.initialized:
            return
            
        self.MONGODB_URL = os.getenv("MONGO_URI", "mongodb://localhost:27017")
        self.DATABASE_NAME = os.getenv("DATABASE_NAME", "fitness_db")

        # MongoDB bağlantısı
        self.client = AsyncIOMotorClient(self.MONGODB_URL)
        self.db = self.client[self.DATABASE_NAME]
        
        # Koleksiyonlar
        self.users = self.db.users
        self.workouts = self.db.workouts
        self.diets = self.db.diets
        self.progress = self.db.progress
        self.ai_recommendations = self.db.ai_recommendations
        
        self.initialized = True

    async def connect(self):
        try:
            await self.client.admin.command('ping')
            print("MongoDB bağlantısı başarılı!")
        except Exception as e:
            print(f"MongoDB bağlantı hatası: {e}")
            raise e

    def close(self):
        self.client.close()

# Singleton instance
db = MongoDB() 