import React, { useEffect } from 'react';
import { View, Text, Image, FlatList, StyleSheet, Dimensions, Alert } from 'react-native';
import colors from '../utils/colors';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2; // Two cards per row with padding

const ProductCard = ({ data }) => {
  useEffect(() => {
  }, []);

  const renderCard = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image_url }} style={styles.image} />

      <View style={styles.nameSection}>
        {/* {
          item.category !== 'Accessories' ? ( */}
            <>
              <Text style={styles.commonName}>{item.product_name}</Text>
              <Text style={styles.scientificName}>{item.scientificName}</Text>
            </>
          {/* ) : (
            <Text style={styles.commonName}>{item.name}</Text>
          )
        } */}
      </View>

      <View style={styles.footer}>
        <Text style={styles.price}>₹{item.price}</Text>
        <View style={styles.addButton}>
          <Text style={styles.addButtonText}>{'\u002B'}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <FlatList
      data={data}
      renderItem={renderCard}
      keyExtractor={(item) => item.id}
      numColumns={2}
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 10,
  },
  card: {
    width: cardWidth,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    margin: 5,
    gap: 8,
    alignItems: 'center',
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    aspectRatio: 1,
    resizeMode: 'contain',
  },
  name: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'black',
    fontFamily: 'Poppins-Bold',
  },
  category: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primaryGreen,
    marginLeft: 10,
    fontFamily: 'Poppins-Bold',
  },
  addButton: {
    backgroundColor: colors.primaryGreen,
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 30,
    fontFamily: 'Poppins-SemiBold',
  },
  nameSection: {
    width: '100%',
    alignItems: 'flex-start',
    marginLeft: 10,
    gap: 2,
  },
  commonName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
  },
  scientificName: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#888',
    fontFamily: 'Poppins-Italic',
  },
});

export default ProductCard;
