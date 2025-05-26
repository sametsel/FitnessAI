import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Surface } from 'react-native-paper';
import { theme } from '../../theme/theme';
import CircularProgress from '../../components/CircularProgress';

interface NutritionSummaryProps {
  dailySummary: {
    calories: { consumed: number; target: number };
    protein: { consumed: number; target: number };
    carbs: { consumed: number; target: number };
    fat: { consumed: number; target: number };
  };
}

export const NutritionSummary: React.FC<NutritionSummaryProps> = ({ dailySummary }) => {
  const calculatePercentage = (consumed: number, target: number) => {
    return Math.min(Math.round((consumed / target) * 100), 100);
  };

  const macroPercentages = {
    protein: Math.round((dailySummary.protein.consumed * 4 / dailySummary.calories.consumed) * 100) || 0,
    carbs: Math.round((dailySummary.carbs.consumed * 4 / dailySummary.calories.consumed) * 100) || 0,
    fat: Math.round((dailySummary.fat.consumed * 9 / dailySummary.calories.consumed) * 100) || 0,
  };

  return (
    <Surface style={styles.container}>
      <View style={styles.caloriesContainer}>
        <CircularProgress
          size={120}
          strokeWidth={10}
          percentage={calculatePercentage(dailySummary.calories.consumed, dailySummary.calories.target)}
          color={theme.colors.primary}
        />
        <View style={styles.caloriesTextContainer}>
          <Text style={styles.caloriesValue}>{dailySummary.calories.consumed}</Text>
          <Text style={styles.caloriesLabel}>kcal</Text>
          <Text style={styles.caloriesTarget}>Hedef: {dailySummary.calories.target}</Text>
        </View>
      </View>

      <View style={styles.macrosContainer}>
        <View style={styles.macroItem}>
          <Text style={[styles.macroLabel, { color: theme.colors.primary }]}>Protein</Text>
          <Text style={styles.macroValue}>{dailySummary.protein.consumed}g</Text>
          <Text style={styles.macroPercentage}>{macroPercentages.protein}%</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={[styles.macroLabel, { color: theme.colors.secondary }]}>Karbonhidrat</Text>
          <Text style={styles.macroValue}>{dailySummary.carbs.consumed}g</Text>
          <Text style={styles.macroPercentage}>{macroPercentages.carbs}%</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={[styles.macroLabel, { color: theme.colors.accent }]}>Yağ</Text>
          <Text style={styles.macroValue}>{dailySummary.fat.consumed}g</Text>
          <Text style={styles.macroPercentage}>{macroPercentages.fat}%</Text>
        </View>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 4,
  },
  caloriesContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  caloriesTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  caloriesValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  caloriesLabel: {
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  caloriesTarget: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  macroPercentage: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
}); 