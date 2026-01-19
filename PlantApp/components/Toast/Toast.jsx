import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';

const iconMap = {
  success: 'https://img.icons8.com/color/48/000000/ok--v1.png',
  error: 'https://img.icons8.com/color/48/000000/high-priority.png',
  warning: 'https://img.icons8.com/color/48/000000/error--v1.png',
  info: 'https://img.icons8.com/color/48/000000/info--v1.png',
};

const borderColorMap = {
  success: '#4BB543',
  error: '#FF3B30',
  warning: '#FFA500',
  info: '#007AFF',
};

const Toast = ({
  type = 'success', // success, error, warning, info
  text1 = 'Please check your email, you will receive further instructions.',
  duration = 3000,
  onHide,
}) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide();
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [slideAnim, fadeAnim, duration, onHide]);

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
          borderLeftColor: borderColorMap[type] || '#4BB543',
        },
      ]}
    >
      <Image source={{ uri: iconMap[type] }} style={styles.icon} />
      <View style={styles.textContainer}>
        <Text style={styles.titleText}>{type.toUpperCase()}</Text>
        <Text style={styles.messageText}>{text1}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 40,
    left: '5%',
    right: '5%',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    zIndex: 10000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
  },
  icon: {
    width: 24,
    height: 24,
    marginTop: 4,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  titleText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    textTransform: 'capitalize',
  },
  messageText: {
    color: '#666',
    fontSize: 13,
    marginTop: 2,
  },
});

export default Toast;
