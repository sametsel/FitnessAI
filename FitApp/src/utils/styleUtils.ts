import { StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';

export const createStyles = (styles: any) => {
  return StyleSheet.create(styles);
};

export const getCommonStyles = () => {
  return createStyles({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    centerContent: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    input: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.medium,
      padding: theme.spacing.md,
      marginVertical: theme.spacing.sm,
      ...theme.shadows.small,
    },
    button: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.medium,
      padding: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: theme.spacing.sm,
      ...theme.shadows.medium,
    },
    buttonText: {
      color: theme.colors.text.inverse,
      ...theme.typography.button,
    },
    title: {
      ...theme.typography.h1,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.lg,
    },
    subtitle: {
      ...theme.typography.h2,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
    },
    errorText: {
      color: theme.colors.error,
      ...theme.typography.caption,
      marginTop: theme.spacing.xs,
    },
  });
}; 