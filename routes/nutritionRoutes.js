const express = require('express');
const router = express.Router();
const nutritionController = require('../controllers/nutritionController');
const { protect } = require('../middleware/authMiddleware');
const { getNutritionPlan } = require('../utils/aiService');

router.use(protect);

router.get('/today', nutritionController.getTodayNutrition);
router.get('/recommendations', nutritionController.getNutritionRecommendations);
router.get('/', nutritionController.getNutrition);

// AI destekli beslenme planı
router.post('/ai-plan', async (req, res) => {
    try {
        const plan = await getNutritionPlan(req.body);
        res.json(plan);
    } catch (err) {
        res.status(500).json({ error: 'AI servisinden cevap alınamadı', detail: err.message });
    }
});

module.exports = router; 