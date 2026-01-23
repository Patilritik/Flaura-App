import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BottomTabs from './BottomTab';
import ProductDescription from '../screens/ProductDescription';
import SearchResults from '../screens/SearchResults';
import EditProfileScreen from '../screens/EditProfileScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      
      {/* Bottom tabs ALWAYS visible */}
      <Stack.Screen name="MainTabs" component={BottomTabs} />

      {/* These screens will still keep bottom tabs */}
      <Stack.Screen name="ProductDescription" component={ProductDescription} />
      <Stack.Screen name="SearchResults" component={SearchResults} />
      <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />

    </Stack.Navigator>
  );
}
