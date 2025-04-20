from typing import Dict, List
import numpy as np
from sklearn.preprocessing import StandardScaler
import tensorflow as tf
from ..database.mongodb import ai_recommendations_collection

class UserAnalyzer:
    def __init__(self):
        self.scaler = StandardScaler()
        # Basit bir sinir ağı modeli
        self.model = tf.keras.Sequential([
            tf.keras.layers.Dense(64, activation='relu', input_shape=(10,)),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(32, activation='relu'),
            tf.keras.layers.Dense(16, activation='relu'),
            tf.keras.layers.Dense(8, activation='softmax')
        ])
        
    def _preprocess_user_data(self, user_data: Dict) -> np.ndarray:
        """Kullanıcı verilerini modele uygun formata dönüştürür"""
        features = [
            user_data['age'],
            user_data['weight'],
            user_data['height'],
            1 if user_data['gender'] == 'male' else 0,
            ['low', 'medium', 'high'].index(user_data['activity_level']),
            ['weight_loss', 'muscle_gain', 'maintenance'].index(user_data['fitness_goal']),
            len(user_data.get('health_restrictions', [])),
            ['beginner', 'intermediate', 'advanced'].index(user_data['experience_level']),
            user_data['preferred_workout_days'],
            1 if user_data['program_duration'] == 'monthly' else 0
        ]
        return np.array(features).reshape(1, -1)
    
    async def analyze_user(self, user_data: Dict) -> Dict:
        """Kullanıcı profilini analiz eder ve öneriler oluşturur"""
        try:
            # Veri ön işleme
            processed_data = self._preprocess_user_data(user_data)
            
            # Model tahmini (örnek)
            predictions = self.model.predict(processed_data)
            
            # Analiz sonuçları
            analysis_results = {
                'user_id': user_data['user_id'],
                'fitness_level': float(np.mean(predictions)),
                'recommended_program_type': self._get_program_type(predictions),
                'recommended_intensity': self._get_intensity(predictions),
                'estimated_timeline': self._calculate_timeline(user_data),
                'risk_factors': self._identify_risk_factors(user_data)
            }
            
            # Sonuçları veritabanına kaydet
            await ai_recommendations_collection.update_one(
                {'user_id': user_data['user_id']},
                {'$set': {'analysis_results': analysis_results}},
                upsert=True
            )
            
            return analysis_results
            
        except Exception as e:
            raise Exception(f"Kullanıcı analizi sırasında hata: {str(e)}")
    
    def _get_program_type(self, predictions: np.ndarray) -> str:
        """Tahminlere göre program tipini belirler"""
        program_types = ['strength', 'cardio', 'hybrid', 'flexibility']
        return program_types[np.argmax(predictions[0][:4])]
    
    def _get_intensity(self, predictions: np.ndarray) -> str:
        """Tahminlere göre program yoğunluğunu belirler"""
        intensities = ['low', 'moderate', 'high']
        return intensities[np.argmax(predictions[0][4:7])]
    
    def _calculate_timeline(self, user_data: Dict) -> Dict:
        """Hedeflere ulaşmak için tahmini süre hesaplar"""
        base_timeline = 12  # Hafta
        
        # Faktörlere göre süreyi ayarla
        if user_data['experience_level'] == 'beginner':
            base_timeline += 4
        elif user_data['experience_level'] == 'advanced':
            base_timeline -= 2
            
        if user_data['activity_level'] == 'low':
            base_timeline += 2
        elif user_data['activity_level'] == 'high':
            base_timeline -= 2
            
        return {
            'weeks': base_timeline,
            'estimated_completion_date': f"{base_timeline} hafta"
        }
    
    def _identify_risk_factors(self, user_data: Dict) -> List[str]:
        """Potansiyel risk faktörlerini belirler"""
        risks = []
        
        if user_data['age'] > 50:
            risks.append('age_related_considerations')
            
        if user_data.get('health_restrictions'):
            risks.extend(user_data['health_restrictions'])
            
        if user_data['activity_level'] == 'low' and user_data['fitness_goal'] == 'muscle_gain':
            risks.append('gradual_intensity_increase_needed')
            
        return risks 