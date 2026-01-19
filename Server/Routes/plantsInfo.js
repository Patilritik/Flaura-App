const express = require('express');
const Plant = require('../models/PlantModal');
const router = express.Router();

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

module.exports = router;
