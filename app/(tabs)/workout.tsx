import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../src/theme';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { Header } from '../../src/components/Header';
import { StyleGuide } from '../../src/styles/StyleGuide';
import { SectionHeader } from '../../src/components/SectionHeader';

export default function WorkoutScreen() {
  return (
    <ScrollView style={styles.container}>
      <SectionHeader 
        title="Antrenman Programı" 
        subtitle="Günlük antrenman planınız"
      />

      <Card variant="interactive" style={styles.workoutCard}>
        <View style={styles.workoutHeader}>
          <MaterialIcons 
            name="fitness-center" 
            size={StyleGuide.icons.medium} 
            color={theme.colors.accent} 
          />
          <View style={styles.workoutInfo}>
            <Text style={StyleGuide.typography.h3}>Üst Vücut Antrenmanı</Text>
            <Text style={StyleGuide.typography.bodySmall}>
              8 egzersiz • 45 dakika
            </Text>
          </View>
        </View>
        <Button
          title="Başla"
          onPress={() => {}}
          variant="outline"
          size="small"
        />
      </Card>

      <Card variant="interactive" style={styles.workoutCard}>
        <View style={styles.workoutHeader}>
          <MaterialIcons 
            name="directions-run" 
            size={StyleGuide.icons.medium} 
            color={theme.colors.accent} 
          />
          <View style={styles.workoutInfo}>
            <Text style={StyleGuide.typography.h3}>Kardiyo Programı</Text>
            <Text style={StyleGuide.typography.bodySmall}>
              5 egzersiz • 30 dakika
            </Text>
          </View>
        </View>
        <Button
          title="Başla"
          onPress={() => {}}
          variant="outline"
          size="small"
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: StyleGuide.layout.screenPadding,
    backgroundColor: theme.colors.background.primary,
  },
  workoutCard: {
    marginBottom: StyleGuide.layout.containerSpacing,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: StyleGuide.layout.elementSpacing,
  },
  workoutInfo: {
    flex: 1,
    marginLeft: StyleGuide.layout.elementSpacing,
  }
}); 