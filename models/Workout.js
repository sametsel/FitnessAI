const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Egzersiz adı zorunludur']
    },
    sets: {
        type: Number,
        required: [true, 'Set sayısı zorunludur']
    },
    reps: {
        type: Number,
        required: [true, 'Tekrar sayısı zorunludur']
    },
    weight: {
        type: Number,
        default: 0
    },
    duration: {
        type: Number, // dakika cinsinden
        default: 0
    },
    restTime: {
        type: Number, // saniye cinsinden
        default: 60
    }
});

const workoutSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Antrenman bir kullanıcıya ait olmalıdır']
    },
    name: {
        type: String,
        required: [true, 'Antrenman adı zorunludur']
    },
    type: {
        type: String,
        enum: ['cardio', 'strength', 'flexibility', 'hiit', 'custom'],
        required: [true, 'Antrenman tipi zorunludur']
    },
    exercises: [exerciseSchema],
    duration: {
        type: Number, // dakika cinsinden
        required: [true, 'Antrenman süresi zorunludur']
    },
    difficulty: {
        type: String,
        enum: ['başlangıç', 'orta', 'ileri'],
        required: [true, 'Zorluk seviyesi zorunludur']
    },
    calories: {
        type: Number,
        default: 0
    },
    notes: String,
    completed: {
        type: Boolean,
        default: false
    },
    scheduledFor: {
        type: Date,
        required: [true, 'Antrenman tarihi zorunludur']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Workout', workoutSchema); 