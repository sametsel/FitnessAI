const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Öğün adı zorunludur']
    },
    foods: [{
        name: {
            type: String,
            required: [true, 'Yiyecek adı zorunludur']
        },
        portion: {
            type: Number,
            required: [true, 'Porsiyon miktarı zorunludur']
        },
        unit: {
            type: String,
            required: [true, 'Birim zorunludur']
        },
        calories: {
            type: Number,
            required: [true, 'Kalori miktarı zorunludur']
        },
        protein: Number,
        carbs: Number,
        fat: Number
    }],
    totalCalories: {
        type: Number,
        default: 0
    },
    time: {
        type: String,
        required: [true, 'Öğün zamanı zorunludur']
    }
});

const nutritionPlanSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Beslenme planı bir kullanıcıya ait olmalıdır']
    },
    name: {
        type: String,
        required: [true, 'Plan adı zorunludur']
    },
    type: {
        type: String,
        enum: ['günlük', 'haftalık', 'aylık'],
        required: [true, 'Plan tipi zorunludur']
    },
    targetCalories: {
        type: Number,
        required: [true, 'Hedef kalori miktarı zorunludur']
    },
    meals: [mealSchema],
    startDate: {
        type: Date,
        required: [true, 'Başlangıç tarihi zorunludur']
    },
    endDate: {
        type: Date,
        required: [true, 'Bitiş tarihi zorunludur']
    },
    notes: String,
    macroTargets: {
        protein: Number,
        carbs: Number,
        fat: Number
    },
    restrictions: [{
        type: String,
        enum: ['vejeteryan', 'vegan', 'glütensiz', 'laktozsuz', 'diğer']
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('NutritionPlan', nutritionPlanSchema); 