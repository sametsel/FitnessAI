import React from 'react';
import { View, Text, StyleSheet, Image, ImageStyle } from 'react-native';
import { Surface } from 'react-native-paper';
import { theme } from '../../theme/theme';

interface FoodItemProps {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image: string;
}

export const FoodItem: React.FC<FoodItemProps> = ({
  name,
  portion,
  calories,
  protein,
  carbs,
  fat,
  image,
}) => {
  return (
    <Surface style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: image }} style={styles.image as ImageStyle} />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.portion}>{portion}</Text>
      </View>
      <View style={styles.macrosContainer}>
        <Text style={styles.calories}>{calories} kcal</Text>
        <View style={styles.macroRow}>
          <Text style={styles.macroText}>P: {protein}g</Text>
          <Text style={styles.macroText}>K: {carbs}g</Text>
          <Text style={styles.macroText}>Y: {fat}g</Text>
        </View>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
    elevation: 2,
  },
  imageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text.primary,
  },
  portion: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  macrosContainer: {
    alignItems: 'flex-end',
  },
  calories: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  macroRow: {
    flexDirection: 'row',
  },
  macroText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginLeft: 8,
  },
}); 