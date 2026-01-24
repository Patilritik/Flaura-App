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
  Platform
} from 'react-native';
import { PermissionsAndroid } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
// Import both Camera and Library functions
import { launchImageLibrary, launchCamera } from 'react-native-image-picker'; 
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../utils/colors';
import ToastManager from '../components/Toast/ToastManager';

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

  const requestMediaPermission = async () => {
    if (Platform.OS !== 'android') return true;

    const mediaPermission = Platform.Version >= 33
      ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
      : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

    const result = await PermissionsAndroid.request(mediaPermission);
    return result === PermissionsAndroid.RESULTS.GRANTED;
  };

  const requestCameraPermission = async () => {
    if (Platform.OS !== 'android') return true;
    const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
    return result === PermissionsAndroid.RESULTS.GRANTED;
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  /**
   * Opens an Alert to let user choose between Camera or Gallery
   */
  const handlePickImage = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 1000,
      maxWidth: 1000,
      quality: 0.8,
    };

    const pickFromGallery = async () => {
      const allowed = await requestMediaPermission();
      if (!allowed) {
        Alert.alert('Permission required', 'Enable photo library permission to pick an image.');
        return;
      }
      launchImageLibrary(options, onSelectResponse);
    };

    const takePhoto = async () => {
      const cameraAllowed = await requestCameraPermission();
      const mediaAllowed = await requestMediaPermission();
      if (!cameraAllowed || !mediaAllowed) {
        Alert.alert('Permission required', 'Enable camera and storage permission to take a photo.');
        return;
      }
      launchCamera(options, onSelectResponse);
    };

    Alert.alert(
      'Update Profile Picture',
      'Select a source for your image:',
      [
        {
          text: 'Camera',
          onPress: takePhoto,
        },
        {
          text: 'Gallery',
          onPress: pickFromGallery,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  /**
   * Handles the response from both Camera and Gallery
   */
  const onSelectResponse = (response) => {
    if (response.didCancel) {
      console.log('User cancelled selection');
    } else if (response.errorCode) {
      console.log('Picker Error: ', response.errorMessage);
      Alert.alert('Error', 'Could not access media: ' + response.errorMessage);
    } else if (response.assets && response.assets.length > 0) {
      const asset = response.assets[0];
      setSelectedImage(asset);
    }
  };

 const handleSave = async () => {
    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      const data = new FormData();
      
      // Append text data
      data.append('name', formData.name);
      data.append('phone', formData.phone);
      data.append('address', formData.address);

      // Append image data
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.select({ ios: 80, android: (StatusBar.currentHeight || 0) + 60 })}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Image Picker Section */}
          <View style={styles.avatarPickerContainer}>
            <View style={styles.imageWrapper}>
              <Image
                source={{ 
                  uri: selectedImage?.uri || userDetails?.avatar || 'https://via.placeholder.com/150' 
                }}
                style={styles.avatarPreview}
              />
              <TouchableOpacity style={styles.editBadge} onPress={handlePickImage}>
                <Text style={styles.editBadgeText}>Edit</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.avatarLabel}>Profile Picture</Text>
          </View>

          <View style={styles.formContainer}>
            {/* Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => handleInputChange('name', text)}
                placeholder="Enter your name"
                placeholderTextColor="#888"
              />
            </View>

            {/* Email Input (Non-editable) */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={formData.email}
                editable={false}
                placeholderTextColor="#888"
              />
            </View>

            {/* Phone Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => handleInputChange('phone', text)}
                placeholder="Enter your phone number"
                placeholderTextColor="#888"
                keyboardType="phone-pad"
              />
            </View>

            {/* Address Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={formData.address}
                onChangeText={(text) => handleInputChange('address', text)}
                placeholder="Enter your address"
                placeholderTextColor="#888"
                multiline
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: StatusBar.currentHeight,
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  avatarPickerContainer: {
    alignItems: 'center',
    marginVertical: 25,
  },
  imageWrapper: {
    position: 'relative',
  },
  avatarPreview: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#e1e1e1',
    borderWidth: 3,
    borderColor: '#fff',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primaryGreen,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  editBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  avatarLabel: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#666',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  inputDisabled: {
    backgroundColor: '#f0f0f0',
    color: '#888',
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: colors.primaryGreen,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  saveButtonDisabled: {
    backgroundColor: '#a5d6a7',
  },
  saveButtonText: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  bottomSpacer: {
    height: 20,
  },
});

export default EditProfileScreen;