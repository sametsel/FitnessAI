import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';

interface ActivityCardProps {
  title: string;
  subtitle?: string;
  icon: string;
  iconColor?: string;
  backgroundColor?: string;
  onPress?: () => void;
  duration?: string;
  calories?: string;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  title,
  subtitle,
  icon,
  iconColor = theme.colors.primary,
  backgroundColor = theme.colors.cardBackground,
  onPress,
  duration,
  calories,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={icon as any} size={24} color={iconColor} />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        
        {(duration || calories) && (
          <View style={styles.statsContainer}>
            {duration && (
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
                <Text style={styles.statText}>{duration}</Text>
              </View>
            )}
            
            {calories && (
              <View style={styles.statItem}>
                <Ionicons name="flame-outline" size={14} color={theme.colors.textSecondary} />
                <Text style={styles.statText}>{calories}</Text>
              </View>
            )}
          </View>
        )}
      </View>
      
      <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: theme.colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontFamily: theme.fonts.medium,
    fontSize: 16,
    color: theme.colors.text,
  },
  subtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  statText: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
}); 