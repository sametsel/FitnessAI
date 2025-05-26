import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProgressBar, Button, Chip } from 'react-native-paper';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

export interface Meal {
  id: string;
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  type?: string;
  foods?: any[];
}

export interface NutritionSummaryProps {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  meals: Meal[];
}

const MEAL_ORDER = [
  { type: 'sabah', label: 'Kahvaltı', icon: 'food-apple', color: '#FF9500' },
  { type: 'ara_ogun', label: 'Ara Öğün', icon: 'food-apple-outline', color: '#9C27B0' },
  { type: 'ogle', label: 'Öğle Yemeği', icon: 'food', color: '#4CAF50' },
  { type: 'ara_ogun_2', label: 'Ara Öğün 2', icon: 'food-apple-outline', color: '#9C27B0' },
  { type: 'aksam', label: 'Akşam Yemeği', icon: 'food-turkey', color: '#2196F3' },
];

export const NutritionSummary: React.FC<NutritionSummaryProps> = ({
  totalCalories,
  totalProtein,
  totalCarbs,
  totalFat,
  meals = [],
}) => {
  // Makro besin dağılımı için yüzdeleri hesapla
  const calculateMacroPercentages = () => {
    const totalGrams = totalProtein + totalCarbs + totalFat;
    if (totalGrams === 0) return { protein: 0, carbs: 0, fat: 0 };
    return {
      protein: Math.round((totalProtein / totalGrams) * 100),
      carbs: Math.round((totalCarbs / totalGrams) * 100),
      fat: Math.round((totalFat / totalGrams) * 100)
    };
  };
  const macroPercentages = calculateMacroPercentages();

  return (
    <View style={styles.container}>
      {/* Günlük Beslenme Özeti */}
      <View style={styles.summaryCard}>
        <View style={styles.calorieCircle}>
          <Text style={styles.calorieValue}>{totalCalories}</Text>
          <Text style={styles.calorieLabel}>kcal</Text>
        </View>
        <View style={styles.macrosContainer}>
          <View style={[styles.macroItem, {flexDirection: 'row', alignItems: 'center'}]}>
            <MaterialCommunityIcons name="food-steak" size={20} color="#FF9800" style={{marginRight: 6}} />
            <Text style={[styles.macroLabel, {color: '#FF9800'}]}>Protein</Text>
            <Text style={[styles.macroValue, {marginLeft: 8}]}>{totalProtein}g</Text>
            <Text style={styles.macroPercent}>{macroPercentages.protein}%</Text>
          </View>
          <ProgressBar progress={macroPercentages.protein/100} color="#FF9800" style={styles.progressBar} />
          <View style={[styles.macroItem, {flexDirection: 'row', alignItems: 'center'}]}>
            <MaterialCommunityIcons name="corn" size={20} color="#4CAF50" style={{marginRight: 6}} />
            <Text style={[styles.macroLabel, {color: '#4CAF50'}]}>Karbonhidrat</Text>
            <Text style={[styles.macroValue, {marginLeft: 8}]}>{totalCarbs}g</Text>
            <Text style={styles.macroPercent}>{macroPercentages.carbs}%</Text>
          </View>
          <ProgressBar progress={macroPercentages.carbs/100} color="#4CAF50" style={styles.progressBar} />
          <View style={[styles.macroItem, {flexDirection: 'row', alignItems: 'center'}]}>
            <MaterialCommunityIcons name="peanut" size={20} color="#F44336" style={{marginRight: 6}} />
            <Text style={[styles.macroLabel, {color: '#F44336'}]}>Yağ</Text>
            <Text style={[styles.macroValue, {marginLeft: 8}]}>{totalFat}g</Text>
            <Text style={styles.macroPercent}>{macroPercentages.fat}%</Text>
          </View>
          <ProgressBar progress={macroPercentages.fat/100} color="#F44336" style={styles.progressBar} />
        </View>
      </View>

      {/* Öğünler */}
      <View style={styles.mealsSection}>
        <Text style={styles.sectionTitle}>Öğünler</Text>
        {MEAL_ORDER.map((mealType) => {
          // Eğer meal.type yoksa backend'den meal objesine type eklenmeli
          const meal = meals.find((m) => m.type === mealType.type);
          return (
            <View key={mealType.type} style={styles.mealItem}>
              <View style={styles.mealHeader}>
                <View style={[styles.iconCircle, { backgroundColor: mealType.color + '22' }] }>
                  <MaterialCommunityIcons name={mealType.icon as any} size={24} color={mealType.color} />
                </View>
                <Text style={styles.mealName}>{mealType.label}</Text>
                <Text style={styles.mealTime}>{meal?.time || ''}</Text>
              </View>
              {/* Besin isimleri */}
              {meal && meal.foods && Array.isArray(meal.foods) && meal.foods.length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6, marginLeft: 8 }}>
                  {meal.foods.map((food: any, idx: number) => (
                    <Chip
                      key={food.name + idx}
                      style={{
                        backgroundColor: '#F0F4FF',
                        marginRight: 6,
                        marginBottom: 4,
                        borderRadius: 12,
                        paddingHorizontal: 4,
                      }}
                      textStyle={{ color: '#333', fontWeight: 'bold' }}
                      icon={() => <MaterialCommunityIcons name="silverware-fork-knife" size={16} color="#2196F3" />}
                    >
                      {food.name}
                    </Chip>
                  ))}
                </View>
              )}
              {meal && meal.name && (!meal.foods || meal.foods.length === 0) && (
                <Chip
                  style={{
                    backgroundColor: '#F0F4FF',
                    marginLeft: 8,
                    marginBottom: 6,
                    borderRadius: 12,
                    paddingHorizontal: 4,
                  }}
                  textStyle={{ color: '#333', fontWeight: 'bold' }}
                  icon={() => <MaterialCommunityIcons name="silverware-fork-knife" size={16} color="#2196F3" />}
                >
                  {meal.name}
                </Chip>
              )}
              {meal ? (
                <View style={styles.mealMacros}>
                  <Chip icon="fire" style={styles.mealChip}>{meal.calories} kcal</Chip>
                  <View style={styles.mealMacroValues}>
                    <View style={{flexDirection:'row', alignItems:'center', marginRight:10}}>
                      <MaterialCommunityIcons name="food-steak" size={16} color="#FF9800" />
                      <Text style={[styles.mealMacroText, {color:'#FF9800', marginLeft:3}]}>P: {meal.protein}g</Text>
                    </View>
                    <View style={{flexDirection:'row', alignItems:'center', marginRight:10}}>
                      <MaterialCommunityIcons name="corn" size={16} color="#4CAF50" />
                      <Text style={[styles.mealMacroText, {color:'#4CAF50', marginLeft:3}]}>K: {meal.carbs}g</Text>
                    </View>
                    <View style={{flexDirection:'row', alignItems:'center'}}>
                      <MaterialCommunityIcons name="peanut" size={16} color="#F44336" />
                      <Text style={[styles.mealMacroText, {color:'#F44336', marginLeft:3}]}>Y: {meal.fat}g</Text>
                    </View>
                  </View>
                </View>
              ) : (
                <Text style={styles.emptyMealsText}>Kayıt yok</Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  summaryCard: {
    flexDirection: 'row',
    marginVertical: 10,
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 18,
  },
  calorieCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  calorieValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  calorieLabel: {
    fontSize: 14,
    color: '#666',
  },
  macrosContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  macroItem: {
    marginBottom: 8,
  },
  macroLabel: {
    fontSize: 14,
    color: '#666',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  macroPercent: {
    position: 'absolute',
    right: 0,
    fontSize: 12,
    color: '#666',
  },
  progressBarContainer: {
    marginTop: 4,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  mealsSection: {
    marginTop: 10,
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  mealItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#f8f8f8',
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  mealTime: {
    fontSize: 14,
    color: '#666',
  },
  mealMacros: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  mealChip: {
    height: 30,
  },
  mealMacroValues: {
    flexDirection: 'row',
  },
  mealMacroText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 10,
  },
  emptyMealsText: {
    textAlign: 'center',
    color: '#888',
    marginVertical: 20,
    fontStyle: 'italic',
  },
  iconCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 10, },
}); 