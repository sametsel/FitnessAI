import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../src/theme';
import { StyleGuide } from '../../src/styles/StyleGuide';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={StyleGuide.typography.h1}>Hoş Geldiniz</Text>
      <Text style={StyleGuide.typography.bodySmall}>
        Bugünkü aktivitelerinizi görüntüleyin
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    padding: StyleGuide.layout.screenPadding,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 