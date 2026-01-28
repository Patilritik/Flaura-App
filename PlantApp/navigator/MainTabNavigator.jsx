import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, Alert, Image, TouchableOpacity, Platform, PermissionsAndroid } from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import HomeScreen from '../screens/HomeScreen';
import FavoritesScreen from '../screens/FavouriteScreen';
import CartScreen from '../screens/CartScreen';
import UserProfile from '../screens/UserProfile';
import EditProfileScreen from '../screens/EditProfileScreen';
import CustomTabBar from '../components/CustomTabBar';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const PlaceholderScreen = () => (
  <View style={{ flex: 1, backgroundColor: 'white' }} />
  
);

// Create a nested stack for UserProfile tab
const UserProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name="UserProfileMain" component={UserProfile} options={{ headerShown: false }}/>
      <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

const MainTabNavigator = () => {
  // Camera options
  const cameraOptions = {
    mediaType: 'photo',
    saveToPhotos: true,
    quality: 0.8,
  };

  const requestCameraPermission = async () => {
    if (Platform.OS !== 'android') return true;
    const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
    return result === PermissionsAndroid.RESULTS.GRANTED;
  };

  const handleOpenCamera = async () => {
    const allowed = await requestCameraPermission();
    if (!allowed) {
      Alert.alert('Permission required', 'Enable camera permission to take a photo.');
      return;
    }
    launchCamera(cameraOptions, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Camera error', response.errorMessage || 'Failed to open camera');
        return;
      }
      // You can handle captured image in response.assets[0]
    });
  };

  return (
    <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={({ navigation }) => ({
            headerShown: true,
            headerTitleAlign: 'center',
            headerStyle: {
                backgroundColor: '#fff',
            },
            headerTitleStyle: {
                fontSize: 24,
                fontFamily: 'Poppins-Bold',
                color: '#333',
                fontWeight: '600',
                textAlign: 'center',
            },
            headerTintColor: '#333',
            // Default headerLeft for tabs that need it (can be overridden)
            headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.navigate('Home')} style={{ marginLeft: 15 }}>
                    <Image 
                        source={require('../assets/back_arrow_icon.png')} 
                        style={{ width: 24, height: 24, resizeMode: 'contain' }} 
                    />
                </TouchableOpacity>
            ),
        })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesScreen} 
        options={{ title: 'Favourite Screen' }}
      />
      <Tab.Screen 
        name="Primary" 
        component={PlaceholderScreen} 
        options={{ headerShown: false }} 
        listeners={{
            tabPress: (e) => {
                e.preventDefault();
                // Open camera on primary tab press
                handleOpenCamera();
            },
        }}
      />
      <Tab.Screen 
        name="Cart" 
        component={CartScreen} 
        options={{ title: 'My Cart' }}
      />
      <Tab.Screen 
        name="UserProfile" 
        component={UserProfileStack}
        options={{ title: 'User Profile' }}
      />
        {/* <Tab.Screen
          name="EditProfileScreen"
          component={EditProfileScreen}
          options={{ title: 'Edit Profile' }}
        /> */}
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
