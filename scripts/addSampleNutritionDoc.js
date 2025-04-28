const mongoose = require('mongoose');
require('dotenv').config();

const Nutrition = require('../models/Nutrition');

// Buraya kendi kullanıcı ObjectId'ni gir!
const USER_ID = '6805413c7d12c672ac95e7cb';

const sampleNutrition = {
  userId: USER_ID,
  date: new Date(),
  meals: [
    { name: 'Kahvaltı', calories: 400, protein: 20, carbs: 50, fat: 10, time: '08:00' },
    { name: 'Öğle Yemeği', calories: 600, protein: 30, carbs: 70, fat: 15, time: '13:00' },
    { name: 'Akşam Yemeği', calories: 500, protein: 25, carbs: 60, fat: 12, time: '19:00' }
  ],
  totalCalories: 1500,
  totalProtein: 75,
  totalCarbs: 180,
  totalFat: 37
};

async function addNutrition() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB bağlantısı başarılı');
    // Aynı gün ve userId için eski kaydı sil
    await Nutrition.deleteMany({ userId: USER_ID, date: { $gte: new Date(new Date().setHours(0,0,0,0)) } });
    const nutrition = await Nutrition.create(sampleNutrition);
    console.log('Eksiksiz günlük beslenme eklendi:', nutrition);
    process.exit(0);
  } catch (err) {
    console.error('Hata:', err);
    process.exit(1);
  }
}

addNutrition(); 