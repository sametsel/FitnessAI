const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Auth routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes
router.use(protect);
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

module.exports = router; 