const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutController');
const { protect } = require('../middleware/authMiddleware');
const { getWorkoutPlan } = require('../utils/aiService');

// AI destekli antrenman planı - authentication gerekmez
router.post('/ai-plan', async (req, res) => {
    try {
        console.log('AI plan isteği alındı:', req.body);
        const token = req.headers.authorization;
        const plan = await getWorkoutPlan(req.body, token);
        console.log('AI plan yanıtı:', plan);
        res.json(plan);
    } catch (err) {
        console.error('AI Plan Hatası:', err);
        res.status(500).json({ 
            error: 'AI servisinden yanıt alınamadı', 
            detail: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

// Diğer tüm workout rotaları için authentication gerekli
router.use(protect);

// Workout rotaları
router.get('/', workoutController.getWorkouts);
router.post('/', workoutController.createWorkout);
router.get('/:id', workoutController.getWorkoutById);
router.put('/:id', workoutController.updateWorkout);
router.delete('/:id', workoutController.deleteWorkout);
router.put('/:id/complete', workoutController.completeWorkout);

module.exports = router; 