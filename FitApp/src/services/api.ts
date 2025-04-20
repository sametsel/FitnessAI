import axios from 'axios';
import { User, UserWithoutPassword } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  token?: string;
}

interface LoginResponse {
  user: {
    _id: string;
    email: string;
    name: string;
  };
  token: string;
}

interface RegisterResponse {
  user: UserWithoutPassword;
  token: string;
}

type RegisterData = Omit<User, '_id' | 'createdAt' | 'updatedAt'>;

class ApiService {
  private api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 saniye timeout
  });

  constructor() {
    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      async (config) => {
        try {
          const token = await AsyncStorage.getItem('token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          return config;
        } catch (error) {
          console.error('Token alınamadı:', error);
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
          // Sunucudan yanıt alındı ama hata kodu döndü
          console.error('Sunucu hatası:', error.response.data);
          if (error.response.status === 401) {
            await AsyncStorage.removeItem('token');
          }
          throw new Error(error.response.data.message || 'Sunucu hatası oluştu');
        } else if (error.request) {
          // İstek yapıldı ama yanıt alınamadı
          console.error('Sunucuya ulaşılamadı:', error.request);
          throw new Error('Sunucuya ulaşılamıyor. Lütfen internet bağlantınızı kontrol edin.');
        } else {
          // İstek oluşturulurken hata oluştu
          console.error('İstek hatası:', error.message);
          throw new Error('Bir hata oluştu. Lütfen tekrar deneyin.');
        }
      }
    );
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      console.log('Login isteği gönderiliyor:', { email, password: '***' });
      const response = await this.api.post<ApiResponse<LoginResponse>>('/auth/login', {
        email,
        password,
      });
      console.log('Login yanıtı alındı:', response.data);
      await AsyncStorage.setItem('token', response.data.token!);
      return response.data.data;
    } catch (error) {
      console.error('Login hatası:', error);
      throw error;
    }
  }

  async register(userData: RegisterData): Promise<RegisterResponse> {
    try {
      console.log('Kayıt isteği gönderiliyor:', userData);
      const response = await this.api.post<ApiResponse<RegisterResponse>>('/auth/register', userData);
      console.log('Kayıt yanıtı alındı:', response.data);
      await AsyncStorage.setItem('token', response.data.token!);
      return response.data.data;
    } catch (error) {
      console.error('Kayıt hatası:', error);
      throw error;
    }
  }

  async get<T>(url: string) {
    const response = await this.api.get<ApiResponse<T>>(url);
    return response.data.data;
  }

  async post<T>(url: string, data: any) {
    const response = await this.api.post<ApiResponse<T>>(url, data);
    return response.data.data;
  }

  async put<T>(url: string, data: any) {
    const response = await this.api.put<ApiResponse<T>>(url, data);
    return response.data.data;
  }

  async delete<T>(url: string) {
    const response = await this.api.delete<ApiResponse<T>>(url);
    return response.data.data;
  }

  async updateProfile(userData: Partial<UserWithoutPassword>): Promise<UserWithoutPassword> {
    const response = await this.api.put<ApiResponse<UserWithoutPassword>>('/users/profile', userData);
    return response.data.data!;
  }

  async getProfile(): Promise<UserWithoutPassword> {
    const response = await this.api.get<ApiResponse<UserWithoutPassword>>('/users/profile');
    return response.data.data!;
  }
}

export const api = new ApiService();

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    return response;
  } catch (error) {
    throw error;
  }
}; 