import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text } from 'react-native';

// Kullanıcı tipi tanımı
interface User {
  _id: string;
  name: string;
  email: string;
  profileCompleted: boolean;
  age: string;
  height: string;
  weight: string;
  gender: 'erkek' | 'kadin';
  activityLevel: 'hareketsiz' | 'azHareketli' | 'ortaAktif' | 'cokAktif';
}

// AuthContext tipi
interface AuthContextData {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  age: string;
  height: string;
  weight: string;
  gender: 'erkek' | 'kadin';
  activityLevel: 'hareketsiz' | 'azHareketli' | 'ortaAktif' | 'cokAktif';
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      setError('Kullanıcı bilgileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // API çağrısı burada yapılacak
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message);
      }

      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      
      setToken(data.token);
      setUser(data.user);
    } catch (err: any) {
      setError(err.message || 'Giriş yapılırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setLoading(true);
      setError(null);
      
      // API çağrısı burada yapılacak
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message);
      }

      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      
      setToken(data.token);
      setUser(data.user);
    } catch (err: any) {
      setError(err.message || 'Kayıt olurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setUser(null);
      setToken(null);
    } catch (err) {
      setError('Çıkış yapılırken bir hata oluştu');
    }
  };

  const clearError = () => {
    setError(null);
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      setLoading(true);
      setError(null);
      
      // API çağrısı burada yapılacak
      const response = await fetch('http://localhost:5000/api/auth/updateProfile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message);
      }

      setUser(data.user);
    } catch (err: any) {
      setError(err.message || 'Profil güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
        updateProfile
      }}
    >
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
