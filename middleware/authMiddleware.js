const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

// JWT Secret Key from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'gizli_anahtariniz';

// Token doğrulama middleware'i
const protect = async (req, res, next) => {
    let token;

    // Token'ı header'dan al
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Token'ı al
            token = req.headers.authorization.split(' ')[1];

            // Token'ı doğrula
            const decoded = jwt.verify(token, JWT_SECRET);

            // Kullanıcıyı bul ve req nesnesine ekle
            req.user = await User.findById(decoded.id).select('-password');

            next();
        } catch (error) {
            console.error('Token doğrulama hatası:', error);
            res.status(401).json({
                status: 'error',
                message: 'Yetkilendirme başarısız, lütfen giriş yapın'
            });
        }
    }

    if (!token) {
        res.status(401).json({
            status: 'error',
            message: 'Token bulunamadı, lütfen giriş yapın'
        });
    }
};

module.exports = { protect }; 