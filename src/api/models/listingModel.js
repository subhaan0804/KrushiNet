const mongoose = require('mongoose');

/* 
    - image ***
listingSchema 
  - sellerId
  - name
  - price
  - quantity
  - category
  - location
  - description
  - timestamp

*/

const listingSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  location: {
    type: {
      type: String,
      default: 'Point',
      required: true,
    },
    coordinates: {
      type: [Number],
      default: [0, 0] // [longitude, latitude]
    },
    address: {
      type: String,
    },
  },
  description: {
    type: String,
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Index for geospatial queries
listingSchema.index({ location: '2dsphere' });

// Index for text search (optional, if you want to enable text search on name and description)
listingSchema.index({ name: 'text', description: 'text' });

const Listing = mongoose.model('Listing', listingSchema, "marketplaceData");
module.exports = Listing;
