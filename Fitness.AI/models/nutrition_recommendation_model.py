"""
Beslenme öneri modeli - TensorFlow/Keras kullanarak oluşturulmuştur
Bu model kullanıcı özelliklerini alır ve kişiselleştirilmiş beslenme önerileri yapar
"""

import os
import json
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers # type: ignore
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.model_selection import train_test_split
import joblib
import sys
import pathlib

# Proje dizinine erişim için path ayarı
sys.path.append(str(pathlib.Path(__file__).parent.parent))
from data.nutrition_dataset import FOOD_DATABASE, DIET_TYPES, calculate_daily_calories, calculate_macros

class NutritionRecommendationModel:
    """
    Beslenme önerileri yapay zeka modeli
    """
    def __init__(self):
        self.model = None
        self.food_encoder = None
        self.user_features_scaler = None
        self.recipe_encoder = None
        self.food_features = None
        self.loaded_recipes = None
        self.model_directory = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'saved_models')
        
        # Model kayıt dizini oluştur
        os.makedirs(self.model_directory, exist_ok=True)
        
        # Veri yolları
        self.data_directory = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data')
        self.nutrition_data_path = os.path.join(self.data_directory, 'nutrition_data.csv')
        self.recipes_data_path = os.path.join(self.data_directory, 'recipes.json')

    def _load_data(self):
        """
        Beslenme ve tarif verilerini yükler
        """
        try:
            # Beslenme verilerini yükle
            self.food_df = pd.read_csv(self.nutrition_data_path)
            
            # Tarif verilerini yükle
            with open(self.recipes_data_path, 'r', encoding='utf-8') as f:
                self.loaded_recipes = json.load(f)
        except FileNotFoundError:
            from data.nutrition_dataset import create_nutrition_dataset
            print("Veri dosyaları bulunamadı, yeni veri seti oluşturuluyor...")
            self.food_df = create_nutrition_dataset()
            
            # Tarif dosyasını tekrar okuma
            with open(self.recipes_data_path, 'r', encoding='utf-8') as f:
                self.loaded_recipes = json.load(f)
                
        print(f"Toplam {len(self.food_df)} besin ve {len(self.loaded_recipes)} tarif yüklendi")
        
        # Besib özellikleri için vektör oluştur
        self.food_features = self.food_df[['kalori', 'protein', 'karbonhidrat', 'yağ']].values
    
    def _create_synthetic_user_data(self, num_samples=1000):
        """
        Model eğitimi için sentetik kullanıcı verileri oluşturur
        """
        np.random.seed(42)  # Tekrarlanabilirlik için
        
        # Kullanıcı demografi verileri
        ages = np.random.randint(18, 70, num_samples)
        heights = np.random.normal(170, 10, num_samples)  # cm
        weights = np.random.normal(70, 15, num_samples)   # kg
        genders = np.random.choice(['erkek', 'kadın'], num_samples)
        
        # Aktivite seviyeleri
        activity_levels = np.random.choice(
            ['sedanter', 'hafif_aktif', 'orta_aktif', 'çok_aktif', 'ekstra_aktif'], 
            num_samples
        )
        
        # Diyet türleri ve diyet kısıtlamaları
        diet_types = np.random.choice(list(DIET_TYPES.keys()), num_samples)
        has_allergies = np.random.choice([0, 1], num_samples, p=[0.7, 0.3])
        
        # Hedefler
        goals = np.random.choice(
            ['kilo_verme', 'kilo_alma', 'kas_kazanma', 'sağlıklı_beslenme'], 
            num_samples
        )
        
        # Günlük kalori ve makro hesaplamaları
        calories = np.zeros(num_samples)
        protein = np.zeros(num_samples)
        carbs = np.zeros(num_samples)
        fats = np.zeros(num_samples)
        
        for i in range(num_samples):
            cal = calculate_daily_calories(weights[i], heights[i], ages[i], genders[i], activity_levels[i])
            macros = calculate_macros(cal, diet_types[i])
            
            calories[i] = cal
            protein[i] = macros['protein']
            carbs[i] = macros['karbonhidrat']
            fats[i] = macros['yağ']
        
        # Besin seçimleri - kullanıcı tercihleri (etiket olarak kullanılacak)
        preferred_foods = []
        for i in range(num_samples):
            if diet_types[i] == 'vegan' or diet_types[i] == 'vejetaryen':
                food_choices = [f for f in self.food_df['besin_adı'].values 
                              if f not in ['tavuk', 'sığır eti', 'ton balığı']]
            else:
                food_choices = self.food_df['besin_adı'].values
                
            n_choices = np.random.randint(5, 15)  # Her kullanıcı için 5-15 besin seçiyoruz
            choices = np.random.choice(food_choices, n_choices, replace=False)
            preferred_foods.append(list(choices))
        
        # Veri çerçevesi oluştur
        user_data = pd.DataFrame({
            'yaş': ages,
            'boy': heights,
            'kilo': weights,
            'cinsiyet': genders,
            'aktivite_seviyesi': activity_levels,
            'diyet_türü': diet_types,
            'alerji_var': has_allergies,
            'hedef': goals,
            'günlük_kalori': calories,
            'protein': protein,
            'karbonhidrat': carbs,
            'yağ': fats,
            'tercih_edilen_besinler': preferred_foods
        })
        
        return user_data
    
    def _preprocess_data(self, user_data):
        """
        Model için veri önişleme yapar
        """
        # Kullanıcı özellikleri - sayısal
        numerical_features = user_data[['yaş', 'boy', 'kilo', 'günlük_kalori', 'protein', 'karbonhidrat', 'yağ', 'alerji_var']].values
        
        # Sayısal özellikleri ölçeklendir
        self.user_features_scaler = StandardScaler()
        scaled_numerical = self.user_features_scaler.fit_transform(numerical_features)
        
        # Kategorik veriler için one-hot encoding
        categorical_features = user_data[['cinsiyet', 'aktivite_seviyesi', 'diyet_türü', 'hedef']]
        
        self.user_categorical_encoder = OneHotEncoder(sparse=False, handle_unknown='ignore')
        encoded_categorical = self.user_categorical_encoder.fit_transform(categorical_features)
        
        # Besin adları için encoder
        all_food_names = self.food_df['besin_adı'].unique()
        self.food_encoder = {food: i for i, food in enumerate(all_food_names)}
        
        # Hedef veriler oluştur - multi-hot encoding (birden fazla besin tercihi)
        y_data = np.zeros((len(user_data), len(all_food_names)))
        
        for i, food_list in enumerate(user_data['tercih_edilen_besinler']):
            for food in food_list:
                if food in self.food_encoder:
                    y_data[i, self.food_encoder[food]] = 1
        
        # Girdi verisi olarak tüm özellikleri birleştir
        X_data = np.hstack([scaled_numerical, encoded_categorical])
        
        return X_data, y_data
    
    def build_model(self, input_shape, output_shape):
        """
        Derin öğrenme modelini oluşturur
        """
        model = keras.Sequential([
            layers.Input(shape=(input_shape,)),
            layers.Dense(128, activation='relu'),
            layers.Dropout(0.3),
            layers.Dense(256, activation='relu'),
            layers.Dropout(0.3),
            layers.Dense(128, activation='relu'),
            layers.Dense(output_shape, activation='sigmoid')
        ])
        
        model.compile(
            optimizer='adam',
            loss='binary_crossentropy',
            metrics=['accuracy', tf.keras.metrics.AUC()]
        )
        
        return model
    
    def train(self, epochs=30, batch_size=32):
        """
        Modeli eğitir ve kaydeder
        """
        # Veriyi yükle
        self._load_data()
        
        # Sentetik veri oluştur
        user_data = self._create_synthetic_user_data()
        
        # Veriyi önişle
        X_data, y_data = self._preprocess_data(user_data)
        
        # Eğitim ve test setlerine böl
        X_train, X_test, y_train, y_test = train_test_split(
            X_data, y_data, test_size=0.2, random_state=42
        )
        
        # Model oluştur
        self.model = self.build_model(X_train.shape[1], y_train.shape[1])
        
        # Erken durdurma için callback
        early_stopping = tf.keras.callbacks.EarlyStopping(
            monitor='val_loss',
            patience=5,
            restore_best_weights=True
        )
        
        # Modeli eğit
        history = self.model.fit(
            X_train, y_train,
            epochs=epochs,
            batch_size=batch_size,
            validation_split=0.2,
            callbacks=[early_stopping],
            verbose=1
        )
        
        # Test seti değerlendirmesi
        test_loss, test_acc, test_auc = self.model.evaluate(X_test, y_test)
        print(f"Test doğruluğu: {test_acc:.4f}")
        print(f"Test AUC: {test_auc:.4f}")
        
        # Modeli kaydet
        self.save_model()
        
        return history
    
    def save_model(self):
        """
        Modeli ve önişleme araçlarını kaydeder
        """
        # Model dosya yolları
        model_path = os.path.join(self.model_directory, 'nutrition_recommendation_model')
        scaler_path = os.path.join(self.model_directory, 'user_features_scaler.pkl')
        categorical_encoder_path = os.path.join(self.model_directory, 'user_categorical_encoder.pkl')
        food_encoder_path = os.path.join(self.model_directory, 'food_encoder.pkl')
        
        # TensorFlow modelini kaydet
        self.model.save(model_path)
        
        # Scaler ve encoder'ları kaydet
        joblib.dump(self.user_features_scaler, scaler_path)
        joblib.dump(self.user_categorical_encoder, categorical_encoder_path)
        joblib.dump(self.food_encoder, food_encoder_path)
        
        print(f"Model ve ön işleme araçları {self.model_directory} konumuna kaydedildi")
    
    def load_model(self):
        """
        Kaydedilmiş modeli ve önişleme araçlarını yükler
        """
        model_path = os.path.join(self.model_directory, 'nutrition_recommendation_model')
        scaler_path = os.path.join(self.model_directory, 'user_features_scaler.pkl')
        categorical_encoder_path = os.path.join(self.model_directory, 'user_categorical_encoder.pkl')
        food_encoder_path = os.path.join(self.model_directory, 'food_encoder.pkl')
        
        try:
            # Modeli yükle
            self.model = keras.models.load_model(model_path)
            
            # Scaler ve encoder'ları yükle
            self.user_features_scaler = joblib.load(scaler_path)
            self.user_categorical_encoder = joblib.load(categorical_encoder_path)
            self.food_encoder = joblib.load(food_encoder_path)
            
            # Veriyi yükle (besinler ve tarifler için)
            self._load_data()
            
            print("Model başarıyla yüklendi")
            return True
        except Exception as e:
            print(f"Model yüklenemedi: {e}")
            return False
    
    def get_food_recommendations(self, user_data, top_n=10):
        """
        Kullanıcı verilerine göre beslenme önerileri yapar
        """
        if self.model is None:
            if not self.load_model():
                print("Model bulunamadı, lütfen önce modeli eğitin")
                return []
        
        # Kullanıcı özelliklerini ön işle
        numerical_features = np.array([
            user_data['yaş'], user_data['boy'], user_data['kilo'], 
            user_data['günlük_kalori'], user_data['protein'],
            user_data['karbonhidrat'], user_data['yağ'], 
            1 if user_data.get('alerji_var', False) else 0
        ]).reshape(1, -1)
        
        # Sayısal özellikleri ölçeklendir
        scaled_numerical = self.user_features_scaler.transform(numerical_features)
        
        # Kategorik veriler için diziler
        categorical_features = pd.DataFrame({
            'cinsiyet': [user_data['cinsiyet']],
            'aktivite_seviyesi': [user_data['aktivite_seviyesi']],
            'diyet_türü': [user_data['diyet_türü']],
            'hedef': [user_data['hedef']]
        })
        
        # Kategorik verileri encode et
        encoded_categorical = self.user_categorical_encoder.transform(categorical_features)
        
        # Tüm özellikleri birleştir
        X_input = np.hstack([scaled_numerical, encoded_categorical])
        
        # Tahmini yap
        food_scores = self.model.predict(X_input)[0]
        
        # Reverse food_encoder
        reverse_food_encoder = {i: food for food, i in self.food_encoder.items()}
        
        # En yüksek skorlu besinleri al
        top_indices = np.argsort(food_scores)[-top_n:][::-1]
        
        # Besin önerileri listesi
        recommendations = []
        
        for idx in top_indices:
            food_name = reverse_food_encoder[idx]
            score = food_scores[idx]
            
            # Besin bilgilerini bul
            food_info = self.food_df[self.food_df['besin_adı'] == food_name].iloc[0].to_dict()
            
            recommendations.append({
                'besin_adı': food_name,
                'skor': float(score),  # numpy float64'ten Python float'a çevir
                'kalori': food_info['kalori'],
                'protein': food_info['protein'],
                'karbonhidrat': food_info['karbonhidrat'],
                'yağ': food_info['yağ']
            })
        
        return recommendations
    
    def get_meal_plan(self, user_data, days=7, meals_per_day=3):
        """
        Kullanıcı için günlük öğün planı oluşturur
        """
        # Öncelikle diyet türüne uygun tarifleri filtrele
        diet_type = user_data['diyet_türü']
        
        suitable_recipes = []
        for recipe in self.loaded_recipes:
            if diet_type in recipe['diyet_uyumluluğu']:
                suitable_recipes.append(recipe)
        
        if not suitable_recipes:
            suitable_recipes = self.loaded_recipes  # Eğer uygun tarif yoksa hepsini kullan
        
        # Günlük kalori ve makrobesin hedeflerini al
        daily_calories = user_data['günlük_kalori']
        protein_target = user_data['protein']
        carb_target = user_data['karbonhidrat']
        fat_target = user_data['yağ']
        
        # Öğün başına kalori ve makro dağılımı
        meal_calories = {
            'kahvaltı': daily_calories * 0.3,
            'öğle_yemeği': daily_calories * 0.4,
            'akşam_yemeği': daily_calories * 0.3
        }
        
        # Öğün isimlerini tanımla
        meal_names = ['kahvaltı', 'öğle_yemeği', 'akşam_yemeği']
        
        # 7 günlük plan oluştur
        meal_plan = []
        
        for day in range(1, days + 1):
            daily_meals = {'gün': day, 'öğünler': []}
            
            # Tüm öğünleri doldur
            for meal_name in meal_names[:meals_per_day]:
                target_calories = meal_calories[meal_name]
                
                # Öncelikle uygun tarifleri karıştır
                np.random.shuffle(suitable_recipes)
                
                # Bu öğün için tarif seç
                selected_recipe = None
                
                # Kalori hedefine en yakın tarifi bul
                for recipe in suitable_recipes:
                    if recipe['kalori'] <= target_calories * 1.2:  # %20 tolerans
                        selected_recipe = recipe
                        break
                
                # Eğer uygun tarif bulunamadıysa, en düşük kalorili tarifi kullan
                if selected_recipe is None:
                    selected_recipe = min(suitable_recipes, key=lambda x: x['kalori'])
                
                # Besin önerileri al
                food_recommendations = self.get_food_recommendations(user_data, top_n=3)
                
                # Öğün bilgilerini oluştur
                meal = {
                    'öğün_adı': meal_name,
                    'tarif': selected_recipe['isim'],
                    'kalori': selected_recipe['kalori'],
                    'protein': selected_recipe['protein'],
                    'karbonhidrat': selected_recipe['karbonhidrat'],
                    'yağ': selected_recipe['yağ'],
                    'tarif_detayları': selected_recipe['tarifler'],
                    'malzemeler': selected_recipe['malzemeler'],
                    'önerilen_ek_besinler': [item['besin_adı'] for item in food_recommendations]
                }
                
                daily_meals['öğünler'].append(meal)
            
            meal_plan.append(daily_meals)
        
        return meal_plan

if __name__ == "__main__":
    # Model oluştur ve eğit
    model = NutritionRecommendationModel()
    history = model.train(epochs=20, batch_size=32)
    
    # Test: Örnek kullanıcı için beslenme önerisi al
    test_user = {
        'yaş': 30,
        'boy': 175,
        'kilo': 70,
        'cinsiyet': 'erkek',
        'aktivite_seviyesi': 'orta_aktif',
        'diyet_türü': 'dengeli',
        'alerji_var': False,
        'hedef': 'sağlıklı_beslenme',
        'günlük_kalori': 2500,
        'protein': 150,
        'karbonhidrat': 250,
        'yağ': 80
    }
    
    # Besin önerileri
    recommendations = model.get_food_recommendations(test_user)
    print("\nBesin Önerileri:")
    for item in recommendations:
        print(f"{item['besin_adı']} - Skor: {item['skor']:.2f}")
    
    # Öğün planı
    meal_plan = model.get_meal_plan(test_user, days=3)
    print("\nÖrnek 3 Günlük Öğün Planı:")
    for day in meal_plan:
        print(f"\nGün {day['gün']}:")
        for meal in day['öğünler']:
            print(f"  {meal['öğün_adı']}: {meal['tarif']} ({meal['kalori']} kalori)") 