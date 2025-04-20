import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../../src/context/AuthContext';
import { Picker } from '@react-native-picker/picker';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    height: '',
    weight: '',
    gender: 'erkek',
    activityLevel: 'sedanter',
    goal: 'form_koruma'
  });

  const { register, loading } = useAuth();

  const handleRegister = async () => {
    // Form validasyonu
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword ||
        !formData.age || !formData.height || !formData.weight) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurunuz');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor');
      return;
    }

    try {
      await register(formData);
      console.log('Kayıt başarılı, yönlendiriliyor...');
    } catch (error) {
      console.error('Kayıt hatası:', error);
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu';
      Alert.alert('Kayıt Başarısız', errorMessage);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Yeni Hesap Oluştur</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Ad Soyad"
          value={formData.name}
          onChangeText={(value) => setFormData(prev => ({ ...prev, name: value }))}
        />

        <TextInput
          style={styles.input}
          placeholder="E-posta"
          value={formData.email}
          onChangeText={(value) => setFormData(prev => ({ ...prev, email: value }))}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Şifre"
          value={formData.password}
          onChangeText={(value) => setFormData(prev => ({ ...prev, password: value }))}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Şifre Tekrar"
          value={formData.confirmPassword}
          onChangeText={(value) => setFormData(prev => ({ ...prev, confirmPassword: value }))}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Yaş"
          value={formData.age}
          onChangeText={(value) => setFormData(prev => ({ ...prev, age: value }))}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="Boy (cm)"
          value={formData.height}
          onChangeText={(value) => setFormData(prev => ({ ...prev, height: value }))}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="Kilo (kg)"
          value={formData.weight}
          onChangeText={(value) => setFormData(prev => ({ ...prev, weight: value }))}
          keyboardType="numeric"
        />

        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Cinsiyet</Text>
          <Picker
            selectedValue={formData.gender}
            onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
            style={styles.picker}
          >
            <Picker.Item label="Erkek" value="erkek" />
            <Picker.Item label="Kadın" value="kadın" />
            <Picker.Item label="Diğer" value="diger" />
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Aktivite Seviyesi</Text>
          <Picker
            selectedValue={formData.activityLevel}
            onValueChange={(value) => setFormData(prev => ({ ...prev, activityLevel: value }))}
            style={styles.picker}
          >
            <Picker.Item label="Hareketsiz" value="sedanter" />
            <Picker.Item label="Az Hareketli" value="hafif_aktif" />
            <Picker.Item label="Orta Derece Aktif" value="orta_aktif" />
            <Picker.Item label="Aktif" value="aktif" />
            <Picker.Item label="Çok Aktif" value="cok_aktif" />
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Hedef</Text>
          <Picker
            selectedValue={formData.goal}
            onValueChange={(value) => setFormData(prev => ({ ...prev, goal: value }))}
            style={styles.picker}
          >
            <Picker.Item label="Kilo Verme" value="kilo_verme" />
            <Picker.Item label="Kilo Alma" value="kilo_alma" />
            <Picker.Item label="Kas Kazanma" value="kas_kazanma" />
            <Picker.Item label="Form Koruma" value="form_koruma" />
          </Picker>
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.linkText}>Zaten hesabınız var mı? Giriş yapın</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  pickerContainer: {
    marginBottom: 15,
  },
  pickerLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#666',
  },
  picker: {
    width: '100%',
    height: 50,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#007AFF',
    fontSize: 16,
  },
}); 