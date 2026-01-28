import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import ProductCard from '../components/ProductCard';
import colors from '../utils/colors';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';

const { width } = Dimensions.get('window');

const FavoritesScreen = () => {
  const navigation = useNavigation();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFavorites = async () => {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}api/user/${userId}/favorites`,
      );
      setFavorites(response.data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setFavorites([]);
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

  const handleProductPress = item => {
    navigation.navigate('ProductDescription', {product: item});
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primaryGreen} />
        <Text style={styles.loaderText}>Loading Favorites...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Set StatusBar to non-translucent to prevent the content from creeping under the top bar */}
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
      
      {favorites.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          style={styles.scrollView}>
          <View style={styles.emptyCartContainer}>
            <Image
              source={require('../assets/cart_empty.png')} 
              style={styles.emptyCartImage}
            />
            <Text style={styles.emptyCartText}>Your Wishlist is Empty</Text>
            
            {/* FLAT BUTTON STYLE MATCHING CART/PROFILE */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Home')}
              activeOpacity={0.8}
              style={[styles.actionBtn, styles.primaryBtn, { marginTop: 30, width: width * 0.6 }]}>
              <Text style={styles.primaryBtnText}>Start Filling</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={favorites}
          numColumns={2}
          keyExtractor={item => item._id}
          renderItem={({item}) => (
            <TouchableOpacity 
              activeOpacity={0.9} 
              style={styles.cardWrapper}
              onPress={() => handleProductPress(item)}>
              <ProductCard data={[item]} />
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1, 
    marginTop: 70, 
    alignItems: 'center',
    // justifyContent: 'center', // This handles vertical centering
    paddingHorizontal: 20,
  },
  
  emptyCartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCartImage: {
    width: 220,
    height: 220,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  emptyCartText: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    textAlign: 'center',
  },

  /* FLAT BUTTON STYLES (EXACT MATCH TO CART) */
  actionBtn: {
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtn: {
    backgroundColor: colors.primaryGreen,
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
  },

  /* LIST STYLES */
  listContent: {
    paddingHorizontal: 15,
    paddingTop: 10, 
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  cardWrapper: {
    flex: 0.48,
    marginBottom: 15,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: colors.primaryGreen,
  },
});

export default FavoritesScreen;