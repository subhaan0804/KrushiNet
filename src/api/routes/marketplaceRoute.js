const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/authMiddleware');
const marketplaceController = require('../controllers/marketplaceController');
const reviewController = require('../controllers/reviewController');
const favouriteController = require('../controllers/favouriteController');
const searchController = require('../controllers/searchController');

// Used to create listing
router.get('/list', auth, (req, res) => {
    res.render('createListing', { user: req.user });
});

// View Routes
router.get('/listings/view', (req, res) => {  
    res.render('listings');
});

// API Routes
router.get('/listings/data', marketplaceController.getListings);  // Changed from /listings to /listings/data

// Listings Routes
// Public routes (no auth required)

// Auth present because the id is fetched from DB and is only for favourite items for specific users.
router.get('/list/:id', marketplaceController.getListingById); // get a single listing by id
router.post('/list', auth, marketplaceController.createListing); // create a single listing(uploading a product)z
router.put('/list/:id',auth, marketplaceController.updateListing); // update a single listing(editing a product)
router.delete('/list/:id', auth, marketplaceController.deleteListing); // delete a single listing(deleting a product)


// ===== Reviews and Ratings =====
// Protected routes (auth required)
router.post('/list/:id/reviews', auth, reviewController.createReview); // Create new review
router.get('/list/:id/reviews', reviewController.getListingReviews); // Get listing reviews
router.put('/list/:id/reviews', auth, reviewController.updateReview); // Update review
router.delete('/list/:id/reviews', auth, reviewController.deleteReview); // Delete review

// ===== Favorites =====
// Add to favorites (:id - refers to listingid (Product ID))
// Protected routes (auth required)
router.post('/favourites/:id', auth, favouriteController.addToFavourites);
// Remove from favorites
router.delete('/favourites/:id', auth, favouriteController.removeFromFavourites);
// Get user's favorites
router.get('/favourites', auth, favouriteController.getFavourites);

// ===== Search and Filter =====
router.get('/search', marketplaceController.searchListings); // Change this line

module.exports = router;