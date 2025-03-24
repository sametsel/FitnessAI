import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { StyleGuide } from '../styles/StyleGuide';

interface MenuItemProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  onPress: () => void;
  textColor?: string;
  style?: ViewStyle;
}

export const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  title,
  onPress,
  textColor = theme.colors.text.primary,
  style
}) => {
  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={onPress}
    >
      <MaterialIcons 
        name={icon} 
        size={24} 
        color={textColor} 
        style={styles.icon} 
      />
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      <MaterialIcons 
        name="chevron-right" 
        size={24} 
        color={theme.colors.text.secondary} 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: StyleGuide.layout.elementSpacing,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    marginBottom: StyleGuide.layout.elementSpacing,
    ...theme.shadows.small,
  },
  icon: {
    marginRight: StyleGuide.layout.elementSpacing,
  },
  title: {
    ...StyleGuide.typography.body,
    flex: 1,
  },
}); 