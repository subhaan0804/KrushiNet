const mongoose = require('mongoose');

const favouriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  listings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true,
  }],
}, { timestamps: true });

const Favourite = mongoose.model('Favourite', favouriteSchema);
module.exports = Favourite;