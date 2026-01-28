const express = require('express');
const mongoose = require('mongoose');
const Cart = require('../models/CartItem');
const Plant = require('../models/PlantModal');
const router = express.Router();

// POST API to add or update cart item
router.post('/update_cart', async (req, res) => {
  try {
    const { userId, product_id, cartCount } = req.body;

    // Basic validation
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ message: 'Valid userId (string) is required' });
    }
    if (!product_id || !mongoose.Types.ObjectId.isValid(product_id)) {
      return res.status(400).json({ message: 'Valid product_id is required' });
    }
    if (cartCount === undefined || typeof cartCount !== 'number' || cartCount < 0) {
        return res.status(400).json({ message: 'cartCount must be a number and 0 or greater' });
      }

    if(cartCount === 0) {
        // If cartCount is 0, remove the item from the cart
        const deletedItem = await Cart.findOneAndDelete({ user_id: userId, product_id });
        if (!deletedItem) {
            return res.status(404).json({ message: 'Cart item not found' });
        }
        return res.status(200).json({ message: 'Cart item removed successfully' });
        }
    // Fetch product_name
    const plant = await Plant.findById(product_id);
    console.log("plant", plant);
    if (!plant) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update or insert cart item
    const cartItem = await Cart.findOneAndUpdate(
      { user_id: userId, product_id },
      { cart_count: cartCount, product_name: plant.commonName },
      { new: true, upsert: true } // Return updated doc, create if not exists
    );

    return res.status(200).json({ message: 'Cart item updated successfully', cartItem });
  } catch (error) {
    console.error('Error in cart API:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// GET cart item by userId and product_id
router.post('/get_cart_item', async (req, res) => {
  try {
    const { userId, product_id } = req.body;
    // Minimal validation
    if (!userId || !product_id) {
      return res.status(400).json({ message: 'userId and product_id are required' });
    }
    const cartItem = await Cart.findOne({ user_id: userId, product_id });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    res.status(200).json(cartItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET all cart items for a user by userId  
router.get('/get_cart_items/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const cartItems = await Cart.find({ user_id: userId });

    if (!cartItems || cartItems.length === 0) {
      return res.status(404).json({ message: 'No cart items found for this user' });
    }

    const updatedCartItems = await Promise.all(
      cartItems.map(async (item) => {
        const product = await Plant.findById(item.product_id); // yaha change
        console.log("Product in cart item:", product);
        if (product) {
          item = item.toObject();
          item.price = product.price;         // yaha add
          item.image_url = product.image_url; // yaha add
          item.commonName = product.commonName;     // yaha add
          item.scientificName = product.scientificName; // yaha add
        }
        return item;
      })
    );
    console.log("Updated Cart Items: ", updatedCartItems);
    res.status(200).json(updatedCartItems);

  } catch (error) {
    console.error('Error in get_cart_items:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});




module.exports = router;