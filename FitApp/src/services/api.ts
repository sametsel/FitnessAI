import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';
import { 
  UserWithoutPassword, 
  ApiResponse, 
  LoginResponse, 
  RegisterResponse, 
  Workout,
  WorkoutListResponse,
  UserResponse,
  WorkoutDetailResponse
} from '../types/index';
import { IWorkout } from '../models/Workout';
import { INutrition } from '../models/Nutrition';

const TOKEN_KEY = '@fitapp_token';


const setToken = async (token: string) => {
  try {
    console.log('TOKEN KAYDETME BAŞLADI, token:', token ? `${token.substring(0, 15)}...` : 'boş');
    await AsyncStorage.setItem(TOKEN_KEY, token);
    console.log('TOKEN BAŞARIYLA KAYDEDİLDİ');
    // Token'ı doğrulama amaçlı hemen oku
    const savedToken = await AsyncStorage.getItem(TOKEN_KEY);
    console.log('KONTROL: Kaydedilen token:', savedToken ? `${savedToken.substring(0, 15)}...` : 'boş');
  } catch (error) {
    console.error('TOKEN KAYDETME HATASI:', error);
    throw error;
  }
};

const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return token;
  } catch (error) {
    console.error('TOKEN OKUMA HATASI:', error);
    return null;
  }
};

const clearStorage = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('STORAGE TEMİZLEME HATASI:', error);
  }
};

class ApiService {
  private api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      async (config) => {
        const token = await getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await clearStorage();
        }
        return Promise.reject(error);
      }
    );
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      await clearStorage();
      console.log('Login isteği gönderiliyor:', { email, password: '***' });
      const response = await this.api.post('/auth/login', {
        email,
        password,
      });
      console.log('Login yanıtı alındı:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Giriş başarısız');
      }
      
      if (!response.data.token) {
        throw new Error('Token alınamadı');
      }
      
      await setToken(response.data.token);
      
      // Kullanıcı nesnesinde id ve _id alanlarını kontrol et ve düzelt
      if (response.data.user) {
        if (response.data.user._id && !response.data.user.id) {
          response.data.user.id = response.data.user._id;
        } else if (response.data.user.id && !response.data.user._id) {
          response.data.user._id = response.data.user.id;
        }
      }
      
      return {
        token: response.data.token,
        user: response.data.user
      };
    } catch (error) {
      console.error('Login hatası:', error);
      await clearStorage();
      throw error;
    }
  }

  async register(userData: any): Promise<RegisterResponse> {
    try {
      await clearStorage();
      console.log('Kayıt isteği gönderiliyor:', userData);
      const response = await this.api.post('/auth/register', userData);
      console.log('Kayıt yanıtı alındı:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Kayıt işlemi başarısız');
      }
      
      if (!response.data.token) {
        throw new Error('Token alınamadı');
      }
      
      if (!response.data.user) {
        throw new Error('Kullanıcı bilgileri alınamadı');
      }
      
      await setToken(response.data.token);
      
      // Kullanıcı nesnesinde id ve _id alanlarını kontrol et ve düzelt
      const user = response.data.user;
      if (user._id && !user.id) {
        user.id = user._id;
      } else if (user.id && !user._id) {
        user._id = user.id;
      }
      
      return {
        user: user,
        token: response.data.token
      };
    } catch (error) {
      console.error('Kayıt hatası:', error);
      await clearStorage();
      throw error;
    }
  }

  async getProfile(): Promise<UserWithoutPassword> {
    const response = await this.api.get<ApiResponse<UserResponse>>('/users/profile');
    
    if (!response.data.data) {
      throw new Error('Sunucudan geçersiz yanıt alındı');
    }
    
    // Backend'den gelen user nesnesinde _id alanından id alanını oluştur
    const user = response.data.data.user;
    
    // Doğrulama ve alan ekleme
    if (user._id && !user.id) {
      console.log('API response: _id mevcut ama id yok, id alanını ekliyorum');
      user.id = user._id;
    } else if (user.id && !user._id) {
      console.log('API response: id mevcut ama _id yok, _id alanını ekliyorum');
      user._id = user.id;
    }
    
    console.log('Kullanıcı profili alındı:', 
      user.id ? `id: ${user.id.substring(0, 8)}...` : 'id yok',
      user._id ? `_id: ${user._id.substring(0, 8)}...` : '_id yok',
      user.name);
    
    return user;
  }

  async updateProfile(userData: Partial<UserWithoutPassword>): Promise<UserWithoutPassword> {
    try {
      console.log('Profil güncelleme isteği gönderiliyor:', userData);
      const response = await this.api.put<ApiResponse<UserResponse>>('/users/profile', userData);
      console.log('Profil güncelleme yanıtı:', response.data);
      
      if (!response.data.data) {
        throw new Error('Sunucudan geçersiz yanıt alındı');
      }
      
      return response.data.data.user;
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Sunucu hatası oluştu');
        } else if (error.request) {
          throw new Error('Sunucuya ulaşılamıyor. Lütfen internet bağlantınızı kontrol edin.');
        }
      }
      throw error;
    }
  }

  // Antrenman işlemleri
  async getWorkouts(userId: string): Promise<Workout[]> {
    const response = await this.api.get('/workout-plans', { params: { userId } });
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data.data) {
      if (Array.isArray(response.data.data)) {
        return response.data.data;
      }
      if (response.data.data.workouts) {
      return response.data.data.workouts;
      }
    }
    throw new Error('Sunucudan geçersiz yanıt alındı');
  }

  async createWorkout(workoutData: Omit<Workout, 'id'>): Promise<Workout> {
    const response = await this.api.post<ApiResponse<WorkoutDetailResponse>>('/workout-plans', workoutData);
      if (!response.data.data) {
        throw new Error('Sunucudan geçersiz yanıt alındı');
      }
      return response.data.data.workout;
  }

  async updateWorkout(id: string, workoutData: Partial<Workout>): Promise<Workout> {
    const response = await this.api.put<ApiResponse<WorkoutDetailResponse>>(`/workout-plans/${id}`, workoutData);
      if (!response.data.data) {
        throw new Error('Sunucudan geçersiz yanıt alındı');
      }
      return response.data.data.workout;
  }

  async deleteWorkout(id: string): Promise<void> {
    await this.api.delete<ApiResponse<void>>(`/workout-plans/${id}`);
  }

  async completeWorkout(id: string): Promise<Workout> {
    const response = await this.api.put<ApiResponse<WorkoutDetailResponse>>(`/workout-plans/${id}/complete`);
      if (!response.data.data) {
        throw new Error('Sunucudan geçersiz yanıt alındı');
      }
      return response.data.data.workout;
  }

  async getTodayWorkout(userId: string): Promise<Workout> {
    const response = await this.api.get<ApiResponse<WorkoutDetailResponse>>('/workout-plans/today', {
      params: { userId }
    });
    return response.data.data.workout;
  }

  async getNextWorkout(userId: string): Promise<Workout> {
    const response = await this.api.get<ApiResponse<WorkoutDetailResponse>>('/workout-plans/next', {
      params: { userId }
    });
    return response.data.data.workout;
  }

  // Beslenme işlemleri
  async getNutrition(userId: string): Promise<any[]> {
    const response = await this.api.get('/nutrition-plans', {
      params: { userId }
    });
    return response.data;
  }

  async getDailyNutritionPlan(date: string, userId: string): Promise<any> {
    const response = await this.api.get('/nutrition-plans/plan', {
      params: { date, userId }
    });
    return response.data;
  }

  async getTodayNutrition(userId: string): Promise<INutrition> {
    const response = await this.api.get<ApiResponse<INutrition>>('/nutrition/today', {
      params: { userId }
    });
    return response.data.data;
  }

  async getNutritionStats(userId: string): Promise<any> {
    const response = await this.api.get<ApiResponse<any>>('/stats/nutrition', {
      params: { userId }
    });
    return response.data.data;
  }

  async getNutritionDays(userId: string): Promise<any[]> {
    const response = await this.api.get('/nutrition-plans/days', {
      params: { userId }
    });
    return response.data;
  }
}

export const api = new ApiService(); 