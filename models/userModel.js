const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    // Temel kullanıcı bilgileri
    name: {
        type: String,
        required: [true, 'İsim alanı zorunludur']
    },
    email: {
        type: String,
        required: [true, 'Email alanı zorunludur'],
        unique: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Lütfen geçerli bir email adresi girin']
    },
    password: {
        type: String,
        required: [true, 'Şifre alanı zorunludur'],
        minlength: [6, 'Şifre en az 6 karakter olmalıdır'],
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    
    // Profil bilgileri
    profileImage: {
        type: String,
        default: 'default.jpg'
    },
    gender: {
        type: String,
        enum: ['erkek', 'kadın', 'diğer'],
        required: true
    },
    
    // Fitness ve sağlık bilgileri
    age: {
        type: Number,
        required: [true, 'Yaş alanı zorunludur'],
        min: [15, 'Yaş 15\'ten büyük olmalıdır'],
        max: [100, 'Yaş 100\'den küçük olmalıdır']
    },
    weight: {
        type: Number,
        required: [true, 'Kilo alanı zorunludur'],
        min: [30, 'Kilo 30\'dan büyük olmalıdır'],
        max: [300, 'Kilo 300\'den küçük olmalıdır']
    },
    height: {
        type: Number,
        required: [true, 'Boy alanı zorunludur'],
        min: [100, 'Boy 100\'den büyük olmalıdır'],
        max: [250, 'Boy 250\'den küçük olmalıdır']
    },
    activityLevel: {
        type: Number,
        required: [true, 'Aktivite seviyesi zorunludur'],
        enum: [1, 2, 3, 4, 5],
        default: 1
        // 1: Çok az aktif (Hareketsiz)
        // 2: Az aktif (Haftada 1-2 gün)
        // 3: Orta aktif (Haftada 3-4 gün)
        // 4: Aktif (Haftada 5-6 gün)
        // 5: Çok aktif (Her gün)
    },
    goal: {
        type: Number,
        required: [true, 'Hedef alanı zorunludur'],
        enum: [1, 2, 3],
        default: 1
        // 1: Kilo verme
        // 2: Kilo alma
        // 3: Kas kazanma
    },
    
    // Beslenme tercihleri
    dietaryRestrictions: {
        type: Number,
        default: 0
        // 0: Yok
        // 1: Vejetaryen
        // 2: Vegan
        // 3: Glutensiz
        // 4: Laktozsuz
    },
    allergies: {
        type: [String],
        default: []
    },
    preferredCuisine: {
        type: Number,
        default: 0
        // 0: Farketmez
        // 1: Türk mutfağı
        // 2: Akdeniz mutfağı
        // 3: Asya mutfağı
        // 4: Vejetaryen mutfağı
    },
    mealPreferences: {
        type: Number,
        default: 0
        // 0: Farketmez
        // 1: Protein ağırlıklı
        // 2: Karbonhidrat ağırlıklı
        // 3: Yağ ağırlıklı
        // 4: Dengeli
    },
    calorieTarget: {
        type: Number,
        required: [true, 'Kalori hedefi zorunludur'],
        min: [1000, 'Minimum 1000 kalori olmalıdır'],
        max: [5000, 'Maksimum 5000 kalori olmalıdır']
    },

    // İlerleme takibi
    progress: [{
        date: {
            type: Date,
            default: Date.now
        },
        weight: Number,
        bodyFat: Number,
        muscleMass: Number,
        notes: String
    }],

    // Aktiflik durumu
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Şifre hashleme middleware
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Şifre karşılaştırma metodu
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);