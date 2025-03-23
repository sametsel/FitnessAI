import os
from typing import Dict, List
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

class OpenAIService:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
    async def generate_workout_plan(self, user_data: Dict, analysis_results: Dict) -> Dict:
        """Kullanıcıya özel antrenman programı oluşturur"""
        try:
            prompt = self._create_workout_prompt(user_data, analysis_results)
            
            response = await self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "Sen bir profesyonel fitness antrenörüsün."},
                    {"role": "user", "content": prompt}
                ]
            )
            
            return self._parse_workout_response(response.choices[0].message.content)
            
        except Exception as e:
            raise Exception(f"Antrenman programı oluşturulurken hata: {str(e)}")
            
    async def generate_diet_plan(self, user_data: Dict, analysis_results: Dict) -> Dict:
        """Kullanıcıya özel beslenme programı oluşturur"""
        try:
            prompt = self._create_diet_prompt(user_data, analysis_results)
            
            response = await self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "Sen bir beslenme uzmanısın."},
                    {"role": "user", "content": prompt}
                ]
            )
            
            return self._parse_diet_response(response.choices[0].message.content)
            
        except Exception as e:
            raise Exception(f"Beslenme programı oluşturulurken hata: {str(e)}")
    
    def _create_workout_prompt(self, user_data: Dict, analysis_results: Dict) -> str:
        """Antrenman programı için prompt oluşturur"""
        return f"""
        Kullanıcı Bilgileri:
        - Yaş: {user_data['age']}
        - Cinsiyet: {user_data['gender']}
        - Kilo: {user_data['weight']} kg
        - Boy: {user_data['height']} cm
        - Deneyim: {user_data['experience_level']}
        - Hedef: {user_data['fitness_goal']}
        - Aktivite Seviyesi: {user_data['activity_level']}
        - Program Süresi: {user_data['program_duration']}
        - Tercih Edilen Antrenman Günleri: {user_data['preferred_workout_days']}
        
        Analiz Sonuçları:
        - Program Tipi: {analysis_results['recommended_program_type']}
        - Yoğunluk: {analysis_results['recommended_intensity']}
        
        Lütfen bu bilgilere göre detaylı bir antrenman programı oluştur.
        Program şunları içermeli:
        1. Haftalık antrenman planı
        2. Her antrenman için egzersizler, setler ve tekrarlar
        3. Dinlenme süreleri
        4. İlerleme önerileri
        5. Dikkat edilmesi gereken noktalar
        """
    
    def _create_diet_prompt(self, user_data: Dict, analysis_results: Dict) -> str:
        """Beslenme programı için prompt oluşturur"""
        return f"""
        Kullanıcı Bilgileri:
        - Yaş: {user_data['age']}
        - Cinsiyet: {user_data['gender']}
        - Kilo: {user_data['weight']} kg
        - Boy: {user_data['height']} cm
        - Hedef: {user_data['fitness_goal']}
        - Aktivite Seviyesi: {user_data['activity_level']}
        - Sağlık Kısıtlamaları: {', '.join(user_data.get('health_restrictions', ['Yok']))}
        
        Lütfen bu bilgilere göre detaylı bir beslenme programı oluştur.
        Program şunları içermeli:
        1. Günlük kalori ihtiyacı
        2. Makro besin oranları
        3. Öğün planlaması
        4. Örnek yemek listeleri
        5. Takviye önerileri
        6. Dikkat edilmesi gereken noktalar
        """
    
    def _parse_workout_response(self, response: str) -> Dict:
        """AI yanıtını yapılandırılmış formata dönüştürür"""
        # TODO: Yanıt ayrıştırma mantığı eklenecek
        return {
            "program": response,
            "structured_data": {}  # Ayrıştırılmış veri
        }
    
    def _parse_diet_response(self, response: str) -> Dict:
        """AI yanıtını yapılandırılmış formata dönüştürür"""
        # TODO: Yanıt ayrıştırma mantığı eklenecek
        return {
            "plan": response,
            "structured_data": {}  # Ayrıştırılmış veri
        } 