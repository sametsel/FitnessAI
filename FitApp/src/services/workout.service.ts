import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

export interface Exercise {
  id: string;
  name: string;
  description: string;
  muscleGroup: string;
  equipment: string;
  difficulty: string;
}

export interface Workout {
  id: string;
  name: string;
  description: string;
  exercises: Exercise[];
}

export interface WorkoutDay {
  id: string;
  date: Date;
  workout: Workout;
  completed: boolean;
  progress: number;
}

class WorkoutService {
  private async getHeaders() {
    const token = await AsyncStorage.getItem('token');
    return {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    };
  }

  // Egzersiz işlemleri
  async createExercise(exercise: Omit<Exercise, 'id'>): Promise<Exercise> {
    try {
      const response = await axios.post(`${API_URL}/exercises`, exercise, {
        headers: await this.getHeaders(),
      });
      return response.data as Exercise;
    } catch (error) {
      throw new Error('Egzersiz oluşturulurken bir hata oluştu');
    }
  }

  async getExercises(): Promise<Exercise[]> {
    try {
      const response = await axios.get(`${API_URL}/exercises`, {
        headers: await this.getHeaders(),
      });
      return response.data as Exercise[];
    } catch (error) {
      throw new Error('Egzersizler alınırken bir hata oluştu');
    }
  }

  async getExerciseById(id: string): Promise<Exercise> {
    try {
      const response = await axios.get(`${API_URL}/exercises/${id}`, {
        headers: await this.getHeaders(),
      });
      return response.data as Exercise;
    } catch (error) {
      throw new Error('Egzersiz alınırken bir hata oluştu');
    }
  }

  async updateExercise(id: string, exercise: Partial<Exercise>): Promise<Exercise> {
    try {
      const response = await axios.put(`${API_URL}/exercises/${id}`, exercise, {
        headers: await this.getHeaders(),
      });
      return response.data as Exercise;
    } catch (error) {
      throw new Error('Egzersiz güncellenirken bir hata oluştu');
    }
  }

  async deleteExercise(id: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/exercises/${id}`, {
        headers: await this.getHeaders(),
      });
    } catch (error) {
      throw new Error('Egzersiz silinirken bir hata oluştu');
    }
  }

  // Antrenman işlemleri
  async createWorkout(workout: Omit<Workout, 'id'>): Promise<Workout> {
    try {
      const response = await axios.post(`${API_URL}/workouts`, workout, {
        headers: await this.getHeaders(),
      });
      return response.data as Workout;
    } catch (error) {
      throw new Error('Antrenman oluşturulurken bir hata oluştu');
    }
  }

  async getWorkouts(): Promise<Workout[]> {
    try {
      const response = await axios.get(`${API_URL}/workouts`, {
        headers: await this.getHeaders(),
      });
      return response.data as Workout[];
    } catch (error) {
      throw new Error('Antrenmanlar alınırken bir hata oluştu');
    }
  }

  async getWorkoutById(id: string): Promise<Workout> {
    try {
      const response = await axios.get(`${API_URL}/workouts/${id}`, {
        headers: await this.getHeaders(),
      });
      return response.data as Workout;
    } catch (error) {
      throw new Error('Antrenman alınırken bir hata oluştu');
    }
  }

  async updateWorkout(id: string, workout: Partial<Workout>): Promise<Workout> {
    try {
      const response = await axios.put(`${API_URL}/workouts/${id}`, workout, {
        headers: await this.getHeaders(),
      });
      return response.data as Workout;
    } catch (error) {
      throw new Error('Antrenman güncellenirken bir hata oluştu');
    }
  }

  async deleteWorkout(id: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/workouts/${id}`, {
        headers: await this.getHeaders(),
      });
    } catch (error) {
      throw new Error('Antrenman silinirken bir hata oluştu');
    }
  }

  // Antrenman günü işlemleri
  async addWorkoutDay(workoutId: string, day: Omit<WorkoutDay, 'id'>): Promise<WorkoutDay> {
    try {
      const response = await axios.post(`${API_URL}/workouts/${workoutId}/days`, day, {
        headers: await this.getHeaders(),
      });
      return response.data as WorkoutDay;
    } catch (error) {
      throw new Error('Antrenman günü eklenirken bir hata oluştu');
    }
  }

  async updateWorkoutDay(workoutId: string, dayId: string, day: Partial<WorkoutDay>): Promise<WorkoutDay> {
    try {
      const response = await axios.put(`${API_URL}/workouts/${workoutId}/days/${dayId}`, day, {
        headers: await this.getHeaders(),
      });
      return response.data as WorkoutDay;
    } catch (error) {
      throw new Error('Antrenman günü güncellenirken bir hata oluştu');
    }
  }

  async deleteWorkoutDay(workoutId: string, dayId: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/workouts/${workoutId}/days/${dayId}`, {
        headers: await this.getHeaders(),
      });
    } catch (error) {
      throw new Error('Antrenman günü silinirken bir hata oluştu');
    }
  }

  // İlerleme takibi
  async updateWorkoutProgress(workoutId: string, progress: number): Promise<WorkoutDay> {
    try {
      const response = await axios.put(`${API_URL}/workouts/${workoutId}/progress`, { progress }, {
        headers: await this.getHeaders(),
      });
      return response.data as WorkoutDay;
    } catch (error) {
      throw new Error('Antrenman ilerlemesi güncellenirken bir hata oluştu');
    }
  }

  async completeWorkoutDay(workoutId: string, dayId: string): Promise<WorkoutDay> {
    try {
      const response = await axios.put(`${API_URL}/workouts/${workoutId}/days/${dayId}/complete`, {}, {
        headers: await this.getHeaders(),
      });
      return response.data as WorkoutDay;
    } catch (error) {
      throw new Error('Antrenman günü tamamlanırken bir hata oluştu');
    }
  }
}

export const workoutService = new WorkoutService(); 