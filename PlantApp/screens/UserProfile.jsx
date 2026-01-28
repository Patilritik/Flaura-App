import axios from 'axios';
import React, { useState, useCallback } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import API_BASE_URL from '../apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../utils/colors';
import ToastManager from '../components/Toast/ToastManager';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const UserProfile = () => {
  const [userDetails, setUserDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const getUserDetails = async () => {
    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) { setLoading(false); return; }
      const response = await axios.get(`${API_BASE_URL}api/user/${userId}`);
      if (response.data) setUserDetails(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userId');
    ToastManager.show({ type: 'success', message: 'Logged out', duration: 2000 });
    navigation.replace('Login');
  };

  useFocusEffect(useCallback(() => { getUserDetails(); }, []));

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primaryGreen} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Compact Header */}
        <View style={styles.headerBlock}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: userDetails?.avatar || 'https://via.placeholder.com/150' }}
              style={styles.avatar}
            />
          </View>
          <Text style={styles.userNameText}>{userDetails?.name || 'User'}</Text>
          <Text style={styles.userSubText}>{userDetails?.email || 'Not provided'}</Text>
        </View>

        {/* Content Section */}
        <View style={styles.contentArea}>
          <View style={styles.infoCard}>
            <Text style={styles.cardHeading}>Account Information</Text>
            <InfoItem label="Full Name" value={userDetails?.name} />
            <View style={styles.divider} />
            <InfoItem label="Phone Number" value={userDetails?.phone} />
            <View style={styles.divider} />
            <InfoItem label="Address" value={userDetails?.address} />
          </View>

          {/* EQUAL SIDE-BY-SIDE BUTTONS */}
          <View style={styles.buttonRow}>
            {/* Primary Action Button */}
            <TouchableOpacity 
              activeOpacity={0.8}
              style={[styles.btnBase, styles.primaryActionBtn]} 
              onPress={() => navigation.navigate('EditProfileScreen', { userDetails })}
            >
              <View style={styles.innerGlow}>
                <Text style={styles.primaryBtnText}>Edit Profile</Text>
              </View>
            </TouchableOpacity>

            {/* Secondary Action Button */}
            <TouchableOpacity 
              activeOpacity={0.7}
              style={[styles.btnBase, styles.secondaryActionBtn]} 
              onPress={handleLogout}
            >
              <Text style={styles.secondaryBtnText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const InfoItem = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue} numberOfLines={1}>{value || 'N/A'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  headerBlock: {
    backgroundColor: colors.primaryGreen,
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 60,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  avatarWrapper: {
    padding: 3,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 60,
    marginBottom: 10,
  },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: '#FFF' },
  userNameText: { fontSize: 22, fontFamily: 'Poppins-Bold', color: '#FFF' },
  userSubText: { fontSize: 13, fontFamily: 'Poppins-Regular', color: 'rgba(255,255,255,0.8)' },

  contentArea: { paddingHorizontal: 20, marginTop: -30 },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 30,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    marginBottom: 20,
  },
  cardHeading: { fontSize: 10, fontFamily: 'Poppins-Bold', color: colors.primaryGreen, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 15 },
  infoRow: { marginVertical: 6 },
  infoLabel: { fontSize: 11, fontFamily: 'Poppins-Regular', color: '#BBB' },
  infoValue: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#333' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 4 },

  /* EQUAL BUTTON STYLES */
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 15, // Space between buttons
  },
  btnBase: {
    flex: 1, // This ensures both buttons take exactly 50% of the available width
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryActionBtn: {
    backgroundColor: colors.primaryGreen,
    shadowColor: colors.primaryGreen,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  innerGlow: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(255,255,255,0.3)',
    borderRadius: 18,
  },
  primaryBtnText: { color: '#FFF', fontSize: 15, fontFamily: 'Poppins-Bold' },
  
  secondaryActionBtn: {
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#FEE2E2', // Very soft red border
  },
  secondaryBtnText: { color: '#FF5252', fontSize: 15, fontFamily: 'Poppins-Bold' },
});

export default UserProfile;