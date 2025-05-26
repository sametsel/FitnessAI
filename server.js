const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const workoutPlanRoutes = require('./routes/workoutPlanRoutes');
const nutritionPlanRoutes = require('./routes/nutritionPlanRoutes');
const axios = require('axios');
const User = require('./models/User');
const path = require('path');
require('dotenv').config();

const app = express();

// FastAPI bağlantısı için axios instance
const fastApiClient = axios.create({
    baseURL: process.env.FASTAPI_URL || 'http://localhost:5000',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// FastAPI bağlantı kontrolü
const checkFastApiConnection = async () => {
    try {
        await fastApiClient.get('/');
        console.log('FastAPI bağlantısı başarılı');
        return true;
    } catch (error) {
        console.error('FastAPI bağlantı hatası:', error.message);
        return false;
    }
};

// MongoDB bağlantısı
connectDB();

// Güvenlik middleware'leri
app.use(helmet()); // Güvenlik başlıkları
app.use(express.json({ limit: '10mb' })); // JSON boyut limiti
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 1000, // IP başına maksimum istek (arttırıldı)
    message: 'Çok fazla istek gönderdiniz, lütfen daha sonra tekrar deneyin.'
});
app.use(limiter);

// CORS ayarları
const allowedOrigins = [
    'http://localhost:3000', // Web uygulaması
    'http://localhost:19006', // Expo web
    'http://localhost:8081', // Expo Metro
    'exp://localhost:19000', // Expo
    'exp://192.168.1.104:8081', // Expo local network
    'http://192.168.1.104:3000', // Web uygulaması local network
    'http://192.168.1.104:8081', // Expo web local network
    'http://localhost:5000', // FastAPI
    'http://127.0.0.1:5000', // Localhost alternatifi
    'http://127.0.0.1:5500', // Frontend local
    'http://localhost:5500'   // Frontend local
];

app.use(cors({
    origin: function(origin, callback) {
        // Geliştirme ortamında origin kontrolünü atla
        if (!origin || process.env.NODE_ENV === 'development') {
            return callback(null, true);
        }
        
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error('CORS politikası bu isteğe izin vermiyor'), false);
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Length', 'Authorization'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// Hata loglama middleware'i
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
    });
    next();
});

// Statik dosya sunumu
app.use(express.static('fitweb'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/workout-plans', workoutPlanRoutes);
app.use('/api/nutrition-plans', nutritionPlanRoutes);
app.use('/api/profile', require('./routes/profile'));

// Ana route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'fitweb', 'index.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'İstenen kaynak bulunamadı'
    });
});

// Hata yakalama middleware'i
app.use((err, req, res, next) => {
    console.error('Hata Detayı:', err);
    
    // MongoDB bağlantı hatası kontrolü
    if (err.name === 'MongoError' || err.name === 'MongoServerError') {
        return res.status(503).json({
            success: false,
            message: 'Veritabanı bağlantısında bir sorun oluştu',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }

    // JWT hatası kontrolü
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Geçersiz token',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }

    // Validation hatası kontrolü
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Geçersiz veri',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Sunucu hatası',
        error: process.env.NODE_ENV === 'development' ? err : undefined
    });
});

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Tüm ağ arayüzlerinden bağlantıya izin ver

// FastAPI bağlantısını kontrol et ve sunucuyu başlat
checkFastApiConnection().then(() => {
    app.listen(PORT, HOST, () => {
        console.log(`Server http://${HOST}:${PORT} adresinde çalışıyor`);
        console.log(`Ortam: ${process.env.NODE_ENV || 'development'}`);
    });
}); 