import mongoose from 'mongoose';
import { db } from '../../database';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB bağlantısı başarılı!');
  } catch (error) {
    console.error('MongoDB bağlantı hatası:', error);
    process.exit(1);
  }
};

export default connectDB;

// Örnek kullanım
const getWorkoutPlans = async (userId) => {
  return await db.workouts.find({ user_id: userId });
}; 