import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import ProductCard from '../components/ProductCard';
import colors from '../utils/colors';
import ToastManager from '../components/Toast/ToastManager';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const [bannerImages, setBannerImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [plantsInfo, setPlantsInfo] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();

  // Static map of banner images (if stored locally)
  const bannerImageMap = {
    banner1: require('../assets/banner_1.jpg'),
    banner2: require('../assets/banner_2.jpg'),
    banner5: require('../assets/banner_5.jpg'),
    banner3: require('../assets/banner_3.jpg'),
    banner4: require('../assets/banner_4.jpg'),
  };

  const categories = ['All', 'Indoor', 'Outdoor', 'Accessories'];

  const getBannerImages = async () => {
    const userId = await AsyncStorage.getItem('userId');
    if (userId !== null) {
      // Alert.alert('User ID', userId);
    } else {
      ToastManager.show({
        type: 'error',
        message: 'No User ID Found Please login again',
        duration: 3000,
      });
      return;
    }
    setLoading(true);
    setBannerImages([]);
    try {
      const response = await axios.get(`${API_BASE_URL}api/banner_images`);
      setBannerImages(response.data);
      console.log('Banner Images:', response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getPlantsInfo = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}api/plants_info`);
      setPlantsInfo(response.data);
      console.log('Plants Info:', response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const searchPlants = async (query) => {
    if (!query) return;
    setLoading(true);
    try {
      const payload = { searchInput: query };
      const response = await axios.post(`${API_BASE_URL}api/plants_info/search`, payload);
      Alert.alert('Search Results', `Found ${response.data.length} plants matching "${query}"`);
    } catch (error) {
      console.log(error?.response?.data);
      if (error.response) {
        if (error.response.status === 404) {
          ToastManager.show({
            type: 'info',
            message: `${error?.response?.data?.message}`,
            duration: 3000,
          });
        } else {
          Alert.alert('Error', error.response.data.message || 'Server error');
          ToastManager.show({
            type: 'error',
            message: error.response.data.message || 'Server error',
            duration: 3000,
          });
        }
      } else {
        ToastManager.show({
          type: 'error',
          message: 'Network error. Please try again later.',
          duration: 3000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearchFocus = () => {
    navigation.navigate('SearchResults');
  };

  // Handle product card click
  const handleProductPress = (product) => {
    navigation.navigate('ProductDescription', { product });
  };

  useEffect(() => {
    getBannerImages();
    getPlantsInfo();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim() !== '') {
        searchPlants(searchQuery.trim());
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const renderItem = ({ item }) => {
    switch (item.type) {
      case 'search':
        return (
          <View style={styles.searchContainer}>
            <View style={styles.searchHeader}>
              <Text style={styles.searchLabel}>What are you looking for?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('UserProfile')}>
              <Image source={require('../assets/account_icon.png')} style={{ width: 50, height: 50 , tintColor : '#000' }} />
              </TouchableOpacity>
              {/* <Image source={require('../assets/plant_notification_icon.png')} style={{ width: 50, height: 50 }} /> */}
            </View>
            {/* Search input with search icon */}
            <View style={styles.inputWrapper}>
              <Image source={require('../assets/search_icon.png')} style={styles.inputIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search Products"
                placeholderTextColor="#888"
                onChangeText={text => setSearchQuery(text)}
                onFocus={handleSearchFocus}
              />
            </View>
          </View>
        );
      case 'banner':
        return (
          <View style={styles.bannerContainer}>
            <FlatList
              data={bannerImages}
              renderItem={({ item: bannerItem }) => {
                const imageName = bannerItem.file_name;
                const image = bannerImageMap[imageName];
                return (
                  <View style={styles.imageContainer}>
                    <Image source={image} style={styles.bannerImage} resizeMode="cover" />
                    <View style={styles.textOverlay}>
                      <Text style={styles.title}>{bannerItem.title}</Text>
                      <Text style={styles.subtitle}>Inspiration</Text>
                    </View>
                  </View>
                );
              }}
              keyExtractor={(bannerItem, index) => index.toString()}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              snapToInterval={width - 40}
              initialNumToRender={1}
              windowSize={3}
            />
          </View>
        );
      case 'category':
        return (
          <View style={styles.filterContainer}>
            <FlatList
              data={categories}
              renderItem={({ item: categoryItem }) => {
                const isSelected = categoryItem === selectedCategory;
                return (
                  <TouchableOpacity onPress={() => setSelectedCategory(categoryItem)} style={{ marginRight: 10 }}>
                    <View style={[styles.categoryButton, isSelected && styles.selectedCategoryButton]}>
                      <Text style={[styles.categoryButtonText, isSelected && styles.selectedCategoryButtonText]}>
                        {categoryItem}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
              keyExtractor={(categoryItem, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </View>
        );
      case 'product':
        return (
          <FlatList
            data={plantsInfo.filter((plant) => selectedCategory === 'All' || plant.category === selectedCategory)}
            renderItem={({ item: productItem }) => (
              <TouchableOpacity onPress={() => handleProductPress(productItem)}>
                <ProductCard data={[productItem]} />
              </TouchableOpacity>
            )}
            keyExtractor={(productItem) => productItem._id.toString()}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        );
      case 'spacer':
        return <View style={styles.bottomSpacer} />;
      default:
        return null;
    }
  };

  const combinedData = [
    { type: 'search', id: 'search-1' },
    { type: 'banner', id: 'banner-1' },
    { type: 'category', id: 'category-1' },
    { type: 'product', id: 'product-1' },
    { type: 'spacer', id: 'spacer-1' },
  ].filter(item => !loading || (item.type !== 'product' && item.type !== 'spacer'));

  // Navigation handlers for bottom bar
  const [activeTab, setActiveTab] = useState('Home');
  const handleHomePress = () => {
    setActiveTab('Home');
    navigation.navigate('HomeScreen');
  };

  const handleFavoritesPress = () => {
    setActiveTab('Favorites');
    navigation.navigate('FavoritesScreen'); // Adjust route as needed
  };

  const handlePrimaryPress = () => {
    setActiveTab('Primary');
    navigation.navigate('PrimaryScreen'); // Adjust route as needed
  };

  const handleCartPress = () => {
    setActiveTab('Cart');
    navigation.navigate('CartScreen');
  };

  const handleAccountPress = () => {
    setActiveTab('Account');
    navigation.navigate('UserProfile');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Scrollable Content */}
      <FlatList
        data={combinedData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scrollContent}
      />

      {/* Fixed Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} onPress={handleHomePress}>
          <Image source={require('../assets/home_icon.png')} style={[styles.navIcon, activeTab === 'Home' && { tintColor: colors.primaryGreen }]} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={handleFavoritesPress}>
          <Image source={require('../assets/favourite_icon.png')} style={[styles.navIcon, activeTab === 'Favorites' && { tintColor: colors.primaryGreen }]} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navPrimaryButton} onPress={handlePrimaryPress}>
          <View style={styles.primaryCircle}>
            <Image source={require('../assets/qrcode_icon.png')} style={styles.primaryIcon} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={handleCartPress}>
          <Image source={require('../assets/cart_icon.png')} style={[styles.navIcon, activeTab === 'Cart' && { tintColor: colors.primaryGreen }]} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={handleAccountPress}>
          <Image source={require('../assets/account_icon.png')} style={[styles.navIcon, activeTab === 'Account' && { tintColor: colors.primaryGreen }]} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Ensure content is not hidden under bottom nav
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchLabel: {
    fontSize: 24,
    width: '50%',
    marginBottom: 5,
    fontFamily: 'Poppins-Bold',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    height: 50,
    marginTop: 20,
  },
  inputIcon: {
    width: 25,
    height: 25,
    marginLeft: 10,
  },
  searchInput: {
    flex: 1,
    padding: 10,
    paddingLeft: 5,
    fontSize: 16,
    color: '#000',
    height: 50,
    fontFamily: 'Poppins-Regular',
  },
  filterContainer: {
    marginBottom: 20,
    marginTop: 10,
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCategoryButton: {
    backgroundColor: colors.primaryGreen,
  },
  categoryButtonText: {
    color: '#000',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  selectedCategoryButtonText: {
    color: '#fff',
    fontFamily: 'Poppins-Regular',
  },
  bannerContainer: {
    marginBottom: 20,
    marginTop: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
  imageContainer: {
    width: width - 45,
    height: 250,
    borderRadius: 10,
    marginRight: 6,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#eee',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  textOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
  },
  title: {
    fontSize: 18,
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    fontFamily: 'Poppins-Medium',
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
    fontFamily: 'Poppins-Regular',
  },
  bottomSpacer: {
    height: 50,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
  },
  navButton: {
    alignItems: 'center',
    padding: 5,
  },
  navPrimaryButton: {
    alignItems: 'center',
    padding: 5,
    transform: [{ translateY: -15 }], // Lift the central button
  },
  primaryCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
  navIcon: {
    width: 24,
    height: 24,
    tintColor: '#666',
  },
});

export default HomeScreen;