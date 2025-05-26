const WorkoutPlan = require('../models/WorkoutPlan');

// Aktif antrenman planını getir
exports.getActiveWorkoutPlan = async (req, res) => {
    try {
        const userId = req.user.id;
        const currentDate = new Date();

        const workoutPlan = await WorkoutPlan.findOne({
            userId,
            startDate: { $lte: currentDate },
            endDate: { $gte: currentDate }
        }).sort({ createdAt: -1 });

        if (!workoutPlan) {
            return res.status(404).json({ message: 'Aktif antrenman planı bulunamadı' });
        }

        res.json(workoutPlan);
    } catch (error) {
        console.error('Antrenman planı getirme hatası:', error);
        res.status(500).json({ message: 'Antrenman planı alınamadı' });
    }
};

// Tüm antrenman planlarını getir
exports.getAllWorkoutPlans = async (req, res) => {
    try {
        const userId = req.user.id;
        const workoutPlans = await WorkoutPlan.find({ userId })
            .sort({ startDate: -1 });

        res.json(workoutPlans);
    } catch (error) {
        console.error('Antrenman planları getirme hatası:', error);
        res.status(500).json({ message: 'Antrenman planları alınamadı' });
    }
};

// Belirli bir antrenman planını getir
exports.getWorkoutPlanById = async (req, res) => {
    try {
        const userId = req.user.id;
        const planId = req.params.id;

        const workoutPlan = await WorkoutPlan.findOne({
            _id: planId,
            userId
        });

        if (!workoutPlan) {
            return res.status(404).json({ message: 'Antrenman planı bulunamadı' });
        }

        res.json(workoutPlan);
    } catch (error) {
        console.error('Antrenman planı getirme hatası:', error);
        res.status(500).json({ message: 'Antrenman planı alınamadı' });
    }
};

exports.getTodayWorkout = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const plan = await WorkoutPlan.findOne({ userId }).sort({ createdAt: -1 });

        if (!plan) {
            return res.status(404).json({ message: 'Antrenman planı bulunamadı.' });
        }

        // Bugünkü tüm antrenmanları bul (tarih ile)
        const todayWorkouts = plan.workouts.filter(w => w.date === today);

        if (!todayWorkouts || todayWorkouts.length === 0) {
            return res.status(404).json({ message: 'Bugün için antrenman bulunamadı.' });
        }

        res.json(todayWorkouts);
    } catch (err) {
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
}; 