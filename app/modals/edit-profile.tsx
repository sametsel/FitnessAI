import { View, StyleSheet, Alert, ScrollView, Text } from 'react-native';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { Card } from '../../src/components/Card';
import { theme } from '../../src/theme';
import { StyleGuide } from '../../src/styles/StyleGuide';
import { Picker } from '@react-native-picker/picker';

export default function EditProfileScreen() {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    age: user?.age || '',
    height: user?.height || '',
    weight: user?.weight || '',
    gender: user?.gender || 'erkek',
    activityLevel: user?.activityLevel || 'hareketsiz'
  });

  const activityLevels = [
    { label: 'Hareketsiz', value: 'hareketsiz' },
    { label: 'Az Hareketli', value: 'azHareketli' },
    { label: 'Orta Derece Aktif', value: 'ortaAktif' },
    { label: 'Çok Aktif', value: 'cokAktif' }
  ];

  const handleUpdate = async () => {
    try {
      if (!formData.name || !formData.age || !formData.height || !formData.weight) {
        Alert.alert('Hata', 'Lütfen tüm alanları doldurunuz');
        return;
      }

      await updateProfile(formData);
      Alert.alert('Başarılı', 'Profiliniz güncellendi');
      router.back();
    } catch (error) {
      Alert.alert('Hata', 'Güncelleme başarısız oldu');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Input
          label="Ad Soyad"
          value={formData.name}
          onChangeText={(text) => setFormData({...formData, name: text})}
          placeholder="Ad Soyad giriniz"
        />

        <Input
          label="Yaş"
          value={formData.age}
          onChangeText={(text) => setFormData({...formData, age: text})}
          placeholder="Yaşınızı giriniz"
          keyboardType="numeric"
        />

        <Input
          label="Boy (cm)"
          value={formData.height}
          onChangeText={(text) => setFormData({...formData, height: text})}
          placeholder="Boyunuzu giriniz"
          keyboardType="numeric"
        />

        <Input
          label="Kilo (kg)"
          value={formData.weight}
          onChangeText={(text) => setFormData({...formData, weight: text})}
          placeholder="Kilonuzu giriniz"
          keyboardType="numeric"
        />

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Cinsiyet</Text>
          <Picker
            selectedValue={formData.gender}
            onValueChange={(value) => setFormData({...formData, gender: value})}
            style={styles.picker}
          >
            <Picker.Item label="Erkek" value="erkek" />
            <Picker.Item label="Kadın" value="kadin" />
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Aktivite Seviyesi</Text>
          <Picker
            selectedValue={formData.activityLevel}
            onValueChange={(value) => setFormData({...formData, activityLevel: value})}
            style={styles.picker}
          >
            {activityLevels.map((level) => (
              <Picker.Item 
                key={level.value} 
                label={level.label} 
                value={level.value} 
              />
            ))}
          </Picker>
        </View>

        <Button
          title="Güncelle"
          onPress={handleUpdate}
          style={styles.button}
        />

        <Button
          title="İptal"
          onPress={() => router.back()}
          variant="secondary"
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  card: {
    margin: StyleGuide.layout.screenPadding,
    padding: StyleGuide.layout.padding,
  },
  pickerContainer: {
    marginBottom: StyleGuide.layout.spacing,
  },
  label: {
    ...StyleGuide.typography.label,
    marginBottom: 5,
  },
  picker: {
    backgroundColor: theme.colors.surface,
    borderRadius: StyleGuide.borderRadius.medium,
  },
  button: {
    marginVertical: StyleGuide.layout.spacing,
  }
}); 