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
    console.log('TOKEN OKUMA, mevcut token:', token ? `${token.substring(0, 15)}...` : 'boş');
    return token;
  } catch (error) {
    console.error('TOKEN ALMA HATASI:', error);
    return null;
  }
};

const clearStorage = async () => {
  try {
    await AsyncStorage.clear();
    console.log('AsyncStorage başarıyla temizlendi');
  } catch (error) {
    console.error('AsyncStorage temizlenirken hata oluştu:', error);
  }
};

class ApiService {
  private api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 15000,
  });

  constructor() {
    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      async (config) => {
        try {
          const token = await getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          return config;
        } catch (error) {
          console.error('Request interceptor hatası:', error);
          return config;
        }
      },
      (error) => {
        console.error('Request interceptor hatası:', error);
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        console.error('API Hatası:', error);
        
        if (error.response) {
          console.error('Sunucu hatası:', error.response.data);
          if (error.response.status === 401) {
            await clearStorage();
          }
          throw new Error(error.response.data.message || 'Sunucu hatası oluştu');
        } else if (error.request) {
          console.error('Sunucuya ulaşılamadı:', error.request);
          console.error('Hedef URL:', error.config?.url);
          console.error('Timeout ayarı:', error.config?.timeout);
          
          if (error.code === 'ECONNABORTED') {
            throw new Error('İstek zaman aşımına uğradı. Sunucu yanıt vermiyor.');
          } else {
            throw new Error('Sunucuya ulaşılamıyor. Lütfen internet bağlantınızı kontrol edin.');
          }
        } else {
          console.error('İstek hatası:', error.message);
          throw new Error('Bir hata oluştu. Lütfen tekrar deneyin.');
        }
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
      
      // Sunucu yanıtı ile doğrudan çalış
      if (!response.data.token) {
        throw new Error('Token alınamadı');
      }
      
      await setToken(response.data.token);
      
      // Kullanıcı nesnesinde id ve _id alanlarını kontrol et ve düzelt
      if (response.data.user) {
        if (response.data.user._id && !response.data.user.id) {
          console.log('Login: _id mevcut ama id yok, id alanını ekliyorum');
          response.data.user.id = response.data.user._id;
        } else if (response.data.user.id && !response.data.user._id) {
          console.log('Login: id mevcut ama _id yok, _id alanını ekliyorum');
          response.data.user._id = response.data.user.id;
        }
        
        console.log('Login işlemi başarılı, kullanıcı bilgileri:', 
          response.data.user.id ? `id: ${response.data.user.id.substring(0, 8)}...` : 'id yok',
          response.data.user._id ? `_id: ${response.data.user._id.substring(0, 8)}...` : '_id yok',
          response.data.user.name);
      }
      
      // Doğrudan response.data'daki user ve token değerlerini döndür
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

  async register(userData: Omit<UserWithoutPassword, '_id' | 'createdAt' | 'updatedAt'>): Promise<RegisterResponse> {
    try {
      await clearStorage();
      console.log('Kayıt isteği gönderiliyor:', userData);
      const response = await this.api.post('/auth/register', userData);
      console.log('Kayıt yanıtı alındı:', response.data);
      
      // Sunucu yanıtını kontrol et - response.data.data yerine direkt response.data içeriğine bakalım
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
        console.log('Register: _id mevcut ama id yok, id alanını ekliyorum');
        user.id = user._id;
      } else if (user.id && !user._id) {
        console.log('Register: id mevcut ama _id yok, _id alanını ekliyorum');
        user._id = user.id;
      }
      
      console.log('Kayıt işlemi başarılı, kullanıcı bilgileri:', 
        user.id ? `id: ${user.id.substring(0, 8)}...` : 'id yok',
        user._id ? `_id: ${user._id.substring(0, 8)}...` : '_id yok',
        user.name);
      
      // RegisterResponse tipinde dönüş oluştur
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
  async getWorkouts(userId: string, startDate?: Date, endDate?: Date): Promise<Workout[]> {
    try {
      const params: any = { userId };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await this.api.get<ApiResponse<WorkoutListResponse>>('/workouts', { params });
      
      if (!response.data.data) {
        throw new Error('Sunucudan geçersiz yanıt alındı');
      }
      
      return response.data.data.workouts;
    } catch (error) {
      console.error('Antrenman listesi alınamadı:', error);
      throw error;
    }
  }

  async createWorkout(workoutData: Omit<Workout, 'id'>): Promise<Workout> {
    try {
      const response = await this.api.post<ApiResponse<WorkoutDetailResponse>>('/workouts', workoutData);
      
      if (!response.data.data) {
        throw new Error('Sunucudan geçersiz yanıt alındı');
      }
      
      return response.data.data.workout;
    } catch (error) {
      console.error('Antrenman oluşturulamadı:', error);
      throw error;
    }
  }

  async updateWorkout(id: string, workoutData: Partial<Workout>): Promise<Workout> {
    try {
      const response = await this.api.put<ApiResponse<WorkoutDetailResponse>>(`/workouts/${id}`, workoutData);
      
      if (!response.data.data) {
        throw new Error('Sunucudan geçersiz yanıt alındı');
      }
      
      return response.data.data.workout;
    } catch (error) {
      console.error('Antrenman güncellenemedi:', error);
      throw error;
    }
  }

  async deleteWorkout(id: string): Promise<void> {
    try {
      await this.api.delete<ApiResponse<void>>(`/workouts/${id}`);
    } catch (error) {
      console.error('Antrenman silinemedi:', error);
      throw error;
    }
  }

  async completeWorkout(id: string): Promise<Workout> {
    try {
      const response = await this.api.put<ApiResponse<WorkoutDetailResponse>>(`/workouts/${id}/complete`);
      
      if (!response.data.data) {
        throw new Error('Sunucudan geçersiz yanıt alındı');
      }
      
      return response.data.data.workout;
    } catch (error) {
      console.error('Antrenman tamamlanamadı:', error);
      throw error;
    }
  }

  async getTodayWorkout(userId: string): Promise<Workout> {
    const response = await this.api.get<ApiResponse<WorkoutDetailResponse>>('/workouts/today', {
      params: { userId }
    });
    return response.data.data.workout;
  }

  async getNextWorkout(userId: string): Promise<Workout> {
    const response = await this.api.get<ApiResponse<WorkoutDetailResponse>>('/workouts/next', {
      params: { userId }
    });
    return response.data.data.workout;
  }

  // Beslenme işlemleri
  async getNutrition(userId: string, date: Date): Promise<INutrition> {
    const response = await this.api.get<ApiResponse<INutrition>>('/nutrition', {
      params: { userId, date }
    });
    return response.data.data;
  }

  async getTodayNutrition(userId: string): Promise<INutrition> {
    const response = await this.api.get<ApiResponse<INutrition>>('/nutrition/today', {
      params: { userId }
    });
    return response.data.data;
  }

  // İstatistikler
  async getWorkoutStats(userId: string): Promise<any> {
    const response = await this.api.get<ApiResponse<any>>('/stats/workouts', {
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

  // Yapay Zeka Beslenme Önerileri
  async getNutritionRecommendation(userId: string, date?: Date): Promise<any> {
    const params: any = { userId };
    if (date) params.date = date.toISOString().split('T')[0];
    
    try {
      const response = await this.api.get<ApiResponse<any>>('/nutrition/recommendations', {
        params
      });
      
      if (!response.data.data) {
        throw new Error('Beslenme önerileri alınamadı');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Beslenme önerileri alınamadı:', error);
      throw error;
    }
  }
}

export const api = new ApiService(); 