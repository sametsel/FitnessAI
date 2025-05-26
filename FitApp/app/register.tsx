import { View, StyleSheet, Alert, ScrollView, Text } from 'react-native';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useAuth } from '../src/context/AuthContext';
import { Button } from '../src/components/Button';
import { Input } from '../src/components/Input';
import { Card } from '../src/components/Card';
import { theme } from '../src/theme/theme';
import { StyleGuide } from '../src/styles/StyleGuide';
import { Picker } from '@react-native-picker/picker';
import type { RegisterFormData, Goal, ActivityLevel, Gender } from 'src/types/index';

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
    activityLevel: 'sedanter',
    goals: 'form_koruma',
    experienceLevel: '1',
    injuries: '0',
    availableEquipment: '1',
    timeAvailability: '60',
    preferredWorkoutTime: '1'
  });

  const { register, loading } = useAuth();

  const activityLevels: { label: string; value: ActivityLevel }[] = [
    { label: 'Hareketsiz', value: 'sedanter' },
    { label: 'Az Hareketli', value: 'hafif_aktif' },
    { label: 'Orta Derece Aktif', value: 'orta_aktif' },
    { label: 'Aktif', value: 'aktif' },
    { label: 'Çok Aktif', value: 'cok_aktif' }
  ];

  const goals: { label: string; value: Goal }[] = [
    { label: 'Kilo Verme', value: 'kilo_verme' },
    { label: 'Kilo Alma', value: 'kilo_alma' },
    { label: 'Kas Kazanma', value: 'kas_kazanma' },
    { label: 'Form Koruma', value: 'form_koruma' }
  ];

  const genders: { label: string; value: Gender }[] = [
    { label: 'Erkek', value: 'erkek' },
    { label: 'Kadın', value: 'kadın' },
    { label: 'Diğer', value: 'diger' }
  ];


  const validateForm = (): boolean => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword ||
        !formData.age || !formData.height || !formData.weight || !formData.experienceLevel ||
        !formData.injuries || !formData.availableEquipment || !formData.timeAvailability ||
        !formData.preferredWorkoutTime) {
      Alert.alert('Hata', 'Tüm alanları doldurunuz');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor');
      return false;
    }

    const age = parseInt(formData.age);
    const height = parseInt(formData.height);
    const weight = parseInt(formData.weight);

    if (isNaN(age) || age < 13 || age > 100) {
      Alert.alert('Hata', 'Geçerli bir yaş giriniz (13-100)');
      return false;
    }

    if (isNaN(height) || height < 100 || height > 250) {
      Alert.alert('Hata', 'Geçerli bir boy giriniz (100-250 cm)');
      return false;
    }

    if (isNaN(weight) || weight < 30 || weight > 300) {
      Alert.alert('Hata', 'Geçerli bir kilo giriniz (30-300 kg)');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      await register(formData);
      router.replace('/(tabs)');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Kayıt işlemi başarısız oldu';
      Alert.alert('Hata', errorMessage);
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
          autoCapitalize="none"
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
            {genders.map((gender) => (
              <Picker.Item 
                key={gender.value} 
                label={gender.label} 
                value={gender.value} 
              />
            ))}
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

        <View style={styles.pickerContainer}>
          <Text style={StyleGuide.typography.label}>Hedef</Text>
          <Picker
            selectedValue={formData.goals}
            onValueChange={(value) => setFormData({...formData, goals: value})}
            style={styles.picker}
          >
            {goals.map((goal) => (
              <Picker.Item 
                key={goal.value} 
                label={goal.label} 
                value={goal.value} 
              />
            ))}
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={StyleGuide.typography.label}>Deneyim Seviyesi</Text>
          <Picker
            selectedValue={formData.experienceLevel}
            onValueChange={(value) => setFormData({...formData, experienceLevel: value})}
            style={styles.picker}
          >
            
            
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={StyleGuide.typography.label}>Sakatlık Durumu</Text>
          <Picker
            selectedValue={formData.injuries}
            onValueChange={(value) => setFormData({...formData, injuries: value})}
            style={styles.picker}
          >
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={StyleGuide.typography.label}>Mevcut Ekipman</Text>
          <Picker
            selectedValue={formData.availableEquipment}
            onValueChange={(value) => setFormData({...formData, availableEquipment: value})}
            style={styles.picker}
          >

          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={StyleGuide.typography.label}>Antrenman Süresi</Text>
          <Picker
            selectedValue={formData.timeAvailability}
            onValueChange={(value) => setFormData({...formData, timeAvailability: value})}
            style={styles.picker}
          >
          
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={StyleGuide.typography.label}>Tercih Edilen Antrenman Zamanı</Text>
          <Picker
            selectedValue={formData.preferredWorkoutTime}
            onValueChange={(value) => setFormData({...formData, preferredWorkoutTime: value})}
            style={styles.picker}
          >
          
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
    backgroundColor: theme.colors.background.default,
  },
  card: {
    margin: StyleGuide.layout.screenPadding,
    padding: StyleGuide.layout.padding,
  },
  pickerContainer: {
    marginBottom: StyleGuide.layout.spacing,
  },
  picker: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: StyleGuide.borderRadius.medium,
  },
  button: {
    marginVertical: StyleGuide.layout.spacing,
  }
}); 