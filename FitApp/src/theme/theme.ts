export const theme = {
  colors: {
    primary: '#3F51B5',
    primaryLight: '#C5CAE9',
    secondary: '#00BCD4',
    accent: '#FF4081',
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    danger: '#F44336', // error ile aynı
    info: '#2196F3',
    
    // Zorluk seviyeleri için renkler
    beginner: '#4CAF50',    // Yeşil
    intermediate: '#FFC107', // Sarı
    advanced: '#F44336',    // Kırmızı
    
    // Nötr renkler
    white: '#FFFFFF',
    black: '#000000',
    gray50: '#F8F9FA',
    gray100: '#F1F3F5',
    gray200: '#E9ECEF',
    gray300: '#DEE2E6',
    gray400: '#CED4DA',
    gray500: '#ADB5BD',
    gray600: '#6C757D',
    gray700: '#495057',
    gray800: '#343A40',
    gray900: '#212529',
    
    // Arka plan renkleri
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    cardBackground: '#FFFFFF',
    card: '#FFFFFF',
    border: '#DEE2E6',
    
    // Metin renkleri
    textPrimary: '#212529',
    textSecondary: '#6C757D',
    textMuted: '#ADB5BD',
    shadow: 'rgba(0,0,0,0.1)',

    // Metin nesnesi
    text: {
      primary: '#212529',
      secondary: '#6C757D',
      accent: '#FF4081',
      success: '#4CAF50',
      warning: '#FFC107',
      error: '#F44336',
      info: '#2196F3',
    }
  },
  
  // Yazı tipleri
  fonts: {
    light: 'System',
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  typography: {
    fontSizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 30,
    },
    fontWeights: {
      light: '300',
      regular: '400',
      medium: '500',
      semiBold: '600',
      bold: '700',
    },
  },
  
  borderRadius: {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    full: 9999,
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.20,
      shadowRadius: 1.41,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.27,
      shadowRadius: 4.65,
      elevation: 6,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
      elevation: 8,
    }
  }
}; 