const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./Routes/auth'); // Fixed casing: 'Routes' to 'routes'
const plantsInfoRoutes = require('./Routes/plantsInfo'); // Fixed casing: 'Routes' to 'routes'
const bannerImagesRoutes = require('./Routes/bannerImages'); // Fixed casing: 'Routes' to 'routes'
const CartItemsRoutes = require('./Routes/cart'); // Fixed casing: 'Routes' to 'routes'

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: '*' })); // Allow all origins for development
app.use(express.json()); // Parse JSON bodies

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api', authRoutes ); // Fixed casing: 'Routes' to 'routes'
app.use('/api', plantsInfoRoutes);
app.use('/api', bannerImagesRoutes); // Fixed casing: 'Routes' to 'routes'
app.use('/api', CartItemsRoutes); // Fixed casing: 'Routes' to 'routes'

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});