const mongoose = require('mongoose');

// Define the schema for the plant's care tips
const careTipsSchema = new mongoose.Schema({
  light: { type: String, required: true },
  water: { type: String, required: true },
  soil: { type: String, required: true },
  temperature: { type: String, required: true },
});

// Define the main Plant schema
const plantSchema = new mongoose.Schema({
  id: { type: Number, unique: true }, // Optional numeric ID used by frontend
  product_name: { type: String, required: true }, // Common name of the plant
  scientificName: { type: String, required: true }, // Scientific name of the plant
  category: { type: String, required: true }, // Indoor or Outdoor
  description: { type: String, required: true }, // Description of the plant
  careTips: { type: careTipsSchema, required: true }, // Care tips embedded as a subdocument
  price: { type: Number, required: true }, // Price of the plant
  image: { type: String, required: true }, // Image URL for the plant
  toxicity: { type: String, required: true }, // Toxicity information
  maintenance: { type: String, required: true }, // Maintenance level (Low, Medium, High)
  airPurifying: { type: Boolean, required: true }, // Boolean indicating if the plant purifies air
  image_url: { type: String, required: true }, // URL for the plant image
});

// Create the Plant model from the schema
const Plant = mongoose.model('Plant', plantSchema, 'plants_info');  // Here 'plants_info' is your collection name


module.exports = Plant;
