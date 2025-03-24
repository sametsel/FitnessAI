import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StyleGuide } from '../styles/StyleGuide';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export const SectionHeader = ({ title, subtitle }: SectionHeaderProps) => {
  return (
    <View style={styles.container}>
      <Text style={[StyleGuide.typography.h2]}>{title}</Text>
      {subtitle && (
        <Text style={[StyleGuide.typography.bodySmall]}>{subtitle}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: StyleGuide.layout.sectionSpacing,
  },
}); 