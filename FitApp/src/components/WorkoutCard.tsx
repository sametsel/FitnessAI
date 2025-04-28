import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme/theme';
import { ProgressBar } from './ProgressBar';

export interface WorkoutCardProps {
  title: string;
  description?: string;
  image?: ImageSourcePropType;
  duration?: string;
  exercises?: number;
  progress?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  caloriesBurn: number;
  onPress?: () => void;
}

const difficultyLabels = {
  beginner: 'Başlangıç',
  intermediate: 'Orta',
  advanced: 'İleri'
};

export const WorkoutCard = ({
  title,
  description,
  image,
  duration,
  exercises,
  progress = 0,
  difficulty,
  caloriesBurn,
  onPress,
}: WorkoutCardProps) => {
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return theme.colors.success;
      case 'intermediate': return theme.colors.warning;
      case 'advanced': return theme.colors.error;
      default: return theme.colors.warning;
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      {image && (
        <View style={styles.imageContainer}>
          <Image source={image} style={styles.image} />
          <View style={styles.overlay} />
        </View>
      )}
      
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>{title}</Text>
          <View 
            style={[
              styles.difficultyBadge, 
              { backgroundColor: getDifficultyColor(difficulty) }
            ]}
          >
            <Text style={styles.difficultyText}>{difficultyLabels[difficulty]}</Text>
          </View>
        </View>
        
        {description && (
          <Text style={styles.description} numberOfLines={2}>{description}</Text>
        )}
        
        <View style={styles.detailsContainer}>
          {duration && (
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.detailText}>{duration}</Text>
            </View>
          )}
          
          {exercises !== undefined && (
            <View style={styles.detailItem}>
              <Ionicons name="fitness-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.detailText}>{exercises} egzersiz</Text>
            </View>
          )}
        </View>
        
        {progress > 0 && (
          <View style={styles.progressContainer}>
            <ProgressBar 
              progress={progress} 
              height={6} 
              color={theme.colors.primary}
              backgroundColor={theme.colors.gray100}
              width="100%"
            />
            <Text style={styles.progressText}>{`%${progress}`}</Text>
          </View>
        )}
        
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="flame-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>{caloriesBurn} kcal</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    height: 150,
    width: '100%',
    position: 'relative',
  },
  image: {
    height: '100%',
    width: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  contentContainer: {
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 18,
    color: theme.colors.text,
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  difficultyText: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: 'white',
    textTransform: 'capitalize',
  },
  description: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  detailsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressText: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
    textAlign: 'right',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
});
