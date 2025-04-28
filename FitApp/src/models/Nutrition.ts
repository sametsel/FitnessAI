import { Schema, model } from 'mongoose';

export interface INutrition {
  userId: string;
  date: Date;
  meals: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    time: string;
  }[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface INutritionRecommendation {
  userId: string;
  date: string;
  meals: {
    type: string;      // 'breakfast', 'lunch', 'dinner', 'snack'
    name: string;
    description?: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    time: string;
    ingredients?: {
      name: string;
      amount: string;
      calories: number;
    }[];
    recipe?: string;
    image?: string;
  }[];
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
  createdBy: 'ai' | 'user' | 'coach';
  recommendations?: string[];
  notes?: string;
}

const nutritionSchema = new Schema<INutrition>({
  userId: { type: String, required: true },
  date: { type: Date, required: true },
  meals: [{
    name: { type: String, required: true },
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true },
    time: { type: String, required: true }
  }],
  totalCalories: { type: Number, required: true },
  totalProtein: { type: Number, required: true },
  totalCarbs: { type: Number, required: true },
  totalFat: { type: Number, required: true }
});

export const Nutrition = model<INutrition>('Nutrition', nutritionSchema); 