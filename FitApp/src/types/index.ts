// Enum benzeri tipler
export type Gender = 'erkek' | 'kadın' | 'diger';
export type ActivityLevel = 'sedanter' | 'hafif_aktif' | 'orta_aktif' | 'aktif' | 'cok_aktif';
export type Goal = 'kilo_verme' | 'kilo_alma' | 'kas_kazanma' | 'form_koruma';

// User ile ilgili tipler
export interface User {
  _id: string;
  email: string;
  name: string;
  password: string;
  age: number;
  weight: number;
  height: number;
  gender: Gender;
  goal: Goal;
  activityLevel: ActivityLevel;
  createdAt: Date;
  updatedAt: Date;
}

// Güvenlik için, password'ü hariç tutan bir tip de oluşturalım
export type UserWithoutPassword = Omit<User, 'password'>;

// Form tipleri
export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  age: string;
  height: string;
  weight: string;
  gender: Gender;
  activityLevel: ActivityLevel;
  goal: Goal;
}

// Auth ile ilgili tipler
export interface AuthContextType {
  user: UserWithoutPassword | null;
  setUser: React.Dispatch<React.SetStateAction<UserWithoutPassword | null>>;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  updateProfile: (data: Partial<UserWithoutPassword>) => Promise<void>;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  token?: string;
}

export interface Workout {
  _id: string;
  userId: string;
  name: string;
  description: string;
  exercises: Exercise[];
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdAt: Date;
  updatedAt: Date;
}

export interface Exercise {
  _id: string;
  name: string;
  description: string;
  muscleGroup: string;
  equipment: string;
  sets: number;
  reps: number;
  restTime: number;
  videoUrl?: string;
  imageUrl?: string;
}

export interface NutritionPlan {
  _id: string;
  userId: string;
  name: string;
  description: string;
  meals: Meal[];
  dailyCalories: number;
  macronutrients: {
    protein: number;
    carbs: number;
    fat: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Meal {
  _id: string;
  name: string;
  description: string;
  ingredients: string[];
  calories: number;
  macronutrients: {
    protein: number;
    carbs: number;
    fat: number;
  };
  preparationTime: number;
  recipe: string;
  imageUrl?: string;
}

export interface Progress {
  _id: string;
  userId: string;
  weight: number;
  bodyMeasurements: {
    chest: number;
    waist: number;
    hips: number;
    arms: number;
    thighs: number;
  };
  date: Date;
  notes?: string;
}

export interface WorkoutHistory {
  _id: string;
  userId: string;
  workoutId: string;
  date: Date;
  duration: number;
  completedExercises: {
    exerciseId: string;
    sets: number;
    reps: number;
    weight?: number;
  }[];
  notes?: string;
}

export interface NutritionHistory {
  _id: string;
  userId: string;
  mealId: string;
  date: Date;
  portionSize: number;
  notes?: string;
}

export interface AIRecommendation {
  _id: string;
  userId: string;
  type: 'workout' | 'nutrition';
  recommendation: string;
  date: Date;
  isCompleted: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
} 