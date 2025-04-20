import { api } from './api';
import { UserWithoutPassword } from '../types';

export interface UserProfile extends UserWithoutPassword {
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
}

interface UserStats {
  totalWorkouts: number;
  totalCaloriesBurned: number;
  averageWorkoutDuration: number;
  workoutStreak: number;
}

interface WorkoutHistory {
  date: Date;
  duration: number;
  type: string;
  caloriesBurned: number;
}

interface NutritionHistory {
  date: Date;
  meals: {
    type: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[];
}

interface UserProgress {
  weightHistory: {
    date: Date;
    weight: number;
  }[];
  measurementHistory: {
    date: Date;
    chest: number;
    waist: number;
    hips: number;
    biceps: number;
    thighs: number;
  }[];
}

interface UserSettings {
  notifications: boolean;
  language: string;
  theme: 'light' | 'dark';
  measurementUnit: 'metric' | 'imperial';
}

interface FitnessProgram {
  exercises: {
    name: string;
    sets: number;
    reps: number;
    weight?: number;
    duration?: number;
    restTime: number;
  }[];
  schedule: {
    [key: string]: string[];
  };
}

interface DietPlan {
  meals: {
    type: string;
    foods: {
      name: string;
      portion: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    }[];
  }[];
  dailyCalories: number;
  macroSplit: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

class UserService {
  async getProfile(): Promise<UserProfile> {
    return api.get<UserProfile>('/users/profile');
  }

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    return api.put<UserProfile>('/users/profile', data);
  }

  async getUserStats(): Promise<UserStats> {
    return api.get<UserStats>('/users/stats');
  }

  async getUserWorkoutHistory(): Promise<WorkoutHistory[]> {
    return api.get<WorkoutHistory[]>('/users/workouts/history');
  }

  async getUserNutritionHistory(): Promise<NutritionHistory[]> {
    return api.get<NutritionHistory[]>('/users/nutrition/history');
  }

  async getUserProgress(): Promise<UserProgress> {
    return api.get<UserProgress>('/users/progress');
  }

  async updateUserSettings(settings: UserSettings): Promise<UserSettings> {
    return api.put<UserSettings>('/users/settings', settings);
  }

  async getFitnessProgram(): Promise<FitnessProgram> {
    return api.get<FitnessProgram>('/users/fitness-program');
  }

  async getDietPlan(): Promise<DietPlan> {
    return api.get<DietPlan>('/users/diet-plan');
  }
}

const userService = new UserService();
export default userService; 