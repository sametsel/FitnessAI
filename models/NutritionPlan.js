const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['sabah', 'ara_ogun', 'ara_ogun_2', 'ogle', 'aksam'],
        required: true
    },
    time: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: String,
    calories: {
        type: Number,
        required: true,
        get: v => Math.round(v),
        set: v => Math.round(v)
    },
    protein: {
        type: Number,
        required: true,
        get: v => Math.round(v),
        set: v => Math.round(v)
    },
    carbs: {
        type: Number,
        required: true,
        get: v => Math.round(v),
        set: v => Math.round(v)
    },
    fat: {
        type: Number,
        required: true,
        get: v => Math.round(v),
        set: v => Math.round(v)
    },
    ingredients: [String],
    recipe: String,
    image: String
});

const dailyPlanSchema = new mongoose.Schema({
    day: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    meals: [mealSchema],
    totalCalories: {
        type: Number,
        required: true,
        get: v => Math.round(v),
        set: v => Math.round(v)
    },
    totalProtein: {
        type: Number,
        required: true,
        get: v => Math.round(v),
        set: v => Math.round(v)
    },
    totalCarbs: {
        type: Number,
        required: true,
        get: v => Math.round(v),
        set: v => Math.round(v)
    },
    totalFat: {
        type: Number,
        required: true,
        get: v => Math.round(v),
        set: v => Math.round(v)
    }
});

const nutritionPlanSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    planType: {
        type: String,
        enum: ['weekly', 'monthly'],
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    dailyPlans: [dailyPlanSchema],
    goals: {
        type: String,
        required: true
    },
    dietaryRestrictions: [{
        type: String
    }],
    notes: String,
    createdBy: {
        type: String,
        enum: ['ai', 'user'],
        default: 'ai'
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
    toJSON: { getters: true },
    toObject: { getters: true }
});

module.exports = mongoose.model('NutritionPlan', nutritionPlanSchema); 