// src/api/controllers/favoriteController.js
const Favourite = require('../models/favouriteModel');
const Listing = require('../models/listingModel');

// Add to favourites
exports.addToFavourites = async (req, res) => {
    try {
        const listingId = req.params.id;
        const userId = req.user._id; // Get userId from auth middleware

        // Check if listing exists
        const listing = await Listing.findById(listingId);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        // Find or create user's favourite document
        let favourite = await Favourite.findOne({ userId });

        if (!favourite) {
            favourite = new Favourite({
                userId,
                listings: [listingId]
            });
        } else {
            if (favourite.listings.includes(listingId)) {
                return res.status(400).json({ message: 'Already in favourites' });
            }
            favourite.listings.push(listingId);
        }

        await favourite.save();
        res.status(201).json({ message: 'Added to favourites successfully' });

    } catch (error) {
        console.error('Add to favourites error:', error);
        res.status(400).json({ message: error.message });
    }
};

// Remove from favourites
exports.removeFromFavourites = async (req, res) => {
    try {
        const listingId = req.params.id;
        const userId = req.user.id;

        const favourite = await Favourite.findOne({ userId });

        if (!favourite) {
            return res.status(404).json({ message: 'No favourites found' });
        }

        // Remove listings from array
        favourite.listings = favourite.listings.filter(
            id => id.toString() !== listingId
        );

        await favourite.save();
        res.json({ message: 'Removed from favourites successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user's favourites
exports.getFavourites = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const userId = req.user.id;

        const favourite = await Favourite.findOne({ userId })
            .populate({
                path: 'listings',
                options: {
                    skip: (page - 1) * limit,
                    limit: limit
                }
            });

        if (!favourite) {
            return res.json({
                favourites: [],
                totalPages: 0,
                currentPage: 1,
                total: 0
            });
        }

        res.json({
            favourites: favourite.listings,
            totalPages: Math.ceil(favourite.listings.length / limit),
            currentPage: Number(page),
            total: favourite.listings.length
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

