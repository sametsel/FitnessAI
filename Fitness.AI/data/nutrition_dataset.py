"""
Beslenme önerileri için kullanılacak temel veri seti
"""

import pandas as pd
import numpy as np
import json
import os

# Ana besin ögeleri veritabanı
FOOD_DATABASE = {
    "meyveler": {
        "elma": {"kalori": 52, "protein": 0.3, "karbonhidrat": 14, "yağ": 0.2, "lif": 2.4, "vitamin_c": 8.4},
        "muz": {"kalori": 89, "protein": 1.1, "karbonhidrat": 22.8, "yağ": 0.3, "lif": 2.6, "vitamin_c": 8.7},
        "portakal": {"kalori": 47, "protein": 0.9, "karbonhidrat": 11.8, "yağ": 0.1, "lif": 2.4, "vitamin_c": 53.2},
        "çilek": {"kalori": 32, "protein": 0.7, "karbonhidrat": 7.7, "yağ": 0.3, "lif": 2, "vitamin_c": 58.8},
        "avokado": {"kalori": 160, "protein": 2, "karbonhidrat": 8.5, "yağ": 14.7, "lif": 6.7, "vitamin_c": 10},
    },
    "sebzeler": {
        "ıspanak": {"kalori": 23, "protein": 2.9, "karbonhidrat": 3.6, "yağ": 0.4, "lif": 2.2, "vitamin_c": 28.1},
        "brokoli": {"kalori": 34, "protein": 2.8, "karbonhidrat": 6.6, "yağ": 0.4, "lif": 2.6, "vitamin_c": 89.2},
        "havuç": {"kalori": 41, "protein": 0.9, "karbonhidrat": 9.6, "yağ": 0.2, "lif": 2.8, "vitamin_c": 5.9},
        "domates": {"kalori": 18, "protein": 0.9, "karbonhidrat": 3.9, "yağ": 0.2, "lif": 1.2, "vitamin_c": 13.7},
        "patates": {"kalori": 77, "protein": 2, "karbonhidrat": 17, "yağ": 0.1, "lif": 2.2, "vitamin_c": 19.7},
    },
    "tahıllar": {
        "pirinç": {"kalori": 130, "protein": 2.7, "karbonhidrat": 28, "yağ": 0.3, "lif": 0.4, "vitamin_c": 0},
        "makarna": {"kalori": 131, "protein": 5.5, "karbonhidrat": 25.1, "yağ": 1.1, "lif": 1.8, "vitamin_c": 0},
        "ekmek": {"kalori": 265, "protein": 9.4, "karbonhidrat": 49, "yağ": 3.2, "lif": 4.1, "vitamin_c": 0},
        "yulaf": {"kalori": 68, "protein": 2.5, "karbonhidrat": 12, "yağ": 1.4, "lif": 2, "vitamin_c": 0},
        "bulgur": {"kalori": 83, "protein": 3.1, "karbonhidrat": 18.6, "yağ": 0.2, "lif": 4.5, "vitamin_c": 0},
    },
    "proteinler": {
        "tavuk": {"kalori": 165, "protein": 31, "karbonhidrat": 0, "yağ": 3.6, "lif": 0, "vitamin_c": 0},
        "sığır eti": {"kalori": 250, "protein": 26, "karbonhidrat": 0, "yağ": 17, "lif": 0, "vitamin_c": 0},
        "yumurta": {"kalori": 155, "protein": 13, "karbonhidrat": 1.1, "yağ": 11, "lif": 0, "vitamin_c": 0},
        "ton balığı": {"kalori": 132, "protein": 28, "karbonhidrat": 0, "yağ": 1, "lif": 0, "vitamin_c": 0},
        "mercimek": {"kalori": 116, "protein": 9, "karbonhidrat": 20, "yağ": 0.4, "lif": 7.9, "vitamin_c": 1.5},
    },
    "süt ürünleri": {
        "süt": {"kalori": 42, "protein": 3.4, "karbonhidrat": 5, "yağ": 1, "lif": 0, "vitamin_c": 0},
        "yoğurt": {"kalori": 59, "protein": 3.5, "karbonhidrat": 5, "yağ": 3.3, "lif": 0, "vitamin_c": 0.5},
        "peynir": {"kalori": 350, "protein": 26, "karbonhidrat": 2.4, "yağ": 27, "lif": 0, "vitamin_c": 0},
    },
    "yağlar": {
        "zeytinyağı": {"kalori": 884, "protein": 0, "karbonhidrat": 0, "yağ": 100, "lif": 0, "vitamin_c": 0},
        "tereyağı": {"kalori": 717, "protein": 0.9, "karbonhidrat": 0.1, "yağ": 81, "lif": 0, "vitamin_c": 0},
        "hindistan cevizi yağı": {"kalori": 862, "protein": 0, "karbonhidrat": 0, "yağ": 100, "lif": 0, "vitamin_c": 0},
    }
}

# Diyet türleri
DIET_TYPES = {
    "keto": {
        "makro_oranlar": {"protein": 20, "karbonhidrat": 5, "yağ": 75},
        "açıklama": "Düşük karbonhidrat, yüksek yağ diyeti",
        "uygun_gıdalar": ["avokado", "zeytinyağı", "et", "yumurta", "peynir"],
        "kaçınılacak_gıdalar": ["şeker", "ekmek", "pirinç", "makarna", "patates"]
    },
    "düşük_karbonhidrat": {
        "makro_oranlar": {"protein": 30, "karbonhidrat": 20, "yağ": 50},
        "açıklama": "Karbonhidratları sınırlayan diyet",
        "uygun_gıdalar": ["et", "yumurta", "sebzeler", "balık", "kuruyemiş"],
        "kaçınılacak_gıdalar": ["şeker", "ekmek", "pirinç", "makarna"]
    },
    "paleo": {
        "makro_oranlar": {"protein": 30, "karbonhidrat": 30, "yağ": 40},
        "açıklama": "Taş devri diyeti olarak da bilinir",
        "uygun_gıdalar": ["et", "balık", "sebze", "meyve", "kuruyemiş"],
        "kaçınılacak_gıdalar": ["tahıllar", "baklagiller", "süt ürünleri", "şeker", "işlenmiş gıdalar"]
    },
    "vegan": {
        "makro_oranlar": {"protein": 15, "karbonhidrat": 60, "yağ": 25},
        "açıklama": "Hayvansal ürün içermeyen diyet",
        "uygun_gıdalar": ["sebzeler", "meyveler", "baklagiller", "tofu", "kuruyemiş"],
        "kaçınılacak_gıdalar": ["et", "balık", "süt ürünleri", "yumurta", "bal"]
    },
    "vejetaryen": {
        "makro_oranlar": {"protein": 15, "karbonhidrat": 55, "yağ": 30},
        "açıklama": "Et içermeyen diyet",
        "uygun_gıdalar": ["sebzeler", "meyveler", "baklagiller", "yumurta", "süt ürünleri"],
        "kaçınılacak_gıdalar": ["et", "balık"]
    },
    "dengeli": {
        "makro_oranlar": {"protein": 25, "karbonhidrat": 50, "yağ": 25},
        "açıklama": "Tüm besin gruplarından uygun oranlarda tüketen diyet",
        "uygun_gıdalar": ["et", "balık", "sebze", "meyve", "tahıl"],
        "kaçınılacak_gıdalar": ["aşırı şeker", "aşırı işlenmiş gıdalar"]
    }
}

# Günlük Aktivite Seviyeleri ve Kalori Çarpanları
ACTIVITY_LEVELS = {
    "sedanter": 1.2,  # Minimal aktivite, çoğunlukla oturma
    "hafif_aktif": 1.375,  # Haftada 1-3 gün hafif egzersiz
    "orta_aktif": 1.55,  # Haftada 3-5 gün orta düzey egzersiz
    "çok_aktif": 1.725,  # Haftada 6-7 gün yoğun egzersiz
}

# Yemek tarifleri veri seti
RECIPES = [
    {
        "isim": "Fırında Tavuk Göğsü",
        "kalori": 350,
        "protein": 40,
        "karbonhidrat": 5,
        "yağ": 18,
        "malzemeler": ["tavuk göğsü", "zeytinyağı", "baharatlar"],
        "tarifler": "Tavuk göğsünü baharatla, zeytinyağında marine edin ve 180 derece fırında 25 dakika pişirin.",
        "diyet_uyumluluğu": ["keto", "düşük_karbonhidrat", "paleo", "dengeli"]
    },
    {
        "isim": "Mercimek Çorbası",
        "kalori": 230,
        "protein": 12,
        "karbonhidrat": 40,
        "yağ": 2,
        "malzemeler": ["kırmızı mercimek", "soğan", "havuç", "sarımsak", "su"],
        "tarifler": "Sebzeleri doğrayın, mercimekle birlikte pişirin, blenderdan geçirin.",
        "diyet_uyumluluğu": ["vegan", "vejetaryen", "dengeli"]
    },
    {
        "isim": "Karışık Salata",
        "kalori": 150,
        "protein": 5,
        "karbonhidrat": 10,
        "yağ": 10,
        "malzemeler": ["marul", "domates", "salatalık", "zeytinyağı", "limon"],
        "tarifler": "Tüm sebzeleri doğrayın, zeytinyağı ve limon sosuyla karıştırın.",
        "diyet_uyumluluğu": ["keto", "düşük_karbonhidrat", "paleo", "vegan", "vejetaryen", "dengeli"]
    },
    {
        "isim": "Avokado Tostu",
        "kalori": 280,
        "protein": 8,
        "karbonhidrat": 20,
        "yağ": 18,
        "malzemeler": ["tam tahıllı ekmek", "avokado", "tuz", "karabiber", "limon"],
        "tarifler": "Ekmeği kızartın, avokadoyu ezin ve ekmek üzerine sürün, baharatlar ve limonla tatlandırın.",
        "diyet_uyumluluğu": ["vejetaryen", "vegan", "dengeli"]
    },
    {
        "isim": "Yulaf Ezmesi",
        "kalori": 300,
        "protein": 10,
        "karbonhidrat": 45,
        "yağ": 8,
        "malzemeler": ["yulaf", "süt", "muz", "bal", "tarçın"],
        "tarifler": "Yulafı süt ile pişirin, muz, bal ve tarçınla tatlandırın.",
        "diyet_uyumluluğu": ["vejetaryen", "dengeli"]
    }
]

# Besin takviyeleri ve etkileri
SUPPLEMENTS = {
    "protein tozu": {
        "kalori": 120,
        "protein": 24,
        "karbonhidrat": 3,
        "yağ": 1,
        "kullanım": "Spordan sonra kas gelişimi için",
        "hedef_kitle": ["kas_geliştirme", "kilo_verme", "dengeli_beslenme"]
    },
    "kreatin": {
        "kalori": 0,
        "protein": 0,
        "karbonhidrat": 0,
        "yağ": 0,
        "kullanım": "Güç ve yüksek yoğunluklu egzersiz performansını artırmak için",
        "hedef_kitle": ["kas_geliştirme", "güç_artırma"]
    },
    "multivitamin": {
        "kalori": 0,
        "protein": 0,
        "karbonhidrat": 0,
        "yağ": 0,
        "kullanım": "Genel vitamin ve mineral takviyesi",
        "hedef_kitle": ["genel_sağlık", "bağışıklık_güçlendirme"]
    },
    "omega_3": {
        "kalori": 10,
        "protein": 0,
        "karbonhidrat": 0,
        "yağ": 1,
        "kullanım": "Kalp ve beyin sağlığı için",
        "hedef_kitle": ["kalp_sağlığı", "eklem_sağlığı", "bilişsel_performans"]
    },
    "magnezyum": {
        "kalori": 0,
        "protein": 0,
        "karbonhidrat": 0,
        "yağ": 0,
        "kullanım": "Kas fonksiyonu ve sinir sistemi için",
        "hedef_kitle": ["kas_gevşemesi", "uyku_kalitesi", "stres_azaltma"]
    }
}

def create_nutrition_dataset():
    """Beslenme veri setini oluşturur ve DataFrame formatında döndürür"""
    data = []
    
    # Her bir besin grubunu işle
    for food_group, foods in FOOD_DATABASE.items():
        for food_name, nutrients in foods.items():
            entry = {
                "besin_grubu": food_group,
                "besin_adı": food_name,
                **nutrients
            }
            data.append(entry)
    
    # DataFrame oluştur
    df = pd.DataFrame(data)
    
    # Veri setini CSV dosyasına kaydet
    os.makedirs(os.path.dirname(os.path.abspath(__file__)), exist_ok=True)
    csv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "nutrition_data.csv")
    df.to_csv(csv_path, index=False)
    
    # Tarifleri JSON dosyasına kaydet
    json_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "recipes.json")
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(RECIPES, f, ensure_ascii=False, indent=4)
    
    # Takviyeleri JSON dosyasına kaydet
    supp_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "supplements.json")
    with open(supp_path, 'w', encoding='utf-8') as f:
        json.dump(SUPPLEMENTS, f, ensure_ascii=False, indent=4)
    
    return df

def calculate_daily_calories(weight, height, age, gender, activity_level):
    """
    Harris-Benedict denklemi kullanarak günlük kalori ihtiyacını hesaplar
    """
    if gender.lower() == "erkek":
        bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
    else:  # Kadın
        bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
    
    # Aktivite seviyesine göre çarpan
    activity_multiplier = ACTIVITY_LEVELS.get(activity_level, 1.2)
    
    return int(bmr * activity_multiplier)

def calculate_macros(calories, diet_type="dengeli"):
    """
    Belirlenen kalori miktarı ve diyet türüne göre makrobesin dağılımını hesaplar
    """
    # Diyet türüne göre makro oranlarını al
    ratios = DIET_TYPES.get(diet_type, DIET_TYPES["dengeli"])["makro_oranlar"]
    
    # Makro hesaplamalarını yap
    protein_calories = calories * (ratios["protein"] / 100)
    carb_calories = calories * (ratios["karbonhidrat"] / 100)
    fat_calories = calories * (ratios["yağ"] / 100)
    
    # Gramlar (1g protein = 4 cal, 1g karbonhidrat = 4 cal, 1g yağ = 9 cal)
    protein_grams = int(protein_calories / 4)
    carb_grams = int(carb_calories / 4)
    fat_grams = int(fat_calories / 9)
    
    return {
        "protein": protein_grams,
        "karbonhidrat": carb_grams,
        "yağ": fat_grams
    }

if __name__ == "__main__":
    # Veri setini oluştur
    nutrition_df = create_nutrition_dataset()
    print(f"Beslenme veri seti oluşturuldu: {len(nutrition_df)} besin öğesi")
    
    # Örnek hesaplamalar
    calories = calculate_daily_calories(70, 175, 30, "erkek", "orta_aktif")
    print(f"Örnek günlük kalori ihtiyacı: {calories} kalori")
    
    macros = calculate_macros(calories, "düşük_karbonhidrat")
    print(f"Makro dağılımı: {macros}") 