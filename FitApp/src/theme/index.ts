export const theme = {
  colors: {
    primary: '#38A169',
    secondary: '#48BB78',
    accent: '#2F855A',
    background: {
      primary: '#FFFFFF',
      secondary: '#F7FAFC'
    },
    surface: '#F7FAFC',
    text: {
      primary: '#2D3748',
      secondary: '#4A5568',
      light: '#FFFFFF'
    },
    error: '#E53E3E',
    success: '#38A169',
    warning: '#ECC94B'
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
  },
  typography: {
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 24,
      xxl: 32,
    },
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 2,
    },
  },
};

export type Theme = typeof theme;

export type ThemeColors = typeof theme.colors; 