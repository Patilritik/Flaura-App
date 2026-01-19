import React, { useState, useEffect, useRef } from 'react';
import { Text, View, TextInput, FlatList, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Animated, Keyboard } from 'react-native';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import ToastManager from '../components/Toast/ToastManager';
import ProductCard from '../components/ProductCard';
import colors from '../utils/colors';

const SearchResults = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [plants, setPlants] = useState([]);
  const [hasSearched, setHasSearched] = useState(false); // Track if a search has been performed
  const textInputRef = useRef(null);

  // Animation values
  const loaderTextOpacity = useRef(new Animated.Value(1)).current;
  const searchBarOpacity = useRef(new Animated.Value(0)).current;
  const searchBarScale = useRef(new Animated.Value(0.8)).current;
  const noResultsOpacity = useRef(new Animated.Value(0)).current;
  const noResultsScale = useRef(new Animated.Value(0.5)).current;

  const searchPlants = async (query) => {
    if (!query) return;
    setLoading(true);
    setHasSearched(true); // Mark that a search has been performed
    try {
      const payload = { searchInput: query };
      const response = await axios.post(`${API_BASE_URL}api/plants_info/search`, payload);
      setPlants(response.data);
      if (response.data.length === 0) {
        ToastManager.show({
          type: 'info',
          message: `No plants found for "${query}"`,
          duration: 3000,
        });
      }
    } catch (error) {
      console.log(error?.response?.data);
      if (error.response) {
        // ToastManager.show({
        //   type: 'error',
        //   message: error.response.data.message || 'Server error',
        //   duration: 3000,
        // });
      } else {
        ToastManager.show({
          type: 'error',
          message: 'Network error. Please try again later.',
          duration: 3000,
        });
      }
      setPlants([]);
    } finally {
      setLoading(false);
    }
  };

  // Open keyboard and animate search bar on mount
  useEffect(() => {
    textInputRef.current.focus();
    Animated.parallel([
      Animated.timing(searchBarOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(searchBarScale, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Debounce search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim() !== '') {
        searchPlants(searchQuery.trim());
      } else {
        setPlants([]); // Clear results when search query is empty
        setHasSearched(false); // Reset search state
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Loader text fade loop
  useEffect(() => {
    const fadeLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(loaderTextOpacity, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(loaderTextOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    if (loading) {
      fadeLoop.start();
    } else {
      fadeLoop.stop();
      loaderTextOpacity.setValue(1);
    }

    return () => fadeLoop.stop();
  }, [loading]);

  // Animate "No results found" when plants array is empty and a search has been performed
  useEffect(() => {
    if (plants.length === 0 && !loading && hasSearched) {
      Animated.parallel([
        Animated.timing(noResultsOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(noResultsScale, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      noResultsOpacity.setValue(0);
      noResultsScale.setValue(0.5);
    }
  }, [plants, loading, hasSearched]);

  const renderItem = ({ item }) => <ProductCard data={[item]} />;

  const renderEmptyComponent = () => (
    <Animated.View style={[
      styles.emptyContainer,
      {
        opacity: noResultsOpacity,
        transform: [{ scale: noResultsScale }],
      },
    ]}>
      <Text style={styles.noResultsText}>No results found</Text>
      <Image
        source={require('../assets/not_found_new.png')}
        style={styles.notFoundImage}
      />
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar with Back Arrow */}
      <Animated.View style={[
        styles.searchContainer,
        {
          opacity: searchBarOpacity,
          transform: [{ scale: searchBarScale }],
        },
      ]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image
            source={require('../assets/back_arrow_icon.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <View style={styles.inputContainer}>
          <Image
            source={require('../assets/search_icon.png')}
            style={styles.searchIcon}
          />
          <TextInput
            ref={textInputRef}
            style={styles.searchInput}
            placeholder="Search Products"
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => searchPlants(searchQuery.trim())}
          />
        </View>
      </Animated.View>

      {/* Loader or Results */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Animated.Text style={[styles.loaderText, { opacity: loaderTextOpacity }]}>
            Searching...
          </Animated.Text>
        </View>
      ) : (
        <FlatList
          data={plants}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          ListEmptyComponent={hasSearched ? renderEmptyComponent : null} // Only render empty component if a search has been performed
          contentContainerStyle={styles.resultsContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
    paddingLeft: 0,
  },
  backIcon: {
    width: 25,
    height: 25,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    height: 50,
  },
  searchIcon: {
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
  loaderContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4CAF50',
    fontFamily: 'Poppins-Medium',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  notFoundImage: {
    width: 300,
    height: 400,
    marginBottom: 20,
  },
  noResultsText: {
    textAlign: 'center',
    fontSize: 26,
    color: colors.primaryGreen,
    fontFamily: 'Poppins-SemiBold',
  },
  resultsContainer: {
    paddingBottom: 20,
  },
});

export default SearchResults;