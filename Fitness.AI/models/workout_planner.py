import numpy as np
from sklearn.preprocessing import StandardScaler
import tensorflow as tf

class WorkoutPlanner:
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
        try:
            # Kullanıcı verilerini işle
            features = self._preprocess_data(user_data)
            
            # Model tahminini al
            predictions = self.model.predict(features)
            
            # Tahminleri egzersiz planına dönüştür
            plan = self._create_workout_plan(predictions, user_data)
            
            return plan
        except Exception as e:
            print(f"Plan oluşturma hatası: {str(e)}")
            raise e
    
    def _preprocess_data(self, user_data):
        try:
            # Kullanıcı verilerini özellik vektörüne dönüştür
            features = np.array([
                user_data['age'],
                user_data['weight'],
                user_data['height'],
                self._convert_activity_level(user_data['activity_level']),
                self._convert_goal(user_data['goal']),
                user_data['dietary_restrictions'],
                user_data['allergies'],
                user_data['preferred_cuisine'],
                user_data['meal_preferences'],
                user_data['calorie_target']
            ]).reshape(1, -1)
            
            return self.scaler.fit_transform(features)
        except Exception as e:
            print(f"Veri ön işleme hatası: {str(e)}")
            raise e
    
    def _convert_activity_level(self, level):
        levels = {
            'cok_aktif': 5,
            'aktif': 4,
            'orta': 3,
            'az_aktif': 2,
            'hareketsiz': 1
        }
        return levels.get(level, 3)
    
    def _convert_goal(self, goal):
        goals = {
            'kilo_alma': 1,
            'kilo_verme': 2,
            'kas_kazanimi': 3,
            'dayaniklilik': 4,
            'genel_fitness': 5
        }
        return goals.get(goal, 5)
    
    def _create_workout_plan(self, predictions, user_data):
        workout_plan = {
            'weekly_plan': [],
            'workout_info': {
                'weekly_frequency': 5,
                'session_duration': '45-60 dakika',
                'intensity_level': user_data['activity_level'],
                'goal': user_data['goal'],
                'user_info': {
                    'name': user_data['name'],
                    'age': user_data['age'],
                    'weight': user_data['weight'],
                    'height': user_data['height']
                }
            }
        }
        
        # Her gün için egzersiz planı oluştur
        for day in range(7):
            daily_workout = {
                'day': day + 1,
                'exercises': self._generate_workout(user_data, day)
            }
            workout_plan['weekly_plan'].append(daily_workout)
        
        return workout_plan
    
    def _generate_workout(self, user_data, day):
        # Örnek egzersiz veritabanı
        exercises = {
            'strength': [
                {
                    'name': 'Şınav',
                    'sets': 3,
                    'reps': 12,
                    'rest': '60 saniye',
                    'difficulty': 'orta',
                    'muscle_groups': ['göğüs', 'triceps', 'omuz']
                },
                {
                    'name': 'Squat',
                    'sets': 4,
                    'reps': 15,
                    'rest': '90 saniye',
                    'difficulty': 'orta',
                    'muscle_groups': ['bacak', 'kalça', 'core']
                },
                {
                    'name': 'Plank',
                    'sets': 3,
                    'duration': '45 saniye',
                    'rest': '30 saniye',
                    'difficulty': 'orta',
                    'muscle_groups': ['core', 'karın']
                }
            ],
            'cardio': [
                {
                    'name': 'Koşu',
                    'duration': '20 dakika',
                    'intensity': 'orta',
                    'calories': 200,
                    'type': 'kardiyo'
                },
                {
                    'name': 'Jumping Jack',
                    'duration': '15 dakika',
                    'intensity': 'yüksek',
                    'calories': 150,
                    'type': 'kardiyo'
                }
            ],
            'flexibility': [
                {
                    'name': 'Yoga',
                    'duration': '20 dakika',
                    'focus': 'esneklik',
                    'difficulty': 'başlangıç',
                    'type': 'esneklik'
                },
                {
                    'name': 'Stretching',
                    'duration': '15 dakika',
                    'focus': 'esneklik',
                    'difficulty': 'başlangıç',
                    'type': 'esneklik'
                }
            ]
        }
        
        # Günlere göre farklı egzersiz kombinasyonları
        workout_types = [
            ['strength', 'cardio'],
            ['cardio', 'flexibility'],
            ['strength', 'flexibility'],
            ['cardio', 'strength'],
            ['flexibility', 'strength'],
            ['cardio', 'flexibility'],
            ['strength', 'cardio']
        ]
        
        # Seçilen günün egzersiz tiplerini al
        selected_types = workout_types[day]
        
        # Kullanıcı seviyesine ve hedefine göre egzersiz seç
        workout = {
            'warmup': {
                'name': 'Hafif Kardiyo',
                'duration': '10 dakika',
                'exercises': ['Yerinde koşu', 'Jumping Jack'],
                'purpose': 'Vücut ısısını artırmak ve kasları hazırlamak'
            },
            'main_workout': [
                exercises[selected_types[0]][0],
                exercises[selected_types[1]][0]
            ],
            'cooldown': {
                'name': 'Esneme',
                'duration': '10 dakika',
                'exercises': ['Omuz esnetme', 'Bacak esnetme'],
                'purpose': 'Kasları gevşetmek ve esnekliği artırmak'
            },
            'notes': f"Bu antrenman {user_data['goal']} hedefinize yönelik olarak hazırlanmıştır. Aktivite seviyeniz: {user_data['activity_level']}"
        }
        
        return workout 