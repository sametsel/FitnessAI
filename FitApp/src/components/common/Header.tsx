import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';

interface HeaderProps {
  greeting: string;
  showCalendar?: boolean;
  onCalendarPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  greeting, 
  showCalendar = false,
  onCalendarPress 
}) => {
  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.headerGradient}
    >
      <View style={styles.container}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>{greeting}</Text>
        </View>
        
        {showCalendar && (
          <TouchableOpacity 
            style={styles.calendarButton} 
            onPress={onCalendarPress}
          >
            <MaterialCommunityIcons 
              name="calendar" 
              size={24} 
              color={theme.colors.white} 
            />
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerGradient: {
    marginHorizontal: -16,
    marginTop: -16,
    paddingHorizontal: 20,
    paddingVertical: 25,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  calendarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 