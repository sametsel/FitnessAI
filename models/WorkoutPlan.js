const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
    day: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    targetMuscleGroups: [String],
    sets: Number,
    reps: Number,
    duration: Number,
    restTime: String,
    intensity: String,
    type: String,
    description: String
});

const workoutPlanSchema = new mongoose.Schema({
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
    workouts: [workoutSchema],
    goals: {
        type: String,
        required: true
    },
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
});

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema); 