from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, Field
from database.mongodb import db  # Ana veritabanı bağlantısını kullan

class Exercise(BaseModel):
    """
    Egzersiz bilgilerini içeren model
    """
    name: str = Field(..., description="Egzersiz adı")
    muscle_group: str = Field(..., description="Çalışan kas grubu")
    equipment: str = Field(..., description="Kullanılan ekipman türü")
    difficulty: str = Field(..., description="Zorluk seviyesi (beginner, intermediate, advanced)")
    sets: int = Field(..., gt=0, description="Set sayısı")
    reps: str = Field(..., description="Tekrar sayısı veya süresi")
    rest_time: int = Field(..., ge=0, description="Setler arası dinlenme süresi (saniye)")
    instructions: Optional[str] = Field(default=None, description="Egzersiz talimatları")
    image_url: Optional[str] = Field(default=None, description="Egzersiz görseli URL'si")
    video_url: Optional[str] = Field(default=None, description="Egzersiz videosu URL'si")

class WorkoutProgram(BaseModel):
    """
    Antrenman programı modeli
    """
    program_id: str = Field(..., description="Benzersiz program kimliği")
    user_id: str = Field(..., description="Kullanıcı kimliği")
    name: str = Field(..., description="Program adı")
    description: Optional[str] = Field(default=None, description="Program açıklaması")
    difficulty: str = Field(..., description="Program zorluk seviyesi")
    duration_weeks: int = Field(..., gt=0, description="Program süresi (hafta)")
    exercises: List[Exercise] = Field(..., description="Program egzersizleri")
    schedule: Dict[str, List[str]] = Field(..., description="Haftalık program (gün: kas grupları)")
    target_muscles: List[str] = Field(..., description="Hedef kas grupları")
    created_at: datetime = Field(default_factory=datetime.now, description="Oluşturulma tarihi")
    last_updated: datetime = Field(default_factory=datetime.now, description="Son güncelleme tarihi")

# MongoDB ile etkileşim için yardımcı fonksiyonlar
async def get_workout_by_id(program_id: str):
    """
    Antrenman programını ID'ye göre getir
    """
    program_data = await db.workouts.find_one({"program_id": program_id})
    if program_data:
        return WorkoutProgram(**program_data)
    return None

async def get_user_workouts(user_id: str):
    """
    Kullanıcının tüm antrenman programlarını getir
    """
    from database.mongodb import workout_programs_collection
    cursor = workout_programs_collection.find({"user_id": user_id})
    programs = []
    async for program in cursor:
        programs.append(WorkoutProgram(**program))
    return programs

async def create_workout(workout: WorkoutProgram):
    """
    Yeni antrenman programı oluştur
    """
    from database.mongodb import workout_programs_collection
    workout_dict = workout.dict()
    await workout_programs_collection.insert_one(workout_dict)
    return workout

async def update_workout(program_id: str, update_data: Dict):
    """
    Antrenman programını güncelle
    """
    from database.mongodb import workout_programs_collection
    update_data["last_updated"] = datetime.now()
    await workout_programs_collection.update_one(
        {"program_id": program_id},
        {"$set": update_data}
    )
    return await get_workout_by_id(program_id)

async def delete_workout(program_id: str):
    """
    Antrenman programını sil
    """
    from database.mongodb import workout_programs_collection
    result = await workout_programs_collection.delete_one({"program_id": program_id})
    return result.deleted_count > 0 