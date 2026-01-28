import React from 'react';
import { View, Text, Image, FlatList, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import colors from '../utils/colors';

const { width } = Dimensions.get('window');
const cardWidth = (width - 40) / 2;

const ProductCard = ({ data }) => {
  const navigation = useNavigation();

  const renderCard = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
      onPress={() => navigation.navigate('ProductDescription', { product: item })}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image_url }} style={styles.image} />
      </View>

      <View style={styles.content}>
        <View style={styles.nameSection}>
          <Text numberOfLines={1} style={styles.commonName}>
            {item.commonName || item.name}
          </Text>
          {item.scientificName && (
            <Text numberOfLines={1} style={styles.scientificName}>
              {item.scientificName}
            </Text>
          )}
        </View>

        <Text style={styles.price}>₹{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={data}
      renderItem={renderCard}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
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
    borderRadius: 15,
    margin: 5,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 150,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  content: {
    padding: 12,
  },
  nameSection: {
    marginBottom: 6,
  },
  commonName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
  },
  scientificName: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#888',
    fontFamily: 'Poppins-Italic',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primaryGreen,
    fontFamily: 'Poppins-Bold',
  },
});

export default ProductCard;
