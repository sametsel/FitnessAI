from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, Field

class UserProfile(BaseModel):
    """
    Kullanıcı profil bilgilerini içeren model
    """
    age: int = Field(..., gt=0, description="Kullanıcının yaşı")
    gender: str = Field(..., description="Cinsiyet (erkek/kadın)")
    weight: float = Field(..., gt=0, description="Kilo (kg)")
    height: float = Field(..., gt=0, description="Boy (cm)")
    activity_level: str = Field(..., description="Aktivite seviyesi (sedentary, light, moderate, active, very_active)")
    fitness_goal: str = Field(..., description="Fitness hedefi (weight_loss, muscle_gain, maintenance, overall_health)")
    health_restrictions: Optional[List[str]] = Field(default=None, description="Sağlık kısıtlamaları (gluten_free, vegetarian, vb.)")
    experience_level: str = Field(..., description="Fitness deneyim seviyesi (beginner, intermediate, advanced)")
    preferred_workout_days: int = Field(..., ge=1, le=7, description="Haftada tercih edilen antrenman günü sayısı")
    has_gym_access: bool = Field(default=False, description="Spor salonu erişimi var mı?")
    program_duration: str = Field(default="weekly", description="Program süresi (weekly, monthly)")

class BodyMeasurement(BaseModel):
    """
    Vücut ölçümlerini içeren model
    """
    date: datetime = Field(default_factory=datetime.now, description="Ölçüm tarihi")
    weight: float = Field(..., gt=0, description="Kilo (kg)")
    body_fat_percentage: Optional[float] = Field(default=None, ge=0, le=100, description="Vücut yağ oranı (%)")
    chest: Optional[float] = Field(default=None, description="Göğüs ölçüsü (cm)")
    waist: Optional[float] = Field(default=None, description="Bel ölçüsü (cm)")
    hips: Optional[float] = Field(default=None, description="Kalça ölçüsü (cm)")
    arms: Optional[float] = Field(default=None, description="Kol ölçüsü (cm)")
    thighs: Optional[float] = Field(default=None, description="Bacak ölçüsü (cm)")
    notes: Optional[str] = Field(default=None, description="Notlar")

class Goal(BaseModel):
    """
    Kullanıcı hedeflerini içeren model
    """
    title: str = Field(..., description="Hedef başlığı")
    description: Optional[str] = Field(default=None, description="Hedef açıklaması")
    target_value: Optional[float] = Field(default=None, description="Hedef değer (örn. kilo)")
    current_value: Optional[float] = Field(default=None, description="Mevcut değer")
    unit: Optional[str] = Field(default=None, description="Birim (kg, cm, vb.)")
    start_date: datetime = Field(default_factory=datetime.now, description="Başlangıç tarihi")
    target_date: Optional[datetime] = Field(default=None, description="Hedef tarihi")
    is_completed: bool = Field(default=False, description="Tamamlandı mı?")
    completion_date: Optional[datetime] = Field(default=None, description="Tamamlanma tarihi")

class WorkoutLog(BaseModel):
    """
    Tamamlanan antrenmanları içeren model
    """
    date: datetime = Field(default_factory=datetime.now, description="Antrenman tarihi")
    workout_id: str = Field(..., description="Antrenman program ID'si")
    completed_exercises: List[Dict] = Field(..., description="Tamamlanan egzersizler")
    duration_minutes: int = Field(..., gt=0, description="Antrenman süresi (dakika)")
    calories_burned: Optional[int] = Field(default=None, description="Yakılan kalori")
    notes: Optional[str] = Field(default=None, description="Notlar")
    mood: Optional[str] = Field(default=None, description="Ruh hali (good, average, bad)")
    energy_level: Optional[int] = Field(default=None, ge=1, le=10, description="Enerji seviyesi (1-10)")

class User(BaseModel):
    """
    Kullanıcı modelinin ana sınıfı
    """
    user_id: str = Field(..., description="Benzersiz kullanıcı kimliği")
    username: str = Field(..., description="Kullanıcı adı")
    email: str = Field(..., description="E-posta adresi")
    password_hash: str = Field(..., description="Şifre hash'i")
    profile: UserProfile = Field(..., description="Kullanıcı profili")
    measurements: List[BodyMeasurement] = Field(default_factory=list, description="Vücut ölçümleri geçmişi")
    goals: List[Goal] = Field(default_factory=list, description="Kullanıcı hedefleri")
    workout_logs: List[WorkoutLog] = Field(default_factory=list, description="Antrenman kayıtları")
    created_at: datetime = Field(default_factory=datetime.now, description="Oluşturulma tarihi")
    last_updated: datetime = Field(default_factory=datetime.now, description="Son güncelleme tarihi")

# MongoDB ile etkileşim için yardımcı fonksiyonlar
async def get_user_by_id(user_id: str):
    """
    Kullanıcıyı ID'ye göre getir
    """
    from database.mongodb import users_collection
    user_data = await users_collection.find_one({"user_id": user_id})
    if user_data:
        return User(**user_data)
    return None

async def get_user_by_email(email: str):
    """
    Kullanıcıyı e-posta adresine göre getir
    """
    from database.mongodb import users_collection
    user_data = await users_collection.find_one({"email": email})
    if user_data:
        return User(**user_data)
    return None

async def create_user(user: User):
    """
    Yeni kullanıcı oluştur
    """
    from database.mongodb import users_collection
    user_dict = user.dict()
    await users_collection.insert_one(user_dict)
    return user

async def update_user(user_id: str, update_data: Dict):
    """
    Kullanıcı bilgilerini güncelle
    """
    from database.mongodb import users_collection
    update_data["last_updated"] = datetime.now()
    await users_collection.update_one(
        {"user_id": user_id},
        {"$set": update_data}
    )
    return await get_user_by_id(user_id)

async def add_measurement(user_id: str, measurement: BodyMeasurement):
    """
    Kullanıcıya yeni ölçüm ekle
    """
    from database.mongodb import users_collection
    measurement_dict = measurement.dict()
    await users_collection.update_one(
        {"user_id": user_id},
        {
            "$push": {"measurements": measurement_dict},
            "$set": {"last_updated": datetime.now()}
        }
    )
    return measurement 