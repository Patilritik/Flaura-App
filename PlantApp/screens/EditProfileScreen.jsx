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
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../utils/colors';
import ToastManager from '../components/Toast/ToastManager';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userDetails } = route.params || {}; // Passed from UserProfile

  const [formData, setFormData] = useState({
    name: userDetails?.name || '',
    email: userDetails?.email || '',
    phone: userDetails?.phone || '',
    address: userDetails?.address || '',
    avatar: userDetails?.avatar || '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        ToastManager.show({
          type: 'error',
          message: 'User ID not found. Please log in again.',
          duration: 3000,
        });
        setLoading(false);
        return;
      }

      const response = await axios.put(`${API_BASE_URL}api/user/${userId}`, formData);
      if (response.data) {
        ToastManager.show({
          type: 'success',
          message: 'Profile updated successfully.',
          duration: 3000,
        });
        navigation.goBack(); // Navigate back to UserProfile
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      ToastManager.show({
        type: 'error',
        message: error.response?.data?.message || 'Failed to update profile. Please try again.',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              'Go Back',
              'Are you sure you want to go back? Any unsaved changes will be lost.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Confirm', onPress: () => navigation.goBack() },
              ],
              { cancelable: true }
            )
          }
          style={styles.backButton}>
          <Image
            source={require('../assets/back_arrow_icon.png')}
            style={styles.headerIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>Edit Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
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
              onChangeText={(text) => handleInputChange('email', text)}
              placeholder="Enter your email"
              placeholderTextColor="#888"
              keyboardType="email-address"
              editable={false} // Email is non-editable to avoid login conflicts
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

          {/* Avatar URL Input (Optional) */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Avatar URL (Optional)</Text>
            <TextInput
              style={styles.input}
              value={formData.avatar}
              onChangeText={(text) => handleInputChange('avatar', text)}
              placeholder="Enter avatar image URL"
              placeholderTextColor="#888"
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    zIndex: 1,
  },
  backButton: {
    position: 'absolute',
    left: 20,
  },
  headerIcon: {
    width: 30,
    height: 30,
  },
  headerText: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    textAlign: 'center',
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 80, // Adjusted for header height
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
    padding: 10,
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
  },
  saveButtonDisabled: {
    backgroundColor: '#a5d6a7', // Lighter shade when disabled
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