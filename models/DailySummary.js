const mongoose = require('mongoose');

const dailySummarySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    todayWorkout: {
        type: {
            type: String,
            required: true,
            enum: ['Üst Vücut', 'Alt Vücut', 'Kardiyo', 'Tam Vücut', 'Esneklik', 'HIIT', 'Yok']
        },
        completed: {
            type: Boolean,
            default: false
        }
    },
    nextWorkout: {
        type: {
            type: String,
            required: true,
            enum: ['Üst Vücut', 'Alt Vücut', 'Kardiyo', 'Tam Vücut', 'Esneklik', 'HIIT', 'Yok']
        },
        scheduledDate: {
            type: Date,
            required: true
        }
    },
    workoutStats: {
        completedWorkouts: {
            type: Number,
            default: 0
        },
        totalMinutes: {
            type: Number,
            default: 0
        },
        caloriesBurned: {
            type: Number,
            default: 0
        }
    },
    todayNutrition: {
        totalCalories: {
            type: Number,
            default: 0
        },
        totalProtein: {
            type: Number,
            default: 0
        },
        totalCarbs: {
            type: Number,
            default: 0
        },
        totalFat: {
            type: Number,
            default: 0
        },
        meals: [{
            name: {
                type: String,
                required: true
            },
            calories: {
                type: Number,
                required: true
            },
            protein: {
                type: Number,
                required: true
            },
            carbs: {
                type: Number,
                required: true
            },
            fat: {
                type: Number,
                required: true
            },
            time: {
                type: String,
                required: true
            }
        }]
    }
}, {
    timestamps: true
});

// Günlük özet oluşturulduğunda otomatik olarak toplam değerleri hesapla
dailySummarySchema.pre('save', function(next) {
    if (this.todayNutrition.meals && this.todayNutrition.meals.length > 0) {
        this.todayNutrition.totalCalories = this.todayNutrition.meals.reduce((sum, meal) => sum + meal.calories, 0);
        this.todayNutrition.totalProtein = this.todayNutrition.meals.reduce((sum, meal) => sum + meal.protein, 0);
        this.todayNutrition.totalCarbs = this.todayNutrition.meals.reduce((sum, meal) => sum + meal.carbs, 0);
        this.todayNutrition.totalFat = this.todayNutrition.meals.reduce((sum, meal) => sum + meal.fat, 0);
    }
    next();
});

const DailySummary = mongoose.model('DailySummary', dailySummarySchema);

module.exports = DailySummary; 