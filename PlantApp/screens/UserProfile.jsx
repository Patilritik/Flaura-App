import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import API_BASE_URL from '../apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../utils/colors';
import ToastManager from '../components/Toast/ToastManager';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const UserProfile = () => {
  const [userDetails, setUserDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  const getUserDetails = async () => {
    setLoading(true);
    setError(null);
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

      const response = await axios.get(`${API_BASE_URL}api/user/${userId}`);
      if (response.data) {
        setUserDetails(response.data);
      } else {
        setError('No user details found.');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError('Failed to fetch user details. Please try again.');
      ToastManager.show({
        type: 'error',
        message: 'Failed to fetch user details.',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userId');
      ToastManager.show({
        type: 'success',
        message: 'Logged out successfully.',
        duration: 3000,
      });
      navigation.replace('Login'); // Replace with your login screen route
    } catch (error) {
      console.error('Error during logout:', error);
      ToastManager.show({
        type: 'error',
        message: 'Failed to log out. Please try again.',
        duration: 3000,
      });
    }
  };

  const handleEditDetails = () => {
    navigation.navigate('EditProfileScreen', { userDetails }); // Replace with your edit profile screen route
  };

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('HomeScreen'); // Navigate to home if no back history
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      getUserDetails();
    }, [])
  ); // Refresh data every time screen is focused

  return (
    <SafeAreaView style={styles.container}>
      {/* <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBackPress}
          style={styles.backButton}>
          <Image
            source={require('../assets/back_arrow_icon.png')}
            style={styles.headerIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>User Profile</Text>
      </View> */}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primaryGreen} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={getUserDetails}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* User Avatar */}
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: userDetails?.avatar || 'https://via.placeholder.com/150' }}
              style={styles.avatar}
            />
          </View>

          {/* User Details Card */}
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>{userDetails?.name || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{userDetails?.email || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>{userDetails?.phone || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Address</Text>
              <Text style={styles.value}>{userDetails.address || 'N/A'}</Text>
            </View>
          </View>

          {/* Edit Details Button */}
          <TouchableOpacity style={styles.editButton} onPress={handleEditDetails}>
            <Text style={styles.editButtonText}>Edit Details</Text>
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: StatusBar.currentHeight, 
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
    paddingTop: 10, // Adjusted to account for header height
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#d9534f',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primaryGreen,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: colors.primaryGreen,
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
  value: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    flex: 1,
    textAlign: 'right',
  },
  editButton: {
    backgroundColor: colors.primaryGreen,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginBottom: 10, // Space between Edit and Logout buttons
  },
  editButtonText: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  logoutButton: {
    backgroundColor: '#d9534f',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  logoutButtonText: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  bottomSpacer: {
    height: 20,
  },
});

export default UserProfile;