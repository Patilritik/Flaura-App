import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from 'react-native';
import { PermissionsAndroid } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker'; 
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../utils/colors';
import ToastManager from '../components/Toast/ToastManager';

const { width } = Dimensions.get('window');

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userDetails } = route.params || {};

  const [formData, setFormData] = useState({
    name: userDetails?.name || '',
    email: userDetails?.email || '',
    phone: userDetails?.phone || '',
    address: userDetails?.address || '',
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handlePickImage = () => {
    const options = { mediaType: 'photo', quality: 0.8 };
    Alert.alert(
      'Update Profile Picture',
      'Choose a source:',
      [
        { text: 'Camera', onPress: () => launchCamera(options, onSelectResponse) },
        { text: 'Gallery', onPress: () => launchImageLibrary(options, onSelectResponse) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const onSelectResponse = (response) => {
    if (response.assets && response.assets.length > 0) {
      setSelectedImage(response.assets[0]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      const data = new FormData();
      data.append('name', formData.name);
      data.append('phone', formData.phone);
      data.append('address', formData.address);

      if (selectedImage) {
        data.append('avatar', {
          uri: Platform.OS === 'android' ? selectedImage.uri : selectedImage.uri.replace('file://', ''),
          type: selectedImage.type || 'image/jpeg',
          name: selectedImage.fileName || 'profile.jpg',
        });
      }

      const response = await axios.put(`${API_BASE_URL}api/user/${userId}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data) {
        ToastManager.show({ type: 'success', message: 'Profile updated!' });
        navigation.goBack();
      }
    } catch (error) {
      ToastManager.show({ type: 'error', message: 'Update failed' });
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        // behavior="padding" is usually best for iOS. 
        // behavior="height" or no behavior at all often works better for Android.
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        // Offset helps if you have a navigation header
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView
          // contentContainerStyle needs flexGrow: 1 so the content can expand
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Image Section */}
          <View style={styles.avatarSection}>
            <View style={styles.imageWrapper}>
              <Image
                source={{ 
                  uri: selectedImage?.uri || userDetails?.avatar || 'https://via.placeholder.com/150' 
                }}
                style={styles.avatarPreview}
              />
              <TouchableOpacity style={styles.cameraIconBtn} onPress={handlePickImage} activeOpacity={0.8}>
                 <Text style={{fontSize: 14}}>📷</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            <InputItem 
              label="Full Name" 
              value={formData.name} 
              onChangeText={(t) => handleInputChange('name', t)} 
              placeholder="Enter your name"
            />
            
            <InputItem 
              label="Email Address" 
              value={formData.email} 
              editable={false} 
              style={styles.disabledInput}
            />

            <InputItem 
              label="Phone Number" 
              value={formData.phone} 
              onChangeText={(t) => handleInputChange('phone', t)} 
              keyboardType="phone-pad"
              placeholder="Enter phone number"
            />

            <InputItem 
              label="Home Address" 
              value={formData.address} 
              onChangeText={(t) => handleInputChange('address', t)} 
              multiline
              placeholder="Enter your full address"
            />
          </View>

          {/* MATCHED ACTION BUTTON */}
          <TouchableOpacity
            style={[styles.actionBtn, styles.editBtn, loading && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.editBtnText}>Save Changes</Text>
            )}
          </TouchableOpacity>

          {/* Extra space at bottom to ensure inputs can scroll up above the keyboard */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const InputItem = ({ label, value, onChangeText, placeholder, editable = true, multiline = false, keyboardType = 'default', style }) => (
  <View style={styles.inputWrapper}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={[styles.textInput, multiline && styles.multiLine, style]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      editable={editable}
      multiline={multiline}
      keyboardType={keyboardType}
      placeholderTextColor="#BBB"
      // This helps with visibility when the keyboard is open
      onFocus={(e) => {}} 
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    // flexGrow is key to making the ScrollView work inside KeyboardAvoidingView
    flexGrow: 1, 
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  imageWrapper: {
    position: 'relative',
  },
  avatarPreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F3F3',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  cameraIconBtn: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: colors.primaryGreen,
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  formContainer: {
    marginBottom: 30,
  },
  inputWrapper: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 11,
    fontFamily: 'Poppins-Bold',
    color: colors.primaryGreen,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  textInput: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    borderBottomWidth: 1.5,
    borderBottomColor: '#F0F0F0',
    paddingVertical: 10,
  },
  multiLine: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  disabledInput: {
    color: '#AAA',
    borderBottomColor: '#F9F9F9',
  },
  actionBtn: {
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  editBtn: {
    backgroundColor: colors.primaryGreen,
    shadowColor: colors.primaryGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  editBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
});

export default EditProfileScreen;