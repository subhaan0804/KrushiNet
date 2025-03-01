const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { 
        type: String, 
        required: true,
        minlength: [6, 'Password must be at least 6 characters long'] 
    },
    phoneNo: { type: String, required: true, unique: true },
    aadhaarNo: { type: String, required: true, unique: true },
    gender: { type: String, required: true },
    dateOfBirth: { type: String, required: true },
    upiId: { type: String, required: false},
    state: { type: String, required: true },
    city: { type: String, required: true },
    token: { type: String },
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
        }
    }
}, { timestamps: true, collection: 'userCredentials' });

// Add geospatial index
userSchema.index({ location: '2dsphere' });

// Pre-Save Hook
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();
    
    try {
        // Generate a salt and hash the password
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Add a method to verify password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;