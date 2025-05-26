import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserWithoutPassword } from '../types/index';
import { api } from '../services/api';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import userService from '../services/user.service';

const TOKEN_KEY = '@fitapp_token';

interface AuthContextType {
  user: UserWithoutPassword | null;
  setUser: React.Dispatch<React.SetStateAction<UserWithoutPassword | null>>;
  loading: boolean;
  token: string | null;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: any) => Promise<void>;
  updateProfile: (data: Partial<UserWithoutPassword>) => Promise<UserWithoutPassword>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserWithoutPassword | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Uygulama başladığında kayıtlı token ve kullanıcı var mı kontrol et
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        // Önce token'ı kontrol et
        const savedToken = await AsyncStorage.getItem(TOKEN_KEY);
        
        // Otomatik giriş devre dışı bırakıldı
        
        // Token varsa bile kullanıcı bilgilerini çekme işlemi yapılmıyor
        setLoading(false);
        // Token varsa userService'e set et
        if (savedToken) userService.setAuthToken(savedToken);
        
        /* Otomatik giriş kodu geçici olarak devre dışı bırakıldı
        if (savedToken) {
          setToken(savedToken);
          
          // Token varsa, API ile kullanıcı bilgilerini al
          try {
            const response = await api.getProfile();
            
            // Kullanıcı nesnesini kontrol et ve id/_id tutarlılığını sağla
            if (response) {
              // Eğer _id varsa ve id yoksa, id alanını ekle
              if (response._id && !response.id) {
                response.id = response._id;
              }
              // Eğer id varsa ve _id yoksa, _id alanını ekle
              else if (response.id && !response._id) {
                response._id = response.id;
              }
              console.log('Kullanıcı bilgileri yüklendi ve ID alanları düzeltildi:', 
                response?.id ? `id: ${response.id.substring(0, 8)}...` : 'id yok',
                response?._id ? `_id: ${response._id.substring(0, 8)}...` : '_id yok');
            }
            
            setUser(response);
          } catch (error) {
            console.error('Otomatik giriş hatası:', error);
            // Hata detaylarını göster
            if (error instanceof Error) {
              console.error('Hata mesajı:', error.message);
            }
            
            // Sunucu bağlantı hatası olabilir, api.ts'deki interceptor'lar hatayı yönetiyor
            // Token'ı hemen silme, sunucu geçici olarak çalışmıyor olabilir
            if (error instanceof Error && 
                (error.message.includes('Sunucuya ulaşılamıyor') || 
                 error.message.includes('geçersiz yanıt'))) {
              console.log('Sunucu bağlantı sorunu: Token korunuyor ama oturum geçici olarak kapatılıyor');
              setUser(null); // Kullanıcıyı geçici olarak çıkış yaptır ama token'ı silme
            } else {
              // Diğer hatalarda token'ı temizle (401 vb.)
              await AsyncStorage.removeItem(TOKEN_KEY);
              setToken(null);
            }
          }
        }
        */
      } catch (error) {
        console.error('Kayıtlı veri yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSavedData();
  }, []);

  // Token değiştiğinde userService'e set et
  useEffect(() => {
    if (token) userService.setAuthToken(token);
  }, [token]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('Login işlemi başladı, email:', email);
      const response = await api.login(email, password);
      
      // API yanıtını kontrol et
      console.log('Login yanıt inceleniyor. Token var mı?', !!response.token);
      
      // Token'ı manuel olarak kaydet ve state'e ayarla  
      if (response.token) {
        await AsyncStorage.setItem(TOKEN_KEY, response.token);
        setToken(response.token);
        console.log('Login: Token başarıyla kaydedildi ve state ayarlandı.');
      } else {
        console.error('Login: Token alınamadı!');
      }
      
      setUser(response.user);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Login hatası:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      console.log('Çıkış yapılıyor...');
      
      // AsyncStorage'dan token'ı sil
      await AsyncStorage.removeItem(TOKEN_KEY);
      console.log("Token storage'dan silindi");
      
      // State'leri temizle
      setUser(null);
      setToken(null);
      console.log("Kullanıcı ve token state'leri temizlendi");
      
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout hatası:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: any) => {
    setLoading(true);
    try {
      const response = await api.register(data);
      
      // Güncellenmiş API yapısına göre kullanıcı bilgilerini al
      setUser(response.user);
      setToken(response.token); // Token'ı state'e de ayarla
      
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Kayıt hatası:', error);
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
      return updatedUser;
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    setUser,
    loading,
    token,
    setToken,
    login,
    logout,
    register,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
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

export default AuthContext;
