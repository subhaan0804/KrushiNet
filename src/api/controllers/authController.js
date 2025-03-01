const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '24h' // Increased from 10m to 24h for better user experience
    });
};

exports.register = async (req, res) => {
    try {
        console.log(req.body);
        const { firstName, lastName, email, phoneNo, aadhaarNo, gender, dateOfBirth, upiId, state, city, password } = req.body;
        console.log('Original password:', password); // original pass logging
        
       
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const user = new User({
            firstName,
            lastName,
            email,
            phoneNo,
            aadhaarNo,
            gender,
            dateOfBirth,
            upiId,
            state,
            city,
            password
        });
        // If not upiId then Null stored in the database
        if (user.upiId === undefined || user.upiId === '') {
            user.upiId = null;
        }
        // Save the user without generating a token
        await user.save();
        console.log('Hashed password:', user.password); // hashed pass logging
        console.log('User created successfully:', user);

        // Return success message without token
        res.status(201).json({
            message: 'Registration successful. Please login.',
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Registration error:', error); // error logging
        res.status(400).json({ message: error.message });
    }
};

// Update login controller to store token in localStorage
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for:', email); // Add logging

        // 1. First check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email' });
        }

        // 2. Compare passwords using bcrypt
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match result:', isMatch); // Add logging

        if (isMatch) {
            const token = generateToken(user._id);
            user.token = token;
            await user.save();
            
            // Add token to response
            res.json({
                token,
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phoneNo: user.phoneNo,
                    aadhaarNo: user.aadhaarNo,
                    gender: user.gender,
                    dateOfBirth: user.dateOfBirth,
                    upiId: user.upiId,
                    state: user.state,
                    city: user.city
                }
            });
        } else {
            return res.status(401).json({ message: 'Invalid password' });
        }
    } catch (error) {
        console.error('Login error:', error); // Add error logging
        res.status(500).json({ message: 'Login failed. Please try again.' });
    }
};

// NEED TO FIND WHATS WRONG WITH THIS FUNCTION
// /AUTH/ME RESPONSE : {"message":"Cannot read properties of undefined (reading '_id')"}
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// NEW CODE : RIJHAN
exports.checkActiveUser = async (req, res) => {
    res.status(200).json({ message: 'User is active', user: req.user });
};

// NEW CODE : RIJHAN
exports.logout = async (req, res) => {
    try {
        // Clear token from user document
        req.user.token = null;
        await req.user.save();
        
        res.status(200).json({ 
            success: true, 
            message: 'Logged out successfully' 
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Logout failed' 
        });
    }
};


exports.updateProfileImage = async (req, res) => {
    try {
      // If no file was uploaded, just continue without changing image
      if (!req.file) {
        return res.status(200).json({ 
          message: 'No new image provided. Keeping existing profile image.',
          profileImage: req.user.profileImage || DEFAULT_PROFILE_IMAGE
        });
      }
  
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Update user profile with new image URL
      user.profileImage = req.file.path;
      await user.save();

      // Get optimized image URL
      const optimizedImageUrl = getImageUrl(user.profileImage, 'profile');
  
      res.json({
        success: true,
        profileImage: optimizedImageUrl,
        message: 'Profile image updated successfully'
      });
    } catch (error) {
      console.error('Profile image update error:', error);
      res.status(500).json({ message: error.message });
    }
  };