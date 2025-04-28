const mongoose = require('mongoose');
require('dotenv').config();

const Workout = require('../models/Workout');

// Buraya kendi kullanıcı ObjectId'ni gir!
const USER_ID = '6805413c7d12c672ac95e7cb';

const sampleWorkout = {
  user: USER_ID,
  name: 'Test Antrenmanı',
  description: 'Test için eklenen antrenman',
  type: 'kuvvet',
  duration: 45,
  difficulty: 'orta',
  exercises: [
    { name: 'Şınav', sets: 3, reps: 12 }
  ],
  completed: true
};

async function addWorkout() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB bağlantısı başarılı');
    const workout = await Workout.create(sampleWorkout);
    console.log('Örnek antrenman eklendi:', workout);
    process.exit(0);
  } catch (err) {
    console.error('Hata:', err);
    process.exit(1);
  }
}

addWorkout(); 