const express = require('express');
const router = express.Router();
const { getDailySummary, updateDailySummary } = require('../controllers/dailySummaryController');
const { protect } = require('../middleware/authMiddleware');

// Günlük özeti getir
router.get('/', protect, getDailySummary);

// Günlük özeti güncelle
router.put('/', protect, updateDailySummary);

module.exports = router; 