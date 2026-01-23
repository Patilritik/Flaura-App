import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import InputField from '../components/InputField';
import axios from 'axios';
import ToastManager from '../components/Toast/ToastManager';
import API_BASE_URL from '../apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create Animated TouchableOpacity
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const LoginScreen = ({ navigation }) => {
  console.log('LoginScreen Navigation prop:', navigation); // Debug: Check if navigation is defined

  const [email, setEmail] = useState('ritik@gmail.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);

  // Animation values
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const subHeaderOpacity = useRef(new Animated.Value(0)).current;
  const emailTranslateY = useRef(new Animated.Value(50)).current;
  const passwordTranslateY = useRef(new Animated.Value(50)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const socialButtonsOpacity = useRef(new Animated.Value(0)).current;
  const loaderTextOpacity = useRef(new Animated.Value(1)).current;

  // Check if all required fields are filled
  const isFormValid = email.trim() !== '' && password.trim() !== '';

  // Initial animations (run once on mount)
  useEffect(() => {
    Animated.parallel([
      // Header fade-in
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      // Subheader fade-in (delayed)
      Animated.timing(subHeaderOpacity, {
        toValue: 1,
        duration: 500,
        delay: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      // Input fields slide-in
      Animated.timing(emailTranslateY, {
        toValue: 0,
        duration: 600,
        delay: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(passwordTranslateY, {
        toValue: 0,
        duration: 600,
        delay: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      // Sign In button fade-in (after input fields)
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 500,
        delay: 1100, // Start after password animation (600ms + 500ms)
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      // Social buttons fade-in
      Animated.timing(socialButtonsOpacity, {
        toValue: 1,
        duration: 700,
        delay: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []); // Empty dependency array to run once on mount

  // Loader text fade loop (depends on loading state)
  useEffect(() => {
    const fadeLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(loaderTextOpacity, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(loaderTextOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    if (loading) {
      fadeLoop.start();
    } else {
      fadeLoop.stop();
      loaderTextOpacity.setValue(1); // Reset opacity when not loading
    }

    return () => fadeLoop.stop(); // Cleanup on unmount
  }, [loading]);

  // Button press animation
  const handleButtonPressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.97, // Subtle scale down
      friction: 7, // Controls bounciness
      tension: 100, // Controls speed
      useNativeDriver: true,
    }).start();
  };

  const handleButtonPressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1, // Return to original size
      friction: 7,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}api/login`, {
        email,
        password,
      });
      ToastManager.show({
        message: 'Login successfull!',
        type: 'success',
        duration: 4000,
      });
      await AsyncStorage.setItem('token', response?.data?.token);
      await AsyncStorage.setItem('email', response?.data?.email);
      await AsyncStorage.setItem('userId', response?.data?.userId);
      navigation.navigate('Home');
    } catch (error) {
      console.log("Login error:", error?.response?.data);
      ToastManager.show({
        message:
          error?.response?.data?.message || 'Invalid credentials. Try again!',
        type: 'error',
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Loader */}
      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Animated.Text style={[styles.loaderText, { opacity: loaderTextOpacity }]}>
            Logging in...
          </Animated.Text>
        </View>
      )}

      {/* Header */}
      <Animated.Text style={[styles.headerText, { opacity: headerOpacity }]}>
        Plants Fresher
      </Animated.Text>
      <Animated.Text style={[styles.subHeaderText, { opacity: subHeaderOpacity }]}>
        LET'S GET STARTED!
      </Animated.Text>

      {/* Input Fields */}
      <Animated.View style={{ transform: [{ translateY: emailTranslateY }] }}>
        <InputField
          placeholder="oripio@gmail.com"
          placeholderTextColor="#A9A9A9"
          onChangeText={(text) => setEmail(text)}
          value={email}
          icon={require('../assets/email_icon.png')}
          showCheck={email.length > 0}
          editable={!loading}
        />
      </Animated.View>
      <Animated.View style={{ transform: [{ translateY: passwordTranslateY }] }}>
        <InputField
          placeholder="Enter your password"
          placeholderTextColor="#A9A9A9"
          onChangeText={(text) => {
            setPassword(text);
            console.log('Password:', text);
          }}
          value={password}
          secureTextEntry={true}
          icon={require('../assets/lock_icon.png')}
          showEye
          editable={!loading}
        />
      </Animated.View>

      {/* Forgot Password */}
      <TouchableOpacity disabled={loading}>
        <Text style={styles.forgotPassword}>Forget Password?</Text>
      </TouchableOpacity>

      {/* Sign In Button */}
      <AnimatedTouchableOpacity
        style={[
          styles.signUpButton,
          (!isFormValid || loading) && styles.disabledButton,
          { transform: [{ scale: buttonScale }], opacity: buttonOpacity },
        ]}
        onPress={handleSignIn}
        onPressIn={handleButtonPressIn}
        onPressOut={handleButtonPressOut}
        disabled={!isFormValid || loading}
        activeOpacity={1}
      >
        <Text style={styles.signUpButtonText}>Sign In</Text>
      </AnimatedTouchableOpacity>

      {/* Navigate to Register */}
      <TouchableOpacity onPress={() => navigation.navigate('Register')} disabled={loading}>
        <Text style={styles.registerLink}>Don't have an account? Register</Text>
      </TouchableOpacity>

      {/* Or Sign In With */}
      <Text style={styles.orSignInText}>Or sign in with</Text>

      {/* Social Buttons */}
      <Animated.View style={[styles.socialButtonsContainer, { opacity: socialButtonsOpacity }]}>
        <TouchableOpacity style={styles.socialButton} disabled={loading}>
          <Image
            source={require('../assets/google_icon.png')}
            style={styles.socialIcon}
          />
          <Text style={styles.socialButtonText}>Continue with Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton} disabled={loading}>
          <Image
            source={require('../assets/apple_icon.png')}
            style={styles.socialIcon}
          />
          <Text style={styles.socialButtonText}>Continue with Apple</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4CAF50',
    fontFamily: 'Poppins-Medium',
  },
  headerText: {
    fontSize: 20,
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'Poppins-ExtraBold',
  },
  subHeaderText: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  forgotPassword: {
    color: '#A9A9A9',
    textAlign: 'right',
    marginVertical: 10,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  signUpButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 10,
    marginVertical: 20,
  },
  disabledButton: {
    backgroundColor: '#A5D6A7',
  },
  signUpButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  registerLink: {
    color: '#4CAF50',
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  orSignInText: {
    textAlign: 'center',
    color: '#A9A9A9',
    marginVertical: 20,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  socialButtonsContainer: {
    alignItems: 'center',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 10,
    width: '100%',
    justifyContent: 'center',
  },
  socialIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  socialButtonText: {
    fontSize: 16,
    color: '#000000',
    fontFamily: 'Poppins-Medium',
  },
});

export default LoginScreen;