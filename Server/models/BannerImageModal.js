const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  file_name: {
    type: String,
    required: true,
    unique: true,
  },
  file_path: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema , 'banner_images'); // 'banner_images' is the collection name in MongoDB
