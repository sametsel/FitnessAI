from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
from models.user_model import User, get_user_by_email
from passlib.context import CryptContext
from jose import JWTError, jwt

# Modülleri import et
from api.nutrition_endpoints import router as nutrition_router

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

# Beslenme router'ını ekle
app.include_router(nutrition_router)

# Şifre hashleme için
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT ayarları
SECRET_KEY = "your-secret-key"  # Prodüksiyonda güvenli bir şekilde saklanmalı
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

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

class LoginRequest(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

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

@app.post("/api/auth/login", response_model=Token)
async def login(login_data: LoginRequest):
    user = await get_user_by_email(login_data.email)
    if not user:
        raise HTTPException(status_code=401, detail="Geçersiz email veya şifre")
    
    if not verify_password(login_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Geçersiz email veya şifre")
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/")
async def root():
    """
    API kök endpoint - sistem durumu gösterir
    """
    return {
        "status": "online",
        "app_name": "Fitness AI API",
        "version": "1.0.0",
        "endpoints": {
            "nutrition": "/api/nutrition",
            "auth": "/api/auth",
            "user": "/api/analyze-user",
            "program": "/api/generate-program"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 