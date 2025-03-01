const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {
        const starTime = performance.now();
        await mongoose.connect(process.env.MONGO_URI);
        const endTime = performance.now();
        const timeTaken = endTime - starTime;
        
        console.log(`Connected to MongoDB in ${timeTaken.toFixed(3)}ms`);

        // List all the users for RnD
        // const usersAvailable = await User.find();
        // console.log('Users available:', usersAvailable);

    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;