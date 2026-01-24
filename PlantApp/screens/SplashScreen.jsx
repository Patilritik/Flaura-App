import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import colors from '../utils/colors';

const SplashScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      const token = AsyncStorage.getItem('userToken');
      if (token) {
        navigation.replace('Home'); // ya HomeScreen
      } else {  
      navigation.replace('Login'); // ya LoginScreen
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.primaryGreen} barStyle="light-content" />

      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/app_logo.png')}
          style={styles.logo}
        />
        <Text style={styles.appName}>Plantify</Text>
        <Text style={styles.tagline}>Grow Green, Live Clean 🌱</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Loading...</Text>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryGreen,
    justifyContent: 'space-between',
  },

  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    resizeMode: 'contain',
  },

  appName: {
    fontSize: 32,
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },

  tagline: {
    fontSize: 14,
    color: '#e6ffe6',
    marginTop: 8,
    fontFamily: 'Poppins-Regular',
  },

  footer: {
    paddingBottom: 30,
    alignItems: 'center',
  },

  footerText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    opacity: 0.8,
  },
});

export default SplashScreen;
