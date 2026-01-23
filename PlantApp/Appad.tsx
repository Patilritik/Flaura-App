import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AuthNavigator from './navigator/AuthNavigator';
import AppNavigator from './navigator/AppNavigator';

const RootStack = createStackNavigator();

export default function Appad() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <RootStack.Navigator screenOptions={{ headerShown: false }}>
            
            {/* NO bottom tabs */}
            <RootStack.Screen name="Auth" component={AuthNavigator} />

            {/* Bottom tabs enabled */}
            <RootStack.Screen name="App" component={AppNavigator} />

          </RootStack.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
