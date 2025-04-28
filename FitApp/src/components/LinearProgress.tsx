import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface LinearProgressProps {
  progress: number; // 0 ile 1 arasında bir değer
  color?: string;
  trackColor?: string;
  style?: ViewStyle;
}

export const LinearProgress: React.FC<LinearProgressProps> = ({
  progress,
  color = '#00adf5',
  trackColor = '#f0f0f0',
  style,
}) => {
  // progress değerini 0-1 arasında tutuyoruz
  const safeProgress = Math.min(Math.max(progress, 0), 1);

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.track, { backgroundColor: trackColor }]}>
        <View
          style={[
            styles.progress,
            {
              backgroundColor: color,
              width: `${safeProgress * 100}%`,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  track: {
    height: 6,
    borderRadius: 3,
    width: '100%',
  },
  progress: {
    height: '100%',
    borderRadius: 3,
  },
}); 