// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import LoginScreen from './screens/LoginScreen';
// import RegisterScreen from './screens/RegisterScreen';

// const Stack = createNativeStackNavigator();

// export default function AuthStack() {
//   return (
//     <Stack.Navigator
//       screenOptions={{
//         animation: 'slide_from_right', // 👈 Slide left-to-right
//       }}
//       initialRouteName="Login"
//     >
//       <Stack.Screen name="Login" component={LoginScreen} />
//       <Stack.Screen name="Register" component={RegisterScreen} />
//       {/* <Stack.Screen name="Home" component={HomeScreen} /> */}
//     </Stack.Navigator>
//   );
// }

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import ToastManager from './components/Toast/ToastManager';
import SearchResults from './screens/SearchResults';
import ProductDescription from './screens/ProductDescription';
import CartScreen from './screens/CartScreen';
import UserProfile from './screens/UserProfile';
import EditProfileScreen from './screens/EditProfileScreen';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {StatusBar} from 'react-native';
import FavoritesScreen from './screens/FavouriteScreen';
import SplashScreen from './screens/SplashScreen';

const Stack = createStackNavigator();

// Custom transition for slide-in from the right
const forSlide = ({
  current,
  next,
  layouts,
}: {
  current: any;
  next?: any;
  layouts: any;
}) => {
  return {
    cardStyle: {
      transform: [
        {
          translateX: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [layouts.screen.width, 0], // Slide in from right
          }),
        },
        {
          translateX: next
            ? next.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -layouts.screen.width], // Slide out to left
              })
            : 0,
        },
      ],
    },
  };
};
const commonHeaderOptions = {
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
};

function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{flex: 1}}>
        <NavigationContainer>
          <ToastManager />
          <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
          <Stack.Navigator
            initialRouteName="SplashScreen"
            screenOptions={{
              cardStyleInterpolator: forSlide,
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
            }}>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="SearchResults"
              component={SearchResults}
              options={{headerTitle: 'Search Result'}}
            />
            <Stack.Screen
              name="ProductDescription"
              component={ProductDescription}
              options={{
                headerTitle: 'Product Description',
              }}
            />
            <Stack.Screen
              name="UserProfile"
              component={UserProfile}
              options={{
                headerTitle: 'User Profile',
                headerBackTitle: 'Go Ahead',
              }}
            />

            <Stack.Screen
              name="CartScreen"
              component={CartScreen}
              options={{
                headerTitle: 'My Cart',
              }}
            />

            <Stack.Screen
              name="EditProfileScreen"
              component={EditProfileScreen}
              options={{
                headerTitle: 'Edit Profile',
              }}
            />
            <Stack.Screen
              name="FavouriteScreen"
              component={FavoritesScreen}
              options={{
                headerTitle: 'Favourite Screen',
              }}
            />
            <Stack.Screen
              name="SplashScreen"
              component={SplashScreen}
              options={{ headerShown: false }}
            />

          </Stack.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

export default App;
