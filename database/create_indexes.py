import asyncio
from database.mongodb import db

async def create_indexes():
    try:
        # Kullanıcılar için benzersiz email indeksi
        await db.users.create_index("email", unique=True)
        
        # Egzersiz programları için bileşik indeks
        await db.workout_programs.create_index([
            ("user_id", 1),
            ("program_name", 1)
        ])
        
        # Beslenme planları için bileşik indeks
        await db.diet_plans.create_index([
            ("user_id", 1),
            ("plan_name", 1)
        ])
        
        # AI önerileri için kullanıcı indeksi
        await db.ai_recommendations.create_index("user_id")
        
        print("Tüm indeksler başarıyla oluşturuldu!")
        
    except Exception as e:
        print(f"İndeks oluşturma hatası: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(create_indexes()) 