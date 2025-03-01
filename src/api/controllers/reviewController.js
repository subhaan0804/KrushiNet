const Review = require('../models/reviewModel');
const User = require('../models/userModel');

// Create new review
exports.createReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const listingId = req.params.id;
        const userId = req.user._id; // Get userId from authenticated user

        console.log('Creating review:', { rating, comment, listingId, userId }); // Debug log

        // Validate input
        if (!rating || !comment || !listingId || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Check if user has already reviewed this listing
        const existingReview = await Review.findOne({ listingId, userId });
        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this listing'
            });
        }

        const review = new Review({
            userId,
            listingId,
            rating,
            comment
        });

        await review.save();

        // Populate user details
        await review.populate('userId', 'firstName lastName');

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            review
        });
    } catch (error) {
        console.error('Review creation error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to submit review'
        });
    }
};

// Get reviews for a listing
exports.getListingReviews = async (req, res) => {
    try {
        const listingId = req.params.id;
        const reviews = await Review.find({ listingId })
            .populate('userId', 'firstName lastName')
            .sort({ createdAt: -1 });

        // Calculate rating statistics
        const total = reviews.length;
        const ratingSum = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = total > 0 ? (ratingSum / total).toFixed(1) : 0;

        // Calculate rating distribution
        const ratingDistribution = {
            1: 0, 2: 0, 3: 0, 4: 0, 5: 0
        };
        reviews.forEach(review => {
            ratingDistribution[review.rating]++;
        });

        res.json({
            success: true,
            reviews,
            stats: {
                total,
                averageRating,
                distribution: ratingDistribution
            }
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch reviews'
        });
    }
};

exports.updateReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const listingId = req.params.id;
        const { userId } = req.body;

        // Find review and check ownership
        const review = await Review.findOne({
            listingId: listingId,
            userId: userId
        });

        if (!review) {
            return res.status(404).json({
                message: 'Review not found or unauthorized'
            });
        }

        // Update review
        review.rating = rating;
        review.comment = comment;
        await review.save();

        res.json(review);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const { userId } = req.body;
        console.log(userId);

        // Find and delete review if user owns it
        const review = await Review.findOneAndDelete({
            userId
        });
        
        console.log(`deleting review: ${review}`);

        if (!review) {
            return res.status(404).json({
                message: 'Review not found or unauthorized'
            });
        }

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


function generateStarRating(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }

    // Add half star if needed
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }

    // Add empty stars
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }

    return stars;
}
