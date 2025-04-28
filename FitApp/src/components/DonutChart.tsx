import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { theme } from '../theme/theme';

interface DonutChartProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  label?: string;
  value?: string | number;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  progress,
  size = 120,
  strokeWidth = 12,
  color,
  label,
  value
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progressValue = Math.min(Math.max(progress, 0), 1);
  const strokeDashoffset = circumference - (progressValue * circumference);

  return (
    <View style={styles.container}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ transform: [{ rotate: '-90deg' }] }}>
          <Svg width={size} height={size}>
            {/* Arka Plan Çemberi */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={`${color}30`}
              strokeWidth={strokeWidth / 2}
              fill="transparent"
            />
            {/* İlerleme Çemberi */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </Svg>
        </View>
        <View style={styles.labelContainer}>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  label: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
}); 