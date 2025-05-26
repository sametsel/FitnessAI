import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../theme/theme';
import { LinearGradient } from 'expo-linear-gradient';

interface WorkoutHeaderProps {
  greeting: string;
}

export const WorkoutHeader: React.FC<WorkoutHeaderProps> = ({ greeting }) => {
  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.headerGradient}
    >
      <View style={styles.container}>
        <Text style={styles.greeting}>{greeting}</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerGradient: {
    marginHorizontal: -16,
    marginTop: -16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  container: {
    marginBottom: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
}); 