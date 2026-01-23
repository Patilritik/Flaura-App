import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Alert, Image, TouchableOpacity } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import FavoritesScreen from '../screens/FavouriteScreen';
import CartScreen from '../screens/CartScreen';
import UserProfile from '../screens/UserProfile';
import CustomTabBar from '../components/CustomTabBar';

const Tab = createBottomTabNavigator();

const PlaceholderScreen = () => (
  <View style={{ flex: 1, backgroundColor: 'white' }} />
);

const MainTabNavigator = () => {
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
                Alert.alert("Primary Action", "This feature is coming soon!");
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
        component={UserProfile} 
        options={{ title: 'User Profile' }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
