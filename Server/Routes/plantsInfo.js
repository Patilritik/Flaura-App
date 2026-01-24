const express = require('express');
const Plant = require('../models/PlantModal');
const router = express.Router();
const User = require('../models/UserModal');

// GET ALL PLANTS INFO
router.get('/plants_info', async (req, res) => {
    try{
        const plantsInfo = await Plant.find({});
        res.status(200).json(plantsInfo);
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}
);


// UPDATE PLANT INFO BY ID
router.put('/plants_info/:id', async (req, res) => {
    try {
        const plantId = req.params.id;
        console.log("plant id",plantId);
        const updates = req.body;
        console.log("update" , updates);
        // Check if the plant exists
        const plant = await Plant.findById(plantId);
        console.log("plant",plant);
        if (!plant) {
            return res.status(404).json({ message: 'Plant not found' });
        }

        // Update the plant with the provided fields using $set
        const updatedPlant = await Plant.findByIdAndUpdate(
            plantId,
            { $set: updates },
            { new: true, runValidators: true , strict : false} // Return the updated document and run schema validators
        );

        res.status(200).json(updatedPlant);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// SEARCH PLANT INFO BY NAME
router.post('/plants_info/search', async (req, res) => {
    try {
        const { searchInput } = req.body;
        console.log("Req body",req.body);
        console.log("search input",searchInput);
        // Find plants that match the name (case-insensitive)
        const plants = await Plant.find({
            $or: [
                { commonName: { $regex: searchInput, $options: 'i' } },
                { scientificName: { $regex: searchInput, $options: 'i' } },
                { name: { $regex: searchInput, $options: 'i' } },
            ],
        });

        if (plants.length === 0) {
            return res.status(404).json({ message: 'No plants found' });
        }

        res.status(200).json(plants);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET PLANT INFO BY ID
router.get('/plants_info/:id', async (req, res) => {
    try {
        const plantId = req.params.id;
        console.log("plant id",plantId);
        // Find the plant by ID
        const plant = await Plant.findById(plantId);

        if (!plant) {
            return res.status(404).json({ message: 'Plant not found' });
        }
        res.status(200).json(plant);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ADD NEW PLANT
router.post('/plants_info', async (req, res) => {
    console.log("Req body",req.body);
    return;
 
    try {
    const {
      commonName,
      scientificName,
      category,
      description,
      careTips,
      price,
      image,
      image_url,
      toxicity,
      maintenance,
      airPurifying,
    } = req.body;

    // Basic validation
    if (
      !commonName ||
      !scientificName ||
      !category ||
      !description ||
      !careTips ||
      !price ||
      !image ||
      !image_url
    ) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const newPlant = new Plant({
      commonName,
      scientificName,
      category,
      description,
      careTips,
      price,
      image,
      image_url,
      toxicity,
      maintenance,
      airPurifying,
    });

    const savedPlant = await newPlant.save();

    res.status(201).json({
      message: 'Plant added successfully',
      data: savedPlant,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check Favorite Plants for a User
router.get('/check_favourites/:userId/:productId', async (req, res) => {
    try {
        const { userId, productId } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isFavorite = user.favorites.includes(productId);
        res.status(200).json({ isFavorite });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

//toggle Favorite Plant for a User
router.post('/toggle_favorite', async (req, res) => {
    try {
        const { userId, product_id } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const index = user.favorites.indexOf(product_id);

        if (index === -1) {
            // Not in favorites, so ADD it
            user.favorites.push(product_id);
            await user.save();
            return res.status(200).json({ message: 'Added to favorites', isFavorite: true });
        } else {
            // Already in favorites, so REMOVE it
            user.favorites.splice(index, 1);
            await user.save();
            return res.status(200).json({ message: 'Removed from favorites', isFavorite: false });
        }
    } catch (error) {
        console.error('Error toggling favorite:', error);
        res.status(500).json({ message: 'Server error' });
    }
});



module.exports = router;
