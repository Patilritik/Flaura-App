const express = require('express');
const Banner = require('../models/BannerImageModal');
const router = express.Router();

// GET ALL PLANTS INFO
router.get('/banner_images', async (req, res) => {
    try{
        const BannerImages = await Banner.find({});
        res.status(200).json(BannerImages);
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}
);


module.exports = router;
