import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';
import { Surface } from 'react-native-paper';

interface Food {
  _id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients?: string[];
  time?: string;
}

interface Meal {
  _id: string;
  name: string;
  type: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
  ingredients?: string[];
}

interface MealListProps {
  meals: Meal[];
  onAddFood: (mealId: string) => void;
}

export const MealList: React.FC<MealListProps> = ({ meals, onAddFood }) => {
  const getMealIcon = (type: string) => {
    switch (type) {
      case 'sabah':
        return { icon: 'food-apple', color: '#FF9500' };
      case 'ara_ogun':
        return { icon: 'food-apple-outline', color: '#9C27B0' };
      case 'ogle':
        return { icon: 'food', color: '#4CAF50' };
      case 'ara_ogun_2':
        return { icon: 'food-apple-outline', color: '#9C27B0' };
      case 'aksam':
        return { icon: 'food-turkey', color: '#2196F3' };
      default:
        return { icon: 'food', color: theme.colors.primary };
    }
  };

  const getMealTitle = (type: string) => {
    switch (type) {
      case 'sabah':
        return 'Kahvaltı';
      case 'ara_ogun':
        return 'Ara Öğün';
      case 'ogle':
        return 'Öğle Yemeği';
      case 'ara_ogun_2':
        return 'Ara Öğün 2';
      case 'aksam':
        return 'Akşam Yemeği';
      default:
        return type;
    }
  };

  return (
    <View style={styles.container}>
      {meals.map((meal) => {
        const { icon, color } = getMealIcon(meal.type);
        return (
          <Surface key={meal._id} style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <View style={[styles.iconCircle, { backgroundColor: color + '22' }]}>
                <MaterialCommunityIcons name={icon as any} size={28} color={color} />
              </View>
              <View style={styles.mealInfo}>
                <Text style={styles.mealName}>{getMealTitle(meal.type)}</Text>
                <Text style={styles.mealTime}>{meal.time}</Text>
              </View>
            </View>

            <View style={styles.mealContent}>
              <View style={styles.mealDetails}>
                <Text style={styles.mealTitle}>{meal.name}</Text>
                {meal.ingredients && meal.ingredients.length > 0 && (
                  <Text style={styles.ingredients}>
                    {meal.ingredients.join(', ')}
                  </Text>
                )}
              </View>

              <View style={styles.macrosContainer}>
                <View style={styles.macroItem}>
                  <MaterialCommunityIcons name="fire" size={18} color={theme.colors.primary} style={styles.macroIcon} />
                  <Text style={styles.macroValue}>{meal.calories}</Text>
                  <Text style={styles.macroLabel}>kcal</Text>
                </View>
                <View style={styles.macroItem}>
                  <MaterialCommunityIcons name="food-steak" size={18} color="#4CAF50" style={styles.macroIcon} />
                  <Text style={styles.macroValue}>{meal.protein}g</Text>
                  <Text style={styles.macroLabel}>Protein</Text>
                </View>
                <View style={styles.macroItem}>
                  <MaterialCommunityIcons name="corn" size={18} color="#FFC107" style={styles.macroIcon} />
                  <Text style={styles.macroValue}>{meal.carbs}g</Text>
                  <Text style={styles.macroLabel}>Karbonhidrat</Text>
                </View>
                <View style={styles.macroItem}>
                  <MaterialCommunityIcons name="peanut" size={18} color="#FF9800" style={styles.macroIcon} />
                  <Text style={styles.macroValue}>{meal.fat}g</Text>
                  <Text style={styles.macroLabel}>Yağ</Text>
                </View>
              </View>
            </View>
          </Surface>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  mealCard: {
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    backgroundColor: theme.colors.background.paper,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  mealTime: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  mealContent: {
    marginTop: 8,
  },
  mealDetails: {
    marginBottom: 12,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  ingredients: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.gray100,
    borderRadius: 12,
    padding: 12,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  macroLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  macroIcon: {
    marginBottom: 2,
  },
}); 