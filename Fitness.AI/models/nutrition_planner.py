import numpy as np
from sklearn.preprocessing import StandardScaler
import tensorflow as tf

class NutritionPlanner:
    def __init__(self):
        self.model = self._build_model()
        self.scaler = StandardScaler()
        
    def _build_model(self):
        model = tf.keras.Sequential([
            tf.keras.layers.Dense(64, activation='relu', input_shape=(10,)),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(32, activation='relu'),
            tf.keras.layers.Dense(16, activation='relu'),
            tf.keras.layers.Dense(7, activation='softmax')  # 7 günlük plan
        ])
        model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
        return model
    
    def generate_plan(self, user_data):
        # Kullanıcı verilerini işle
        features = self._preprocess_data(user_data)
        
        # Model tahminini al
        predictions = self.model.predict(features)
        
        # Tahminleri beslenme planına dönüştür
        plan = self._create_meal_plan(predictions, user_data)
        
        return plan
    
    def _preprocess_data(self, user_data):
        # Kullanıcı verilerini özellik vektörüne dönüştür
        features = np.array([
            user_data['age'],
            user_data['weight'],
            user_data['height'],
            user_data['activity_level'],
            user_data['goal'],
            user_data['dietary_restrictions'],
            user_data['allergies'],
            user_data['preferred_cuisine'],
            user_data['meal_preferences'],
            user_data['calorie_target']
        ]).reshape(1, -1)
        
        return self.scaler.fit_transform(features)
    
    def _create_meal_plan(self, predictions, user_data):
        # Tahminleri kullanarak detaylı beslenme planı oluştur
        meal_plan = {
            'weekly_plan': [],
            'nutritional_info': {
                'daily_calories': user_data['calorie_target'],
                'protein': f"{user_data['weight'] * 1.6}g",
                'carbs': f"{user_data['weight'] * 3}g",
                'fats': f"{user_data['weight'] * 0.5}g"
            }
        }
        
        # Her gün için öğün planı oluştur
        for day in range(7):
            daily_meals = {
                'day': day + 1,
                'meals': {
                    'breakfast': self._generate_meal('breakfast', user_data),
                    'lunch': self._generate_meal('lunch', user_data),
                    'dinner': self._generate_meal('dinner', user_data),
                    'snacks': self._generate_meal('snack', user_data)
                }
            }
            meal_plan['weekly_plan'].append(daily_meals)
        
        return meal_plan
    
    def _generate_meal(self, meal_type, user_data):
        # Örnek yemek veritabanı (gerçek uygulamada daha kapsamlı olmalı)
        meals = {
            'breakfast': [
                {'name': 'Yulaf Ezmesi', 'calories': 350, 'protein': 12, 'carbs': 58, 'fats': 6},
                {'name': 'Protein Smoothie', 'calories': 300, 'protein': 25, 'carbs': 35, 'fats': 5}
            ],
            'lunch': [
                {'name': 'Izgara Tavuk Salata', 'calories': 450, 'protein': 35, 'carbs': 25, 'fats': 15},
                {'name': 'Mercimek Çorbası', 'calories': 400, 'protein': 20, 'carbs': 45, 'fats': 10}
            ],
            'dinner': [
                {'name': 'Somon Balığı', 'calories': 500, 'protein': 40, 'carbs': 30, 'fats': 20},
                {'name': 'Sebzeli Makarna', 'calories': 450, 'protein': 15, 'carbs': 60, 'fats': 12}
            ],
            'snack': [
                {'name': 'Protein Bar', 'calories': 200, 'protein': 20, 'carbs': 15, 'fats': 5},
                {'name': 'Meyve Salatası', 'calories': 150, 'protein': 2, 'carbs': 35, 'fats': 0}
            ]
        }
        
        # Kullanıcı tercihlerine göre yemek seç
        return meals[meal_type][0]  # Basit örnek için ilk yemeği döndür 