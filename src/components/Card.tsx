import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { StyleGuide } from '../styles/StyleGuide';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'interactive';
  style?: ViewStyle;
}

export const Card = ({
  children,
  variant = 'default',
  style,
}: CardProps) => {
  return (
    <View style={[StyleGuide.cards[variant], style]}>
      {children}
    </View>
  );
}; 