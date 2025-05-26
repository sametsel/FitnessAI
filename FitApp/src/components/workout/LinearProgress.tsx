import React, { useState, useEffect } from 'react';
import { View, Animated, ViewStyle } from 'react-native';
import { theme } from '../../theme/theme';

interface LinearProgressProps {
  progress: number;
  color?: string;
  trackColor?: string;
  style?: ViewStyle;
  key?: string;
  animated?: boolean;
}

export const LinearProgress: React.FC<LinearProgressProps> = ({
  progress,
  color = theme.colors.primary,
  trackColor = theme.colors.gray200,
  style,
  key,
  animated = true,
}) => {
  const safeProgress = Math.min(Math.max(progress, 0), 1);
  const [widthAnimation] = useState(new Animated.Value(0));
  
  useEffect(() => {
    if (animated) {
      Animated.timing(widthAnimation, {
        toValue: safeProgress,
        duration: 500,
        useNativeDriver: false,
      }).start();
    } else {
      widthAnimation.setValue(safeProgress);
    }
  }, [safeProgress, animated]);
  
  return (
    <View key={key} style={[{ width: '100%', overflow: 'hidden' }, style]}>
      <View style={[
        { height: 8, borderRadius: 4, width: '100%' },
        { backgroundColor: trackColor }
      ]}>
        <Animated.View
          style={[
            { height: '100%', borderRadius: 4 },
            {
              backgroundColor: color,
              width: animated 
                ? widthAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }) 
                : `${safeProgress * 100}%`,
            },
          ]}
        />
      </View>
    </View>
  );
}; 