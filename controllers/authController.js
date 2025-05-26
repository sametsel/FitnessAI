const User = require('../models/User');
const WorkoutPlan = require('../models/WorkoutPlan');
const NutritionPlan = require('../models/NutritionPlan');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Kullanıcı kaydı
exports.register = async (req, res) => {
    try {
        console.log('Kayıt isteği alındı:', req.body);
        const { email, password, name, age, gender, height, weight, activityLevel, goals } = req.body;

        // Zorunlu alanları kontrol et
        if (!email || !password || !name || !age || !gender || !height || !weight || !activityLevel || !goals) {
            console.log('Eksik alanlar var');
            return res.status(400).json({
                success: false,
                message: 'Tüm alanları doldurunuz',
                error: 'Missing required fields'
            });
        }

        // Email kontrolü
        console.log('Email kontrolü yapılıyor:', email);
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('Email zaten kullanımda:', email);
            return res.status(400).json({
                success: false,
                message: 'Bu email adresi zaten kullanılıyor',
                error: 'Email already exists'
            });
        }

        // Yeni kullanıcı oluştur
        console.log('Yeni kullanıcı oluşturuluyor...');
        const user = new User({
            email,
            password,
            name,
            age,
            gender,
            height,
            weight,
            activityLevel,
            goals
        });

        // Kullanıcıyı kaydet
        console.log('Kullanıcı kaydediliyor...');
        await user.save();
        console.log('Kullanıcı başarıyla kaydedildi');

        // Kullanıcının kayıt günü (createdAt) Türkçe gün adı olarak al
        const registerDate = user.createdAt;
        const registerDay = registerDate.toLocaleDateString('tr-TR', { weekday: 'long' }); // ör: "Cuma"
        const registerDateStr = registerDate.toISOString().slice(0, 10); // "2025-05-23"

        // AI destekli antrenman planı oluştur (FastAPI)
        try {
            const fastApiRes = await axios.post(
                process.env.FASTAPI_URL ? process.env.FASTAPI_URL + '/generate-workout-plan' : 'http://localhost:5000/generate-workout-plan',
                {
                    age,
                    weight,
                    height,
                    gender,
                    activity_level: activityLevel,
                    goals,
                    register_day: registerDay,
                    register_date: registerDateStr
                },
            );
            if (fastApiRes.data && fastApiRes.data.data && fastApiRes.data.data.workout_plan) {
                // AI'dan gelen JSON'u parse et
                let aiPlan;
                try {
                    aiPlan = typeof fastApiRes.data.data.workout_plan === 'string'
                        ? JSON.parse(fastApiRes.data.data.workout_plan)
                        : fastApiRes.data.data.workout_plan;
                } catch (e) {
                    console.error('AI planı parse edilemedi:', e);
                }
                if (aiPlan) {
                    const workouts = parseAIPlanToWorkouts(aiPlan, new Date());
                    const newPlan = new WorkoutPlan({
                        userId: user._id,
                        planType: 'monthly',
                        startDate: new Date(),
                        endDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
                        workouts,
                        goals: goals,
                        notes: 'AI tarafından oluşturuldu',
                        createdBy: 'ai'
                    });
                    await newPlan.save();
                    console.log('AI antrenman planı kaydedildi');
                }
            } else {
                console.error('AI planı alınamadı:', fastApiRes.data);
            }
        } catch (aiErr) {
            console.error('AI antrenman planı alınırken hata:', aiErr.message);
        }

        // AI destekli beslenme planı oluştur (FastAPI)
        try {
            const nutritionApiRes = await axios.post(
                process.env.FASTAPI_URL ? process.env.FASTAPI_URL + '/generate-nutrition-plan' : 'http://localhost:5000/generate-nutrition-plan',
                {
                    age,
                    weight,
                    height,
                    gender,
                    activity_level: activityLevel,
                    goals,
                    register_day: registerDay,
                    register_date: registerDateStr
                },
            );
            if (nutritionApiRes.data) {
                let aiNutritionPlan;
                try {
                    aiNutritionPlan = typeof nutritionApiRes.data === 'string'
                        ? JSON.parse(nutritionApiRes.data)
                        : nutritionApiRes.data;
                } catch (e) {
                    console.error('AI beslenme planı parse edilemedi:', e);
                }
                if (aiNutritionPlan) {
                    // Mapping fonksiyonu
                    function mapBeslenmeProgramiToDailyPlans(beslenme_programi, planStartDate) {
                        const mealTimes = {
                            sabah: "08:00",
                            ara_ogun: "10:30",
                            ogle: "13:00",
                            ara_ogun_2: "16:00",
                            aksam: "19:00"
                        };
                        const dailyPlans = [];
                        let dayIndex = 0;
                        Object.values(beslenme_programi).forEach(weekObj => {
                            Object.entries(weekObj).forEach(([day, mealsObj]) => {
                                const meals = [];
                                let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
                                // Her gün için doğru tarihi hesapla
                                const currentDate = new Date(planStartDate);
                                currentDate.setDate(currentDate.getDate() + dayIndex);
                                const dateStr = currentDate.toISOString().slice(0, 10);
                                Object.entries(mealsObj).forEach(([type, meal]) => {
                                    if(type === 'date') return;
                                    const calories = Number(meal.kalori || meal.calories || 0);
                                    const protein = Number(meal.protein || 0);
                                    const carbs = Number(meal.karbonhidrat || meal.carbs || 0);
                                    const fat = Number(meal.yag || meal.fat || 0);
                                    meals.push({
                                        type,
                                        time: mealTimes[type] || "",
                                        name: meal.yemek_adi || meal.name || "",
                                        calories,
                                        protein,
                                        carbs,
                                        fat
                                    });
                                    totalCalories += calories;
                                    totalProtein += protein;
                                    totalCarbs += carbs;
                                    totalFat += fat;
                                });
                                dailyPlans.push({
                                    day,
                                    date: dateStr,
                                    meals,
                                    totalCalories,
                                    totalProtein,
                                    totalCarbs,
                                    totalFat
                                });
                                dayIndex++;
                            });
                        });
                        return dailyPlans;
                    }
                    const newNutritionPlan = new NutritionPlan({
                        userId: user._id,
                        planType: 'monthly',
                        startDate: new Date(),
                        endDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
                        dailyPlans: mapBeslenmeProgramiToDailyPlans(aiNutritionPlan.beslenme_programi, new Date()),
                        goals: goals,
                        dietaryRestrictions: [],
                        notes: 'AI tarafından oluşturuldu',
                        createdBy: 'ai'
                    });
                    await newNutritionPlan.save();
                    console.log('AI beslenme planı kaydedildi');
                }
            } else {
                console.error('AI beslenme planı alınamadı:', nutritionApiRes.data);
            }
        } catch (aiErr) {
            console.error('AI beslenme planı alınırken hata:', aiErr.message);
        }

        // Şifreyi yanıttan çıkar
        user.password = undefined;

        // JWT token oluştur
        console.log('Token oluşturuluyor...');
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || 'gizli_anahtariniz',
            { expiresIn: '30d' }
        );

        // Başarılı yanıt
        console.log('Kayıt başarılı, yanıt gönderiliyor...');
        res.status(201).json({
            success: true,
            message: 'Kullanıcı başarıyla oluşturuldu',
            token,
            user: {
                id: user._id,
                _id: user._id,
                email: user.email,
                name: user.name,
                age: user.age,
                height: user.height,
                weight: user.weight,
                gender: user.gender,
                activityLevel: user.activityLevel,
                goals: user.goals
            }
        });

    } catch (error) {
        console.error('Kayıt hatası:', error);
        
        // Validation hatalarını kontrol et
        if (error.name === 'ValidationError') {
            const errorMessages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Doğrulama hatası',
                errors: errorMessages
            });
        }
        
        // Duplicate key hatası
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Bu e-posta adresi zaten kullanılıyor',
                error: 'Duplicate email'
            });
        }
        
        res.status(500).json({
            success: false,
            message: error.message || 'Kayıt sırasında bir hata oluştu',
            error: 'Registration failed'
        });
    }
};

// Kullanıcı girişi
exports.login = async (req, res) => {
    try {
        console.log('Login isteği alındı:', req.body);
        const { email, password } = req.body;

        // Kullanıcı kontrolü
        console.log('Kullanıcı aranıyor:', email);
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            console.log('Kullanıcı bulunamadı:', email);
            return res.status(401).json({
                success: false,
                message: 'Geçersiz email veya şifre',
                error: 'Invalid credentials'
            });
        }

        // Şifre kontrolü
        console.log('Şifre kontrolü yapılıyor');
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Şifre eşleşmedi');
            return res.status(401).json({
                success: false,
                message: 'Geçersiz email veya şifre',
                error: 'Invalid credentials'
            });
        }

        // JWT token oluştur
        console.log('Token oluşturuluyor');
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || 'gizli_anahtariniz',
            { expiresIn: '30d' }
        );

        // Şifreyi yanıttan çıkar
        user.password = undefined;

        // Başarılı yanıt
        console.log('Login başarılı, yanıt gönderiliyor');
        res.json({
            success: true,
            message: 'Giriş başarılı',
            token,
            user: {
                id: user._id,
                _id: user._id,
                email: user.email,
                name: user.name,
                age: user.age,
                height: user.height,
                weight: user.weight,
                gender: user.gender,
                activityLevel: user.activityLevel,
                goals: user.goals
            }
        });
    } catch (error) {
        console.error('Login hatası:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Giriş sırasında bir hata oluştu',
            error: 'Login failed'
        });
    }
};

// AI'dan dönen JSON string'ini temizle (yorumları ve açıklamaları sil)
function cleanJsonString(str) {
    // Yorumları sil
    let cleaned = str.replace(/\s*\/\/.*$/gm, '');
    // 'her bacak', 'her kol', 'her taraf' gibi açıklamaları sil
    cleaned = cleaned.replace(/\d+\s*her [^",}]*/gi, (m) => m.match(/\d+/)[0]);
    // Tekrarlar gibi alanlarda sadece sayıyı bırak
    cleaned = cleaned.replace(/"tekrarlar"\s*:\s*"(\d+)[^\"]*"/gi, '"tekrarlar": $1');
    cleaned = cleaned.replace(/"tekrar"\s*:\s*"(\d+)[^\"]*"/gi, '"tekrar": $1');
    cleaned = cleaned.replace(/"setler"\s*:\s*"(\d+)[^\"]*"/gi, '"setler": $1');
    cleaned = cleaned.replace(/"set"\s*:\s*"(\d+)[^\"]*"/gi, '"set": $1');
    // Gereksiz boşlukları sil
    cleaned = cleaned.replace(/\s+/g, ' ');
    return cleaned;
}

// String veya numberdan sayıyı çıkar
function extractNumber(val) {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
        const match = val.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
    }
    return 0;
}

// Meal time get
function getMealTime(mealType) {
    switch (mealType) {
        case 'sabah':
            return '08:00';
        case 'öğle':
            return '12:30';
        case 'akşam':
            return '19:00';
        default:
            return '10:00';
    }
}

function parseAIPlanToWorkouts(aiPlan, planStartDate) {
    const program = aiPlan.workout_program || aiPlan.egzersiz_programi;
    if (!program) return [];
    const workouts = [];
    let dayIndex = 0;
    Object.entries(program).forEach(([week, weekObj]) => {
        Object.entries(weekObj).forEach(([day, workoutList]) => {
            // Her gün için doğru tarihi hesapla
            const currentDate = new Date(planStartDate);
            currentDate.setDate(currentDate.getDate() + dayIndex);
            const dateStr = currentDate.toISOString().slice(0, 10);
            (Array.isArray(workoutList) ? workoutList : [workoutList]).forEach(workout => {
                workouts.push({
                    day,
                    date: dateStr,
                    name: (workout.name && workout.name.trim()) || workout.egzersiz_adi || workout.egzersiz || 'Antrenman',
                    targetMuscleGroups: workout.targetMuscleGroups || workout.kas_grubu || [],
                    sets: workout.sets || workout.set || workout.setler || 0,
                    reps: workout.reps || workout.tekrar || workout.tekrarlar || 0,
                    duration: workout.duration || workout.sure || 0,
                    restTime: workout.restTime || workout.dinlenme || '',
                    intensity: workout.intensity || workout.seviye || '',
                    notes: workout.notes || workout.aciklama || '',
                    type: workout.type || '',
                    description: workout.description || ''
                });
            });
            dayIndex++;
        });
    });
    console.log('Kaydedilecek workouts:', JSON.stringify(workouts, null, 2));
    return workouts;
}

function mapBeslenmeProgramiToDailyPlans(beslenme_programi, planStartDate) {
    const mealTimes = {
        sabah: "08:00",
        ara_ogun: "10:30",
        ogle: "13:00",
        ara_ogun_2: "16:00",
        aksam: "19:00"
    };
    const dailyPlans = [];
    let dayIndex = 0;
    Object.values(beslenme_programi).forEach(weekObj => {
        Object.entries(weekObj).forEach(([day, mealsObj]) => {
            const meals = [];
            let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
            // Her gün için doğru tarihi hesapla
            const currentDate = new Date(planStartDate);
            currentDate.setDate(currentDate.getDate() + dayIndex);
            const dateStr = currentDate.toISOString().slice(0, 10);
            Object.entries(mealsObj).forEach(([type, meal]) => {
                if(type === 'date') return;
                const calories = Number(meal.kalori || meal.calories || 0);
                const protein = Number(meal.protein || 0);
                const carbs = Number(meal.karbonhidrat || meal.carbs || 0);
                const fat = Number(meal.yag || meal.fat || 0);
                meals.push({
                    type,
                    time: mealTimes[type] || "",
                    name: meal.yemek_adi || meal.name || "",
                    calories,
                    protein,
                    carbs,
                    fat
                });
                totalCalories += calories;
                totalProtein += protein;
                totalCarbs += carbs;
                totalFat += fat;
            });
            dailyPlans.push({
                day,
                date: dateStr,
                meals,
                totalCalories,
                totalProtein,
                totalCarbs,
                totalFat
            });
            dayIndex++;
        });
    });
    return dailyPlans;
} 