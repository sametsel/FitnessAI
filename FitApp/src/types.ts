export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  age: number;
  height: number;
  weight: number;
  gender: 'erkek' | 'kadın';
  activityLevel: 'sedanter' | 'hafif_aktif' | 'orta_aktif' | 'cok_aktif';
  goal: 'form_koruma' | 'kilo_verme' | 'kilo_alma' | 'kas_kazanma';
  createdAt: Date;
  updatedAt: Date;
}

export type UserWithoutPassword = Omit<User, 'password'>;

export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight: number;
  restTime: number;
}

export interface Workout {
  _id: string;
  user: string;
  name: string;
  type: 'kardiyo' | 'kuvvet' | 'esneklik' | 'hiit' | 'pilates' | 'yoga';
  duration: number;
  difficulty: 'başlangıç' | 'orta' | 'ileri';
  exercises: Exercise[];
  notes?: string;
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type WorkoutWithoutUser = Omit<Workout, 'user'>;

export interface ApiResponse<T> {
  status: 'success' | 'fail';
  message?: string;
  data: T;
  token?: string;
}

export interface LoginResponse {
  user: UserWithoutPassword;
  token: string;
}

export interface RegisterResponse {
  user: UserWithoutPassword;
  token: string;
}

export interface WorkoutResponse {
  workouts: Workout[];
}

export interface WorkoutDetailResponse {
  workout: Workout;
}

export interface WorkoutListResponse {
  workouts: WorkoutWithoutUser[];
}

export interface UserResponse {
  user: UserWithoutPassword;
} 