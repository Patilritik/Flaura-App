const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  // cart_id: {
  //   type: String,
  //   required: true,
  //   unique: true,
  // },
  commonName: {
    type: String,
    required: true,
    trim: true,
  },
  cart_count: {
    type: Number,
    required: true,
    min: 0,
  },
  product_id: {
    type: String,
    required: true,
  },
 user_id: {
    type: String,
    required: true,
  },
}, {
  timestamps: true, // adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('CartItem', cartItemSchema , 'cart_items'); // 'cart_items' is the collection name in MongoDB
