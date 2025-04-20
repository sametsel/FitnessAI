import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, ViewStyle, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { Button } from '../../src/components/Button';
import { Picker } from '@react-native-picker/picker';
import { User } from '../../src/types';
import { Card } from '../../src/components/Card';
import { Input } from '../../src/components/Input';
import { theme } from '../../src/theme/theme';
import { StyleGuide } from '../../src/styles/StyleGuide';

export default function EditProfile() {
  const { user, updateProfile, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    age: user?.age?.toString() || '',
    height: user?.height?.toString() || '',
    weight: user?.weight?.toString() || '',
    gender: user?.gender || 'erkek',
    activityLevel: user?.activityLevel || 'sedanter',
    goal: user?.goal || 'form_koruma',
  });

  const handleSave = async () => {
    try {
      const updatedData: Partial<User> = {
        name: formData.name,
        age: parseInt(formData.age),
        height: parseInt(formData.height),
        weight: parseInt(formData.weight),
        gender: formData.gender as User['gender'],
        activityLevel: formData.activityLevel as User['activityLevel'],
        goal: formData.goal,
      };

      await updateProfile(updatedData);
      Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi');
      router.back();
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Hata', error.message);
      } else {
        Alert.alert('Hata', 'Profil güncellenirken bir hata oluştu');
      }
    }
  };

  const updateFormData = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const buttonStyle = { ...styles.button } as ViewStyle;
  const cancelButtonStyle = { ...styles.button, ...styles.cancelButton } as ViewStyle;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Güncelleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Input
          label="Ad Soyad"
          value={formData.name}
          onChangeText={(text) => updateFormData('name', text)}
          placeholder="Ad Soyad giriniz"
        />

        <Input
          label="Yaş"
          value={formData.age}
          onChangeText={(text) => updateFormData('age', text)}
          placeholder="Yaşınızı giriniz"
          keyboardType="numeric"
        />

        <Input
          label="Boy (cm)"
          value={formData.height}
          onChangeText={(text) => updateFormData('height', text)}
          placeholder="Boyunuzu giriniz"
          keyboardType="numeric"
        />

        <Input
          label="Kilo (kg)"
          value={formData.weight}
          onChangeText={(text) => updateFormData('weight', text)}
          placeholder="Kilonuzu giriniz"
          keyboardType="numeric"
        />

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Cinsiyet</Text>
          <Picker
            selectedValue={formData.gender}
            onValueChange={(value) => updateFormData('gender', value)}
            style={styles.picker}
          >
            <Picker.Item label="Erkek" value="erkek" />
            <Picker.Item label="Kadın" value="kadın" />
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Aktivite Seviyesi</Text>
          <Picker
            selectedValue={formData.activityLevel}
            onValueChange={(value) => updateFormData('activityLevel', value)}
            style={styles.picker}
          >
            <Picker.Item label="Sedanter (Hareketsiz)" value="sedanter" />
            <Picker.Item label="Hafif Aktif" value="hafif_aktif" />
            <Picker.Item label="Orta Aktif" value="orta_aktif" />
            <Picker.Item label="Çok Aktif" value="cok_aktif" />
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Hedef</Text>
          <Picker
            selectedValue={formData.goal}
            onValueChange={(value) => updateFormData('goal', value)}
            style={styles.picker}
          >
            <Picker.Item label="Form Koruma" value="form_koruma" />
            <Picker.Item label="Kilo Verme" value="kilo_verme" />
            <Picker.Item label="Kilo Alma" value="kilo_alma" />
            <Picker.Item label="Kas Kazanma" value="kas_kazanma" />
          </Picker>
        </View>

        <Button
          title="Güncelle"
          onPress={handleSave}
          loading={loading}
          style={styles.button}
        />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
    padding: StyleGuide.layout.screenPadding,
  },
  card: {
    padding: StyleGuide.layout.padding,
  },
  button: {
    marginTop: StyleGuide.layout.spacing,
  },
  pickerContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#666',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  cancelButtonText: {
    color: '#ff4444',
  },
}); 