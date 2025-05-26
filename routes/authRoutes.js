const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Kullanıcı kaydı
router.post('/register', authController.register);

// Kullanıcı girişi (userController'dan)
router.post('/login', userController.login);

module.exports = router; 