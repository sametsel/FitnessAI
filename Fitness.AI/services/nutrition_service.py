from datetime import datetime
from typing import Dict, List, Optional
import random

class NutritionPlanService:
    def __init__(self):
        # Servis başlangıç yapılandırması
        pass
        
    def generate_meal_plan(self, user_profile: Dict) -> Dict:
        """
        Kullanıcı profil bilgilerine göre kişiselleştirilmiş beslenme planı oluşturur
        """
        # Kullanıcı profili analizi
        bmr = self._calculate_bmr(user_profile)
        daily_calories = self._calculate_daily_calories(bmr, user_profile["activity_level"])
        
        # Makro besin dağılımı hesaplama
        macros = self._calculate_macros(daily_calories, user_profile["fitness_goal"])
        
        # Yemek planı oluşturma
        meal_plan = self._create_meal_schedule(daily_calories, macros, user_profile)
        
        # Tarifler ve besin takviyeleri önerme
        recipes = self._suggest_recipes(meal_plan, user_profile.get("health_restrictions", []))
        supplements = self._suggest_supplements(user_profile)
        
        return {
            "meal_plan": meal_plan,
            "recipes": recipes,
            "supplements": supplements,
            "daily_calories": daily_calories,
            "macros": macros,
            "created_at": datetime.now(),
            "last_updated": datetime.now()
        }
    
    def _calculate_bmr(self, user_profile: Dict) -> float:
        """
        Bazal Metabolizma Hızını (BMR) hesaplar.
        Harris-Benedict denklemi kullanılır.
        """
        weight = user_profile["weight"]  # kg
        height = user_profile["height"]  # cm
        age = user_profile["age"]
        gender = user_profile["gender"]
        
        if gender.lower() == "erkek":
            return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
        else:
            return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
    
    def _calculate_daily_calories(self, bmr: float, activity_level: str) -> int:
        """
        Günlük kalori ihtiyacını hesaplar
        """
        activity_multipliers = {
            "sedentary": 1.2,      # Hareketsiz (ofis işi)
            "light": 1.375,        # Hafif aktivite (haftada 1-3 gün egzersiz)
            "moderate": 1.55,      # Orta aktivite (haftada 3-5 gün egzersiz)
            "active": 1.725,       # Aktif (haftada 6-7 gün egzersiz)
            "very_active": 1.9     # Çok aktif (günde 2 kez antrenman, fiziksel iş)
        }
        
        multiplier = activity_multipliers.get(activity_level, 1.375)  # Varsayılan: hafif aktivite
        return int(bmr * multiplier)
    
    def _calculate_macros(self, daily_calories: int, fitness_goal: str) -> Dict:
        """
        Fitness hedefine göre makro besinleri hesaplar
        """
        macros = {}
        
        if fitness_goal == "weight_loss":
            # Kilo kaybı için: yüksek protein, orta yağ, düşük karbonhidrat
            protein_pct = 0.40  # %40
            fat_pct = 0.30      # %30
            carbs_pct = 0.30    # %30
        elif fitness_goal == "muscle_gain":
            # Kas kazanımı için: yüksek protein, orta yağ, yüksek karbonhidrat
            protein_pct = 0.30  # %30
            fat_pct = 0.25      # %25
            carbs_pct = 0.45    # %45
        elif fitness_goal == "maintenance":
            # Koruma için: dengeli makrolar
            protein_pct = 0.30  # %30
            fat_pct = 0.30      # %30
            carbs_pct = 0.40    # %40
        else:  # overall_health
            # Genel sağlık için: dengeli makrolar
            protein_pct = 0.25  # %25
            fat_pct = 0.30      # %30
            carbs_pct = 0.45    # %45
        
        # Gram cinsinden hesaplama
        protein_cals = daily_calories * protein_pct
        fat_cals = daily_calories * fat_pct
        carbs_cals = daily_calories * carbs_pct
        
        # Kalori -> gram dönüşümü (protein: 4 cal/g, yağ: 9 cal/g, karbonhidrat: 4 cal/g)
        macros["protein"] = int(protein_cals / 4)
        macros["fat"] = int(fat_cals / 9)
        macros["carbs"] = int(carbs_cals / 4)
        
        return macros
    
    def _create_meal_schedule(self, daily_calories: int, macros: Dict, user_profile: Dict) -> List[Dict]:
        """
        Günlük yemek programı oluşturur (3-6 öğün)
        """
        meal_count = 5  # Varsayılan 5 öğün (kahvaltı, ara öğün, öğle, ara öğün, akşam)
        
        # Fitness hedefine göre öğün sayısını ayarla
        if user_profile["fitness_goal"] == "weight_loss":
            meal_count = random.choice([3, 4])  # Daha az öğün
        elif user_profile["fitness_goal"] == "muscle_gain":
            meal_count = random.choice([5, 6])  # Daha fazla öğün
        
        # Öğün başına kalori dağılımı
        calories_per_meal = [0] * meal_count
        
        if meal_count == 3:
            # 3 öğün için dağılım (%30, %40, %30)
            calories_per_meal = [
                int(daily_calories * 0.3),  # Kahvaltı
                int(daily_calories * 0.4),  # Öğle
                int(daily_calories * 0.3)   # Akşam
            ]
        elif meal_count == 4:
            # 4 öğün için dağılım (%25, %10, %30, %35)
            calories_per_meal = [
                int(daily_calories * 0.25),  # Kahvaltı
                int(daily_calories * 0.10),  # Ara öğün
                int(daily_calories * 0.30),  # Öğle
                int(daily_calories * 0.35)   # Akşam
            ]
        elif meal_count == 5:
            # 5 öğün için dağılım (%20, %10, %30, %10, %30)
            calories_per_meal = [
                int(daily_calories * 0.20),  # Kahvaltı
                int(daily_calories * 0.10),  # Ara öğün
                int(daily_calories * 0.30),  # Öğle
                int(daily_calories * 0.10),  # Ara öğün
                int(daily_calories * 0.30)   # Akşam
            ]
        elif meal_count == 6:
            # 6 öğün için dağılım (%20, %10, %25, %10, %25, %10)
            calories_per_meal = [
                int(daily_calories * 0.20),  # Kahvaltı
                int(daily_calories * 0.10),  # Ara öğün
                int(daily_calories * 0.25),  # Öğle
                int(daily_calories * 0.10),  # Ara öğün
                int(daily_calories * 0.25),  # Akşam
                int(daily_calories * 0.10)   # Gece atıştırması
            ]
        
        # Yemek zamanlarını belirle
        meal_times = []
        if meal_count == 3:
            meal_times = ["08:00", "13:00", "19:00"]
        elif meal_count == 4:
            meal_times = ["08:00", "11:00", "14:00", "19:00"]
        elif meal_count == 5:
            meal_times = ["08:00", "10:30", "13:00", "16:30", "19:30"]
        elif meal_count == 6:
            meal_times = ["07:30", "10:00", "12:30", "15:30", "18:30", "21:00"]
        
        # Öğün adlarını belirle
        meal_names = []
        if meal_count == 3:
            meal_names = ["Kahvaltı", "Öğle Yemeği", "Akşam Yemeği"]
        elif meal_count == 4:
            meal_names = ["Kahvaltı", "Kuşluk Atıştırması", "Öğle Yemeği", "Akşam Yemeği"]
        elif meal_count == 5:
            meal_names = ["Kahvaltı", "Kuşluk Atıştırması", "Öğle Yemeği", "İkindi Atıştırması", "Akşam Yemeği"]
        elif meal_count == 6:
            meal_names = ["Kahvaltı", "Kuşluk Atıştırması", "Öğle Yemeği", "İkindi Atıştırması", "Akşam Yemeği", "Gece Atıştırması"]
        
        # Öğün listesi oluştur
        meals = []
        protein_per_cal = macros["protein"] / daily_calories
        carbs_per_cal = macros["carbs"] / daily_calories
        fat_per_cal = macros["fat"] / daily_calories
        
        for i in range(meal_count):
            meal_calories = calories_per_meal[i]
            
            meal = {
                "name": meal_names[i],
                "time": meal_times[i],
                "calories": meal_calories,
                "protein": int(meal_calories * protein_per_cal * 4 / 4),  # Kalori -> gram
                "carbs": int(meal_calories * carbs_per_cal * 4 / 4),      # Kalori -> gram
                "fat": int(meal_calories * fat_per_cal * 9 / 9),         # Kalori -> gram
                "recipes": [],  # Daha sonra doldurulacak
                "supplements": []  # Daha sonra doldurulacak
            }
            
            meals.append(meal)
        
        return meals
    
    def _suggest_recipes(self, meal_plan: List[Dict], restrictions: List[str]) -> Dict:
        """
        Her öğün için uygun tarifler önerir.
        Spoonacular API veya bir tarif veritabanı kullanılabilir.
        """
        # TODO: Gerçek tarif API'si entegrasyonu
        
        # Şimdilik örnek tarif önerileri
        meal_types = {
            "Kahvaltı": [
                {"name": "Yulaf Ezmesi ve Meyve", "calories": 350},
                {"name": "Omlet ve Tam Tahıllı Ekmek", "calories": 400},
                {"name": "Peynirli ve Sebzeli Tost", "calories": 320},
            ],
            "Kuşluk Atıştırması": [
                {"name": "Yoğurt ve Meyve", "calories": 150},
                {"name": "Protein Bar", "calories": 180},
                {"name": "Bir Avuç Kuruyemiş", "calories": 160},
            ],
            "Öğle Yemeği": [
                {"name": "Tavuklu Salata", "calories": 450},
                {"name": "Mercimek Çorbası ve Tam Tahıllı Ekmek", "calories": 400},
                {"name": "Ton Balıklı Sandviç", "calories": 480},
            ],
            "İkindi Atıştırması": [
                {"name": "Proteinli Shake", "calories": 200},
                {"name": "Elma ve Badem Ezmesi", "calories": 180},
                {"name": "Lor Peyniri ve Kuru Üzüm", "calories": 150},
            ],
            "Akşam Yemeği": [
                {"name": "Izgara Somon ve Sebzeler", "calories": 550},
                {"name": "Köfteli Sebze Yemeği", "calories": 600},
                {"name": "Tavuk Göğsü ve Bulgur Pilavı", "calories": 520},
            ],
            "Gece Atıştırması": [
                {"name": "Kazein Protein ve Süt", "calories": 140},
                {"name": "Badem Sütü ve Chia Tohumu", "calories": 120},
                {"name": "Keçi Peyniri ve Tam Tahıllı Kraker", "calories": 150},
            ]
        }
        
        recipe_suggestions = {}
        
        for meal in meal_plan:
            meal_name = meal["name"]
            meal_calories = meal["calories"]
            
            # Öğün türüne göre tarif seç
            available_recipes = meal_types.get(meal_name, [])
            
            # Öğün kalori değerine en yakın tarifleri seç
            closest_recipes = sorted(available_recipes, 
                                   key=lambda x: abs(x["calories"] - meal_calories))[:3]
            
            recipe_suggestions[meal_name] = closest_recipes
        
        return recipe_suggestions
    
    def _suggest_supplements(self, user_profile: Dict) -> List[Dict]:
        """
        Kullanıcı profili ve fitness hedeflerine göre besin takviyesi önerileri
        """
        supplements = []
        fitness_goal = user_profile["fitness_goal"]
        
        # Temel takviyeler (herkes için)
        supplements.append({
            "name": "Multivitamin",
            "description": "Günlük vitamin ve mineral ihtiyacını karşılamak için",
            "dosage": "Günde 1 tablet",
            "timing": "Kahvaltı ile"
        })
        
        # Hedeflere göre özel takviyeler
        if fitness_goal == "muscle_gain":
            supplements.append({
                "name": "Protein Tozu (Whey)",
                "description": "Kas onarımı ve büyümesi için",
                "dosage": "Günde 1-2 ölçek (25-50g)",
                "timing": "Antrenman sonrası veya kahvaltıda"
            })
            supplements.append({
                "name": "Kreatin",
                "description": "Kas gücü ve performans için",
                "dosage": "Günde 5g",
                "timing": "Günlük olarak, zamanı önemli değil"
            })
        
        elif fitness_goal == "weight_loss":
            supplements.append({
                "name": "Protein Tozu (Whey/Kazein Karışımı)",
                "description": "Tokluk hissi ve kas koruması için",
                "dosage": "Günde 1-2 ölçek (25-50g)",
                "timing": "Ara öğünlerde veya yemek yerine"
            })
        
        elif fitness_goal == "overall_health":
            supplements.append({
                "name": "Omega-3 Yağ Asitleri",
                "description": "Kalp-damar sağlığı ve inflamasyon azaltma",
                "dosage": "Günde 1000-2000mg",
                "timing": "Yemekle birlikte"
            })
        
        # Yaşa göre ek takviyeler
        if user_profile["age"] > 40:
            supplements.append({
                "name": "Koenzim Q10",
                "description": "Hücre enerjisi ve antioksidan destek",
                "dosage": "Günde 100-200mg",
                "timing": "Kahvaltı ile"
            })
        
        return supplements 