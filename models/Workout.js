const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Antrenman adı zorunludur'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        required: [true, 'Antrenman tipi zorunludur'],
        enum: ['kardiyo', 'kuvvet', 'esneklik', 'hiit', 'pilates', 'yoga']
    },
    duration: {
        type: Number,
        required: [true, 'Süre zorunludur'],
        min: [0, 'Süre 0\'dan küçük olamaz']
    },
    difficulty: {
        type: String,
        required: [true, 'Zorluk seviyesi zorunludur'],
        enum: ['başlangıç', 'orta', 'ileri'],
        default: 'orta'
    },
    exercises: [{
        name: {
            type: String,
            required: [true, 'Egzersiz adı zorunludur'],
            trim: true
        },
        sets: {
            type: Number,
            required: [true, 'Set sayısı zorunludur'],
            min: [1, 'Set sayısı en az 1 olmalıdır']
        },
        reps: {
            type: Number,
            required: [true, 'Tekrar sayısı zorunludur'],
            min: [1, 'Tekrar sayısı en az 1 olmalıdır']
        },
        weight: {
            type: Number,
            min: [0, 'Ağırlık 0\'dan küçük olamaz']
        },
        restTime: {
            type: Number,
            min: [0, 'Dinlenme süresi 0\'dan küçük olamaz']
        }
    }],
    notes: {
        type: String,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date
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

// Antrenman tamamlandığında completedAt'i güncelle
workoutSchema.pre('save', function(next) {
    if (this.isModified('completed') && this.completed) {
        this.completedAt = new Date();
    }
    next();
});

const Workout = mongoose.model('Workout', workoutSchema);

module.exports = Workout; 