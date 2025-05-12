const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const nutritionRoutes = require('./routes/nutritionRoutes');
const dailySummaryRoutes = require('./routes/dailySummary');
require('dotenv').config();

const app = express();

// MongoDB bağlantısı
connectDB();

// Middleware'ler
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS ayarları
app.use(cors({
  origin: '*', // Tüm kaynaklara izin ver (geliştirme sırasında)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Length', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Hata loglama middleware'i
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Hata yakalama middleware'i
app.use((err, req, res, next) => {
  console.error('Hata Detayı:', err);
  console.error('Hata Stack:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Sunucu hatası',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// API Routes
app.use('/api/auth', userRoutes); // Auth rotaları
app.use('/api/users', userRoutes); // Kullanıcı rotaları
app.use('/api/workouts', workoutRoutes); // Workout rotaları
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/daily-summary', dailySummaryRoutes); // Günlük özet rotaları

// Ana route
app.get('/', (req, res) => {
    res.json({ message: 'Fitness API aktif' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server ${PORT} portunda çalışıyor`);
}); 