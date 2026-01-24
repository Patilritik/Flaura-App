import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator, // Added ScrollView for empty state consistency
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import ProductCard from '../components/ProductCard';
import colors from '../utils/colors'; // Ensure colors is imported
import axios from 'axios';
import API_BASE_URL from '../apiConfig';

const FavoritesScreen = () => {
  const navigation = useNavigation();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      const stored = await AsyncStorage.getItem('favorites');
      if (stored) {
        setFavorites(JSON.parse(stored));
      } else {
        setFavorites([]);
      }
    });

    return unsubscribe;
  }, [navigation]);

  const handleProductPress = item => {
    navigation.navigate('ProductDescription', {product: item});
  };

  const fetchFavorites = async () => {
    const userId = await AsyncStorage.getItem('userId');
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}api/user/${userId}/favorites`,
      );
      const data = await response.data;
      console.log('Daaa', data);
      setFavorites(data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);  
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchFavorites();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    fetchFavorites();
  }, []);


  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primaryGreen} />
        <Text style={styles.loaderText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Title is usually nice to keep, but for exact match we use ScrollView logic */}
      {favorites.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollView}>
          <View style={styles.emptyCartContainer}>
            <Image
              source={require('../assets/cart_empty.png')} // Reusing your empty asset
              style={styles.emptyCartImage}
            />
            <Text style={styles.emptyCartText}>Your Wishlist is Empty</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Home')}
              style={styles.emptyButton}>
              <Text style={styles.cartButtonText}>Shop Now</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <>
          <FlatList
            data={favorites}
            numColumns={2}
            keyExtractor={item => item._id}
            renderItem={({item}) => (
              <TouchableOpacity onPress={() => handleProductPress(item)}>
                {/* Note: Ensure ProductCard handles single items correctly */}
                <ProductCard data={[item]} />
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingHorizontal: 10, paddingBottom: 80}}
          />
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    // Removed paddingTop: StatusBar.currentHeight to match CartScreen behavior
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#000',
    marginBottom: 10,
  },
  // --- Replicated styles from CartScreen ---
  scrollView: {
    flex: 1,
    marginTop: 20,
    marginBottom: 80,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1, // Ensures content centers in the screen
  },
  emptyCartContainer: {
    flex: 1,
    alignItems: 'center',
  },
  emptyCartImage: {
    width: 300,
    height: 400,
  },
  emptyCartText: {
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
    color: colors.primaryGreen,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: colors.primaryGreen,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  cartButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: colors.primaryGreen,
  },
});

export default FavoritesScreen;
