const mongoose = require('mongoose');

const nutritionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, 'Kullanıcı ID alanı zorunludur'],
    ref: 'User'
  },
  date: {
    type: Date,
    required: [true, 'Tarih alanı zorunludur']
  },
  meals: [{
    name: {
      type: String,
      required: [true, 'Öğün adı zorunludur']
    },
    type: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      default: 'other'
    },
    description: {
      type: String
    },
    calories: {
      type: Number,
      required: [true, 'Kalori alanı zorunludur'],
      min: [0, 'Kalori negatif olamaz']
    },
    protein: {
      type: Number,
      required: [true, 'Protein alanı zorunludur'],
      min: [0, 'Protein negatif olamaz']
    },
    carbs: {
      type: Number,
      required: [true, 'Karbonhidrat alanı zorunludur'],
      min: [0, 'Karbonhidrat negatif olamaz']
    },
    fat: {
      type: Number,
      required: [true, 'Yağ alanı zorunludur'],
      min: [0, 'Yağ negatif olamaz']
    },
    time: {
      type: String,
      required: [true, 'Öğün zamanı zorunludur']
    },
    ingredients: [{
      name: {
        type: String,
        required: [true, 'Malzeme adı zorunludur']
      },
      amount: {
        type: String,
        required: [true, 'Miktar zorunludur']
      },
      calories: {
        type: Number,
        required: [true, 'Kalori değeri zorunludur']
      }
    }],
    recipe: {
      type: String
    },
    image: {
      type: String
    }
  }],
  totalCalories: {
    type: Number,
    required: [true, 'Toplam kalori alanı zorunludur'],
    min: [0, 'Toplam kalori negatif olamaz']
  },
  totalProtein: {
    type: Number,
    required: [true, 'Toplam protein alanı zorunludur'],
    min: [0, 'Toplam protein negatif olamaz']
  },
  totalCarbs: {
    type: Number,
    required: [true, 'Toplam karbonhidrat alanı zorunludur'],
    min: [0, 'Toplam karbonhidrat negatif olamaz']
  },
  totalFat: {
    type: Number,
    required: [true, 'Toplam yağ alanı zorunludur'],
    min: [0, 'Toplam yağ negatif olamaz']
  },
  createdBy: {
    type: String,
    enum: ['user', 'ai', 'coach'],
    default: 'user'
  },
  recommendations: [{
    type: String
  }],
  notes: {
    type: String
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

module.exports = mongoose.model('Nutrition', nutritionSchema); 