const User = require('../models/User');
const jwt = require('jsonwebtoken');

// JWT Token oluşturma
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// Kullanıcı kaydı
exports.register = async (req, res) => {
    try {
        const user = await User.create(req.body);
        const token = createToken(user._id);

        res.status(201).json({
            status: 'success',
            token,
            data: {
                user
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Kullanıcı girişi
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Email ve şifre kontrolü
        if (!email || !password) {
            return res.status(400).json({
                status: 'fail',
                message: 'Lütfen email ve şifre giriniz'
            });
        }

        // Kullanıcıyı bul ve şifreyi seç
        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                status: 'fail',
                message: 'Hatalı email veya şifre'
            });
        }

        // Şifreyi yanıttan çıkar
        user.password = undefined;

        const token = createToken(user._id);

        res.status(200).json({
            status: 'success',
            token,
            data: {
                user
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Profil bilgilerini getir
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Profil güncelleme
exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
}; 