const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Listing = require('../models/listingModel');

dotenv.config();

const sampleData = [
    {
        sellerId: '60d21b4667d0d8992e610c85', // Example ObjectId, replace with actual user IDs
        name: 'Fresh Apples',
        price: 3.5,
        quantity: 100,
        category: 'Fruits',
        location: {
            type: 'Point',
            coordinates: [77.5946, 12.9716], // Example coordinates [longitude, latitude]
            address: 'Bangalore, India'
        },
        description: 'Fresh and juicy apples from the farm.',
    },
    {
        sellerId: '60d21b4667d0d8992e610c86', // Example ObjectId, replace with actual user IDs
        name: 'Organic Tomatoes',
        price: 2.0,
        quantity: 200,
        category: 'Vegetables',
        location: {
            type: 'Point',
            coordinates: [77.5946, 12.9716], // Example coordinates [longitude, latitude]
            address: 'Bangalore, India'
        },
        description: 'Organic tomatoes grown without pesticides.',
    },
    // Add more sample data as needed
];

const populateDB = async () => {
    try {
        await connectDB();

        // Clear existing data
        await Listing.deleteMany();

        // Insert sample data
        await Listing.insertMany(sampleData);

        console.log('Database populated with sample data');
        process.exit();
    } catch (error) {
        console.error('Error populating database:', error.message);
        process.exit(1);
    }
};

populateDB();
