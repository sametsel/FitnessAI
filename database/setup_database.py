import asyncio
from mongodb import MongoDB
from datetime import datetime

async def reset_collections(db):
    """Koleksiyonları sıfırla"""
    try:
        # Tüm koleksiyonları temizle
        await db.users.drop()
        await db.workouts.drop()
        await db.diets.drop()
        await db.progress.drop()
        await db.ai_recommendations.drop()
        print("Koleksiyonlar başarıyla sıfırlandı!")
    except Exception as e:
        print(f"Koleksiyon sıfırlama hatası: {e}")

async def create_collections(db):
    """Koleksiyonları ve indeksleri oluştur"""
    try:
        # Users koleksiyonu
        await db.users.create_index("email", unique=True)
        
        # Workouts koleksiyonu
        await db.workouts.create_index([
            ("user_id", 1),
            ("program_id", 1)
        ], name="workout_user_program_index")
        
        # Diets koleksiyonu
        await db.diets.create_index([
            ("user_id", 1),
            ("plan_id", 1)
        ], name="diet_user_plan_index")
        
        # Progress koleksiyonu
        await db.progress.create_index([
            ("user_id", 1),
            ("date", 1)
        ], name="progress_user_date_index")
        
        # AI recommendations koleksiyonu
        await db.ai_recommendations.create_index("user_id", name="ai_user_index")
        
        print("Koleksiyonlar ve indeksler başarıyla oluşturuldu!")
    except Exception as e:
        print(f"Koleksiyon oluşturma hatası: {e}")

async def insert_test_data(db):
    """Test verilerini ekle"""
    try:
        # Test kullanıcısı
        test_user = {
            "email": "test@test.com",
            "password": "123456",
            "name": "Test Kullanıcı",
            "age": 30,
            "gender": "Erkek",
            "height": 180,
            "weight": 80,
            "goal": "Kilo Verme",
            "activityLevel": "Orta",
            "healthConditions": [],
            "createdAt": datetime.now()
        }
        
        # Kullanıcıyı ekle ve ID'sini al
        user_result = await db.users.insert_one(test_user)
        user_id = str(user_result.inserted_id)
        
        # Test workout programı
        test_workout = {
            "program_id": "test123",
            "user_id": user_id,
            "name": "Başlangıç Programı",
            "description": "Yeni başlayanlar için program",
            "difficulty": "Başlangıç",
            "duration_weeks": 4,
            "exercises": [
                {
                    "name": "Squat",
                    "muscle_group": "Bacak",
                    "equipment": "Vücut Ağırlığı",
                    "difficulty": "beginner",
                    "sets": 3,
                    "reps": "12",
                    "rest_time": 60
                }
            ],
            "schedule": {
                "Pazartesi": ["Bacak", "Karın"],
                "Çarşamba": ["Göğüs", "Omuz"],
                "Cuma": ["Sırt", "Kol"]
            },
            "target_muscles": ["Bacak", "Karın", "Göğüs", "Sırt"],
            "created_at": datetime.now()
        }
        
        # Test diyet planı
        test_diet = {
            "plan_id": "diet123",
            "user_id": user_id,
            "meals": [
                {
                    "mealType": "Kahvaltı",
                    "foods": [
                        {
                            "name": "Yulaf",
                            "portion": "100g",
                            "calories": 350,
                            "protein": 15,
                            "carbs": 60,
                            "fat": 8
                        }
                    ]
                }
            ],
            "startDate": datetime.now(),
            "endDate": datetime.now(),
            "totalCalories": 2000
        }

        # Verileri ekle
        await db.workouts.insert_one(test_workout)
        await db.diets.insert_one(test_diet)
        
        print("Test verileri başarıyla eklendi!")
        print(f"Test kullanıcı ID: {user_id}")
        
    except Exception as e:
        print(f"Test verisi ekleme hatası: {e}")

async def main():
    try:
        # MongoDB instance oluştur
        db = MongoDB()
        
        # Bağlantıyı test et
        await db.connect()
        
        # Koleksiyonları sıfırla
        await reset_collections(db)
        
        # Koleksiyonları ve indeksleri oluştur
        await create_collections(db)
        
        # Test verilerini ekle
        await insert_test_data(db)
        
        print("Veritabanı kurulumu başarıyla tamamlandı!")
        
    except Exception as e:
        print(f"Hata: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(main()) 