import { View, ScrollView, StyleSheet } from 'react-native';
import React from 'react';
import { useAuth } from '../../src/context/AuthContext';
import { Card } from '../../src/components/Card';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { theme } from '../../src/theme/theme';
import { StyleGuide } from '../../src/styles/StyleGuide';

export default function PersonalInfoScreen() {
  const { user } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Input
          label="Ad Soyad"
          value={user?.name || ''}
          editable={false}
        />
        <Input
          label="E-posta"
          value={user?.email || ''}
          editable={false}
        />
        <Input
          label="Yaş"
          value={user?.age?.toString() || ''}
          editable={false}
        />
        <Input
          label="Boy"
          value={user?.height?.toString() || ''}
          editable={false}
        />
        <Input
          label="Kilo"
          value={user?.weight?.toString() || ''}
          editable={false}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
    padding: StyleGuide.layout.screenPadding,
  },
  card: {
    marginBottom: StyleGuide.layout.spacing,
  },
}); 