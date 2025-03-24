import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../theme';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button = ({
  onPress,
  title,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        styles[variant],
        styles[size],
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? theme.colors.primary : theme.colors.text.light} />
      ) : (
        <Text style={[
          styles.text,
          styles[`${variant}Text`],
          styles[`${size}Text`],
          disabled && styles.disabledText,
          textStyle,
        ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Varyant stilleri
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  // Boyut stilleri
  small: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
  },
  medium: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  large: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
  },
  // Metin stilleri
  text: {
    fontWeight: '600',
  },
  primaryText: {
    color: theme.colors.text.light,
  },
  secondaryText: {
    color: theme.colors.text.light,
  },
  outlineText: {
    color: theme.colors.primary,
  },
  smallText: {
    fontSize: theme.typography.fontSize.sm,
  },
  mediumText: {
    fontSize: theme.typography.fontSize.md,
  },
  largeText: {
    fontSize: theme.typography.fontSize.lg,
  },
  // Devre dışı stiller
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: theme.colors.text.secondary,
  },
}); 