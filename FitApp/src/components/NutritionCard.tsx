import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../theme/theme';

export interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface NutritionCardProps {
  title: string;
  nutritionData: NutritionData;
  onPress?: () => void;
  showDetails?: boolean;
}

export const NutritionCard: React.FC<NutritionCardProps> = ({
  title,
  nutritionData,
  onPress,
  showDetails = true,
}) => {
  const { calories, protein, carbs, fat } = nutritionData;
  
  // Makro besinlerin toplam kalori değerleri
  const proteinCalories = protein * 4; // 1g protein = 4 kalori
  const carbsCalories = carbs * 4;     // 1g karbonhidrat = 4 kalori
  const fatCalories = fat * 9;         // 1g yağ = 9 kalori
  
  // Makro besinlerin yüzdeleri
  const totalCalories = calories > 0 ? calories : (proteinCalories + carbsCalories + fatCalories);
  const proteinPercentage = Math.round((proteinCalories / totalCalories) * 100) || 0;
  const carbsPercentage = Math.round((carbsCalories / totalCalories) * 100) || 0;
  const fatPercentage = Math.round((fatCalories / totalCalories) * 100) || 0;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.caloriesContainer}>
          <MaterialCommunityIcons name="fire" size={16} color={theme.colors.error} />
          <Text style={styles.caloriesText}>{totalCalories} kcal</Text>
        </View>
      </View>

      {showDetails && (
        <View style={styles.content}>
          <View style={styles.macrosBar}>
            <View 
              style={[
                styles.macroSegment, 
                { 
                  backgroundColor: theme.colors.primary,
                  width: `${proteinPercentage}%`
                }
              ]} 
            />
            <View 
              style={[
                styles.macroSegment, 
                { 
                  backgroundColor: theme.colors.warning,
                  width: `${carbsPercentage}%`
                }
              ]} 
            />
            <View 
              style={[
                styles.macroSegment, 
                { 
                  backgroundColor: theme.colors.danger,
                  width: `${fatPercentage}%`
                }
              ]} 
            />
          </View>

          <View style={styles.macrosDetail}>
            <View style={styles.macroItem}>
              <View style={[styles.macroIcon, { backgroundColor: theme.colors.primary }]} />
              <Text style={styles.macroLabel}>P</Text>
              <Text style={styles.macroValue}>{protein}g</Text>
            </View>
            
            <View style={styles.macroItem}>
              <View style={[styles.macroIcon, { backgroundColor: theme.colors.warning }]} />
              <Text style={styles.macroLabel}>K</Text>
              <Text style={styles.macroValue}>{carbs}g</Text>
            </View>
            
            <View style={styles.macroItem}>
              <View style={[styles.macroIcon, { backgroundColor: theme.colors.danger }]} />
              <Text style={styles.macroLabel}>Y</Text>
              <Text style={styles.macroValue}>{fat}g</Text>
            </View>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semiBold,
    color: theme.colors.text.primary,
  },
  caloriesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  caloriesText: {
    marginLeft: 4,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.text.primary,
  },
  content: {
    marginTop: theme.spacing.sm,
  },
  macrosBar: {
    height: 8,
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
    backgroundColor: theme.colors.gray200,
  },
  macroSegment: {
    height: '100%',
  },
  macrosDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  macroIcon: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  macroLabel: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.text.secondary,
    marginRight: 4,
  },
  macroValue: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.text.primary,
  },
}); 