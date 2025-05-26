// API URL'sini geliştirme ortamına göre ayarla
const DEV_API_URL = 'http://192.168.1.104:3000/api';
const PROD_API_URL = 'https://api.fitapp.com/api'; // Prodüksiyon URL'si

export const API_URL = DEV_API_URL;

export const APP_CONFIG = {
  DEFAULT_PAGE_LIMIT: 10,
  MIN_PASSWORD_LENGTH: 6,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
  SUPPORTED_VIDEO_FORMATS: ['video/mp4', 'video/webm'],
  TOKEN_STORAGE_KEY: '@fitapp_token',
  USER_STORAGE_KEY: '@fitapp_user',
  THEME_STORAGE_KEY: '@fitapp_theme',
  DEFAULT_LANGUAGE: 'tr',
  VERSION: '1.0.0',
}; 