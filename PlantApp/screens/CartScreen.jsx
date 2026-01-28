import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Image,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  Platform
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import colors from '../utils/colors';
import ConfirmationModal from '../components/Modal';
import ToastManager from '../components/Toast/ToastManager';

const { width } = Dimensions.get('window');

const CartScreen = () => {
  const navigation = useNavigation();
  const [cartItems, setCartItems] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const shipping = 'Free';

  // --- LOGIC SECTION ---

  const getCartItemByUserId = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Error', 'User ID not found. Please log in again.');
        setCartItems([]);
        return;
      }

      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}api/get_cart_items/${userId}`);

      const transformedItems = response.data.map(item => ({
        id: item._id,
        commonName: item.commonName,
        scientificName: item.scientificName,
        quantity: item.cart_count,
        price: parseFloat(item.price) || 0,
        image: item.image_url || 'https://via.placeholder.com/80',
        productId: item.product_id,
      }));

      setCartItems(transformedItems);
    } catch (error) {
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (userId, productId, cartCount, productName) => {
    try {
      if (!userId) {
        ToastManager.show({ type: 'error', message: 'User ID not found.', duration: 3000 });
        return false;
      }
      setLoading(true);
      const payload = { userId, product_id: productId, cartCount };
      await axios.post(`${API_BASE_URL}api/update_cart`, payload);

      ToastManager.show({
        type: 'success',
        message: cartCount === 0 ? `Removed: ${productName}` : `Updated: ${productName}`,
        duration: 2000,
      });
      return true;
    } catch (error) {
      ToastManager.show({ type: 'error', message: 'Failed to update cart.', duration: 3000 });
      return false;
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { getCartItemByUserId(); }, []));

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleIncrease = async id => {
    const item = cartItems.find(i => i.id === id);
    if (!item || item.quantity >= 20) return;
    const userId = await AsyncStorage.getItem('userId');
    const success = await updateCartItem(userId, item.productId, item.quantity + 1, item.name);
    if (success) getCartItemByUserId();
  };

  const handleDecrease = async id => {
    const item = cartItems.find(i => i.id === id);
    if (!item) return;
    const userId = await AsyncStorage.getItem('userId');
    const newCount = item.quantity - 1;
    if (newCount === 0) { handleRemove(item); return; }
    const success = await updateCartItem(userId, item.productId, newCount, item.name);
    if (success) getCartItemByUserId();
  };

  const handleRemove = item => { setItemToDelete(item); setModalVisible(true); };

  const confirmRemove = async () => {
    if (!itemToDelete) return;
    const userId = await AsyncStorage.getItem('userId');
    await updateCartItem(userId, itemToDelete.productId, 0, itemToDelete.name);
    setModalVisible(false);
    setItemToDelete(null);
    getCartItemByUserId();
  };

  // --- UI SECTION ---

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      
      <View style={{ flex: 1 }}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {cartItems.length === 0 ? (
            <View style={styles.emptyCartContainer}>
              <Image source={require('../assets/cart_empty.png')} style={styles.emptyCartImage} />
              <Text style={styles.emptyCartText}>Your Cart is Empty</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Home')}
                style={[styles.actionBtn, styles.primaryBtn, { marginTop: 30, width: width * 0.6 }]}
              >
                <Text style={styles.primaryBtnText}>Start Shopping</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {cartItems.map(item => (
                <View key={item.id} style={styles.cartItemCard}>
                  <Image source={{ uri: item.image }} style={styles.itemImage} />

                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.commonName}</Text>
                    <Text style={styles.scientificName}>{item.scientificName}</Text>

                    <View style={styles.cartControl}>
                      <TouchableOpacity onPress={() => handleDecrease(item.id)} style={styles.qBtn}>
                        <Text style={styles.qBtnText}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.cartCountText}>{item.quantity}</Text>
                      <TouchableOpacity onPress={() => handleIncrease(item.id)} style={styles.qBtn}>
                        <Text style={styles.qBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.itemActions}>
                    <TouchableOpacity onPress={() => handleRemove(item)} style={styles.deleteBtn}>
                      <Image source={require('../assets/delete_icon.png')} style={styles.deleteIcon} />
                    </TouchableOpacity>
                    <Text style={styles.itemPriceText}>₹{(item.price * item.quantity).toFixed(0)}</Text>
                  </View>
                </View>
              ))}

              <View style={styles.infoCard}>
                <Text style={styles.cardHeading}>Order Summary</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Subtotal</Text>
                  <Text style={styles.infoValue}>₹{subtotal.toFixed(2)}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Shipping</Text>
                  <Text style={[styles.infoValue, { color: colors.primaryGreen }]}>{shipping}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { fontFamily: 'Poppins-Bold', color: '#333' }]}>Total Amount</Text>
                  <Text style={[styles.infoValue, { fontSize: 18, color: colors.primaryGreen }]}>
                    ₹{subtotal.toFixed(2)}
                  </Text>
                </View>
              </View>
              
              {/* Extra spacer to clear the footer bar */}
              <View style={{ height: 50 }} />
            </>
          )}
        </ScrollView>
      </View>

      {/* FLOATING FOOTER - Always on top */}
      {cartItems.length > 0 && (
        <View style={styles.checkoutBar}>
          <TouchableOpacity 
            activeOpacity={0.8}
            style={[styles.actionBtn, styles.primaryBtn]} 
            onPress={() => Alert.alert('Checkout', 'Proceeding to checkout...')}
          >
            <Text style={styles.primaryBtnText}>Proceed to Checkout</Text>
          </TouchableOpacity>
        </View>
      )}

      <ConfirmationModal
        visible={modalVisible}
        title="Confirm Removal"
        message={`Remove "${itemToDelete?.name}" from cart?`}
        onConfirm={confirmRemove}
        onCancel={() => setModalVisible(false)}
      />

      {loading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color={colors.primaryGreen} />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollView: { flex: 1 },
  scrollContent: { 
    paddingHorizontal: 20, 
    paddingTop: 20, 
    paddingBottom: 150 // High padding ensures content is never hidden under the bar
  },

  cartItemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  itemImage: { width: 85, height: 85, borderRadius: 15, backgroundColor: '#F9F9F9' },
  itemDetails: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  itemName: { fontSize: 16, fontFamily: 'Poppins-Bold', color: '#333' },
  scientificName: { fontSize: 12, fontFamily: 'Poppins-Regular', fontStyle: 'italic', color: '#AAA', marginBottom: 8 },
  
  cartControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 10,
    padding: 3,
    alignSelf: 'flex-start',
  },
  qBtn: {
    width: 28,
    height: 28,
    backgroundColor: colors.primaryGreen,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  cartCountText: { marginHorizontal: 12, fontFamily: 'Poppins-SemiBold', fontSize: 14, color: '#333' },

  itemActions: { alignItems: 'flex-end', justifyContent: 'space-between' },
  deleteBtn: { padding: 5 },
  deleteIcon: { width: 18, height: 18, tintColor: '#FF6B6B' },
  itemPriceText: { fontSize: 16, fontFamily: 'Poppins-Bold', color: colors.primaryGreen },

  infoCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    marginTop: 10,
    marginBottom: 20,
  },
  cardHeading: { 
    fontSize: 11, 
    fontFamily: 'Poppins-Bold', 
    color: colors.primaryGreen, 
    letterSpacing: 1.2, 
    textTransform: 'uppercase', 
    marginBottom: 15 
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  infoLabel: { fontSize: 12, fontFamily: 'Poppins-Regular', color: '#888' },
  infoValue: { fontSize: 14, fontFamily: 'Poppins-SemiBold', color: '#333' },
  divider: { height: 1, backgroundColor: '#EEEEEE', marginVertical: 8 },

  checkoutBar: {
    position: 'absolute',
    bottom: 90,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: Platform.OS === 'ios' ? 35 : 20, // Better safe-area handling
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    zIndex: 999,      // Overlays all other content
    // elevation: 10,    // Android equivalent of zIndex
  },

  actionBtn: {
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtn: {
    backgroundColor: colors.primaryGreen,
    width: '100%',
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
  },

  emptyCartContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 50 },
  emptyCartImage: { width: 220, height: 220, resizeMode: 'contain', marginBottom: 20 },
  emptyCartText: { fontSize: 18, fontFamily: 'Poppins-Bold', color: '#333' },

  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
});

export default CartScreen;