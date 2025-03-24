import { theme } from '../theme';
import { TextStyle } from 'react-native';

export const StyleGuide = {
  // Layout & Spacing
  layout: {
    screenPadding: 16,
    containerSpacing: 24,
    sectionSpacing: 20,
    elementSpacing: 12,
    padding: 16,
    spacing: 8
  },

  // Typography
  typography: {
    // Başlıklar
    h1: {
      fontSize: 24,
      fontWeight: '700' as const,
      color: '#000',
      marginBottom: 16
    },
    h2: {
      fontSize: 20,
      fontWeight: '600' as const,
      color: '#000',
      marginBottom: 12
    },
    h3: {
      fontSize: 18,
      fontWeight: '600' as const,
      color: '#000',
      marginBottom: 8
    },

    // Metin stilleri
    body: {
      fontSize: 16,
      color: '#333'
    },
    bodySmall: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '400' as TextStyle['fontWeight'],
      color: theme.colors.text.secondary,
    },
    caption: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: '400' as TextStyle['fontWeight'],
      color: theme.colors.text.secondary,
    },
    label: {
      fontSize: 14,
      fontWeight: '500' as const,
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
  }
}; 