from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

app = FastAPI(
    title="Fitness AI API",
    description="Fitness uygulaması için AI servisi",
    version="1.0.0"
)

# CORS ayarları (hem web hem mobil için)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Prodüksiyonda spesifik originler belirtilmeli
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Veri modelleri
class UserProfile(BaseModel):
    user_id: str
    age: int
    weight: float
    height: float
    gender: str
    activity_level: str
    fitness_goal: str
    health_restrictions: Optional[List[str]] = None
    experience_level: str
    preferred_workout_days: int
    program_duration: str  # "weekly" veya "monthly"

class WorkoutProgram(BaseModel):
    exercises: List[dict]
    schedule: dict
    difficulty: str
    duration_weeks: int
    target_muscles: List[str]

class DietPlan(BaseModel):
    meals: List[dict]
    daily_calories: int
    macros: dict
    restrictions: List[str]
    meal_schedule: dict

class AIRecommendation(BaseModel):
    user_id: str
    workout_program: WorkoutProgram
    diet_plan: DietPlan
    created_at: datetime
    last_updated: datetime
    progress_metrics: dict

@app.post("/api/analyze-user")
async def analyze_user(user_profile: UserProfile):
    """
    Kullanıcı profilini analiz eder ve başlangıç değerlendirmesi yapar
    """
    try:
        # TODO: Kullanıcı analizi yapılacak
        return {"status": "success", "message": "Kullanıcı analizi tamamlandı"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-program")
async def generate_program(user_profile: UserProfile):
    """
    Kullanıcıya özel antrenman ve diyet programı oluşturur
    """
    try:
        # TODO: Program oluşturma işlemleri yapılacak
        return {"status": "success", "message": "Program oluşturuldu"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/update-program/{user_id}")
async def update_program(user_id: str, progress_data: dict):
    """
    Kullanıcının ilerlemesine göre programı günceller
    """
    try:
        # TODO: Program güncelleme işlemleri yapılacak
        return {"status": "success", "message": "Program güncellendi"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 