const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    try {
        let token;

        // Token'ı header'dan al
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                status: 'fail',
                message: 'Lütfen giriş yapın'
            });
        }

        // Token'ı doğrula
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Kullanıcıyı bul
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                status: 'fail',
                message: 'Bu token\'a ait kullanıcı artık mevcut değil'
            });
        }

        // Kullanıcıyı request nesnesine ekle
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({
            status: 'fail',
            message: 'Yetkisiz erişim'
        });
    }
}; 