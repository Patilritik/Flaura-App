import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import colors from '../utils/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ToastManager from '../components/Toast/ToastManager';

const ProductDescription = ({route, navigation}) => {
  const {product} = route.params;
  const [productInfo, setProductInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Disable default navigation header
  //   useEffect(() => {
  //     navigation.setOptions({
  // //  psalm: false, // Remove default header
  //     });
  //   }, [navigation]);

  const getPlantInfo = async id => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}api/plants_info/${id}`);
      console.log('Plant info response:', response.data);
      setProductInfo(response.data);
    } catch (error) {
      console.error('Error fetching plant info:', error);
      setProductInfo(product); // Fallback to initial product data
    } finally {
      setLoading(false);
    }
  };

  const getCartItemCount = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId'); // Example of getting user ID from AsyncStorage
      if (!userId) {
        setCartCount(0); // No user ID, no cart items
      }
      setLoading(true);
      const payload = {
        userId: userId,
        product_id: product._id,
      };
      const response = await axios.post(
        `${API_BASE_URL}api/get_cart_item`,
        payload,
      );
      setCartCount(response?.data?.cart_count || 100); // Set cart count from response
    } catch (error) {
      setCartCount(0); // Fallback to 0 on error
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        ToastManager.show({
          type: 'error',
          message: 'Please login to add favorites',
          duration: 3000,
        });
        return;
      }

      const previousState = isFavorite;
      setIsFavorite(!previousState); // Optimistic UI update
      const response = await axios.post(`${API_BASE_URL}api/toggle_favorite`, {
        userId,
        product_id: product._id,
      });

      ToastManager.show(
        {
          type: 'success',
          message: !previousState
            ? 'Added to Favorites'
            : 'Removed from Favorites',
        },
        1000,
      );
    } catch (error) {
      setIsFavorite(isFavorite); // Revert on error
      console.error('Favorite toggle error:', error);
    }
  };

  const checkIfFavorite = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        setIsFavorite(false);
        return;
      }
      const response = await axios.get(`${API_BASE_URL}api/check_favourites/${userId}/${product._id}`);
      setIsFavorite(response.data.isFavorite);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  }, [product._id]);

  useEffect(() => {
    getPlantInfo(product._id);
    getCartItemCount();
    checkIfFavorite();
  }, [product._id, checkIfFavorite]);

  const updateCartItem = async (userId, productId, cartCount) => {
    try {
      if (!userId) {
        ToastManager.show({
          type: 'error',
          message: 'User ID not found. Please log in.',
          duration: 3000,
        });
      }
      const payload = {userId, product_id: productId, cartCount};
      const response = await axios.post(
        `${API_BASE_URL}api/update_cart`,
        payload,
      );
      console.log('Cart item updated:', response.data);
      ToastManager.show({
        type: 'success',
        message:
          cartCount === 0
            ? `Item removed from cart: ${productInfo.commonName}`
            : `Item updated in cart: ${productInfo.commonName} (${cartCount})`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error updating cart item:', error);
      ToastManager.show({
        type: 'error',
        message: 'Failed to update cart. Please try again.',
        duration: 3000,
      });
    }
  };

  // Handle cart count increase
  const handleIncrease = async () => {
    if (cartCount < 20) {
      const newCount = cartCount + 1;
      setCartCount(newCount);
      // Replace 'user-id-placeholder' with actual user ID (e.g., from auth context)
      const userId = await AsyncStorage.getItem('userId'); // Example of getting user ID from AsyncStorage
      updateCartItem(userId, product._id, newCount);
    } else {
      ToastManager.show({
        type: 'error',
        message: 'You can add a maximum of 20 items to the cart.',
        duration: 3000,
      });
    }
  };

  // Handle cart count decrease
  const handleDecrease = async () => {
    if (cartCount > 0) {
      const newCount = cartCount - 1;
      setCartCount(newCount);
      const userId = await AsyncStorage.getItem('userId');
      updateCartItem(userId, product._id, newCount);
    } else {
      ToastManager.show({
        type: 'error',
        message: 'Cart count cannot be less than 0.',
        duration: 3000,
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primaryGreen} />
        <Text style={styles.loaderText}>Loading Product Details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Custom Header with Back Button and Cart Icon */}
      {/* <View style={styles.customHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Image
            source={require('../assets/back_arrow_icon.png')}
            style={styles.headerIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('CartScreen')} // Adjust navigation target as needed
          style={styles.headerButton}
        >
          <Image
            source={require('../assets/plant_notification_icon.png')} // Ensure you have a cart icon asset
            style={styles.headerIcon}
          />
        </TouchableOpacity>
      </View> */}

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}>
        {/* Product Image */}
        {(productInfo.image_url || productInfo.image) && (
          <View style={styles.imageContainer}>
            <Image
              source={{uri: productInfo.image_url || productInfo.image}}
              style={styles.productImage}
              resizeMode="cover"
            />
            {/* 4. Heart Icon Overlay */}
            <TouchableOpacity
              style={styles.favoriteBadge}
              onPress={toggleFavorite}
              activeOpacity={0.7}>
              <Image
                source={
                  isFavorite
                    ? require('../assets/heart_filled_icon.png')
                    : require('../assets/heart_blank_icon.png')
                }
                style={styles.headerIcon}
              />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.content}>
          {/* Product Name with Cart Control */}
          <View style={styles.nameContainer}>
            <Text style={styles.title}>
              {productInfo.commonName || 'Unnamed Product'}
            </Text>
            <View style={styles.cartControl}>
              <TouchableOpacity
                style={styles.cartButton}
                onPress={handleDecrease}>
                <Text style={styles.cartButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.cartCount}>{cartCount}</Text>
              <TouchableOpacity
                style={styles.cartButton}
                onPress={handleIncrease}>
                <Text style={styles.cartButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.subtitle}>
            {productInfo?.scientificName || 'Unknown Species'}
          </Text>

          {/* Description */}
          <Text style={styles.description}>
            {productInfo.description || 'No description available.'}
          </Text>

          {/* Requirements and Specifications Title */}
          <Text style={styles.sectionTitle}>
            Requirements and Specifications
          </Text>

          {/* Care Tips and Features */}
          <View style={styles.featuresContainer}>
            {productInfo.careTips?.light && (
              <View style={styles.featureRow}>
                <Image
                  source={require('../assets/sunlight_icon.png')}
                  style={styles.featureIcon}
                />
                <Text style={styles.featureText}>
                  <Text style={styles.featureLabel}>Light : </Text>
                  {productInfo.careTips.light}
                </Text>
              </View>
            )}
            {productInfo.careTips?.water && (
              <View style={styles.featureRow}>
                <Image
                  source={require('../assets/water_icon.png')}
                  style={styles.featureIcon}
                />
                <Text style={styles.featureText}>
                  <Text style={styles.featureLabel}>Water : </Text>
                  {productInfo.careTips.water}
                </Text>
              </View>
            )}
            {productInfo.careTips?.soil && (
              <View style={styles.featureRow}>
                <Image
                  source={require('../assets/soil_icon.png')}
                  style={styles.featureIcon}
                />
                <Text style={styles.featureText}>
                  <Text style={styles.featureLabel}>Soil : </Text>
                  {productInfo.careTips.soil}
                </Text>
              </View>
            )}
            {productInfo.careTips?.temperature && (
              <View style={styles.featureRow}>
                <Image
                  source={require('../assets/temperature_icon.png')}
                  style={styles.featureIcon}
                />
                <Text style={styles.featureText}>
                  <Text style={styles.featureLabel}>Temperature : </Text>
                  {productInfo.careTips.temperature}
                </Text>
              </View>
            )}
            {productInfo.maintenance && (
              <View style={styles.featureRow}>
                <Image
                  source={require('../assets/maintenance_icon.png')}
                  style={styles.featureIcon}
                />
                <Text style={styles.featureText}>
                  <Text style={styles.featureLabel}>Maintenance : </Text>
                  {productInfo.maintenance}
                </Text>
              </View>
            )}
            {productInfo.hasOwnProperty('airPurifying') && (
              <View style={styles.featureRow}>
                <Image
                  source={require('../assets/air_purify_icon.png')}
                  style={styles.featureIcon}
                />
                <Text style={styles.featureText}>
                  <Text style={styles.featureLabel}>Air Purifying : </Text>
                  {productInfo.airPurifying ? 'Yes' : 'No'}
                </Text>
              </View>
            )}
            {productInfo?.toxicity && (
              <View style={styles.featureRow}>
                <Image
                  source={require('../assets/toxicity.png')}
                  style={styles.featureIcon}
                />
                <Text style={styles.featureText}>
                  <Text style={styles.featureLabel}>Toxicity : </Text>
                  {productInfo.toxicity}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Fixed Footer with Price and Buy Button */}
      <View style={styles.fixedFooter}>
        <Text style={styles.price}>₹ {productInfo.price || 'N/A'}</Text>
        <TouchableOpacity style={styles.buyButton}>
          <Text style={styles.buyButtonText}>BUY NOW</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  customHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  headerButton: {
    padding: 10,
  },
  headerIcon: {
    width: 20,
    height: 20,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 60,
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
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  productImage: {
    width: 300,
    height: 400,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  favoriteBadge: {
    position: 'absolute',
    top: 0,
    right: 20, // Adjust based on your image width
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#000',
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Italic',
    color: '#555',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    lineHeight: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#000',
    marginBottom: 10,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#333',
    flex: 1,
  },
  featureLabel: {
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginRight: 5,
  },
  cartControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1f7e3',
    borderRadius: 25,
  },
  cartButton: {
    backgroundColor: colors.primaryGreen,
    width: 50,
    height: 50,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartButtonText: {
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  cartCount: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#000',
    width: 50,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  fixedFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#d1f7e3',
    padding: 15,
    borderWidth: 1,
    borderColor: '#2ecc71',
    margin: 10,
    borderRadius: 20,
  },
  price: {
    fontSize: 30,
    fontFamily: 'Poppins-SemiBold',
    color: colors.primaryGreen,
  },
  buyButton: {
    backgroundColor: colors.primaryGreen,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buyButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
});

export default ProductDescription;
