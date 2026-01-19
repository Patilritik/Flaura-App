import React, { useState } from 'react';
import { View, TextInput, Image, TouchableOpacity, StyleSheet } from 'react-native';

const InputField = ({
  placeholder,
  placeholderTextColor,
  onChangeText,
  value,
  secureTextEntry: initialSecureTextEntry,
  icon,
  showCheck,
  showEye,
}) => {
  const [showPassword, setShowPassword] = useState(!initialSecureTextEntry);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <View style={styles.container}>
      <Image source={icon} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        onChangeText={onChangeText}
        value={value}
        secureTextEntry={!showPassword} // Toggle based on state
      />
      {/* {showCheck && (
        <Image
        //   source={require('../assets/check_icon.png')}
          style={styles.checkIcon}
        />
      )} */}
      {showEye && (
        <TouchableOpacity onPress={togglePasswordVisibility}>
          <Image
            source={
              showPassword
                ? require('../assets/eye_open_icon.png') // Show "eye closed" when password is visible
                : require('../assets/eye_close_icon.png') // Show "eye open" when password is hidden
            }
            style={styles.eyeIcon}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#000000',
  },
  checkIcon: {
    width: 24,
    height: 24,
    tintColor: '#4CAF50',
  },
  eyeIcon: {
    width: 24,
    height: 24,
    marginLeft: 10,
  },
});

export default InputField;