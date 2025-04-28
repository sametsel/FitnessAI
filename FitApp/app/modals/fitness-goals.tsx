import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../src/theme/theme';
import { StyleGuide } from '../../src/styles/StyleGuide';

export default function FitnessGoalsScreen() {
  return (
    <View style={styles.container}>
      <Text style={StyleGuide.typography.h2}>Fitness Hedeflerim</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: StyleGuide.layout.screenPadding,
    backgroundColor: theme.colors.background.default,
  },
}); 