const express = require('express');
const router = express.Router();
const workoutPlanController = require('../controllers/workoutPlanController');
const auth = require('../middleware/auth');

// Aktif antrenman planını getir
router.get('/active', auth, workoutPlanController.getActiveWorkoutPlan);

// Bugünkü antrenmanı getir
router.get('/today', auth, workoutPlanController.getTodayWorkout);

// Günlük antrenman planını getir
router.get('/plan', auth, async (req, res) => {
    const WorkoutPlan = require('../models/WorkoutPlan');
    const userId = req.user.id;
    const date = req.query.date;
    if (!date) {
        return res.status(400).json({ success: false, message: 'Tarih parametresi gerekli' });
    }
    const plan = await WorkoutPlan.findOne({ userId }).sort({ createdAt: -1 });
    if (!plan) {
        return res.status(404).json({ success: false, message: 'Antrenman planı bulunamadı' });
    }
    const dailyWorkouts = plan.workouts.filter(w => w.date === date);
    if (!dailyWorkouts.length) {
        return res.status(404).json({ success: false, message: 'Bu gün için antrenman planı bulunamadı' });
    }
    res.json({ success: true, data: dailyWorkouts });
});

// Tüm antrenman planlarını getir
router.get('/', auth, workoutPlanController.getAllWorkoutPlans);

// Belirli bir antrenman planını getir
router.get('/:id', auth, workoutPlanController.getWorkoutPlanById);

module.exports = router; 