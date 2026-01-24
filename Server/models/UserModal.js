const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  name: {
    type: String,
    // required: true,
  },
  avatar: {
    type: String,
    // default: 'https://via.placeholder.com/150', // Default avatar URL
    default: 'https://placehold.co/200x200', // Default avatar URL
  },
  phone: {
    type: String,
    default: 'N/A', // Default phone number
  },
  address: {
    type: String,
    default: 'N/A', // Default address
  },
  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plant', // This should match the name you used in mongoose.model('Plant', ...)
    }
  ],

});

module.exports = mongoose.model('User', userSchema);