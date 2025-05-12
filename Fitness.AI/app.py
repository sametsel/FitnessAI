from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from models.nutrition_planner import NutritionPlanner
from models.workout_planner import WorkoutPlanner

# .env dosyasını yükle
load_dotenv()

app = Flask(__name__)

# CORS ayarları
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5000", "http://192.168.1.110:5000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# MongoDB bağlantısı
client = MongoClient(os.getenv('MONGODB_URI'))
db = client.fitness_db

# AI modelleri
nutrition_planner = NutritionPlanner()
workout_planner = WorkoutPlanner()

@app.route('/api/ai/nutrition-plan', methods=['POST'])
def generate_nutrition_plan():
    try:
        print("Beslenme planı isteği alındı:", request.json)
        user_data = request.json
        plan = nutrition_planner.generate_plan(user_data)
        return jsonify(plan)
    except Exception as e:
        print("Beslenme planı hatası:", str(e))
        return jsonify({'error': str(e)}), 500

@app.route('/api/ai/workout-plan', methods=['POST'])
def generate_workout_plan():
    try:
        print("Antrenman planı isteği alındı:", request.json)
        user_data = request.json
        plan = workout_planner.generate_plan(user_data)
        return jsonify(plan)
    except Exception as e:
        print("Antrenman planı hatası:", str(e))
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Flask sunucusu başlatılıyor...")
    app.run(host='0.0.0.0', port=5001, debug=True) 