"""
Beslenme ile ilgili yardımcı araçlar ve fonksiyonlar
- Besin değeri ve kalori hesaplama
- Yemek tarifleri API entegrasyonu
- Öğün planlama yardımcıları
"""

import requests
import json
import os
import sys
import pathlib
import pandas as pd
import random
from typing import Dict, List, Optional, Union
import logging

# Proje dizinine erişim için path ayarı
sys.path.append(str(pathlib.Path(__file__).parent.parent))
from data.nutrition_dataset import FOOD_DATABASE, calculate_daily_calories, calculate_macros

# Logging ayarları
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Yemek tarifleri API bilgileri (gerçek bir API anahtarıyla değiştirilmelidir)
RECIPE_API_KEY = os.getenv("RECIPE_API_KEY", "default_api_key")
RECIPE_API_URL = "https://api.spoonacular.com/recipes"

class NutritionCalculator:
    """
    Besin değeri ve kalori hesaplamaları yapan sınıf
    """
    
    @staticmethod
    def calculate_meal_nutrition(ingredients: List[Dict]) -> Dict:
        """
        Verilen malzeme listesi için toplam besin değerlerini hesaplar
        
        Args:
            ingredients: Malzeme listesi ve miktarları
                [{"name": "elma", "amount": 100, "unit": "g"}, ...]
                
        Returns:
            Toplam besin değerleri içeren sözlük
        """
        total_nutrition = {
            "kalori": 0,
            "protein": 0,
            "karbonhidrat": 0,
            "yağ": 0,
            "lif": 0,
            "vitamin_c": 0
        }
        
        for ingredient in ingredients:
            name = ingredient["name"].lower()
            amount = ingredient["amount"]
            unit = ingredient.get("unit", "g")
            
            # Birim dönüşümü (eğer gerekirse)
            if unit == "kg":
                amount *= 1000  # kg -> g
            
            # Malzeme besin grubunu bul
            found = False
            for food_group, foods in FOOD_DATABASE.items():
                if name in foods:
                    found = True
                    # Her 100g için değerler, miktar oranında ayarla
                    ratio = amount / 100.0
                    
                    for nutrient, value in foods[name].items():
                        if nutrient in total_nutrition:
                            total_nutrition[nutrient] += value * ratio
                    
                    break
            
            if not found:
                logger.warning(f"'{name}' besini veri tabanında bulunamadı")
        
        # Değerleri yuvarla
        for key in total_nutrition:
            total_nutrition[key] = round(total_nutrition[key], 1)
            
        return total_nutrition
    
    @staticmethod
    def calculate_bmr(weight: float, height: float, age: int, gender: str) -> float:
        """
        Bazal metabolizma hızını hesaplar (Harris-Benedict formülü)
        
        Args:
            weight: Kilo (kg)
            height: Boy (cm)
            age: Yaş
            gender: Cinsiyet ("erkek" veya "kadın")
            
        Returns:
            BMR değeri (kalori/gün)
        """
        if gender.lower() == "erkek":
            bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
        else:  # Kadın
            bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
            
        return round(bmr, 1)
    
    @staticmethod
    def calculate_tdee(bmr: float, activity_level: str) -> float:
        """
        Toplam günlük enerji harcamasını hesaplar (TDEE)
        
        Args:
            bmr: Bazal metabolizma hızı
            activity_level: Aktivite seviyesi
            
        Returns:
            TDEE değeri (kalori/gün)
        """
        # Aktivite çarpanları
        activity_multipliers = {
            "sedanter": 1.2,        # Minimal aktivite
            "hafif_aktif": 1.375,   # Haftada 1-3 kez egzersiz
            "orta_aktif": 1.55,     # Haftada 3-5 kez egzersiz
            "çok_aktif": 1.725,     # Haftada 6-7 kez egzersiz
            "ekstra_aktif": 1.9     # Günde 2x veya ağır egzersiz
        }
        
        multiplier = activity_multipliers.get(activity_level, 1.2)
        return round(bmr * multiplier, 0)
        
    @staticmethod
    def adjust_calories_for_goal(tdee: float, goal: str) -> float:
        """
        Hedefe göre kalori miktarını ayarlar
        
        Args:
            tdee: Toplam günlük enerji harcaması
            goal: Hedef ("kilo_verme", "kilo_alma", "kas_kazanma", "sağlıklı_beslenme")
            
        Returns:
            Hedef kalori miktarı
        """
        if goal == "kilo_verme":
            return round(tdee * 0.8, 0)  # %20 kalori açığı
        elif goal == "kilo_alma":
            return round(tdee * 1.15, 0)  # %15 kalori fazlası
        elif goal == "kas_kazanma":
            return round(tdee * 1.1, 0)  # %10 kalori fazlası
        else:  # sağlıklı_beslenme
            return round(tdee, 0)
    
    @staticmethod
    def calculate_user_nutrition_needs(user_data: Dict) -> Dict:
        """
        Kullanıcı verilerine göre beslenme ihtiyaçlarını hesaplar
        
        Args:
            user_data: Kullanıcı verileri (yaş, boy, kilo, cinsiyet, aktivite, hedef)
            
        Returns:
            Beslenme ihtiyaçları (kalori, protein, karbonhidrat, yağ)
        """
        # BMR hesapla
        bmr = NutritionCalculator.calculate_bmr(
            user_data["kilo"], 
            user_data["boy"], 
            user_data["yaş"], 
            user_data["cinsiyet"]
        )
        
        # TDEE hesapla
        tdee = NutritionCalculator.calculate_tdee(bmr, user_data["aktivite_seviyesi"])
        
        # Hedefe göre kalori ayarla
        target_calories = NutritionCalculator.adjust_calories_for_goal(tdee, user_data["hedef"])
        
        # Makro besinleri hesapla
        macros = calculate_macros(target_calories, user_data.get("diyet_türü", "dengeli"))
        
        return {
            "günlük_kalori": int(target_calories),
            "protein": macros["protein"],
            "karbonhidrat": macros["karbonhidrat"],
            "yağ": macros["yağ"],
            "bmr": int(bmr),
            "tdee": int(tdee)
        }

class RecipeApiClient:
    """
    Yemek tarifleri API'sine erişim sağlayan sınıf
    """
    
    def __init__(self, api_key=None):
        """
        RecipeApiClient sınıfını başlatır
        
        Args:
            api_key: API anahtarı (belirtilmezse varsayılan değer kullanılır)
        """
        self.api_key = api_key or RECIPE_API_KEY
        self.api_url = RECIPE_API_URL
        
        # API kullanımının etkin olup olmadığını kontrol et
        self.is_api_enabled = len(self.api_key) > 10 and self.api_key != "default_api_key"
        
        if not self.is_api_enabled:
            logger.warning("API anahtarı sağlanmadı, yerel veri kullanılacak")
    
    def search_recipes(self, 
                      query: str = None, 
                      diet: str = None, 
                      exclude_ingredients: List[str] = None,
                      max_calories: int = None,
                      min_protein: int = None) -> List[Dict]:
        """
        Belirli kriterlere göre tarifleri arar
        
        Args:
            query: Arama sorgusu
            diet: Diyet türü (vegan, vegetarian, gluten-free vb.)
            exclude_ingredients: Dışlanacak malzemeler
            max_calories: Maksimum kalori miktarı
            min_protein: Minimum protein miktarı
            
        Returns:
            Bulunan tariflerin listesi
        """
        # API etkin değilse yerel tarifleri kullan
        if not self.is_api_enabled:
            return self._get_local_recipes(diet)
        
        # API parametrelerini hazırla
        params = {
            "apiKey": self.api_key,
            "number": 10,  # 10 sonuç döndür
            "addRecipeInformation": "true",
            "fillIngredients": "true",
            "instructionsRequired": "true"
        }
        
        if query:
            params["query"] = query
            
        if diet:
            # Diyet türünü API formatına çevir
            diet_map = {
                "vegan": "vegan",
                "vejetaryen": "vegetarian",
                "keto": "ketogenic",
                "düşük_karbonhidrat": "lowcarb",
                "paleo": "paleo"
            }
            params["diet"] = diet_map.get(diet, diet)
            
        if exclude_ingredients:
            params["excludeIngredients"] = ",".join(exclude_ingredients)
            
        if max_calories:
            params["maxCalories"] = max_calories
            
        if min_protein:
            params["minProtein"] = min_protein
        
        # API isteği yap
        try:
            response = requests.get(f"{self.api_url}/complexSearch", params=params)
            response.raise_for_status()
            
            # Yanıtı JSON olarak ayrıştır
            data = response.json()
            recipes = data.get("results", [])
            
            return recipes
        except Exception as e:
            logger.error(f"API isteği sırasında hata: {str(e)}")
            return self._get_local_recipes(diet)
    
    def get_recipe_details(self, recipe_id: int) -> Dict:
        """
        Belirli bir tarif için ayrıntılı bilgi alır
        
        Args:
            recipe_id: Tarif ID'si
            
        Returns:
            Tarif ayrıntıları
        """
        if not self.is_api_enabled:
            return self._get_random_local_recipe()
        
        params = {
            "apiKey": self.api_key,
            "includeNutrition": "true"
        }
        
        try:
            response = requests.get(f"{self.api_url}/{recipe_id}/information", params=params)
            response.raise_for_status()
            
            recipe_data = response.json()
            return recipe_data
        except Exception as e:
            logger.error(f"Tarif detayları alınırken hata: {str(e)}")
            return self._get_random_local_recipe()
    
    def _get_local_recipes(self, diet_type=None) -> List[Dict]:
        """
        Yerel tarif veri setinden tarifleri alır
        
        Args:
            diet_type: Diyet türü
            
        Returns:
            Tariflerin listesi
        """
        # Veritabanını yükle
        recipes_path = os.path.join(
            pathlib.Path(__file__).parent.parent, 
            'data', 
            'recipes.json'
        )
        
        try:
            with open(recipes_path, 'r', encoding='utf-8') as f:
                all_recipes = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            # Dosya yoksa veya JSON formatlı değilse boş liste döndür
            logger.error("Yerel tarif veritabanı yüklenemedi")
            return []
        
        # Diyet türüne göre filtrele
        if diet_type:
            filtered_recipes = [
                recipe for recipe in all_recipes 
                if diet_type in recipe.get('diyet_uyumluluğu', [])
            ]
            return filtered_recipes if filtered_recipes else all_recipes
        
        return all_recipes
    
    def _get_random_local_recipe(self) -> Dict:
        """
        Yerel veritabanından rastgele bir tarif getirir
        
        Returns:
            Rastgele bir tarif
        """
        recipes = self._get_local_recipes()
        return random.choice(recipes) if recipes else {}

class MealPlanner:
    """
    Öğün planlama ve düzenleme için yardımcı sınıf
    """
    
    def __init__(self):
        self.recipe_client = RecipeApiClient()
        self.nutrition_calc = NutritionCalculator()
    
    def create_daily_meal_plan(self, 
                              user_data: Dict, 
                              meals_per_day: int = 3) -> Dict:
        """
        Kullanıcı için günlük öğün planı oluşturur
        
        Args:
            user_data: Kullanıcı verileri ve beslenme ihtiyaçları
            meals_per_day: Günlük öğün sayısı
            
        Returns:
            Günlük öğün planı
        """
        # Kullanıcının beslenme ihtiyaçlarını hesapla
        if 'günlük_kalori' not in user_data:
            nutrition_needs = self.nutrition_calc.calculate_user_nutrition_needs(user_data)
            user_data.update(nutrition_needs)
        
        # Toplam kalori ve makroları öğün sayısına göre dağıt
        meal_distribution = {
            3: [0.3, 0.4, 0.3],      # 3 öğün - kahvaltı %30, öğle %40, akşam %30
            4: [0.25, 0.3, 0.3, 0.15],  # 4 öğün - kahvaltı %25, öğle %30, akşam %30, ara öğün %15
            5: [0.2, 0.25, 0.25, 0.15, 0.15]  # 5 öğün - kahvaltı %20, öğle %25, akşam %25, ara öğünler %15
        }
        
        # Öğün isimlerini tanımla
        meal_names = {
            3: ['kahvaltı', 'öğle_yemeği', 'akşam_yemeği'],
            4: ['kahvaltı', 'öğle_yemeği', 'akşam_yemeği', 'ara_öğün'],
            5: ['kahvaltı', 'ara_öğün_1', 'öğle_yemeği', 'ara_öğün_2', 'akşam_yemeği']
        }
        
        # Öğün dağılımlarını al, yoksa 3 öğün varsayalım
        distribution = meal_distribution.get(meals_per_day, meal_distribution[3])
        names = meal_names.get(meals_per_day, meal_names[3])
        
        # Kalori ve makro dağılımını hesapla
        total_calories = user_data['günlük_kalori']
        meals = []
        
        for i, (name, ratio) in enumerate(zip(names, distribution)):
            meal_calories = total_calories * ratio
            
            # Makroları hesapla
            meal_macros = {
                'protein': user_data['protein'] * ratio,
                'karbonhidrat': user_data['karbonhidrat'] * ratio,
                'yağ': user_data['yağ'] * ratio
            }
            
            # Diyet tipine uygun tarifleri al
            diet_type = user_data.get('diyet_türü', 'dengeli')
            
            # Ara öğünleri ve ana öğünleri farklı şekilde işle
            if 'ara_öğün' in name:
                # Ara öğünler için basit atıştırmalıklar öner
                meal = self._create_simple_snack(meal_calories, diet_type)
                meal['öğün_adı'] = name
                meals.append(meal)
            else:
                # Ana öğünler için tarif ara
                recipes = self.recipe_client.search_recipes(
                    diet=diet_type,
                    max_calories=int(meal_calories * 1.1)  # %10 tolerans
                )
                
                # En uygun kalori değerine sahip tarifi seç
                if recipes:
                    best_recipe = min(recipes, key=lambda r: abs(r.get('kalori', 0) - meal_calories))
                    meal = {
                        'öğün_adı': name,
                        'tarif': best_recipe.get('isim', ''),
                        'kalori': best_recipe.get('kalori', 0),
                        'protein': best_recipe.get('protein', 0),
                        'karbonhidrat': best_recipe.get('karbonhidrat', 0),
                        'yağ': best_recipe.get('yağ', 0),
                        'tarif_detayları': best_recipe.get('tarifler', ''),
                        'malzemeler': best_recipe.get('malzemeler', [])
                    }
                    meals.append(meal)
                else:
                    # API tarifleri bulunamazsa basit bir öğün oluştur
                    meal = self._create_default_meal(name, meal_calories, meal_macros, diet_type)
                    meals.append(meal)
        
        return {
            'toplam_kalori': total_calories,
            'öğünler': meals
        }
    
    def _create_simple_snack(self, calories: float, diet_type: str) -> Dict:
        """
        Basit bir atıştırmalık öğün oluşturur
        
        Args:
            calories: Hedef kalori miktarı
            diet_type: Diyet türü
            
        Returns:
            Atıştırmalık bilgisi
        """
        # Diyet türüne göre uygun atıştırmalıklar
        diet_snacks = {
            'vegan': ['muz', 'elma', 'badem', 'kuruyemiş karışımı', 'avokado'],
            'vejetaryen': ['yoğurt', 'meyve', 'peynir', 'yumurta', 'ceviz'],
            'keto': ['peynir', 'zeytin', 'ceviz', 'avokado', 'yumurta'],
            'düşük_karbonhidrat': ['badem', 'ceviz', 'peynir', 'domates', 'salatalık'],
            'paleo': ['meyve', 'badem', 'ceviz', 'havuç', 'brokoli'],
            'dengeli': ['meyve', 'yoğurt', 'kuruyemiş', 'peynir', 'yumurta']
        }
        
        # Diyet türüne uygun atıştırmalıkları al
        snack_options = diet_snacks.get(diet_type, diet_snacks['dengeli'])
        
        # Rastgele bir atıştırmalık seç
        snack_name = random.choice(snack_options)
        
        # Varsayılan değerler
        protein = calories * 0.15 / 4  # Protein için kalori yüzdesi / 4 kalori/g
        carbs = calories * 0.55 / 4    # Karbonhidrat için kalori yüzdesi / 4 kalori/g
        fat = calories * 0.3 / 9       # Yağ için kalori yüzdesi / 9 kalori/g
        
        return {
            'öğün_adı': 'ara_öğün',
            'tarif': f'{snack_name} atıştırmalık',
            'kalori': int(calories),
            'protein': int(protein),
            'karbonhidrat': int(carbs),
            'yağ': int(fat),
            'tarif_detayları': f'Sağlıklı bir {snack_name} atıştırmalığı',
            'malzemeler': [snack_name]
        }
    
    def _create_default_meal(self, 
                            meal_name: str, 
                            calories: float, 
                            macros: Dict, 
                            diet_type: str) -> Dict:
        """
        Varsayılan bir öğün oluşturur (API kullanılamadığında)
        
        Args:
            meal_name: Öğün adı
            calories: Kalori miktarı
            macros: Makro besinler
            diet_type: Diyet türü
            
        Returns:
            Öğün bilgisi
        """
        # Diyet türüne göre basit yemek önerileri
        default_meals = {
            'kahvaltı': {
                'vegan': 'Meyveli Yulaf Ezmesi',
                'vejetaryen': 'Peynirli ve Sebzeli Omlet',
                'keto': 'Avokado ve Yumurtalı Kahvaltı',
                'düşük_karbonhidrat': 'Sebzeli Yumurta',
                'paleo': 'Meyveli Yumurta',
                'dengeli': 'Tam Tahıllı Ekmek ve Yumurta'
            },
            'öğle_yemeği': {
                'vegan': 'Nohutlu Sebze Salatası',
                'vejetaryen': 'Peynirli Sebze Salatası',
                'keto': 'Avokadolu Ton Balığı Salatası',
                'düşük_karbonhidrat': 'Tavuk ve Sebze Sotelı',
                'paleo': 'Izgara Et ve Sebzeler',
                'dengeli': 'Tavuklu Salata'
            },
            'akşam_yemeği': {
                'vegan': 'Sebzeli Mercimek Yemeği',
                'vejetaryen': 'Peynirli Sebze Güveç',
                'keto': 'Fırında Tavuk ve Brokoli',
                'düşük_karbonhidrat': 'Izgara Balık ve Sebzeler',
                'paleo': 'Fırında Et ve Tatlı Patates',
                'dengeli': 'Tavuklu Sebzeli Makarna'
            }
        }
        
        meal_dict = default_meals.get(meal_name, default_meals['öğle_yemeği'])
        default_recipe = meal_dict.get(diet_type, meal_dict['dengeli'])
        
        return {
            'öğün_adı': meal_name,
            'tarif': default_recipe,
            'kalori': int(calories),
            'protein': int(macros['protein']),
            'karbonhidrat': int(macros['karbonhidrat']),
            'yağ': int(macros['yağ']),
            'tarif_detayları': f'Basit bir {default_recipe} tarifi.',
            'malzemeler': ['Çeşitli malzemeler']
        }

    def create_weekly_meal_plan(self, 
                               user_data: Dict, 
                               days: int = 7, 
                               meals_per_day: int = 3) -> List[Dict]:
        """
        Haftalık öğün planı oluşturur
        
        Args:
            user_data: Kullanıcı verileri
            days: Plan günü sayısı
            meals_per_day: Günlük öğün sayısı
            
        Returns:
            Günlük planlardan oluşan liste
        """
        weekly_plan = []
        
        for day in range(1, days + 1):
            daily_plan = self.create_daily_meal_plan(user_data, meals_per_day)
            daily_plan['gün'] = day
            weekly_plan.append(daily_plan)
        
        return weekly_plan

# Test işlevi
def test_functions():
    # Örnek kullanıcı
    user_data = {
        'yaş': 30,
        'boy': 175,
        'kilo': 70,
        'cinsiyet': 'erkek',
        'aktivite_seviyesi': 'orta_aktif',
        'diyet_türü': 'dengeli',
        'hedef': 'sağlıklı_beslenme',
    }
    
    # Besin ihtiyaçlarını hesapla
    calculator = NutritionCalculator()
    nutrition_needs = calculator.calculate_user_nutrition_needs(user_data)
    
    print("Beslenme İhtiyaçları:")
    for key, value in nutrition_needs.items():
        print(f"  {key}: {value}")
    
    # Örnek malzemeler için besin değeri hesapla
    ingredients = [
        {"name": "elma", "amount": 100, "unit": "g"},
        {"name": "yoğurt", "amount": 150, "unit": "g"},
        {"name": "yulaf", "amount": 50, "unit": "g"}
    ]
    
    nutrition = calculator.calculate_meal_nutrition(ingredients)
    
    print("\nHesaplanan Besin Değerleri:")
    for key, value in nutrition.items():
        print(f"  {key}: {value}")
    
    # Yemek tarifleri API testi
    recipe_client = RecipeApiClient()
    recipes = recipe_client.search_recipes(diet="dengeli")
    
    print(f"\nBulunan Tarif Sayısı: {len(recipes)}")
    if recipes:
        print(f"İlk Tarif: {recipes[0].get('isim', 'Bilinmeyen')}")
    
    # Öğün planı oluşturma
    planner = MealPlanner()
    user_data.update(nutrition_needs)  # Beslenme ihtiyaçlarını ekle
    
    daily_plan = planner.create_daily_meal_plan(user_data)
    
    print("\nGünlük Öğün Planı:")
    print(f"Toplam Kalori: {daily_plan['toplam_kalori']}")
    
    for meal in daily_plan['öğünler']:
        print(f"  {meal['öğün_adı']}: {meal['tarif']} ({meal['kalori']} kalori)")

if __name__ == "__main__":
    test_functions() 