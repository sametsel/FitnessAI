// API yapılandırması
export const API_URL = 'http://192.168.1.101:5000/api/users';

// Uygulama yapılandırması
export const APP_CONFIG = {
  // Sayfalama için varsayılan limit
  DEFAULT_PAGE_LIMIT: 10,
  
  // Minimum şifre uzunluğu
  MIN_PASSWORD_LENGTH: 6,
  
  // Maksimum dosya boyutu (bytes)
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  
  // Desteklenen resim formatları
  SUPPORTED_IMAGE_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
  
  // Desteklenen video formatları
  SUPPORTED_VIDEO_FORMATS: ['video/mp4', 'video/webm'],
  
  // JWT token'ı için localStorage anahtarı
  TOKEN_STORAGE_KEY: '@fitapp_token',
  
  // Kullanıcı bilgileri için localStorage anahtarı
  USER_STORAGE_KEY: '@fitapp_user',
  
  // Tema tercihi için localStorage anahtarı
  THEME_STORAGE_KEY: '@fitapp_theme',
  
  // Varsayılan dil
  DEFAULT_LANGUAGE: 'tr',
  
  // Uygulama sürümü
  VERSION: '1.0.0',
};

// Tema renkleri
export const THEME_COLORS = {
  primary: '#4CAF50',
  secondary: '#2196F3',
  success: '#8BC34A',
  danger: '#F44336',
  warning: '#FFC107',
  info: '#00BCD4',
  light: '#F5F5F5',
  dark: '#212121',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#9E9E9E',
  transparent: 'transparent',
};

// Animasyon süreleri (ms)
export const ANIMATION_DURATIONS = {
  short: 200,
  medium: 300,
  long: 500,
};

// HTTP istek zaman aşımı süresi (ms)
export const REQUEST_TIMEOUT = 30000; // 30 saniye

// Hata mesajları
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'İnternet bağlantınızı kontrol edin',
  SERVER_ERROR: 'Sunucu hatası oluştu',
  UNAUTHORIZED: 'Oturum süreniz doldu',
  FORBIDDEN: 'Bu işlem için yetkiniz yok',
  NOT_FOUND: 'İstenilen kaynak bulunamadı',
  VALIDATION_ERROR: 'Girdiğiniz bilgileri kontrol edin',
  DEFAULT: 'Bir hata oluştu',
};

// Başarı mesajları
export const SUCCESS_MESSAGES = {
  LOGIN: 'Başarıyla giriş yaptınız',
  REGISTER: 'Hesabınız başarıyla oluşturuldu',
  LOGOUT: 'Başarıyla çıkış yaptınız',
  UPDATE_PROFILE: 'Profiliniz güncellendi',
  PASSWORD_RESET: 'Şifreniz başarıyla sıfırlandı',
  WORKOUT_CREATED: 'Antrenman programı oluşturuldu',
  WORKOUT_UPDATED: 'Antrenman programı güncellendi',
  WORKOUT_DELETED: 'Antrenman programı silindi',
}; 