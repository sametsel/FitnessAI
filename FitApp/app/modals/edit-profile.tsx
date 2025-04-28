import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ViewStyle, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { Button } from '../../src/components/Button';
import { Picker } from '@react-native-picker/picker';
import { User } from '../../src/types';
import { Card } from '../../src/components/Card';
import { Input } from '../../src/components/Input';
import { theme } from '../../src/theme/theme';
import { StyleGuide } from '../../src/styles/StyleGuide';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome } from '@expo/vector-icons';

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
    profilePicture: user?.profilePicture || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [image, setImage] = useState<string | null>(user?.profilePicture || null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Ad Soyad alanı zorunludur';
    }

    if (!formData.age) {
      newErrors.age = 'Yaş alanı zorunludur';
    } else if (isNaN(Number(formData.age)) || Number(formData.age) < 15 || Number(formData.age) > 100) {
      newErrors.age = 'Geçerli bir yaş giriniz (15-100)';
    }

    if (!formData.height) {
      newErrors.height = 'Boy alanı zorunludur';
    } else if (isNaN(Number(formData.height)) || Number(formData.height) < 100 || Number(formData.height) > 250) {
      newErrors.height = 'Geçerli bir boy giriniz (100-250 cm)';
    }

    if (!formData.weight) {
      newErrors.weight = 'Kilo alanı zorunludur';
    } else if (isNaN(Number(formData.weight)) || Number(formData.weight) < 30 || Number(formData.weight) > 300) {
      newErrors.weight = 'Geçerli bir kilo giriniz (30-300 kg)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async () => {
    // İzinleri kontrol et
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Hata', 'Fotoğraf erişim izni verilmedi');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        const uri = selectedImage.uri;
        const base64Image = selectedImage.base64;

        if (base64Image) {
          const imageUri = `data:image/jpeg;base64,${base64Image}`;
          setImage(imageUri);
          setFormData(prev => ({ ...prev, profilePicture: imageUri }));
        } else {
          setImage(uri);
          setFormData(prev => ({ ...prev, profilePicture: uri }));
        }
      }
    } catch (error) {
      console.error('Resim seçerken hata oluştu:', error);
      Alert.alert('Hata', 'Resim seçilirken bir hata oluştu');
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Hata', 'Lütfen form alanlarını kontrol ediniz');
      return;
    }

    try {
      const updatedData: Partial<User> = {
        name: formData.name,
        age: parseInt(formData.age),
        height: parseInt(formData.height),
        weight: parseInt(formData.weight),
        gender: formData.gender as User['gender'],
        activityLevel: formData.activityLevel as User['activityLevel'],
        goal: formData.goal,
        profilePicture: formData.profilePicture,
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
    // Hata mesajını temizle
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Güncelleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        {/* Profil Fotoğrafı Seçimi */}
        <View style={styles.profileImageContainer}>
          <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <FontAwesome name="user" size={50} color="#cccccc" />
              </View>
            )}
            <View style={styles.editIconContainer}>
              <FontAwesome name="camera" size={16} color="#ffffff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.changePhotoText}>Profil fotoğrafını değiştir</Text>
        </View>

        <Input
          label="Ad Soyad"
          value={formData.name}
          onChangeText={(text) => updateFormData('name', text)}
          placeholder="Ad Soyad giriniz"
          error={errors.name}
        />

        <Input
          label="Yaş"
          value={formData.age}
          onChangeText={(text) => updateFormData('age', text)}
          placeholder="Yaşınızı giriniz"
          keyboardType="numeric"
          error={errors.age}
        />

        <Input
          label="Boy (cm)"
          value={formData.height}
          onChangeText={(text) => updateFormData('height', text)}
          placeholder="Boyunuzu giriniz"
          keyboardType="numeric"
          error={errors.height}
        />

        <Input
          label="Kilo (kg)"
          value={formData.weight}
          onChangeText={(text) => updateFormData('weight', text)}
          placeholder="Kilonuzu giriniz"
          keyboardType="numeric"
          error={errors.weight}
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
    color: theme.colors.text.secondary,
  },
  picker: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    backgroundColor: theme.colors.background.paper,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.default,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imageContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  changePhotoText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
}); 