const NutritionPlan = require('../models/NutritionPlan');

// Aktif beslenme planını getir
exports.getActiveNutritionPlan = async (req, res) => {
    try {
        const userId = req.user.id;
        const currentDate = new Date();

        const nutritionPlan = await NutritionPlan.findOne({
            userId,
            startDate: { $lte: currentDate },
            endDate: { $gte: currentDate }
        }).sort({ createdAt: -1 });

        if (!nutritionPlan) {
            return res.status(404).json({ message: 'Aktif beslenme planı bulunamadı' });
        }

        res.json(nutritionPlan);
    } catch (error) {
        console.error('Beslenme planı getirme hatası:', error);
        res.status(500).json({ message: 'Beslenme planı alınamadı' });
    }
};

// Tüm beslenme planlarını getir
exports.getAllNutritionPlans = async (req, res) => {
    try {
        const userId = req.user.id;
        const nutritionPlans = await NutritionPlan.find({ userId })
            .sort({ startDate: -1 });

        res.json(nutritionPlans);
    } catch (error) {
        console.error('Beslenme planları getirme hatası:', error);
        res.status(500).json({ message: 'Beslenme planları alınamadı' });
    }
};

// Belirli bir beslenme planını getir
exports.getNutritionPlanById = async (req, res) => {
    try {
        const userId = req.user.id;
        const planId = req.params.id;

        const nutritionPlan = await NutritionPlan.findOne({
            _id: planId,
            userId
        });

        if (!nutritionPlan) {
            return res.status(404).json({ message: 'Beslenme planı bulunamadı' });
        }

        res.json(nutritionPlan);
    } catch (error) {
        console.error('Beslenme planı getirme hatası:', error);
        res.status(500).json({ message: 'Beslenme planı alınamadı' });
    }
};

// Bugünkü öğünleri getir
exports.getTodayMeals = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const plan = await NutritionPlan.findOne({ userId }).sort({ createdAt: -1 });

        if (!plan) {
            return res.status(404).json({ message: 'Beslenme planı bulunamadı.' });
        }

        // Bugünkü beslenme planını bul (tarih ile)
        const todayMeals = plan.dailyPlans.find(d => d.date === today);

        if (!todayMeals) {
            return res.status(404).json({ message: 'Bugün için beslenme planı bulunamadı.' });
        }

        res.json(todayMeals);
    } catch (err) {
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
};

// Günlük beslenme özetini getir
exports.getNutritionSummary = async (req, res) => {
    try {
        const userId = req.user.id;
        const currentDate = new Date();
        const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
        const todayName = days[currentDate.getDay()];

        const nutritionPlan = await NutritionPlan.findOne({
            userId,
            startDate: { $lte: currentDate },
            endDate: { $gte: currentDate }
        }).sort({ createdAt: -1 });

        if (!nutritionPlan) {
            return res.json({
                calories: 0, protein: 0, carbs: 0, fat: 0,
                calorieGoal: 0, proteinGoal: 0, carbsGoal: 0, fatGoal: 0
            });
        }

        const todayPlan = nutritionPlan.dailyPlans.find(plan => plan.day === todayName);
        if (!todayPlan) {
            return res.json({
                calories: 0, protein: 0, carbs: 0, fat: 0,
                calorieGoal: 0, proteinGoal: 0, carbsGoal: 0, fatGoal: 0
            });
        }

        res.json({
            calories: todayPlan.totalCalories,
            protein: todayPlan.totalProtein,
            carbs: todayPlan.totalCarbs,
            fat: todayPlan.totalFat,
            calorieGoal: nutritionPlan.calorieGoal || 0,
            proteinGoal: nutritionPlan.proteinGoal || 0,
            carbsGoal: nutritionPlan.carbsGoal || 0,
            fatGoal: nutritionPlan.fatGoal || 0
        });
    } catch (error) {
        res.status(500).json({
            calories: 0, protein: 0, carbs: 0, fat: 0,
            calorieGoal: 0, proteinGoal: 0, carbsGoal: 0, fatGoal: 0
        });
    }
};

// Belirli bir güne ait beslenme planını getir
exports.getDailyPlanByDate = async (req, res) => {
    try {
        const userId = req.user.id;
        const date = req.query.date; // YYYY-MM-DD formatında gelmeli

        // En güncel planı bul
        const plan = await NutritionPlan.findOne({ userId }).sort({ createdAt: -1 });
        if (!plan) {
            return res.status(404).json({ message: 'Beslenme planı bulunamadı.' });
        }

        // Tarih formatı uyuşmazlıklarını önlemek için normalize et
        const dailyPlan = plan.dailyPlans.find(d => {
            const planDate = new Date(d.date).toISOString().split('T')[0];
            return planDate === date;
        });

        if (!dailyPlan) {
            return res.status(404).json({ message: 'Bu tarihte beslenme planı bulunamadı.' });
        }

        res.json(dailyPlan);
    } catch (err) {
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
};

// Kullanıcının kayıt tarihinden bugüne kadar olan tüm günleri ve planları sırala
exports.getAllDaysFromRegistration = async (req, res) => {
    try {
        const userId = req.user.id;
        const plan = await NutritionPlan.findOne({ userId }).sort({ createdAt: 1 });
        if (!plan) {
            return res.json([]);
        }

        // Kullanıcının kayıt tarihi
        const registrationDate = new Date(plan.createdAt);
        const today = new Date();
        const days = [];
        let current = new Date(registrationDate);

        while (current <= today) {
            const dateStr = current.toISOString().split('T')[0];
            // Plan var mı kontrol et
            const daily = plan.dailyPlans.find(d => {
                const planDate = new Date(d.date).toISOString().split('T')[0];
                return planDate === dateStr;
            });
            days.push({
                date: dateStr,
                hasPlan: !!daily,
                plan: daily || null
            });
            current.setDate(current.getDate() + 1);
        }

        res.json(days);
    } catch (err) {
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
}; 