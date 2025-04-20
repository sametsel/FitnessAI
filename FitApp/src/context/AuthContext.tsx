import React, { createContext, useContext, useState } from 'react';
import { RegisterFormData, User, UserWithoutPassword } from '../types';
import { api } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

interface AuthContextType {
  user: UserWithoutPassword | null;
  setUser: React.Dispatch<React.SetStateAction<UserWithoutPassword | null>>;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  updateProfile: (data: Partial<UserWithoutPassword>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserWithoutPassword | null>(null);
  const [loading, setLoading] = useState(false);

  const register = async (formData: RegisterFormData) => {
    setLoading(true);
    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        age: parseInt(formData.age),
        height: parseInt(formData.height),
        weight: parseInt(formData.weight),
        gender: formData.gender,
        activityLevel: formData.activityLevel,
        goal: formData.goal
      };

      const response = await api.register(userData);
      setUser(response.user);
      console.log('Kayıt başarılı, ana sayfaya yönlendiriliyor...');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Kayıt hatası:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.login(email, password);
      const fullUserData = await api.getProfile();
      setUser(fullUserData);
      console.log('Giriş başarılı, ana sayfaya yönlendiriliyor...');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Giriş hatası:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await AsyncStorage.removeItem('token');
      setUser(null);
      console.log('Çıkış yapıldı, giriş sayfasına yönlendiriliyor...');
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Çıkış hatası:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<UserWithoutPassword>) => {
    setLoading(true);
    try {
      const updatedUser = await api.updateProfile(data);
      setUser(updatedUser);
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, register, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
