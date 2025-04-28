#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Beslenme AI modeli test script'i
- Model eğitimi ve test işlemleri
- Beslenme önerileri doğrulama
- Yemek tarifleri API testi
"""

import os
import sys
import json
import pathlib
import argparse
import logging
import pandas as pd
import matplotlib.pyplot as plt
from typing import Dict, List, Any, Optional

# Proje dizinine erişim için path ayarı
sys.path.append(str(pathlib.Path(__file__).parent.parent))
from models.nutrition_recommendation_model import NutritionRecommendationModel
from utils.nutrition_utils import NutritionCalculator, RecipeApiClient, MealPlanner
from data.nutrition_dataset import create_nutrition_dataset

# Logging ayarları
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def train_nutrition_model(epochs: int = 20, batch_size: int = 32) -> None:
    """
    Beslenme öneri modelini eğitir ve sonuçları değerlendirir
    
    Args:
        epochs: Eğitim devresi sayısı
        batch_size: Mini-batch boyutu
    """
    logger.info("Beslenme öneri modelini eğitmeye başlıyor...")
    
    # Modeli oluştur
    model = NutritionRecommendationModel()
    
    # Modeli eğit
    history = model.train(epochs=epochs, batch_size=batch_size)
    
    # Kaydedilen modeli yükle ve test et
    model.load_model()
    
    # Test kullanıcısı oluştur
    test_user = create_test_user()
    
    # Beslenme önerileri al
    recommendations = model.get_food_recommendations(test_user)
    
    # Sonuçları yazdır
    logger.info(f"\nTest kullanıcısı için {len(recommendations)} besin önerisi bulundu:")
    for i, item in enumerate(recommendations[:5], 1):
        logger.info(f"{i}. {item['besin_adı']} - Skor: {item['skor']:.2f}")
    
    # Günlük öğün planı oluştur
    meal_plan = model.get_meal_plan(test_user, days=3)
    
    logger.info("\nÖrnek 3 Günlük Öğün Planı:")
    for day in meal_plan:
        logger.info(f"\nGün {day['gün']}:")
        for meal in day['öğünler']:
            logger.info(f"  {meal['öğün_adı']}: {meal['tarif']} ({meal['kalori']} kalori)")
    
    logger.info("\nBeslenme modeli eğitimi ve testi tamamlandı.")

def test_nutrition_utils() -> None:
    """
    Beslenme hesaplamaları ve yardımcı araçları test eder
    """
    logger.info("Beslenme hesaplama araçlarını test ediyor...")
    
    # Test kullanıcısı oluştur
    test_user = create_test_user()
    
    # Kalori ve makrobesin hesaplama
    calculator = NutritionCalculator()
    nutrition_needs = calculator.calculate_user_nutrition_needs(test_user)
    
    logger.info("Hesaplanan Beslenme İhtiyaçları:")
    for key, value in nutrition_needs.items():
        logger.info(f"  {key}: {value}")
    
    # BMR ve TDEE hesaplama
    bmr = calculator.calculate_bmr(
        test_user['kilo'], 
        test_user['boy'], 
        test_user['yaş'], 
        test_user['cinsiyet']
    )
    tdee = calculator.calculate_tdee(bmr, test_user['aktivite_seviyesi'])
    
    logger.info(f"BMR: {bmr} kalori/gün")
    logger.info(f"TDEE: {tdee} kalori/gün")
    
    # Örnek malzemeler için besin değeri hesaplama
    ingredients = [
        {"name": "elma", "amount": 100, "unit": "g"},
        {"name": "yoğurt", "amount": 150, "unit": "g"},
        {"name": "yulaf", "amount": 50, "unit": "g"}
    ]
    
    nutrition = calculator.calculate_meal_nutrition(ingredients)
    
    logger.info("\nHesaplanan Besin Değerleri:")
    for key, value in nutrition.items():
        logger.info(f"  {key}: {value}")
    
    logger.info("Beslenme hesaplama testleri tamamlandı.")

def test_meal_planning() -> None:
    """
    Öğün planlama fonksiyonlarını test eder
    """
    logger.info("Öğün planlama işlevlerini test ediyor...")
    
    # Test kullanıcısı oluştur
    test_user = create_test_user()
    
    # Kullanıcının beslenme ihtiyaçlarını hesapla
    calculator = NutritionCalculator()
    nutrition_needs = calculator.calculate_user_nutrition_needs(test_user)
    test_user.update(nutrition_needs)
    
    # Öğün planlayıcı
    planner = MealPlanner()
    
    # Günlük plan testi
    daily_plan = planner.create_daily_meal_plan(test_user)
    
    logger.info("\nGünlük Öğün Planı:")
    logger.info(f"Toplam Kalori: {daily_plan['toplam_kalori']}")
    
    for meal in daily_plan['öğünler']:
        logger.info(f"  {meal['öğün_adı']}: {meal['tarif']} ({meal['kalori']} kalori)")
    
    # Haftalık plan testi
    weekly_plan = planner.create_weekly_meal_plan(test_user, days=2, meals_per_day=3)
    
    logger.info("\nHaftalık Öğün Planı (2 gün):")
    for day in weekly_plan:
        logger.info(f"\nGün {day['gün']}:")
        for meal in day['öğünler']:
            logger.info(f"  {meal['öğün_adı']}: {meal['tarif']} ({meal['kalori']} kalori)")
    
    logger.info("Öğün planlama testleri tamamlandı.")

def test_recipe_api() -> None:
    """
    Yemek tarifleri API'sini test eder
    """
    logger.info("Yemek tarifleri API'sini test ediyor...")
    
    # API istemcisi oluştur
    recipe_client = RecipeApiClient()
    
    # API anahtarı kontrol et
    if recipe_client.is_api_enabled:
        logger.info("API entegrasyonu etkin.")
    else:
        logger.info("API anahtarı sağlanmadı, yerel tarif verileri kullanılıyor.")
    
    # Tarif arama testi
    recipes = recipe_client.search_recipes(diet="dengeli")
    
    logger.info(f"Bulunan Tarif Sayısı: {len(recipes)}")
    if recipes:
        logger.info(f"İlk Tarif: {recipes[0].get('isim', 'Bilinmeyen')}")
        
        # İlk tarif detaylarını al
        if 'id' in recipes[0]:
            recipe_id = recipes[0]['id']
            recipe_details = recipe_client.get_recipe_details(recipe_id)
            
            if recipe_details:
                logger.info(f"Tarif Detayları: {recipe_details.get('title', 'Bilinmeyen')}")
                logger.info(f"Kalori: {recipe_details.get('calories', 'Bilinmeyen')}")
                logger.info(f"Protein: {recipe_details.get('protein', 'Bilinmeyen')}")
    
    # Farklı diyet türleri için arama testi
    logger.info("\nFarklı diyet türleri için tarif arama:")
    
    diets = ["vegan", "keto", "paleo", "vejetaryen", "düşük_karbonhidrat"]
    
    for diet in diets:
        diet_recipes = recipe_client.search_recipes(diet=diet)
        logger.info(f"{diet.capitalize()} tarif sayısı: {len(diet_recipes)}")
    
    logger.info("Yemek tarifleri API testleri tamamlandı.")

def create_test_user() -> Dict[str, Any]:
    """
    Test için örnek kullanıcı verisi oluşturur
    
    Returns:
        Kullanıcı verileri içeren sözlük
    """
    return {
        'yaş': 30,
        'boy': 175,
        'kilo': 70,
        'cinsiyet': 'erkek',
        'aktivite_seviyesi': 'orta_aktif',
        'diyet_türü': 'dengeli',
        'alerji_var': False,
        'hedef': 'sağlıklı_beslenme'
    }

def create_dataset_test() -> None:
    """
    Veri seti oluşturma işlemini test eder
    """
    logger.info("Beslenme veri seti oluşturuluyor...")
    
    # Veri seti oluştur
    df = create_nutrition_dataset()
    
    logger.info(f"Oluşturulan veri seti boyutu: {df.shape}")
    logger.info(f"Sütunlar: {', '.join(df.columns)}")
    
    # İstatistiksel özet
    logger.info("\nVeri Seti İstatistikleri:")
    logger.info(df.describe().to_string())
    
    # Besin gruplarına göre dağılım
    group_counts = df['besin_grubu'].value_counts()
    logger.info("\nBesin Grupları Dağılımı:")
    for group, count in group_counts.items():
        logger.info(f"  {group}: {count}")
    
    logger.info("Veri seti testleri tamamlandı.")

def parse_args() -> argparse.Namespace:
    """
    Komut satırı argümanlarını ayrıştırır
    
    Returns:
        Ayrıştırılmış argümanlar
    """
    parser = argparse.ArgumentParser(description='Beslenme AI modeli test script')
    
    parser.add_argument('--train', action='store_true', help='Beslenme modelini eğit')
    parser.add_argument('--epochs', type=int, default=20, help='Eğitim devresi sayısı')
    parser.add_argument('--batch-size', type=int, default=32, help='Mini-batch boyutu')
    
    parser.add_argument('--test-utils', action='store_true', help='Beslenme hesaplama araçlarını test et')
    parser.add_argument('--test-api', action='store_true', help='Yemek tarifleri API\'sini test et')
    parser.add_argument('--test-planning', action='store_true', help='Öğün planlama işlevlerini test et')
    parser.add_argument('--test-dataset', action='store_true', help='Veri seti oluşturmayı test et')
    
    parser.add_argument('--all', action='store_true', help='Tüm testleri çalıştır')
    
    return parser.parse_args()

def main() -> None:
    """
    Ana işlev - komut satırı argümanlarına göre testleri çalıştırır
    """
    args = parse_args()
    
    # Tüm testleri çalıştır
    if args.all:
        create_dataset_test()
        test_nutrition_utils()
        test_recipe_api()
        test_meal_planning()
        train_nutrition_model(args.epochs, args.batch_size)
        return
    
    # Bireysel testleri çalıştır
    if args.test_dataset:
        create_dataset_test()
    
    if args.test_utils:
        test_nutrition_utils()
    
    if args.test_api:
        test_recipe_api()
    
    if args.test_planning:
        test_meal_planning()
    
    if args.train:
        train_nutrition_model(args.epochs, args.batch_size)
    
    # Hiçbir argüman belirtilmediyse yardım mesajını göster
    if not any([args.train, args.test_utils, args.test_api, args.test_planning, args.test_dataset]):
        print("Hiçbir test seçilmedi. Yardım için --help kullanın.")

if __name__ == "__main__":
    main() 