const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || 'gizli_anahtariniz';

// JWT Token oluşturma
const createToken = (id) => {
    try {
        const token = jwt.sign({ id }, JWT_SECRET, {
            expiresIn: '30d'
        });
        console.log('Token oluşturuldu:', token.substring(0, 20) + '...');
        return token;
    } catch (error) {
        console.error('Token oluşturma hatası:', error);
        throw new Error('Token oluşturulamadı');
    }
};

// Kullanıcı kaydı
exports.register = async (req, res) => {
    try {
        const user = await User.create(req.body);
        
        // Şifreyi yanıttan çıkar
        user.password = undefined;
        
        const token = createToken(user._id);
        if (!token) {
            return res.status(500).json({
                success: false,
                message: 'Token oluşturulamadı',
                error: 'Token creation failed'
            });
        }
        
        res.status(201).json({
            success: true,
            message: 'Kayıt başarılı',
            token,
            user
        });
    } catch (error) {
        console.error('Kayıt hatası:', error);
        
        // Validation hatalarını kontrol et
        if (error.name === 'ValidationError') {
            const errorMessages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Doğrulama hatası',
                errors: errorMessages
            });
        }
        
        // Duplicate key hatası
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Bu e-posta adresi zaten kullanılıyor',
                error: 'Duplicate email'
            });
        }
        
        res.status(400).json({
            success: false,
            message: error.message || 'Kayıt sırasında bir hata oluştu',
            error: 'Registration failed'
        });
    }
};

// Kullanıcı girişi
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login isteği alındı:', { email, password: '***' });

        // Email ve şifre kontrolü
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Lütfen email ve şifre giriniz',
                error: 'Missing credentials'
            });
        }

        // Kullanıcıyı bul ve şifreyi seç
        const user = await User.findOne({ email }).select('+password');
        console.log('Kullanıcı bulundu:', user ? 'Evet' : 'Hayır');

        if (!user) {
            console.log('Kullanıcı bulunamadı:', email);
            return res.status(401).json({
                success: false,
                message: 'Hatalı email veya şifre',
                error: 'Invalid credentials'
            });
        }

        // Şifre kontrolü
        console.log('Şifre kontrolü yapılıyor...');
        const isMatch = await user.comparePassword(password);
        console.log('Şifre eşleşmesi:', isMatch);

        if (!isMatch) {
            console.log('Şifre eşleşmedi');
            return res.status(401).json({
                success: false,
                message: 'Hatalı email veya şifre',
                error: 'Invalid credentials'
            });
        }

        // Şifreyi yanıttan çıkar
        user.password = undefined;

        // Token oluştur
        console.log('Token oluşturuluyor...');
        const token = createToken(user._id);
        console.log('Token oluşturuldu:', token ? 'Evet' : 'Hayır');

        if (!token) {
            console.log('Token oluşturulamadı');
            return res.status(500).json({
                success: false,
                message: 'Token oluşturulamadı',
                error: 'Token creation failed'
            });
        }

        // Yanıtı gönder
        console.log('Başarılı giriş, yanıt gönderiliyor...');
        res.status(200).json({
            success: true,
            message: 'Giriş başarılı',
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                age: user.age,
                height: user.height,
                weight: user.weight,
                gender: user.gender,
                activityLevel: user.activityLevel,
                goals: user.goals
            }
        });
    } catch (error) {
        console.error('Login hatası:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Giriş sırasında bir hata oluştu',
            error: 'Login failed'
        });
    }
};

// Profil bilgilerini getir
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı',
                error: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Profil getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Profil bilgileri alınırken bir hata oluştu',
            error: 'Failed to fetch profile'
        });
    }
};

// Profil güncelleme
exports.updateProfile = async (req, res) => {
    try {
        console.log('Profil güncelleme isteği alındı:', req.body);
        
        const allowedUpdates = ['name', 'age', 'height', 'weight', 'gender', 'activityLevel', 'goal'];
        const updates = Object.keys(req.body);
        
        // İzin verilen alanları kontrol et
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));
        if (!isValidOperation) {
            const invalidFields = updates.filter(update => !allowedUpdates.includes(update));
            return res.status(400).json({
                success: false,
                message: `Geçersiz güncelleme alanları: ${invalidFields.join(', ')}`,
                invalidFields
            });
        }

        // Sayısal değerleri kontrol et
        if (req.body.age && (isNaN(req.body.age) || req.body.age < 15 || req.body.age > 100)) {
            return res.status(400).json({
                success: false,
                message: 'Yaş 15 ile 100 arasında olmalıdır',
                error: 'Invalid age'
            });
        }

        if (req.body.height && (isNaN(req.body.height) || req.body.height < 100 || req.body.height > 250)) {
            return res.status(400).json({
                success: false,
                message: 'Boy 100 ile 250 cm arasında olmalıdır',
                error: 'Invalid height'
            });
        }

        if (req.body.weight && (isNaN(req.body.weight) || req.body.weight < 30 || req.body.weight > 300)) {
            return res.status(400).json({
                success: false,
                message: 'Kilo 30 ile 300 kg arasında olmalıdır',
                error: 'Invalid weight'
            });
        }

        // Kullanıcıyı bul ve güncelle
        const user = await User.findByIdAndUpdate(
            req.user._id,
            req.body,
            {
                new: true,
                runValidators: true,
                select: '-password' // Şifreyi hariç tut
            }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı',
                error: 'User not found'
            });
        }

        console.log('Profil başarıyla güncellendi:', user);
        res.status(200).json({
            success: true,
            message: 'Profil başarıyla güncellendi',
            user
        });
    } catch (error) {
        console.error('Profil güncelleme hatası:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Profil güncellenirken bir hata oluştu',
            error: 'Profile update failed'
        });
    }
}; 