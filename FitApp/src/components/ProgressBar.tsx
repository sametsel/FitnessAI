import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

interface ProgressBarProps {
  progress: number;
  width?: number | string;
  height?: number;
  color?: string;
  backgroundColor?: string;
  radius?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  width = '100%',
  height = 8,
  color = theme.colors.primary,
  backgroundColor = theme.colors.gray100,
  radius = 4,
}) => {
  // İlerleme değerini 0-100 arasında sınırlama
  const limitedProgress = Math.min(Math.max(progress, 0), 100);
  
  return (
    <View 
      style={[
        styles.container, 
        { 
          width, 
          height,
          backgroundColor,
          borderRadius: radius,
        }
      ]}
    >
      <View 
        style={[
          styles.progressFill, 
          { 
            width: `${limitedProgress}%`,
            height,
            backgroundColor: color,
            borderRadius: radius,
          }
        ]} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
}); 