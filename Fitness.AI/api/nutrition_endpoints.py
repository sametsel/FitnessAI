"""
Beslenme önerileri API endpointleri
"""

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
import os
import sys
import pathlib
import logging

# Proje dizinine erişim için path ayarı
sys.path.append(str(pathlib.Path(__file__).parent.parent))
from models.nutrition_recommendation_model import NutritionRecommendationModel
from utils.nutrition_utils import NutritionCalculator, RecipeApiClient, MealPlanner

# Logging ayarları
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# API Router
router = APIRouter(
    prefix="/api/nutrition",
    tags=["nutrition"],
    responses={404: {"description": "Not found"}},
)

# Request ve Response modelleri
class UserDataRequest(BaseModel):
    yaş: int = Field(..., ge=10, le=100, description="Kullanıcı yaşı")
    boy: float = Field(..., ge=100, le=250, description="Boy (cm)")
    kilo: float = Field(..., ge=30, le=300, description="Kilo (kg)")
    cinsiyet: str = Field(..., description="Cinsiyet ('erkek' veya 'kadın')")
    aktivite_seviyesi: str = Field(..., description="Aktivite seviyesi ('sedanter', 'hafif_aktif', 'orta_aktif', 'çok_aktif', 'ekstra_aktif')")
    diyet_türü: str = Field(default="dengeli", description="Diyet türü ('vegan', 'vejetaryen', 'keto', 'düşük_karbonhidrat', 'paleo', 'dengeli')")
    alerji_var: bool = Field(default=False, description="Alerji durumu")
    alerjiler: Optional[List[str]] = Field(default=None, description="Alerjik besinler listesi")
    hedef: str = Field(default="sağlıklı_beslenme", description="Hedef ('kilo_verme', 'kilo_alma', 'kas_kazanma', 'sağlıklı_beslenme')")

class NutritionNeedsResponse(BaseModel):
    günlük_kalori: int = Field(..., description="Günlük kalori ihtiyacı")
    protein: int = Field(..., description="Günlük protein ihtiyacı (g)")
    karbonhidrat: int = Field(..., description="Günlük karbonhidrat ihtiyacı (g)")
    yağ: int = Field(..., description="Günlük yağ ihtiyacı (g)")
    bmr: int = Field(..., description="Bazal metabolizma hızı")
    tdee: int = Field(..., description="Toplam günlük enerji harcaması")

class FoodRecommendation(BaseModel):
    besin_adı: str = Field(..., description="Önerilen besin adı")
    skor: float = Field(..., description="Eşleşme puanı")
    kalori: float = Field(..., description="Kalori miktarı (100g için)")
    protein: float = Field(..., description="Protein miktarı (g)")
    karbonhidrat: float = Field(..., description="Karbonhidrat miktarı (g)")
    yağ: float = Field(..., description="Yağ miktarı (g)")

class MealInfo(BaseModel):
    öğün_adı: str = Field(..., description="Öğün adı (kahvaltı, öğle_yemeği, vb.)")
    tarif: str = Field(..., description="Tarif adı")
    kalori: int = Field(..., description="Kalori miktarı")
    protein: int = Field(..., description="Protein miktarı (g)")
    karbonhidrat: int = Field(..., description="Karbonhidrat miktarı (g)")
    yağ: int = Field(..., description="Yağ miktarı (g)")
    tarif_detayları: str = Field(..., description="Tarif yapılışı")
    malzemeler: List[str] = Field(..., description="Malzemeler listesi")
    önerilen_ek_besinler: Optional[List[str]] = Field(default=None, description="Önerilen ek besinler")

class DailyMealPlan(BaseModel):
    gün: Optional[int] = Field(default=None, description="Gün (1, 2, 3, vb.)")
    toplam_kalori: int = Field(..., description="Toplam günlük kalori")
    öğünler: List[MealInfo] = Field(..., description="Günlük öğünler")

class WeeklyPlanRequest(UserDataRequest):
    days: int = Field(default=7, ge=1, le=30, description="Plan gün sayısı")
    meals_per_day: int = Field(default=3, ge=3, le=5, description="Günlük öğün sayısı")

# Model ve yardımcı sınıfların örnekleri
nutrition_model = NutritionRecommendationModel()
nutrition_calc = NutritionCalculator()
meal_planner = MealPlanner()

@router.post("/calculate-needs", response_model=NutritionNeedsResponse)
async def calculate_nutrition_needs(user_data: UserDataRequest):
    """
    Kullanıcının beslenme ihtiyaçlarını hesaplar
    """
    try:
        # Veri sözlüğe dönüştür
        user_dict = user_data.dict()
        
        # Beslenme ihtiyaçlarını hesapla
        nutrition_needs = nutrition_calc.calculate_user_nutrition_needs(user_dict)
        
        return nutrition_needs
    except Exception as e:
        logger.error(f"Beslenme ihtiyaçları hesaplanırken hata: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Beslenme ihtiyaçları hesaplanamadı: {str(e)}"
        )

@router.post("/food-recommendations", response_model=List[FoodRecommendation])
async def get_food_recommendations(user_data: UserDataRequest, top_n: int = 10):
    """
    Kullanıcıya özel besin önerileri yapar
    """
    try:
        # Veri sözlüğe dönüştür
        user_dict = user_data.dict()
        
        # Beslenme ihtiyaçlarını hesapla ve kullanıcı verisine ekle
        nutrition_needs = nutrition_calc.calculate_user_nutrition_needs(user_dict)
        user_dict.update(nutrition_needs)
        
        # Modeli yüklemeyi dene
        if not nutrition_model.model:
            if not nutrition_model.load_model():
                # Model yoksa eğit
                logger.info("Model bulunamadı, eğitiliyor...")
                nutrition_model.train(epochs=10, batch_size=32)
        
        # Besin önerilerini al
        recommendations = nutrition_model.get_food_recommendations(user_dict, top_n=top_n)
        
        return recommendations
    except Exception as e:
        logger.error(f"Besin önerileri alınırken hata: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Besin önerileri alınamadı: {str(e)}"
        )

@router.post("/daily-meal-plan", response_model=DailyMealPlan)
async def create_daily_meal_plan(user_data: UserDataRequest, meals_per_day: int = 3):
    """
    Kullanıcıya özel günlük öğün planı oluşturur
    """
    try:
        # Veri sözlüğe dönüştür
        user_dict = user_data.dict()
        
        # Beslenme ihtiyaçlarını hesapla ve kullanıcı verisine ekle
        nutrition_needs = nutrition_calc.calculate_user_nutrition_needs(user_dict)
        user_dict.update(nutrition_needs)
        
        # Günlük öğün planı oluştur
        daily_plan = meal_planner.create_daily_meal_plan(user_dict, meals_per_day=meals_per_day)
        
        return daily_plan
    except Exception as e:
        logger.error(f"Günlük öğün planı oluşturulurken hata: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Günlük öğün planı oluşturulamadı: {str(e)}"
        )

@router.post("/weekly-meal-plan", response_model=List[DailyMealPlan])
async def create_weekly_meal_plan(plan_request: WeeklyPlanRequest):
    """
    Kullanıcıya özel haftalık öğün planı oluşturur
    """
    try:
        # Veri sözlüğe dönüştür
        user_dict = plan_request.dict(exclude={"days", "meals_per_day"})
        days = plan_request.days
        meals_per_day = plan_request.meals_per_day
        
        # Beslenme ihtiyaçlarını hesapla ve kullanıcı verisine ekle
        nutrition_needs = nutrition_calc.calculate_user_nutrition_needs(user_dict)
        user_dict.update(nutrition_needs)
        
        # Haftalık öğün planı oluştur
        weekly_plan = meal_planner.create_weekly_meal_plan(
            user_dict,
            days=days,
            meals_per_day=meals_per_day
        )
        
        return weekly_plan
    except Exception as e:
        logger.error(f"Haftalık öğün planı oluşturulurken hata: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Haftalık öğün planı oluşturulamadı: {str(e)}"
        )

@router.get("/recipe-search")
async def search_recipes(query: Optional[str] = None, 
                         diet: Optional[str] = None,
                         max_calories: Optional[int] = None):
    """
    Belirli kriterlere göre tarifleri arar
    """
    try:
        # API istemcisi oluştur
        recipe_client = RecipeApiClient()
        
        # Tarifleri ara
        recipes = recipe_client.search_recipes(
            query=query,
            diet=diet,
            max_calories=max_calories
        )
        
        return {"recipes": recipes}
    except Exception as e:
        logger.error(f"Tarif arama sırasında hata: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Tarifler aranamadı: {str(e)}"
        ) 