const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutController');
const { protect } = require('../middleware/authMiddleware');

// Tüm workout rotaları için authentication gerekli
router.use(protect);

// Workout rotaları
router.get('/', workoutController.getWorkouts);
router.post('/', workoutController.createWorkout);
router.get('/:id', workoutController.getWorkoutById);
router.put('/:id', workoutController.updateWorkout);
router.delete('/:id', workoutController.deleteWorkout);
router.put('/:id/complete', workoutController.completeWorkout);

module.exports = router; 