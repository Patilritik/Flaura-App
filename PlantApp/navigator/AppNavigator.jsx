import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BottomTabs from './BottomTab';
import ProductDescription from '../screens/ProductDescription';
import SearchResults from '../screens/SearchResults';
import EditProfileScreen from '../screens/EditProfileScreen';
import UserProfile from '../screens/UserProfile';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      
      {/* Bottom tabs container */}
      <Stack.Screen name="MainTabs" component={BottomTabs} />

      {/* Screens that should hide bottom tabs */}
      <Stack.Screen 
        name="ProductDescription" 
        component={ProductDescription}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen 
        name="SearchResults" 
        component={SearchResults}
        options={{ presentation: 'card' }}
      />

    </Stack.Navigator>
  );
}
