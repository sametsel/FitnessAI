import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '../../theme/theme';

interface WorkoutFilterProps {
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
}

export const WorkoutFilter: React.FC<WorkoutFilterProps> = ({
  activeFilter,
  onFilterChange,
}) => {
  const filters = [
    { id: null, label: 'Tümü' },
    { id: 'completed', label: 'Tamamlanan' },
    { id: 'upcoming', label: 'Yaklaşan' },
   
  ];

  return (
    <View style={styles.filterSection}>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.filtersContainer}
      >
        {filters.map((filter) => (
          <TouchableOpacity 
            key={`workout-filter-${filter.id || 'all'}`}
            style={[
              styles.filterChip,
              activeFilter === filter.id && styles.activeFilterChip
            ]} 
            onPress={() => onFilterChange(filter.id)}
          >
            <Text style={[
              styles.filterChipText,
              activeFilter === filter.id && styles.activeFilterChipText
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  filterSection: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  filtersContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterChip: {
    backgroundColor: theme.colors.gray200,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: theme.colors.primary,
  },
  filterChipText: {
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  activeFilterChipText: {
    color: theme.colors.white,
  },
}); 