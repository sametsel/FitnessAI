from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, Field

class Meal(BaseModel):
    """
    Öğün bilgilerini içeren model
    """
    name: str = Field(..., description="Öğün adı")
    time: str = Field(..., description="Öğün zamanı")
    calories: int = Field(..., gt=0, description="Kalori miktarı")
    protein: int = Field(..., ge=0, description="Protein miktarı (g)")
    carbs: int = Field(..., ge=0, description="Karbonhidrat miktarı (g)")
    fat: int = Field(..., ge=0, description="Yağ miktarı (g)")
    recipes: List[Dict] = Field(default_factory=list, description="Yemek tarifleri")
    supplements: List[Dict] = Field(default_factory=list, description="Besin takviyeleri")

class NutritionPlan(BaseModel):
    """
    Beslenme planı modeli
    """
    plan_id: str = Field(..., description="Benzersiz plan kimliği")
    user_id: str = Field(..., description="Kullanıcı kimliği")
    name: str = Field(..., description="Plan adı")
    description: Optional[str] = Field(default=None, description="Plan açıklaması")
    daily_calories: int = Field(..., gt=0, description="Günlük kalori hedefi")
    macros: Dict[str, int] = Field(..., description="Makro besin hedefleri (protein, carbs, fat)")
    meals: List[Meal] = Field(..., description="Günlük öğünler")
    restrictions: List[str] = Field(default_factory=list, description="Diyet kısıtlamaları")
    created_at: datetime = Field(default_factory=datetime.now, description="Oluşturulma tarihi")
    last_updated: datetime = Field(default_factory=datetime.now, description="Son güncelleme tarihi")

class MealLog(BaseModel):
    """
    Tüketilen öğün kaydı modeli
    """
    date: datetime = Field(default_factory=datetime.now, description="Kayıt tarihi")
    meal_type: str = Field(..., description="Öğün türü")
    foods: List[Dict] = Field(..., description="Tüketilen yiyecekler")
    total_calories: int = Field(..., description="Toplam kalori")
    total_protein: int = Field(..., description="Toplam protein (g)")
    total_carbs: int = Field(..., description="Toplam karbonhidrat (g)")
    total_fat: int = Field(..., description="Toplam yağ (g)")
    notes: Optional[str] = Field(default=None, description="Notlar")

# MongoDB ile etkileşim için yardımcı fonksiyonlar
async def get_nutrition_plan_by_id(plan_id: str):
    """
    Beslenme planını ID'ye göre getir
    """
    from database.mongodb import diet_plans_collection
    plan_data = await diet_plans_collection.find_one({"plan_id": plan_id})
    if plan_data:
        return NutritionPlan(**plan_data)
    return None

async def get_user_nutrition_plans(user_id: str):
    """
    Kullanıcının tüm beslenme planlarını getir
    """
    from database.mongodb import diet_plans_collection
    cursor = diet_plans_collection.find({"user_id": user_id})
    plans = []
    async for plan in cursor:
        plans.append(NutritionPlan(**plan))
    return plans

async def create_nutrition_plan(plan: NutritionPlan):
    """
    Yeni beslenme planı oluştur
    """
    from database.mongodb import diet_plans_collection
    plan_dict = plan.dict()
    await diet_plans_collection.insert_one(plan_dict)
    return plan

async def update_nutrition_plan(plan_id: str, update_data: Dict):
    """
    Beslenme planını güncelle
    """
    from database.mongodb import diet_plans_collection
    update_data["last_updated"] = datetime.now()
    await diet_plans_collection.update_one(
        {"plan_id": plan_id},
        {"$set": update_data}
    )
    return await get_nutrition_plan_by_id(plan_id)

async def add_meal_log(user_id: str, meal_log: MealLog):
    """
    Kullanıcı için öğün kaydı ekle
    """
    from database.mongodb import users_collection
    meal_log_dict = meal_log.dict()
    result = await users_collection.update_one(
        {"user_id": user_id},
        {"$push": {"meal_logs": meal_log_dict}}
    )
    return result.modified_count > 0 