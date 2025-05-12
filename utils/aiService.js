const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://192.168.1.110:5001';

const getWorkoutPlan = async (userData, token) => {
    try {
        console.log('AI servisine istek gönderiliyor:', AI_SERVICE_URL);
        console.log('Gönderilen veri:', userData);
        
        const response = await axios.post(`${AI_SERVICE_URL}/api/ai/workout-plan`, userData, {
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json'
            }
        });

        console.log('AI servisinden yanıt:', response.data);
        return response.data;
    } catch (error) {
        console.error('AI servis hatası:', error.response ? error.response.data : error.message);
        throw new Error(error.response ? error.response.data.error : 'AI servisinden yanıt alınamadı');
    }
};

const getNutritionPlan = async (userData, token) => {
    try {
        console.log('AI servisine istek gönderiliyor:', AI_SERVICE_URL);
        console.log('Gönderilen veri:', userData);
        
        const response = await axios.post(`${AI_SERVICE_URL}/api/ai/nutrition-plan`, userData, {
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json'
            }
        });

        console.log('AI servisinden yanıt:', response.data);
        return response.data;
    } catch (error) {
        console.error('AI servis hatası:', error.response ? error.response.data : error.message);
        throw new Error(error.response ? error.response.data.error : 'AI servisinden yanıt alınamadı');
    }
};

module.exports = {
    getWorkoutPlan,
    getNutritionPlan
}; 