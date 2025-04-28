import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { theme } from '../theme/theme';
import { StyleGuide } from '../styles/StyleGuide';

interface ButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return theme.colors.gray;
    switch (variant) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.secondary;
      case 'outline':
      case 'text':
        return 'transparent';
      default:
        return theme.colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.text.secondary;
    switch (variant) {
      case 'outline':
      case 'text':
        return theme.colors.primary;
      default:
        return theme.colors.text.inverse;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'small':
        return StyleGuide.layout.spacing / 2;
      case 'large':
        return StyleGuide.layout.spacing * 1.5;
      default:
        return StyleGuide.layout.spacing;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          padding: getPadding(),
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: theme.colors.primary,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: getTextColor(),
              fontSize: size === 'small' ? 14 : 16,
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: StyleGuide.layout.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: 'bold',
  },
}); 