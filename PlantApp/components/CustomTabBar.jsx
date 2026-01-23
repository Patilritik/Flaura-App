import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import colors from '../utils/colors';

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.bottomNav}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            // The `merge: true` option makes sure that the params inside the tab screen are preserved
            navigation.navigate({ name: route.name, merge: true });
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        let iconSource;
        if (route.name === 'Home') {
          iconSource = require('../assets/home_icon.png');
        } else if (route.name === 'Favorites') {
          iconSource = require('../assets/favourite_icon.png');
        } else if (route.name === 'Cart') {
          iconSource = require('../assets/cart_icon.png');
        } else if (route.name === 'UserProfile') {
          iconSource = require('../assets/account_icon.png');
        } else if (route.name === 'Primary') {
            // This is the middle button
            return (
                <TouchableOpacity
                    key={index}
                    style={styles.navPrimaryButton}
                    onPress={onPress}
                    onLongPress={onLongPress}
                >
                    <View style={styles.primaryCircle}>
                         <Image source={require('../assets/qrcode_icon.png')} style={styles.primaryIcon} />
                    </View>
                </TouchableOpacity>
            )
        }

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.navButton}
          >
             <Image 
                source={iconSource} 
                style={[
                    styles.navIcon, 
                    isFocused && { tintColor: colors.primaryGreen }
                ]} 
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navButton: {
    alignItems: 'center',
    padding: 5,
  },
  navPrimaryButton: {
    alignItems: 'center',
    padding: 5,
    transform: [{ translateY: -25 }], // Lift the central button
  },
  primaryCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  primaryIcon: {
    width: 28,
    height: 28,
    tintColor: '#fff',
  },
  navIcon: {
    width: 24,
    height: 24,
    tintColor: '#666',
  },
});

export default CustomTabBar;
