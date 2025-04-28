import { theme } from '../theme';
import { TextStyle } from 'react-native';

export const StyleGuide = {
  // Layout & Spacing
  layout: {
    screenPadding: 16,
    padding: 16,
    spacing: 16,
    borderRadius: 8,
  },

  // Typography
  typography: {
    // Başlıklar
    h1: {
      fontSize: 32,
      fontWeight: 'bold' as TextStyle['fontWeight'],
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold' as TextStyle['fontWeight'],
    },
    h3: {
      fontSize: 20,
      fontWeight: 'bold' as TextStyle['fontWeight'],
    },

    // Metin stilleri
    body1: {
      fontSize: 16,
    },
    body2: {
      fontSize: 14,
    },
    caption: {
      fontSize: 12,
    },
    body: {
      fontSize: 16,
      color: '#333'
    },
    bodySmall: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '400' as TextStyle['fontWeight'],
      color: theme.colors.text.secondary,
    },
    label: {
      fontSize: 14,
      fontWeight: '500' as TextStyle['fontWeight'],
      color: '#666',
      marginBottom: 5
    }
  },

  // Kartlar
  cards: {
    default: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
    },
    elevated: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      ...theme.shadows.small,
    },
    interactive: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      ...theme.shadows.small,
      borderWidth: 1,
      borderColor: 'transparent',
    },
  },

  // Form elemanları
  forms: {
    input: {
      height: 48,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.text.secondary + '20', // %20 opacity
    },
    error: {
      color: theme.colors.error,
      fontSize: theme.typography.fontSize.sm,
      marginTop: theme.spacing.xs,
    },
  },

  // İkonlar
  icons: {
    small: 16,
    medium: 24,
    large: 32,
    xlarge: 48,
  },

  // Animasyonlar
  animations: {
    timing: {
      quick: 200,
      normal: 300,
      slow: 500,
    },
  },

  borderRadius: {
    small: 4,
    medium: 8,
    large: 12
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
    medium: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.37,
      shadowRadius: 7.49,
      elevation: 6,
    },
  },
}; 