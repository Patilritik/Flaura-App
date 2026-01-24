import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import colors from '../utils/colors';
import ConfirmationModal from '../components/Modal'; // Adjust path as needed
import ToastManager from '../components/Toast/ToastManager';

const CartScreen = () => {
  const navigation = useNavigation();
  const [cartItems, setCartItems] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const shipping = 'Free';

  const getCartItemByUserId = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Error', 'User ID not found. Please log in again.');
        setCartItems([]);
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}api/get_cart_items/${userId}`,
      );
      const transformedItems = response.data.map(item => ({
        id: item._id,
        name: item.product_name,
        quantity: item.cart_count,
        price: parseFloat(item.price) || 0,
        image: item.image_url || 'https://via.placeholder.com/80',
        productId: item.product_id,
      }));

      setCartItems(transformedItems);
    } catch (error) {
      setCartItems([]);
      // console.error('Error fetching cart items:', error);
      // Alert.alert('Error', 'Failed to fetch cart items.');
    }
  };

  const updateCartItem = async (userId, productId, cartCount, productName) => {
    try {
      if (!userId) {
        ToastManager.show({
          type: 'error',
          message: 'User ID not found. Please log in.',
          duration: 3000,
        })
        return false;
      }
      const payload = { userId, product_id: productId, cartCount };
      const response = await axios.post(`${API_BASE_URL}api/update_cart`, payload);
      console.log('Cart item updated:', response.data);
      ToastManager.show({
        type: 'success',
        message: cartCount === 0
          ? `Item removed from cart: ${productName}`
          : `Item updated in cart: ${productName} (${cartCount})`,
        duration: 3000,
      });
      return true;
    } catch (error) {
      console.error('Error updating cart item:', error);
      ToastManager.show({
        type: 'error',
        message: 'Failed to update cart. Please try again.',
        duration: 3000,
      });
      return false;
    }
  };

  useEffect(() => {
    // Alert.alert('Cart', 'This is a demo cart screen. No items will be added.');
    getCartItemByUserId();
  }, []);

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  const total = subtotal + (shipping === 'Free' ? 0 : parseFloat(shipping));

  const handleIncrease = async id => {
    const item = cartItems.find(item => item.id === id);
    if (!item || item.quantity >= 20) {
      ToastManager.show({
        type: 'error',
        message: 'You can add a maximum of 20 items to the cart.',
        duration: 3000,
      });
      return;
    }

    const newCount = item.quantity + 1;
    const userId = await AsyncStorage.getItem('userId');
    const success = await updateCartItem(userId, item.productId, newCount, item.name);

    if (success) {
      await getCartItemByUserId();
    }
  };

  const handleDecrease = async id => {
    const item = cartItems.find(item => item.id === id);
    if (!item) return;

    const newCount = item.quantity - 1;
    const userId = await AsyncStorage.getItem('userId');
    let success;

    if (newCount === 0) {
      success = await updateCartItem(userId, item.productId, 0, item.name);
      if (success) {
        setCartItems(cartItems.filter(cartItem => cartItem.id !== id));
        await getCartItemByUserId();
      }
    } else {
      success = await updateCartItem(userId, item.productId, newCount, item.name);
      if (success) {
        await getCartItemByUserId();
      }
    }
  };

  const handleRemove = id => {
    const item = cartItems.find(item => item.id === id);
    if (!item) return;

    setItemToDelete(item);
    setModalVisible(true);
  };

  const confirmRemove = async () => {
    if (!itemToDelete) return;

    const userId = await AsyncStorage.getItem('userId');
    const success = await updateCartItem(userId, itemToDelete.productId, 0, itemToDelete.name);

    if (success) {
      await getCartItemByUserId();
    }

    setModalVisible(false);
    setItemToDelete(null);
  };

  const cancelRemove = () => {
    setModalVisible(false);
    setItemToDelete(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Header */}
      {/* <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Image
            source={require('../assets/back_arrow_icon.png')}
            style={styles.headerIcon}
          />
        </TouchableOpacity>
        <Text style={styles.header}>My Cart</Text>
      </View> */}

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        {cartItems.length === 0 ? (
          <View style={styles.emptyCartContainer}>
            <Image
              source={require('../assets/cart_empty.png')}
              style={styles.emptyCartImage}
            />
            <Text style={styles.emptyCartText}>Your Cart is Empty</Text>
            <TouchableOpacity
                      onPress={() => navigation.navigate('Home')}
                      style={styles.emptyButton}>
                      <Text style={styles.cartButtonText}>Shop Now</Text>
                    </TouchableOpacity>
          </View>
        ) : (
          <>
            {cartItems.map(item => (
              <View key={item.id} style={styles.cartItem}>
                <Image source={{ uri: item.image }} style={styles.itemImage} />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <View style={styles.cartControl}>
                    <TouchableOpacity
                      onPress={() => handleDecrease(item.id)}
                      style={styles.cartButton}>
                      <Text style={styles.cartButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.cartCount}>{item.quantity}</Text>
                    <TouchableOpacity
                      onPress={() => handleIncrease(item.id)}
                      style={styles.cartButton}>
                      <Text style={styles.cartButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.itemActions}>
                  <TouchableOpacity
                    onPress={() => handleRemove(item.id)}
                    style={styles.removeButton}>
                    <Image
                      source={require('../assets/delete_icon.png')}
                      style={styles.deleteIcon}
                    />
                  </TouchableOpacity>
                  <View style={styles.priceDetails}>
                    <Text style={styles.smallText}>
                      {item.quantity} × ₹{item.price.toFixed(2)} =
                    </Text>
                    <Text style={styles.totalPrice}>
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}

            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Sub Total ({cartItems.length} items)
                </Text>
                <Text style={styles.summaryValue}>₹{subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping</Text>
                <Text style={styles.shipping}>{shipping}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Price</Text>
                <Text style={styles.summaryValue}>₹{total.toFixed(2)}</Text>
              </View>
            </View>
          </>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Fixed Checkout Button (Hidden when cart is empty) */}
      {cartItems.length > 0 && (
        <View style={styles.checkoutContainer}>
          <TouchableOpacity style={styles.checkoutButton}>
            <Text style={styles.checkoutText}>Checkout</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={modalVisible}
        title="Confirm Removal"
        message={`Are you sure you want to remove "${itemToDelete?.name}" from the cart?`}
        onConfirm={confirmRemove}
        onCancel={cancelRemove}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  backButton: {
    position: 'absolute',
    left: 20,
  },
  headerIcon: {
    width: 30,
    height: 30,
  },
  deleteIcon: {
    width: 25,
    height: 25,
  },
  header: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
    marginTop: 20,
    marginBottom: 80,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center', // Center content for empty cart message
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
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
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    width: '100%',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 15,
  },
  cartControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1f7e3',
    width: '50%',
    borderRadius: 10,
  },
  cartButton: {
    backgroundColor: '#28a745',
    width: 30,
    height: 30,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  emptyButton: {
    backgroundColor: colors.primaryGreen,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  cartCount: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#000',
    width: 30,
    textAlign: 'center',
    marginHorizontal: 3,
  },
  itemActions: {
    alignItems: 'flex-end',
  },
  removeButton: {
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 5,
    marginBottom: 5,
  },
  priceDetails: {
    alignItems: 'flex-end',
  },
  smallText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginBottom: 5,
  },
  totalPrice: {
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
    color: '#28a745',
  },
  summary: {
    marginBottom: 20,
    width: '100%',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#333',
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
  },
  shipping: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: colors.primaryGreen,
  },
  checkoutContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  checkoutButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  checkoutText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    fontWeight: 'bold',
  },
  bottomSpacer: {
    height: 20,
  },
});

export default CartScreen;