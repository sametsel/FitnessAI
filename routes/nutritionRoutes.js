const express = require('express');
const router = express.Router();
const nutritionController = require('../controllers/nutritionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/today', nutritionController.getTodayNutrition);
router.get('/recommendations', nutritionController.getNutritionRecommendations);
router.get('/', nutritionController.getNutrition);

module.exports = router; 