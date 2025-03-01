const mongoose = require('mongoose');

/*

reviewSchema
 - userId
 - listingId
 - rating
 - comment

*/

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    listingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
});

// Create a unique compound index to prevent duplicate reviews
reviewSchema.index({ userId: 1, listingId: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;