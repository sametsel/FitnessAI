const mongoose = require('mongoose');
const DailySummary = require('../models/DailySummary');
require('dotenv').config();
console.log('MONGODB_URI:', process.env.MONGODB_URI);

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB bağlantısı başarılı'))
    .catch(err => console.error('MongoDB bağlantı hatası:', err));

// Test günlük özet oluştur
const createTestDailySummary = async () => {
    try {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const dailySummary = await DailySummary.create({
            user: '68053a95a5d7f2e58ad57a4b', // Örnek bir kullanıcı ID'si
            date: today,
            todayWorkout: {
                type: 'Üst Vücut',
                completed: true
            },
            nextWorkout: {
                type: 'Alt Vücut',
                scheduledDate: tomorrow
            },
            workoutStats: {
                completedWorkouts: 3,
                totalMinutes: 180,
                caloriesBurned: 900
            },
            todayNutrition: {
                totalCalories: 2500,
                totalProtein: 150,
                totalCarbs: 300,
                totalFat: 80,
                meals: [
                    {
                        name: 'Kahvaltı',
                        calories: 600,
                        protein: 30,
                        carbs: 80,
                        fat: 20,
                        time: '08:00'
                    },
                    {
                        name: 'Öğle Yemeği',
                        calories: 800,
                        protein: 50,
                        carbs: 100,
                        fat: 25,
                        time: '13:00'
                    },
                    {
                        name: 'Akşam Yemeği',
                        calories: 700,
                        protein: 40,
                        carbs: 80,
                        fat: 20,
                        time: '19:00'
                    },
                    {
                        name: 'Ara Öğün',
                        calories: 400,
                        protein: 30,
                        carbs: 40,
                        fat: 15,
                        time: '16:00'
                    }
                ]
            }
        });

        console.log('Test günlük özet oluşturuldu');
        return dailySummary;
    } catch (error) {
        console.error('Günlük özet oluşturma hatası:', error);
        throw error;
    }
};

// Test verilerini oluştur
const createTestData = async () => {
    try {
        // Önce mevcut test verilerini temizle
        await DailySummary.deleteMany({});
        console.log('Mevcut test verileri temizlendi');

        // Test verilerini oluştur
        await createTestDailySummary();

        console.log('Test verileri başarıyla oluşturuldu');
        process.exit(0);
    } catch (error) {
        console.error('Test verisi oluşturma hatası:', error);
        process.exit(1);
    }
};

// Scripti çalıştır
createTestData(); 