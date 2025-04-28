const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

// JWT Secret Key from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'gizli_anahtariniz';

exports.protect = async (req, res, next) => {
    try {
        let token;

        // Token'ı header'dan al
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Bu işlem için giriş yapmalısınız',
                error: 'Token bulunamadı'
            });
        }

        try {
            // Token'ı doğrula
            const decoded = jwt.verify(token, JWT_SECRET);

            // Kullanıcıyı bul
            const user = await User.findById(decoded.id);

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Bu token\'a ait kullanıcı artık mevcut değil',
                    error: 'Kullanıcı bulunamadı'
                });
            }

            // Kullanıcıyı request nesnesine ekle
            req.user = user;
            next();
        } catch (jwtError) {
            console.error('JWT doğrulama hatası:', jwtError);
            
            // JWT hatalarını kontrol et
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Oturum süreniz doldu, lütfen tekrar giriş yapın',
                    error: 'Token süresi doldu'
                });
            }
            
            if (jwtError.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: 'Geçersiz token, lütfen tekrar giriş yapın',
                    error: 'Geçersiz token'
                });
            }
            
            // Diğer JWT hataları
            return res.status(401).json({
                success: false,
                message: 'Yetkilendirme hatası, lütfen tekrar giriş yapın',
                error: jwtError.message
            });
        }
    } catch (error) {
        console.error('Auth middleware hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası',
            error: 'Yetkilendirme işlemi sırasında bir hata oluştu'
        });
    }
}; 