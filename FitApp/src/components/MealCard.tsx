import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { theme } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';

export interface MealCardProps {
  title: string;
  calories: number;
  prepTime: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  image: any;
  onPress: () => void;
}

const mealTypeIcons = {
  breakfast: 'sunny-outline',
  lunch: 'restaurant-outline',
  dinner: 'moon-outline',
  snack: 'cafe-outline'
};

const mealTypeLabels = {
  breakfast: 'Kahvaltı',
  lunch: 'Öğle Yemeği',
  dinner: 'Akşam Yemeği',
  snack: 'Atıştırmalık'
};

export const MealCard = ({
  title,
  calories,
  prepTime,
  mealType,
  image,
  onPress
}: MealCardProps) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Image source={image} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="flame-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>{calories} kcal</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>{prepTime}</Text>
          </View>
        </View>
        
        <View style={styles.mealTypeBadge}>
          <Ionicons name={mealTypeIcons[mealType]} size={14} color={theme.colors.primary} />
          <Text style={styles.mealTypeText}>{mealTypeLabels[mealType]}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  image: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  content: {
    padding: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.semiBold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  infoText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  mealTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.primaryLight,
  },
  mealTypeText: {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.primary,
    marginLeft: 4,
  },
}); 