import axios from 'axios';
import { UserWithoutPassword } from '../types';
import { API_URL } from '../config';

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
  private api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  setAuthToken(token: string) {
    if (token) {
      this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.api.defaults.headers.common['Authorization'];
    }
  }

  async getProfile(): Promise<UserProfile> {
    const response = await this.api.get<UserProfile>('/users/profile');
    return response.data;
  }

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const response = await this.api.put<UserProfile>('/users/profile', data);
    return response.data;
  }

  async getUserStats(): Promise<UserStats> {
    const response = await this.api.get<UserStats>('/users/stats');
    return response.data;
  }

  async getUserWorkoutHistory(): Promise<WorkoutHistory[]> {
    const response = await this.api.get<WorkoutHistory[]>('/workout-plans/history');
    return response.data;
  }

  async getUserNutritionHistory(): Promise<NutritionHistory[]> {
    const response = await this.api.get<NutritionHistory[]>('/users/nutrition/history');
    return response.data;
  }

  async getUserProgress(): Promise<UserProgress> {
    const response = await this.api.get<UserProgress>('/users/progress');
    return response.data;
  }

  async updateUserSettings(settings: UserSettings): Promise<UserSettings> {
    const response = await this.api.put<UserSettings>('/users/settings', settings);
    return response.data;
  }

  async getFitnessProgram(): Promise<FitnessProgram> {
    const response = await this.api.get<FitnessProgram>('/users/fitness-program');
    return response.data;
  }

  async getDietPlan(): Promise<DietPlan> {
    const response = await this.api.get<DietPlan>('/users/diet-plan');
    return response.data;
  }
}

const userService = new UserService();
export default userService; 