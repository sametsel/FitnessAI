# Fitness.AI - Yapay Zeka Destekli Fitness Uygulaması

Bu modül, Fitness uygulamasının yapay zeka destekli beslenme ve antrenman öneri sistemlerini içerir.

## Kurulum

1. Gerekli paketleri yükleyin:

```bash
pip install -r requirements.txt
```

2. (Opsiyonel) Yemek tarifleri API anahtarını ayarlayın:

```bash
# Linux/Mac
export RECIPE_API_KEY=your_api_key_here

# Windows (CMD)
set RECIPE_API_KEY=your_api_key_here

# Windows (PowerShell)
$env:RECIPE_API_KEY = "your_api_key_here"
```

## Veri Setini Oluşturma

İlk kullanımda veri setlerini oluşturmak için:

```bash
python -m scripts.test_nutrition_model --test-dataset
```

## Beslenme Modelini Eğitme

TensorFlow modelini eğitmek için:

```bash
python -m scripts.test_nutrition_model --train
```

Parametreleri özelleştirmek için:

```bash
python -m scripts.test_nutrition_model --train --epochs 30 --batch-size 64
```

## API'yi Çalıştırma

API servisini başlatmak için:

```bash
uvicorn api.main:app --reload
```

Tarayıcınızdan `http://localhost:8000/docs` adresine giderek API belgelerini görüntüleyebilirsiniz.

## Kullanılabilir Endpointler

### Beslenme Endpointleri:

- **POST /api/nutrition/calculate-needs** - Kullanıcının beslenme ihtiyaçlarını hesaplar
- **POST /api/nutrition/food-recommendations** - Kişiselleştirilmiş besin önerileri yapar
- **POST /api/nutrition/daily-meal-plan** - Günlük öğün planı oluşturur
- **POST /api/nutrition/weekly-meal-plan** - Haftalık öğün planı oluşturur
- **GET /api/nutrition/recipe-search** - Yemek tariflerini arar

## Test Scriptleri

Çeşitli test işlevleri için:

```bash
# Beslenme hesaplamaları testleri
python -m scripts.test_nutrition_model --test-utils

# Yemek tarifleri API testleri
python -m scripts.test_nutrition_model --test-api

# Öğün planlama testleri
python -m scripts.test_nutrition_model --test-planning

# Tüm testleri çalıştırma
python -m scripts.test_nutrition_model --all
```

## Örnek Kullanım - Python İstemcisi

```python
import requests
import json

# API URL'si
API_URL = "http://localhost:8000"

# Kullanıcı verisi
user_data = {
    "yaş": 30,
    "boy": 175,
    "kilo": 70,
    "cinsiyet": "erkek",
    "aktivite_seviyesi": "orta_aktif",
    "diyet_türü": "dengeli",
    "alerji_var": False,
    "hedef": "sağlıklı_beslenme"
}

# Beslenme ihtiyaçlarını hesapla
response = requests.post(f"{API_URL}/api/nutrition/calculate-needs", json=user_data)
nutrition_needs = response.json()
print(f"Günlük kalori ihtiyacı: {nutrition_needs['günlük_kalori']} kalori")

# Besin önerilerini al
response = requests.post(f"{API_URL}/api/nutrition/food-recommendations", json=user_data)
recommendations = response.json()
print("\nBesin Önerileri:")
for item in recommendations[:5]:
    print(f"{item['besin_adı']} - Skor: {item['skor']:.2f}")

# Öğün planı oluştur
response = requests.post(f"{API_URL}/api/nutrition/daily-meal-plan", json=user_data)
meal_plan = response.json()
print("\nGünlük Öğün Planı:")
for meal in meal_plan['öğünler']:
    print(f"{meal['öğün_adı']}: {meal['tarif']} ({meal['kalori']} kalori)")
```

## Mimari

Sistem aşağıdaki bileşenlerden oluşur:

1. **Veri Katmanı** (`data/`): Besin verileri, tarifler ve temel hesaplama işlevleri
2. **Model Katmanı** (`models/`): TensorFlow/Keras ile oluşturulmuş öneri modelleri
3. **Yardımcı Modüller** (`utils/`): Hesaplama, API entegrasyonu ve yardımcı araçlar
4. **API Katmanı** (`api/`): FastAPI ile oluşturulmuş RESTful API servisi

## Lisans

Bu proje özel kullanım içindir. Tüm hakları saklıdır. 