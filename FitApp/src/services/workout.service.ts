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
    const token = await AsyncStorage.getItem('@fitapp_token');
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
  async getWorkouts(): Promise<Workout[]> {
    const response = await axios.get(`${API_URL}/workout-plans`, {
        headers: await this.getHeaders(),
      });
      return response.data as Workout[];
  }

  async getWorkoutById(id: string): Promise<Workout> {
    const response = await axios.get(`${API_URL}/workout-plans/${id}`, {
        headers: await this.getHeaders(),
      });
      return response.data as Workout;
  }

  async createWorkout(workout: Omit<Workout, 'id'>): Promise<Workout> {
    const response = await axios.post(`${API_URL}/workout-plans`, workout, {
      headers: await this.getHeaders(),
    });
    return response.data as Workout;
  }

  async updateWorkout(id: string, workout: Partial<Workout>): Promise<Workout> {
    const response = await axios.put(`${API_URL}/workout-plans/${id}`, workout, {
        headers: await this.getHeaders(),
      });
      return response.data as Workout;
  }

  async deleteWorkout(id: string): Promise<void> {
    await axios.delete(`${API_URL}/workout-plans/${id}`, {
        headers: await this.getHeaders(),
      });
  }

  // Antrenman günü işlemleri
  async addWorkoutDay(workoutId: string, day: Omit<WorkoutDay, 'id'>): Promise<WorkoutDay> {
    const response = await axios.post(`${API_URL}/workout-plans/${workoutId}/days`, day, {
        headers: await this.getHeaders(),
      });
      return response.data as WorkoutDay;
  }

  async updateWorkoutDay(workoutId: string, dayId: string, day: Partial<WorkoutDay>): Promise<WorkoutDay> {
    const response = await axios.put(`${API_URL}/workout-plans/${workoutId}/days/${dayId}`, day, {
        headers: await this.getHeaders(),
      });
      return response.data as WorkoutDay;
  }

  async deleteWorkoutDay(workoutId: string, dayId: string): Promise<void> {
    await axios.delete(`${API_URL}/workout-plans/${workoutId}/days/${dayId}`, {
        headers: await this.getHeaders(),
      });
  }

  // İlerleme takibi
  async updateWorkoutProgress(workoutId: string, progress: number): Promise<WorkoutDay> {
    const response = await axios.put(`${API_URL}/workout-plans/${workoutId}/progress`, { progress }, {
        headers: await this.getHeaders(),
      });
      return response.data as WorkoutDay;
  }

  async completeWorkoutDay(workoutId: string, dayId: string): Promise<WorkoutDay> {
    const response = await axios.put(`${API_URL}/workout-plans/${workoutId}/days/${dayId}/complete`, {}, {
        headers: await this.getHeaders(),
      });
      return response.data as WorkoutDay;
  }

  async getDailyWorkoutPlan(date: string): Promise<any> {
    const response = await axios.get(`${API_URL}/workout-plans/plan`, {
      params: { date },
      headers: await this.getHeaders(),
    });
    return response.data;
  }

  async getTodayWorkout(): Promise<any> {
    const response = await axios.get(`${API_URL}/workout-plans/today`, {
      headers: await this.getHeaders(),
    });
    return response.data;
  }
}

export const workoutService = new WorkoutService(); 