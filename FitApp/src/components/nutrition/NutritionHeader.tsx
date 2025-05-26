import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format, addDays, subDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import { theme } from '../../theme/theme';

interface NutritionHeaderProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const greeting = () => {
  const hours = new Date().getHours();
  if (hours < 12) return 'Günaydın';
  if (hours < 18) return 'İyi günler';
  return 'İyi akşamlar';
};

export const NutritionHeader: React.FC<NutritionHeaderProps> = ({ selectedDate, onDateChange }) => {
  const navigateDate = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      onDateChange(addDays(selectedDate, 1));
    } else {
      onDateChange(subDays(selectedDate, 1));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>{greeting()}</Text>
      <View style={styles.dateContainer}>
        <TouchableOpacity onPress={() => navigateDate('prev')}>
          <MaterialCommunityIcons name="chevron-left" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.dateText}>
          {format(selectedDate, 'd MMMM yyyy')}
        </Text>
        <TouchableOpacity onPress={() => navigateDate('next')}>
          <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    color: theme.colors.text.primary,
    marginHorizontal: 16,
  },
}); 