import asyncio
import sys
import os

# Proje kök dizinini Python path'ine ekle
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.mongodb import db

async def test_connection():
    try:
        await db.connect()
        print("Veritabanı bağlantısı başarılı!")
        
        # Test verisi ekleme
        test_user = {
            "name": "Test Kullanıcı",
            "email": "test@example.com",
            "password": "test123",
            "height": 175,
            "weight": 70,
            "age": 30,
            "gender": "Erkek",
            "fitness_goal": "Kilo verme"
        }
        
        result = await db.users.insert_one(test_user)
        print(f"Test kullanıcı eklendi: {result.inserted_id}")
        
    except Exception as e:
        print(f"Hata: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(test_connection()) 