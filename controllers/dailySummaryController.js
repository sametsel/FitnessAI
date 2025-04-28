const DailySummary = require('../models/DailySummary');
const Workout = require('../models/Workout');
const Nutrition = require('../models/Nutrition');

// Workout tipinden DailySummary tipine dönüştürme fonksiyonu
const mapWorkoutType = (type) => {
    if (!type) return 'Yok';
    
    const typeMap = {
        'kardiyo': 'Kardiyo',
        'kuvvet': 'Üst Vücut', // Kuvvet antrenmanları genellikle üst vücut olarak kabul edilebilir
        'esneklik': 'Esneklik',
        'hiit': 'HIIT',
        'pilates': 'Tam Vücut', // Pilates genellikle tam vücut olarak kabul edilebilir
        'yoga': 'Esneklik'      // Yoga esneklik olarak kabul edilebilir
    };
    
    return typeMap[type] || 'Yok';
};

// Günlük özeti getir
exports.getDailySummary = async (req, res) => {
    try {
        const userId = req.user._id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Bugünün özetini bul veya oluştur
        let dailySummary = await DailySummary.findOne({
            user: userId,
            date: today
        });

        if (!dailySummary) {
            // Bugünün antrenmanını bul
            const todayWorkout = await Workout.findOne({
                user: userId,
                date: today
            });

            // Bugünün beslenme bilgilerini bul
            const todayNutrition = await Nutrition.findOne({
                userId: userId,
                date: today
            });

            // Yarının antrenmanını bul
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const nextWorkout = await Workout.findOne({
                user: userId,
                date: tomorrow
            });

            // Son 7 günün tamamlanan antrenman sayısını bul
            const lastWeek = new Date(today);
            lastWeek.setDate(lastWeek.getDate() - 7);
            const completedWorkouts = await Workout.countDocuments({
                user: userId,
                completed: true,
                date: { $gte: lastWeek }
            });

            // Yeni günlük özet oluştur
            dailySummary = new DailySummary({
                user: userId,
                date: today,
                todayWorkout: {
                    type: todayWorkout ? mapWorkoutType(todayWorkout.type) : 'Yok',
                    completed: todayWorkout ? todayWorkout.completed : false
                },
                nextWorkout: {
                    type: nextWorkout ? mapWorkoutType(nextWorkout.type) : 'Yok',
                    scheduledDate: nextWorkout ? nextWorkout.date : tomorrow
                },
                workoutStats: {
                    completedWorkouts: completedWorkouts
                },
                todayNutrition: {
                    totalCalories: todayNutrition ? todayNutrition.totalCalories : 0,
                    totalProtein: todayNutrition ? todayNutrition.totalProtein : 0,
                    totalCarbs: todayNutrition ? todayNutrition.totalCarbs : 0,
                    totalFat: todayNutrition ? todayNutrition.totalFat : 0,
                    meals: todayNutrition ? todayNutrition.meals.map(meal => ({
                        name: meal.name,
                        calories: meal.totalCalories,
                        protein: meal.foods.reduce((sum, food) => sum + (food.protein || 0), 0),
                        carbs: meal.foods.reduce((sum, food) => sum + (food.carbs || 0), 0),
                        fat: meal.foods.reduce((sum, food) => sum + (food.fat || 0), 0),
                        time: meal.time
                    })) : []
                }
            });

            await dailySummary.save();
        }

        res.status(200).json({
            success: true,
            data: dailySummary
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Günlük özeti güncelle
exports.updateDailySummary = async (req, res) => {
    try {
        const userId = req.user._id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let dailySummary = await DailySummary.findOne({
            user: userId,
            date: today
        });

        if (!dailySummary) {
            return res.status(404).json({
                success: false,
                error: 'Günlük özet bulunamadı'
            });
        }

        // Güncelleme işlemleri
        if (req.body.todayWorkout) {
            // Eğer workout tipini güncelliyorsak, geçerli bir değer olduğundan emin olalım
            const updatedWorkout = { ...req.body.todayWorkout };
            if (updatedWorkout.type && typeof updatedWorkout.type === 'string') {
                // Eğer gelen tip Workout modelinden geliyorsa dönüştürme yap
                updatedWorkout.type = mapWorkoutType(updatedWorkout.type);
            }
            
            dailySummary.todayWorkout = {
                ...dailySummary.todayWorkout,
                ...updatedWorkout
            };
        }

        if (req.body.nextWorkout) {
            // Eğer workout tipini güncelliyorsak, geçerli bir değer olduğundan emin olalım
            const updatedWorkout = { ...req.body.nextWorkout };
            if (updatedWorkout.type && typeof updatedWorkout.type === 'string') {
                // Eğer gelen tip Workout modelinden geliyorsa dönüştürme yap
                updatedWorkout.type = mapWorkoutType(updatedWorkout.type);
            }
            
            dailySummary.nextWorkout = {
                ...dailySummary.nextWorkout,
                ...updatedWorkout
            };
        }

        if (req.body.workoutStats) {
            dailySummary.workoutStats = {
                ...dailySummary.workoutStats,
                ...req.body.workoutStats
            };
        }

        if (req.body.todayNutrition) {
            dailySummary.todayNutrition = {
                ...dailySummary.todayNutrition,
                ...req.body.todayNutrition
            };
        }

        await dailySummary.save();

        res.status(200).json({
            success: true,
            data: dailySummary
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}; 