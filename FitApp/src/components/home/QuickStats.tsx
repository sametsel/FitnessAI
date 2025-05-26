import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Surface } from 'react-native-paper';
import { FontAwesome5 } from '@expo/vector-icons';

export interface QuickStatsProps {
  workoutCount: number;
  caloriesBurned: number;
  totalCalories: number;
}

const { width } = Dimensions.get('window');

export const QuickStats: React.FC<QuickStatsProps> = ({
  workoutCount,
  caloriesBurned,
  totalCalories,
}) => {
  return (
    <View style={styles.quickStatsContainer}>
      <Surface style={[styles.quickStatCard, { backgroundColor: '#4CAF50' }]}>
        <View style={styles.quickStatContent}>
          <FontAwesome5 name="dumbbell" size={20} color="white" />
          <Text style={styles.quickStatValue}>{workoutCount}</Text>
          <Text style={styles.quickStatLabel}>Antrenman</Text>
        </View>
      </Surface>
      
      <Surface style={[styles.quickStatCard, { backgroundColor: '#FF9800' }]}>
        <View style={styles.quickStatContent}>
          <FontAwesome5 name="fire" size={20} color="white" />
          <Text style={styles.quickStatValue}>{caloriesBurned || 0}</Text>
          <Text style={styles.quickStatLabel}>Yakılan</Text>
        </View>
      </Surface>
      
      <Surface style={[styles.quickStatCard, { backgroundColor: '#2196F3' }]}>
        <View style={styles.quickStatContent}>
          <FontAwesome5 name="apple-alt" size={20} color="white" />
          <Text style={styles.quickStatValue}>{totalCalories}</Text>
          <Text style={styles.quickStatLabel}>Kalori</Text>
        </View>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  quickStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  quickStatCard: {
    width: (width - 40) / 3,
    borderRadius: 12,
    height: 90,
    elevation: 3,
  },
  quickStatContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickStatValue: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  quickStatLabel: {
    color: 'white',
    fontSize: 12,
    opacity: 0.9,
  },
}); 