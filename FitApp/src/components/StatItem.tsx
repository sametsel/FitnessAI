import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { StyleGuide } from '../styles/StyleGuide';

export interface StatItemProps {
  icon?: keyof typeof MaterialIcons.glyphMap;
  number: string;
  label: string;
}

export const StatItem: React.FC<StatItemProps> = ({ icon, number, label }) => {
  return (
    <View style={styles.container}>
      {icon && (
        <MaterialIcons
          name={icon}
          size={24}
          color={theme.colors.primary}
          style={styles.icon}
        />
      )}
      <Text style={styles.number}>{number}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: StyleGuide.layout.elementSpacing,
  },
  icon: {
    marginBottom: StyleGuide.layout.elementSpacing / 2,
  },
  number: {
    ...StyleGuide.typography.h2,
    color: theme.colors.text.primary,
  },
  label: {
    ...StyleGuide.typography.bodySmall,
    color: theme.colors.text.secondary,
  },
}); 