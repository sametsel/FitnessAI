const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'İsim alanı zorunludur']
    },
    email: {
        type: String,
        required: [true, 'Email alanı zorunludur'],
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Şifre alanı zorunludur'],
        minlength: 6,
        select: false
    },
    height: {
        type: Number,
        required: [true, 'Boy alanı zorunludur']
    },
    weight: {
        type: Number,
        required: [true, 'Kilo alanı zorunludur']
    },
    age: {
        type: Number,
        required: [true, 'Yaş alanı zorunludur']
    },
    gender: {
        type: String,
        enum: ['erkek', 'kadın'],
        required: [true, 'Cinsiyet alanı zorunludur']
    },
    activityLevel: {
        type: String,
        enum: ['sedanter', 'hafif_aktif', 'orta_aktif', 'cok_aktif'],
        required: [true, 'Aktivite seviyesi zorunludur']
    },
    goal: {
        type: String,
        enum: ['kilo_verme', 'kilo_alma', 'kas_kazanma', 'form_koruma'],
        required: [true, 'Hedef alanı zorunludur']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Şifre hashleme
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Şifre karşılaştırma metodu
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema); 