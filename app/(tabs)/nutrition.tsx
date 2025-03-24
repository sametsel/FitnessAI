import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../src/theme';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { Header } from '../../src/components/Header';
import { StyleGuide } from '../../src/styles/StyleGuide';

export default function NutritionScreen() {
  return (
    <ScrollView style={styles.container}>
      <Header title="Beslenme Planı" />

      <View style={styles.mealSection}>
        <Text style={StyleGuide.typography.h2}>Günlük Öğünler</Text>
        
        <Card variant="elevated" style={styles.mealCard}>
          <View style={styles.mealContent}>
            <View style={styles.mealTime}>
              <MaterialIcons name="wb-sunny" size={24} color={theme.colors.accent} />
              <Text style={styles.mealTimeText}>Kahvaltı</Text>
            </View>
            <View style={styles.mealInfo}>
              <Text style={styles.mealCalories}>450 kcal</Text>
            </View>
          </View>
          <Button
            title="Detaylar"
            onPress={() => {}}
            variant="outline"
            size="small"
          />
        </Card>

        <Card variant="elevated" style={styles.mealCard}>
          <View style={styles.mealContent}>
            <View style={styles.mealTime}>
              <MaterialIcons name="brightness-5" size={24} color={theme.colors.accent} />
              <Text style={styles.mealTimeText}>Öğle Yemeği</Text>
            </View>
            <View style={styles.mealInfo}>
              <Text style={styles.mealCalories}>650 kcal</Text>
            </View>
          </View>
          <Button
            title="Detaylar"
            onPress={() => {}}
            variant="outline"
            size="small"
          />
        </Card>

        <Card variant="elevated" style={styles.mealCard}>
          <View style={styles.mealContent}>
            <View style={styles.mealTime}>
              <MaterialIcons name="brightness-4" size={24} color={theme.colors.accent} />
              <Text style={styles.mealTimeText}>Akşam Yemeği</Text>
            </View>
            <View style={styles.mealInfo}>
              <Text style={styles.mealCalories}>550 kcal</Text>
            </View>
          </View>
          <Button
            title="Detaylar"
            onPress={() => {}}
            variant="outline"
            size="small"
          />
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: StyleGuide.layout.screenPadding,
    backgroundColor: theme.colors.background.secondary,
  },
  mealSection: {
    marginBottom: StyleGuide.layout.sectionSpacing,
  },
  mealCard: {
    marginBottom: StyleGuide.layout.containerSpacing,
  },
  mealContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: StyleGuide.layout.elementSpacing,
  },
  mealTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealTimeText: {
    ...StyleGuide.typography.body,
    marginLeft: StyleGuide.layout.elementSpacing,
  },
  mealInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealCalories: {
    ...StyleGuide.typography.bodySmall
  },
}); 