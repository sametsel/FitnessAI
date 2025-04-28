"""
MongoDB Atlas veritabanı işlemleri için yardımcı fonksiyonlar
"""

import os
import json
import logging
from typing import Dict, List, Any, Optional, Union
from datetime import datetime
from pymongo import MongoClient
from pymongo.errors import PyMongoError
from bson import ObjectId
import sys
import pathlib

# Proje dizinine erişim için path ayarı
sys.path.append(str(pathlib.Path(__file__).parent.parent))

# Logging ayarları
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# MongoDB bağlantı bilgileri
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "fitness_app")
USERS_COLLECTION = "users"
NUTRITION_PLANS_COLLECTION = "nutrition_plans"
MEAL_LOGS_COLLECTION = "meal_logs"

class JSONEncoder(json.JSONEncoder):
    """MongoDB ObjectId'leri JSON'a dönüştürebilmek için özel encoder"""
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        if isinstance(o, datetime):
            return o.isoformat()
        return json.JSONEncoder.default(self, o)

class MongoDBClient:
    """
    MongoDB veritabanı işlemleri için yardımcı sınıf
    """
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MongoDBClient, cls).__new__(cls)
            cls._instance._connect()
        return cls._instance
    
    def _connect(self):
        """MongoDB veritabanına bağlanır"""
        try:
            self.client = MongoClient(MONGO_URI)
            self.db = self.client[DB_NAME]
            logger.info(f"MongoDB {DB_NAME} veritabanına bağlantı başarılı")
        except PyMongoError as e:
            logger.error(f"MongoDB bağlantı hatası: {str(e)}")
            raise
    
    def get_user_by_id(self, user_id: str) -> Optional[Dict]:
        """
        Kullanıcıyı ID'sine göre getirir
        
        Args:
            user_id: Kullanıcı ID'si (string veya ObjectId)
            
        Returns:
            Kullanıcı verisi veya None
        """
        try:
            # ObjectId kontrolü
            if not isinstance(user_id, ObjectId) and ObjectId.is_valid(user_id):
                user_id = ObjectId(user_id)
                
            user = self.db[USERS_COLLECTION].find_one({"_id": user_id})
            return user
        except PyMongoError as e:
            logger.error(f"Kullanıcı alınırken hata: {str(e)}")
            return None
    
    def save_nutrition_plan(self, user_id: str, nutrition_plan: Dict) -> Optional[str]:
        """
        Kullanıcı için beslenme planını kaydeder
        
        Args:
            user_id: Kullanıcı ID'si
            nutrition_plan: Beslenme plan verisi
            
        Returns:
            Kaydedilen plan ID'si veya None
        """
        try:
            # ObjectId kontrolü
            if not isinstance(user_id, ObjectId) and ObjectId.is_valid(user_id):
                user_id = ObjectId(user_id)
            
            # Planı kayıt için hazırla
            plan_data = {
                "user_id": user_id,
                "plan_data": nutrition_plan,
                "created_at": datetime.now(),
                "last_updated": datetime.now()
            }
            
            # Planı kaydet
            result = self.db[NUTRITION_PLANS_COLLECTION].insert_one(plan_data)
            plan_id = str(result.inserted_id)
            logger.info(f"Beslenme planı kaydedildi, plan ID: {plan_id}")
            
            # Kullanıcıyı güncelle - en son planın referansını ekle
            self.db[USERS_COLLECTION].update_one(
                {"_id": user_id},
                {"$set": {"current_nutrition_plan_id": result.inserted_id}}
            )
            
            return plan_id
        except PyMongoError as e:
            logger.error(f"Beslenme planı kaydedilirken hata: {str(e)}")
            return None
    
    def get_user_nutrition_plan(self, user_id: str) -> Optional[Dict]:
        """
        Kullanıcının en son beslenme planını getirir
        
        Args:
            user_id: Kullanıcı ID'si
            
        Returns:
            Beslenme planı verisi veya None
        """
        try:
            # ObjectId kontrolü
            if not isinstance(user_id, ObjectId) and ObjectId.is_valid(user_id):
                user_id = ObjectId(user_id)
            
            # Kullanıcının current_nutrition_plan_id'sini bul
            user = self.db[USERS_COLLECTION].find_one(
                {"_id": user_id},
                {"current_nutrition_plan_id": 1}
            )
            
            if not user or "current_nutrition_plan_id" not in user:
                return None
            
            # Kullanıcının beslenme planını getir
            plan = self.db[NUTRITION_PLANS_COLLECTION].find_one(
                {"_id": user["current_nutrition_plan_id"]}
            )
            
            return plan
        except PyMongoError as e:
            logger.error(f"Beslenme planı alınırken hata: {str(e)}")
            return None
    
    def save_meal_log(self, user_id: str, meal_data: Dict) -> Optional[str]:
        """
        Kullanıcının tükettiği öğün kaydını ekler
        
        Args:
            user_id: Kullanıcı ID'si
            meal_data: Tüketilen öğün verisi
            
        Returns:
            Kaydedilen öğün log ID'si veya None
        """
        try:
            # ObjectId kontrolü
            if not isinstance(user_id, ObjectId) and ObjectId.is_valid(user_id):
                user_id = ObjectId(user_id)
            
            # Log verisi
            log_data = {
                "user_id": user_id,
                "meal_data": meal_data,
                "logged_at": datetime.now()
            }
            
            # Kaydet
            result = self.db[MEAL_LOGS_COLLECTION].insert_one(log_data)
            log_id = str(result.inserted_id)
            
            # Kullanıcı koleksiyonunda meal_logs dizisine de ekle
            self.db[USERS_COLLECTION].update_one(
                {"_id": user_id},
                {"$push": {"meal_logs": {
                    "log_id": result.inserted_id,
                    "date": datetime.now(),
                    "meal_type": meal_data.get("öğün_adı", ""),
                    "calories": meal_data.get("kalori", 0)
                }}}
            )
            
            logger.info(f"Öğün kaydı başarıyla eklendi, log ID: {log_id}")
            return log_id
        except PyMongoError as e:
            logger.error(f"Öğün kaydı eklenirken hata: {str(e)}")
            return None
    
    def get_user_meal_logs(self, user_id: str, limit: int = 10) -> List[Dict]:
        """
        Kullanıcının öğün kayıtlarını getirir
        
        Args:
            user_id: Kullanıcı ID'si
            limit: Getirilecek kayıt sayısı
            
        Returns:
            Öğün kayıtları listesi
        """
        try:
            # ObjectId kontrolü
            if not isinstance(user_id, ObjectId) and ObjectId.is_valid(user_id):
                user_id = ObjectId(user_id)
            
            # Son kayıtları getir
            logs = list(self.db[MEAL_LOGS_COLLECTION].find(
                {"user_id": user_id}
            ).sort("logged_at", -1).limit(limit))
            
            return logs
        except PyMongoError as e:
            logger.error(f"Öğün kayıtları alınırken hata: {str(e)}")
            return []
    
    def get_user_profile_data(self, user_id: str) -> Dict[str, Any]:
        """
        Kullanıcının beslenme önerisi için gerekli profil verilerini getirir
        
        Args:
            user_id: Kullanıcı ID'si
            
        Returns:
            Kullanıcı profil verisi
        """
        try:
            # ObjectId kontrolü
            if not isinstance(user_id, ObjectId) and ObjectId.is_valid(user_id):
                user_id = ObjectId(user_id)
            
            # Kullanıcıyı getir ve sadece gerekli alanları seç
            user = self.db[USERS_COLLECTION].find_one(
                {"_id": user_id},
                {
                    "profile.age": 1, 
                    "profile.weight": 1,
                    "profile.height": 1,
                    "profile.gender": 1,
                    "profile.activity_level": 1,
                    "profile.diet_type": 1,
                    "profile.allergies": 1,
                    "profile.fitness_goal": 1
                }
            )
            
            if not user or "profile" not in user:
                logger.warning(f"Kullanıcı {user_id} için profil verisi bulunamadı")
                return {}
            
            # Türkçe alan isimleriyle uyumlu veri formatı oluştur
            profile = user.get("profile", {})
            nutrition_data = {
                "yaş": profile.get("age", 30),
                "boy": profile.get("height", 170),
                "kilo": profile.get("weight", 70),
                "cinsiyet": "erkek" if profile.get("gender", "male").lower() in ["male", "erkek"] else "kadın",
                "aktivite_seviyesi": _map_activity_level(profile.get("activity_level", "moderate")),
                "diyet_türü": _map_diet_type(profile.get("diet_type", "balanced")),
                "alerji_var": bool(profile.get("allergies")),
                "alerjiler": profile.get("allergies", []),
                "hedef": _map_fitness_goal(profile.get("fitness_goal", "maintain"))
            }
            
            return nutrition_data
        except PyMongoError as e:
            logger.error(f"Kullanıcı profil verisi alınırken hata: {str(e)}")
            return {}

# Yardımcı fonksiyonlar
def _map_activity_level(level: str) -> str:
    """İngilizce aktivite seviyesi değerini Türkçe değere dönüştürür"""
    mapping = {
        "sedentary": "sedanter",
        "light": "hafif_aktif",
        "moderate": "orta_aktif",
        "active": "çok_aktif",
        "very_active": "ekstra_aktif"
    }
    return mapping.get(level.lower(), "orta_aktif")

def _map_diet_type(diet: str) -> str:
    """İngilizce diyet türü değerini Türkçe değere dönüştürür"""
    mapping = {
        "balanced": "dengeli",
        "vegan": "vegan",
        "vegetarian": "vejetaryen",
        "keto": "keto",
        "low_carb": "düşük_karbonhidrat",
        "paleo": "paleo"
    }
    return mapping.get(diet.lower(), "dengeli")

def _map_fitness_goal(goal: str) -> str:
    """İngilizce fitness hedefi değerini Türkçe değere dönüştürür"""
    mapping = {
        "lose_weight": "kilo_verme",
        "gain_weight": "kilo_alma",
        "build_muscle": "kas_kazanma",
        "maintain": "sağlıklı_beslenme"
    }
    return mapping.get(goal.lower(), "sağlıklı_beslenme")

# Singleton MongoDB istemcisi
db_client = MongoDBClient()

# Dışa aktarılan fonksiyonlar
def get_user_nutrition_data(user_id: str) -> Dict[str, Any]:
    """
    Kullanıcının beslenme önerisi için gerekli verilerini getirir
    
    Args:
        user_id: Kullanıcı ID'si
        
    Returns:
        Kullanıcı beslenme verileri
    """
    return db_client.get_user_profile_data(user_id)

def save_user_nutrition_plan(user_id: str, nutrition_plan: Dict) -> Optional[str]:
    """
    Kullanıcının beslenme planını kaydeder
    
    Args:
        user_id: Kullanıcı ID'si
        nutrition_plan: Beslenme planı
        
    Returns:
        Kayıt ID'si veya None
    """
    return db_client.save_nutrition_plan(user_id, nutrition_plan)

def save_user_meal_log(user_id: str, meal_data: Dict) -> Optional[str]:
    """
    Kullanıcının tükettiği öğünü kaydeder
    
    Args:
        user_id: Kullanıcı ID'si
        meal_data: Öğün verisi
        
    Returns:
        Kayıt ID'si veya None
    """
    return db_client.save_meal_log(user_id, meal_data)

def get_user_meal_history(user_id: str, limit: int = 10) -> List[Dict]:
    """
    Kullanıcının öğün geçmişini getirir
    
    Args:
        user_id: Kullanıcı ID'si
        limit: Maksimum kayıt sayısı
        
    Returns:
        Öğün kayıtları listesi
    """
    return db_client.get_user_meal_logs(user_id, limit)

# Test fonksiyonu
def test_db_connection():
    """Veritabanı bağlantısını test eder"""
    try:
        client = MongoDBClient()
        db_info = client.client.server_info()
        logger.info(f"MongoDB bağlantısı başarılı: {db_info.get('version')}")
        return True
    except Exception as e:
        logger.error(f"MongoDB bağlantı testi başarısız: {str(e)}")
        return False 