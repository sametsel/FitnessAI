import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

interface MacronutrientsProps {
  protein: number;
  carbs: number;
  fat: number;
  size?: 'small' | 'medium' | 'large';
  showPercentage?: boolean;
  showLabels?: boolean;
}

export const Macronutrients: React.FC<MacronutrientsProps> = ({
  protein,
  carbs,
  fat,
  size = 'medium',
  showPercentage = true,
  showLabels = true,
}) => {
  // Makro besinlerin toplam kalori değerleri hesaplama
  const proteinCalories = protein * 4; // 1g protein = 4 kalori
  const carbsCalories = carbs * 4;     // 1g karbonhidrat = 4 kalori
  const fatCalories = fat * 9;         // 1g yağ = 9 kalori
  
  // Toplam kalori
  const totalCalories = proteinCalories + carbsCalories + fatCalories;
  
  // Yüzde hesapları
  const proteinPercentage = totalCalories > 0 ? Math.round((proteinCalories / totalCalories) * 100) : 0;
  const carbsPercentage = totalCalories > 0 ? Math.round((carbsCalories / totalCalories) * 100) : 0;
  const fatPercentage = totalCalories > 0 ? Math.round((fatCalories / totalCalories) * 100) : 0;
  
  // Boyuta göre stil ayarları
  const barHeight = size === 'small' ? 4 : size === 'medium' ? 8 : 12;
  const fontSize = size === 'small' ? theme.typography.fontSizes.xs : 
                  size === 'medium' ? theme.typography.fontSizes.sm : 
                  theme.typography.fontSizes.md;
  
  return (
    <View style={styles.container}>
      {/* Makro besinler çubuk gösterimi */}
      <View style={[styles.macrosBar, { height: barHeight }]}>
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
      
      {/* Makro besinler detay gösterimi */}
      <View style={styles.macrosDetail}>
        <View style={styles.macroItem}>
          <View style={[styles.macroIcon, { backgroundColor: theme.colors.primary }]} />
          {showLabels && <Text style={[styles.macroLabel, { fontSize }]}>Protein</Text>}
          <Text style={[styles.macroValue, { fontSize }]}>
            {protein}g {showPercentage && `(${proteinPercentage}%)`}
          </Text>
        </View>
        
        <View style={styles.macroItem}>
          <View style={[styles.macroIcon, { backgroundColor: theme.colors.warning }]} />
          {showLabels && <Text style={[styles.macroLabel, { fontSize }]}>Karb</Text>}
          <Text style={[styles.macroValue, { fontSize }]}>
            {carbs}g {showPercentage && `(${carbsPercentage}%)`}
          </Text>
        </View>
        
        <View style={styles.macroItem}>
          <View style={[styles.macroIcon, { backgroundColor: theme.colors.danger }]} />
          {showLabels && <Text style={[styles.macroLabel, { fontSize }]}>Yağ</Text>}
          <Text style={[styles.macroValue, { fontSize }]}>
            {fat}g {showPercentage && `(${fatPercentage}%)`}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  macrosBar: {
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
    marginTop: 4,
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
    color: theme.colors.text.secondary,
    marginRight: 4,
  },
  macroValue: {
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.text.primary,
  },
}); 