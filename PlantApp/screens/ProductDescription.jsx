import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import colors from '../utils/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ToastManager from '../components/Toast/ToastManager';

const {width, height} = Dimensions.get('window');

const ProductDescription = ({route, navigation}) => {
  const {product} = route.params;
  const [productInfo, setProductInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // --- LOGIC PRESERVED ---
  const getPlantInfo = async id => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}api/plants_info/${id}`);
      console.log("object" , response.data)
      setProductInfo(response.data);
    } catch (error) {
      console.error('Error fetching plant info:', error);
      setProductInfo(product);
    } finally {
      setLoading(false);
    }
  };

  const getCartItemCount = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        setCartCount(0);
        return;
      }
      const payload = { userId, product_id: product._id };
      const response = await axios.post(`${API_BASE_URL}api/get_cart_item`, payload);
      setCartCount(response?.data?.cart_count || 0);
    } catch (error) {
      setCartCount(0);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        ToastManager.show({ type: 'error', message: 'Please login to add favorites', duration: 3000 });
        return;
      }
      const previousState = isFavorite;
      setIsFavorite(!previousState);
      await axios.post(`${API_BASE_URL}api/toggle_favorite`, { userId, product_id: product._id });
      ToastManager.show({ type: 'success', message: !previousState ? 'Added to Favorites' : 'Removed from Favorites' }, 1000);
    } catch (error) {
      setIsFavorite(!isFavorite);
    }
  };

  const checkIfFavorite = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) { setIsFavorite(false); return; }
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
        ToastManager.show({ type: 'error', message: 'User ID not found. Please log in.', duration: 3000 });
        return;
      }
      await axios.post(`${API_BASE_URL}api/update_cart`, {userId, product_id: productId, cartCount});
      ToastManager.show({
        type: 'success',
        message: cartCount === 0 ? `Item removed from cart` : `Cart updated: ${cartCount} items`,
        duration: 2000,
      });
    } catch (error) {
      console.error('Error updating cart item:', error);
    }
  };

  const handleIncrease = async () => {
    if (cartCount < 20) {
      const newCount = cartCount + 1;
      setCartCount(newCount);
      const userId = await AsyncStorage.getItem('userId');
      updateCartItem(userId, product._id, newCount);
    } else {
      ToastManager.show({type: 'error', message: 'Maximum 20 items allowed'});
    }
  };

  const handleDecrease = async () => {
    if (cartCount > 0) {
      const newCount = cartCount - 1;
      setCartCount(newCount);
      const userId = await AsyncStorage.getItem('userId');
      updateCartItem(userId, product._id, newCount);
    }
  };

  const handleBuyNow = async () => {
    console.log("gdkjsbakgjds" , cartCount)
    if (cartCount === 0) {
      const newCount = 1;
      setCartCount(newCount);
      const userId = await AsyncStorage.getItem('userId');
      updateCartItem(userId, product._id, newCount);
      console.log('Navigating to CartScreen with 1 item');

    }
    navigation.navigate('CartScreen');
  };





  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primaryGreen} />
        <Text style={styles.loaderText}>Loading Elegance...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      
      <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* HERO IMAGE SECTION */}
        <View style={styles.heroSection}>
          <Image source={{uri: productInfo.image_url || productInfo.image}} style={styles.heroImage} />
          
          {/* FLOATING FAVORITE BUTTON (Top Right) */}
          <TouchableOpacity onPress={toggleFavorite} style={styles.floatingFavBtn} activeOpacity={0.8}>
            <Image 
              source={isFavorite ? require('../assets/heart_filled_icon.png') : require('../assets/heart_blank_icon.png')} 
              style={styles.favIconStyle} 
            />
          </TouchableOpacity>
        </View>

        {/* CONTENT CARD */}
        <View style={styles.contentCard}>
          <View style={styles.dragIndicator} />
          
          <View style={styles.mainInfo}>
            <View style={{flex: 1, paddingRight: 10}}>
              <Text style={styles.productTitle}>{productInfo.commonName}</Text>
              <Text style={styles.speciesText}>{productInfo.scientificName}</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceValue}>₹{productInfo.price}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionBody}>
            {productInfo.description || 'This beautiful botanical piece is carefully selected for its health and aesthetic appeal. Ideal for enhancing your indoor environment.'}
          </Text>

          <Text style={styles.sectionTitle}>Plant Specifications</Text>
          <View style={styles.specGrid}>
            <SpecItem icon={require('../assets/sunlight_icon.png')} label="Light" val={productInfo.careTips?.light} />
            <SpecItem icon={require('../assets/water_icon.png')} label="Water" val={productInfo.careTips?.water} />
            <SpecItem icon={require('../assets/soil_icon.png')} label="Soil" val={productInfo.careTips?.soil} />
            <SpecItem icon={require('../assets/maintenance_icon.png')} label="Care" val={productInfo.maintenance} />
          </View>

          <View style={styles.extraInfoRow}>
            {productInfo.airPurifying && <View style={styles.tag}><Text style={styles.tagText}>🌿 Air Purifying</Text></View>}
            {productInfo.toxicity && <View style={[styles.tag, {backgroundColor: '#FFF1F0'}]}><Text style={[styles.tagText, {color: '#F5222D'}]}>⚠️ {productInfo.toxicity}</Text></View>}
          </View>
        </View>
      </ScrollView>

      {/* FOOTER BAR */}
      <View style={styles.footerContainer}>
        <View style={styles.quantityControl}>
          <TouchableOpacity onPress={handleDecrease} style={styles.qBtn}><Text style={styles.qText}>−</Text></TouchableOpacity>
          <Text style={styles.qCount}>{cartCount}</Text>
          <TouchableOpacity onPress={handleIncrease} style={styles.qBtn}><Text style={styles.qText}>+</Text></TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.checkoutBtn} activeOpacity={0.9} onPress={handleBuyNow}>
          <Text style={styles.checkoutText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Fixed Specification Sub-component
const SpecItem = ({icon, label, val}) => (
  <View style={styles.specBox}>
    <View style={styles.specIconWrap}>
      <Image source={icon} style={styles.specIcon} />
    </View>
    <View style={styles.specTextContent}>
      <Text style={styles.specLabel}>{label}</Text>
      <Text style={styles.specVal} numberOfLines={2}>{val || 'General'}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 15, fontFamily: 'Poppins-Medium', color: '#666' },
  scrollContent: { paddingBottom: 140 },

  // Hero Section
  heroSection: { height: height * 0.45, width: width, position: 'relative' },
  heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  floatingFavBtn: { 
    position: 'absolute', 
    top: 20, 
    right: 20, 
    backgroundColor: 'rgba(255,255,255,0.9)', 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6
  },
  favIconStyle: { width: 24, height: 24 },

  // Content Card
  contentCard: { 
    marginTop: -35, 
    borderTopLeftRadius: 40, 
    borderTopRightRadius: 40, 
    backgroundColor: '#FFF', 
    paddingHorizontal: 22, 
    paddingTop: 10 
  },
  dragIndicator: { width: 35, height: 4, backgroundColor: '#F0F0F0', borderRadius: 10, alignSelf: 'center', marginBottom: 25 },
  mainInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  productTitle: { fontSize: 26, fontFamily: 'Poppins-Bold', color: '#1A1A1A' },
  speciesText: { fontSize: 14, fontFamily: 'Poppins-Italic', color: '#888', marginTop: 2 },
  priceContainer: { backgroundColor: '#F0F9F4', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 15 },
  priceValue: { fontSize: 24, color: '#27AE60', fontFamily: 'Poppins-Bold' },
  divider: { height: 1, backgroundColor: '#F5F5F5', marginVertical: 25 },
  sectionTitle: { fontSize: 18, fontFamily: 'Poppins-Bold', color: '#1A1A1A', marginBottom: 12 },
  descriptionBody: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#555', lineHeight: 22, marginBottom: 25 },

  // Aligned Grid
  specGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  specBox: { 
    width: '48%', 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FAFAFA', 
    padding: 12, 
    borderRadius: 18, 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: '#F0F0F0',
    minHeight: 70 
  },
  specIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginRight: 10, elevation: 1 },
  specIcon: { width: 18, height: 18, tintColor: '#27AE60' },
  specTextContent: { flex: 1 },
  specLabel: { fontSize: 10, color: '#AAAAAA', fontFamily: 'Poppins-Bold', textTransform: 'uppercase' },
  specVal: { fontSize: 12, color: '#333', fontFamily: 'Poppins-Medium' },

  extraInfoRow: { flexDirection: 'row', marginTop: 5 },
  tag: { backgroundColor: '#EBF7EE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginRight: 10 },
  tagText: { fontSize: 11, color: '#27AE60', fontFamily: 'Poppins-Medium' },

  // Footer Style
  footerContainer: { 
    position: 'absolute', bottom: 30, left: 20, right: 20, 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: '#1E231F', 
    borderRadius: 24, padding: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 15, elevation: 10
  },
  quantityControl: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.12)', 
    borderRadius: 18, 
    padding: 4 
  },
  qBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  qText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  qCount: { color: '#FFF', fontSize: 17, fontFamily: 'Poppins-Bold', marginHorizontal: 14 },
  checkoutBtn: { 
    flex: 1, 
    marginLeft: 15, 
    backgroundColor: '#27AE60', 
    height: 52, 
    borderRadius: 18, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  checkoutText: { color: '#FFF', fontSize: 16, fontFamily: 'Poppins-Bold' }
});

export default ProductDescription;