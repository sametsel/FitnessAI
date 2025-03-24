import { View, StyleSheet, Alert, ScrollView, Text } from 'react-native';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Button } from '../src/components/Button';
import { Input } from '../src/components/Input';
import { Card } from '../src/components/Card';
import { theme } from '../src/theme';
import { StyleGuide } from '../src/styles/StyleGuide';
import { Picker } from '@react-native-picker/picker';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  age: string;
  height: string;
  weight: string;
  gender: 'erkek' | 'kadin';
  activityLevel: 'hareketsiz' | 'azHareketli' | 'ortaAktif' | 'cokAktif';
}

export default function RegisterScreen() {
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    height: '',
    weight: '',
    gender: 'erkek',
    activityLevel: 'hareketsiz'
  });

  const { register, loading, error } = useAuth();

  const activityLevels = [
    { label: 'Hareketsiz', value: 'hareketsiz' },
    { label: 'Az Hareketli', value: 'azHareketli' },
    { label: 'Orta Derece Aktif', value: 'ortaAktif' },
    { label: 'Çok Aktif', value: 'cokAktif' }
  ];

  const handleRegister = async () => {
    try {
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword ||
          !formData.age || !formData.height || !formData.weight) {
        Alert.alert('Hata', 'Tüm alanları doldurunuz');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        Alert.alert('Hata', 'Şifreler eşleşmiyor');
        return;
      }

      await register(formData.name, formData.email, formData.password);
      router.replace('/(tabs)');
    } catch (err) {
      Alert.alert('Hata', 'Kayıt başarısız. Lütfen bilgilerinizi kontrol edin.');
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
          label="E-posta"
          value={formData.email}
          onChangeText={(text) => setFormData({...formData, email: text})}
          placeholder="E-posta adresinizi giriniz"
          keyboardType="email-address"
        />

        <Input
          label="Şifre"
          value={formData.password}
          onChangeText={(text) => setFormData({...formData, password: text})}
          placeholder="Şifrenizi giriniz"
          secureTextEntry
        />

        <Input
          label="Şifre Tekrar"
          value={formData.confirmPassword}
          onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
          placeholder="Şifrenizi tekrar giriniz"
          secureTextEntry
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
          <Text style={StyleGuide.typography.label}>Cinsiyet</Text>
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
          <Text style={StyleGuide.typography.label}>Aktivite Seviyesi</Text>
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
          title="Kayıt Ol"
          onPress={handleRegister}
          loading={loading}
          style={styles.button}
        />

        <Button
          title="Geri Dön"
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
  picker: {
    backgroundColor: theme.colors.surface,
    borderRadius: StyleGuide.borderRadius.medium,
  },
  button: {
    marginVertical: StyleGuide.layout.spacing,
  }
}); 