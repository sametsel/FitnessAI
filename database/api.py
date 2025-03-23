from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .mongodb import db
from pydantic import BaseModel
import bcrypt
import jwt

class LoginData(BaseModel):
    email: str
    password: str

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = "your-secret-key"  # Güvenli bir secret key kullanın

@app.on_event("startup")
async def startup_db_client():
    await db.connect()

@app.on_event("shutdown")
async def shutdown_db_client():
    db.close()

# API endpoint'leri
@app.get("/users/{user_id}")
async def get_user(user_id: str):
    user = await db.users.find_one({"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    return user

@app.post("/api/auth/login")
async def login(login_data: LoginData):
    try:
        # Kullanıcıyı e-posta adresine göre bul
        user = await db.users.find_one({"email": login_data.email})
        
        if not user:
            raise HTTPException(status_code=401, detail="Geçersiz e-posta veya şifre")
            
        # Şifreyi kontrol et
        if not bcrypt.checkpw(login_data.password.encode('utf-8'), user['password'].encode('utf-8')):
            raise HTTPException(status_code=401, detail="Geçersiz e-posta veya şifre")
            
        # JWT token oluştur
        token = jwt.encode(
            {"user_id": str(user["_id"])},
            SECRET_KEY,
            algorithm="HS256"
        )
        
        # Hassas bilgileri kullanıcı nesnesinden çıkar
        user.pop('password', None)
        
        return {
            "token": token,
            "user": user
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 