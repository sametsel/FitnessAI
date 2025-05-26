const express = require('express');
const router = express.Router();
const nutritionPlanController = require('../controllers/nutritionPlanController');
const auth = require('../middleware/auth');
const NutritionPlan = require('../models/NutritionPlan');

// Aktif beslenme planını getir
router.get('/active', auth, nutritionPlanController.getActiveNutritionPlan);

// Bugünkü öğünleri getir
router.get('/meals', auth, nutritionPlanController.getTodayMeals);

// Bugünkü öğünleri getir (frontend için /today endpointi)
router.get('/today', auth, nutritionPlanController.getTodayMeals);

// Günlük beslenme özetini getir
router.get('/summary', auth, nutritionPlanController.getNutritionSummary);

// /plan endpointini öne al
router.get('/plan', auth, async (req, res) => {
    const userId = req.user.id;
    const date = req.query.date;
    if (!date) {
        return res.status(400).json({ success: false, message: 'Tarih parametresi gerekli' });
    }
    const plan = await NutritionPlan.findOne({ userId }).sort({ createdAt: -1 });
    if (!plan) {
        return res.status(404).json({ success: false, message: 'Beslenme planı bulunamadı' });
    }
    const dailyNutrition = plan.dailyPlans.find(d => d.date === date);
    if (!dailyNutrition) {
        return res.status(404).json({ success: false, message: 'Bu gün için beslenme planı bulunamadı' });
    }
    res.json({ success: true, data: dailyNutrition });
});

// Belirli bir güne ait beslenme planını getir
router.get('/plan', auth, nutritionPlanController.getDailyPlanByDate);

// Kullanıcının kayıt tarihinden bugüne kadar olan tüm günleri ve planları sırala
router.get('/days', auth, nutritionPlanController.getAllDaysFromRegistration);

// Tüm beslenme planlarını getir
router.get('/', auth, nutritionPlanController.getAllNutritionPlans);

// Belirli bir beslenme planını getir (EN SONDA)
router.get('/:id', auth, nutritionPlanController.getNutritionPlanById);

module.exports = router; 