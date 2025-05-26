from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import openai
import os
from dotenv import load_dotenv
import json
from functools import lru_cache
import hashlib
import logging
import traceback
from typing import Dict, Any, Optional
import re

# Loglama ayarları
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI()

# CORS ayarları
origins = [
    "http://localhost:3000",  # Node.js server
    "http://localhost:19006",  # Expo web
    "exp://localhost:19000",  # Expo mobil
    "http://127.0.0.1:3000",
    "http://127.0.0.1:19006",
    "exp://127.0.0.1:19000",
    "*"  # Geliştirme aşamasında tüm originlere izin ver
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

openai.api_key = os.getenv("OPENAI_API_KEY")

class UserData(BaseModel):
    age: int
    weight: float
    height: float
    gender: str
    activity_level: str
    goals: str
    register_day: str  # Kullanıcının kayıt günü (ör: 'Cuma')

class CacheManager:
    def __init__(self):
        self._cache: Dict[str, Any] = {}
    
    def get(self, key: str) -> Optional[Any]:
        return self._cache.get(key)
    
    def set(self, key: str, value: Any):
        self._cache[key] = value
    
    def clear(self):
        self._cache.clear()

cache_manager = CacheManager()

def get_cache_key(user_data: UserData) -> str:
    """Kullanıcı verilerinden benzersiz bir önbellek anahtarı oluştur"""
    try:
        data_str = f"{user_data.age}_{user_data.weight}_{user_data.height}_{user_data.gender}_{user_data.activity_level}_{user_data.goals}_{user_data.register_day}"
        return hashlib.md5(data_str.encode()).hexdigest()
    except Exception as e:
        logger.error(f"Önbellek anahtarı oluşturma hatası: {str(e)}")
        raise HTTPException(status_code=500, detail="Önbellek anahtarı oluşturulamadı")

def load_prompt(filename: str) -> str:
    """Prompt dosyasını yükle"""
    try:
        prompt_path = os.path.join("prompts", filename)
        if not os.path.exists(prompt_path):
            raise FileNotFoundError(f"Prompt dosyası bulunamadı: {filename}")
        
        with open(prompt_path, "r", encoding="utf-8") as f:
            content = f.read()
            # Boş satırları ve gereksiz boşlukları temizle
            content = '\n'.join(line.strip() for line in content.splitlines() if line.strip())
            return content
    except Exception as e:
        logger.error(f"Prompt yükleme hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prompt yüklenemedi: {str(e)}")

async def ask_openai(prompt: str) -> str:
    """OpenAI API'sine istek gönder"""
    try:
        client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "Sen profesyonel bir fitness ve beslenme uzmanısın. Detaylı ve kapsamlı cevaplar ver."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.4,
            max_tokens=6000,
            presence_penalty=0.1,
            frequency_penalty=0.1
        )
        
        # Token kullanımını logla
        logger.info(f"Token kullanımı - Prompt: {response.usage.prompt_tokens}, Completion: {response.usage.completion_tokens}, Toplam: {response.usage.total_tokens}")
        
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"OpenAI API hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI servisi şu anda kullanılamıyor: {str(e)}")

@app.get("/")
async def root():
    return {"message": "FastAPI Fitness AI servisi aktif"}

def normalize_nutrition_plan(plan):
    try:
        if isinstance(plan, str):
            plan = json.loads(plan)
        
        normalized = {
            "beslenme_programi": {},
            "saglikli_yasam_ipuclari": [],
            "motivasyon_mesajlari": []
        }
        
        # Beslenme programını normalize et
        for hafta, hafta_plan in plan.get("beslenme_programi", {}).items():
            normalized["beslenme_programi"][hafta] = {}
            for gun, gun_plan in hafta_plan.items():
                normalized["beslenme_programi"][hafta][gun] = {}
                for ogun, ogun_plan in gun_plan.items():
                    if not isinstance(ogun_plan, dict):
                        ogun_plan = {"yemek_adi": str(ogun_plan)}
                    normalized["beslenme_programi"][hafta][gun][ogun] = {
                        "yemek_adi": str(ogun_plan.get("yemek_adi", "")),
                        "kalori": str(ogun_plan.get("kalori", "0")),
                        "protein": str(ogun_plan.get("protein", "0")),
                        "karbonhidrat": str(ogun_plan.get("karbonhidrat", "0")),
                        "yag": str(ogun_plan.get("yag", "0"))
                    }
        
        # Sağlıklı yaşam ipuçlarını normalize et
        normalized["saglikli_yasam_ipuclari"] = [
            str(ipucu) for ipucu in plan.get("saglikli_yasam_ipuclari", [])
        ]
        
        # Motivasyon mesajlarını normalize et
        normalized["motivasyon_mesajlari"] = [
            str(mesaj) for mesaj in plan.get("motivasyon_mesajlari", [])
        ]
        
        return normalized
    except Exception as e:
        print(f"Beslenme planı normalizasyon hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Beslenme planı normalizasyon hatası: {str(e)}")

def clean_json_string(json_str: str) -> str:
    """JSON string'ini temizle ve düzelt"""
    try:
        # JavaScript yorum satırlarını kaldır
        json_str = re.sub(r'//.*?\n', '\n', json_str)
        
        # Fazla boşlukları temizle
        json_str = re.sub(r'\s+', ' ', json_str)
        
        # Eksik virgülleri ekle
        json_str = re.sub(r'}\s*"', '}, "', json_str)
        json_str = re.sub(r'}\s*}', '}}', json_str)
        
        # Eksik tırnak işaretlerini ekle
        json_str = re.sub(r'([{,])\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:', r'\1"\2":', json_str)
        
        return json_str.strip()
    except Exception as e:
        logger.error(f"JSON temizleme hatası: {str(e)}")
        return json_str

def extract_json_from_codeblock(text: str) -> str:
    """Kod bloğu içindeki JSON'u ayıkla"""
    try:
        logger.info(f"Ham AI yanıtı: {repr(text)}")
        
        # Önce ```json ve ``` işaretlerini temizle
        text = re.sub(r'^```json\s*', '', text.strip())
        text = re.sub(r'```$', '', text.strip())
        
        # Eğer hala ``` işaretleri varsa, regex ile ayıkla
        match = re.search(r'```json\s*(.*?)\s*```', text, re.DOTALL)
        if match:
            text = match.group(1)
        
        logger.info(f"Ayıklanmış JSON: {text[:100]}...")
        return text.strip()
    except Exception as e:
        logger.error(f"JSON kod bloğu ayıklama hatası: {str(e)}")
        return text.strip()

def fix_json_brackets(json_str: str) -> str:
    # Fazla kapanış parantezi varsa sil
    while json_str.count('}') > json_str.count('{'):
        json_str = json_str.rsplit('}', 1)[0]
    # Eksik kapanış varsa tamamla
    while json_str.count('{') > json_str.count('}'):
        json_str += '}'
    return json_str

def clean_json_comments_and_dots(json_str: str) -> str:
    # // ile başlayan açıklama satırlarını ve ... karakterlerini sil
    json_str = re.sub(r'//.*?\n', '\n', json_str)
    json_str = re.sub(r'\.\.\.|…', '', json_str)
    return json_str

def validate_and_fix_json(raw: str):
    try:
        logger.info("JSON doğrulama başladı")
        raw = extract_json_from_codeblock(raw)
        raw = fix_json_brackets(raw)
        cleaned = clean_json_string(raw)
        return json.loads(cleaned)
    except Exception as e:
        logger.error(f"JSON düzeltme hatası: {e}")
        raise HTTPException(status_code=500, detail=f"JSON düzeltme hatası: {e}")

@app.post("/generate-nutrition-plan")
async def generate_nutrition_plan(user_data: UserData):
    """Beslenme planı oluştur (her hafta için ayrı ayrı OpenAI isteği atar ve birleştirir)"""
    try:
        logger.info(f"Beslenme planı isteği alındı: {user_data.model_dump()}")
        cache_key = get_cache_key(user_data)
        cached_response = cache_manager.get(cache_key)
        if cached_response:
            logger.info("Önbellekten yanıt döndürülüyor")
            return cached_response

        logger.info("Yeni yanıt oluşturuluyor (hafta hafta)")
        prompt = load_prompt("nutrition-plan.txt")
        all_weeks = {}
        for hafta_num in range(1, 5):
            try:
                formatted_prompt = prompt.format(
                    age=user_data.age,
                    weight=user_data.weight,
                    height=user_data.height,
                    gender=user_data.gender,
                    activity_level=user_data.activity_level,
                    goals=user_data.goals,
                    register_day=user_data.register_day
                )
                # Haftaya özel ek kural
                formatted_prompt += f"\nSadece Hafta_{hafta_num} için üret. Diğer haftaları, günleri veya ... gibi kısaltma kullanma. Yanıtta sadece Hafta_{hafta_num} ve o haftanın tüm günleri olsun."
                logger.info(f"Prompt formatlandı (Hafta {hafta_num})")
            except KeyError as e:
                logger.error(f"Prompt format hatası: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Beslenme planı şablonu hatalı: Eksik alan {str(e)}")
            response = await ask_openai(formatted_prompt)
            logger.info(f"OpenAI yanıtı alındı (Hafta {hafta_num})")
            try:
                validated_response = validate_and_fix_json(response)
                # Sadece ilgili haftayı al
                hafta_key = f"Hafta_{hafta_num}"
                if "beslenme_programi" in validated_response and hafta_key in validated_response["beslenme_programi"]:
                    all_weeks[hafta_key] = validated_response["beslenme_programi"][hafta_key]
                else:
                    logger.error(f"Yanıtta {hafta_key} bulunamadı!")
            except Exception as e:
                logger.error(f"JSON işleme hatası (Hafta {hafta_num}): {str(e)}")
                logger.error(f"Ham yanıt: {response}")
                raise HTTPException(status_code=500, detail=f"Beslenme planı işlenemedi (Hafta {hafta_num}): {str(e)}")
        # Tüm haftaları birleştir
        full_plan = {"beslenme_programi": all_weeks}
        normalized_response = normalize_nutrition_plan(full_plan)
        cache_manager.set(cache_key, normalized_response)
        return normalized_response
    except Exception as e:
        logger.error(f"Genel hata: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Beklenmeyen bir hata oluştu: {str(e)}")

def normalize_workout_plan(plan):
    try:
        if isinstance(plan, str):
            plan = json.loads(plan)
        normalized = {"workout_program": {}}
        for hafta, hafta_plan in plan.get("workout_program", {}).items():
            normalized["workout_program"][hafta] = {}
            for gun, gun_plan in hafta_plan.items():
                # Her gün birden fazla antrenman olabilir (liste)
                if isinstance(gun_plan, list):
                    normalized["workout_program"][hafta][gun] = []
                    for antreman in gun_plan:
                        normalized["workout_program"][hafta][gun].append({
                            "name": str(antreman.get("name", "")),
                            "type": str(antreman.get("type", "")),
                            "targetMuscleGroups": antreman.get("targetMuscleGroups", []),
                            "sets": int(antreman.get("sets", 0)),
                            "reps": int(antreman.get("reps", 0)),
                            "duration": int(antreman.get("duration", 0)),
                            "intensity": str(antreman.get("intensity", "")),
                            "description": str(antreman.get("description", "")),
                            "date": str(antreman.get("date", ""))
                        })
                else:
                    normalized["workout_program"][hafta][gun] = []
        return normalized
    except Exception as e:
        print(f"Antrenman planı normalizasyon hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Antrenman planı normalizasyon hatası: {str(e)}")

@app.post("/generate-workout-plan")
async def generate_workout_plan(user_data: UserData):
    try:
        logger.info("/generate-workout-plan isteği geldi")
        logger.info(f"Kullanıcı: {user_data.model_dump()}")
        prompt_template = load_prompt("workout-plan.txt")
        all_weeks = {}
        for hafta_num in range(1, 5):
            formatted_prompt = prompt_template.format(**user_data.model_dump())
            formatted_prompt += f"\nSadece Hafta_{hafta_num} için üret. Diğer haftaları, günleri veya ... gibi kısaltma kullanma. Yanıtta sadece Hafta_{hafta_num} ve o haftanın tüm günleri olsun."
            ai_response = await ask_openai(formatted_prompt)
            print(f"\n\nAI HAM YANIT (Hafta {hafta_num}):\n{ai_response}\n\n")
            logger.error(f"AI HAM YANIT (Hafta {hafta_num}): {ai_response}")
            logger.info(f"Yanıt alındı (Hafta {hafta_num})")
            try:
                validated = validate_and_fix_json(ai_response)
            except Exception as e:
                logger.error(f"validate_and_fix_json HATASI (Hafta {hafta_num}): {e}")
                logger.error(f"AI YANITI (validate_and_fix_json HATASI): {ai_response}")
                raise
            hafta_key = f"Hafta_{hafta_num}"
            if "workout_program" in validated and hafta_key in validated["workout_program"]:
                all_weeks[hafta_key] = validated["workout_program"][hafta_key]
            else:
                logger.error(f"Yanıtta {hafta_key} bulunamadı!")
        full_plan = {"workout_program": all_weeks}
        normalized_response = normalize_workout_plan(full_plan)
        return {"status": "success", "data": {"workout_plan": normalized_response}}
    except Exception as e:
        logger.error(f"İşleme hatası: {e}")
        raise HTTPException(status_code=500, detail=f"Hata: {e}")

@app.post("/generate-alternative-meal")
async def generate_alternative_meal(user_data: UserData):
    print("FastAPI: /generate-alternative-meal endpointine istek geldi!")
    prompt_template = load_prompt("alternative_meal.txt")
    prompt = prompt_template.format(**user_data.model_dump())
    try:
        ai_response = await ask_openai(prompt)
        return {"status": "success", "data": {"alternative_meal": ai_response}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-alternative-exercise")
async def generate_alternative_exercise(user_data: UserData):
    print("FastAPI: /generate-alternative-exercise endpointine istek geldi!")
    prompt_template = load_prompt("alternative_exercise.txt")
    prompt = prompt_template.format(**user_data.model_dump())
    try:
        ai_response = await ask_openai(prompt)
        return {"status": "success", "data": {"alternative_exercise": ai_response}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5000)