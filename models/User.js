const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Ad Soyad alanı zorunludur'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'E-posta alanı zorunludur'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Şifre alanı zorunludur'],
        minlength: 6,
        select: false
    },
    age: {
        type: Number,
        required: [true, 'Yaş alanı zorunludur'],
        min: [15, 'Yaş en az 15 olmalıdır'],
        max: [100, 'Yaş en fazla 100 olmalıdır']
    },
    height: {
        type: Number,
        required: [true, 'Boy alanı zorunludur'],
        min: [100, 'Boy en az 100 cm olmalıdır'],
        max: [250, 'Boy en fazla 250 cm olmalıdır']
    },
    weight: {
        type: Number,
        required: [true, 'Kilo alanı zorunludur'],
        min: [30, 'Kilo en az 30 kg olmalıdır'],
        max: [300, 'Kilo en fazla 300 kg olmalıdır']
    },
    gender: {
        type: String,
        required: [true, 'Cinsiyet alanı zorunludur'],
        enum: ['erkek', 'kadın']
    },
    activityLevel: {
        type: String,
        required: [true, 'Aktivite seviyesi alanı zorunludur'],
        enum: ['sedanter', 'hafif_aktif', 'orta_aktif', 'cok_aktif']
    },
    goal: {
        type: String,
        required: [true, 'Hedef alanı zorunludur'],
        enum: ['form_koruma', 'kilo_verme', 'kilo_alma', 'kas_kazanma']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Şifre hashleme middleware
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Şifre karşılaştırma metodu
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        console.log('Şifre karşılaştırılıyor...');
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        console.log('Şifre eşleşmesi:', isMatch);
        return isMatch;
    } catch (error) {
        console.error('Şifre karşılaştırma hatası:', error);
        throw new Error('Şifre karşılaştırma işlemi başarısız oldu');
    }
};

const User = mongoose.model('User', userSchema);

module.exports = User; 