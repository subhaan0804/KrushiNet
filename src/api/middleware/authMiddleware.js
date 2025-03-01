// const jwt = require('jsonwebtoken');
// const User = require('../models/userModel');

// exports.auth = async (req, res, next) => {
//     try {
//         // Add more detailed logging
//         console.log('Headers:', req.headers);
//         const authHeader = req.headers.authorization;
//         console.log('Auth header:', authHeader);

//         const token = req.header('Authorization')?.replace('Bearer ', '');
//         if (!authHeader) {
//             return res.status(401).json({ message: 'No authorization header found' });
//         }

//         console.log('Extracted token:', token);

//         if (!token) {
//             return res.status(401).json({ message: 'Authentication required' });
//         }

//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         console.log('Decoded token:', decoded);

//         const user = await User.findOne({ 
//             _id: decoded.id,
//             token: token
//         });
        
//         if (!user) {
//             return res.status(401).json({ message: 'Invalid token' });
//         }

//         req.token = token;
//         req.user = user; // Make user available to views
//         next();
//     } catch (error) {
//         console.error('Auth error:', error);
//         res.status(401).json({ message: 'Authentication failed' });
//     }
// };

// const jwt = require('jsonwebtoken');
// const User = require('../models/userModel');

// exports.auth = async (req, res, next) => {
//     try {
//         const token = req.header('Authorization')?.replace('Bearer ', '');
//         console.log(req.headers)

//         // Check if token exists
//         // if (!token) {
//         //     return res.status(401).json({ message: 'No token provided' });
//         // }
//         if (!token) {
//             res.locals.user = null; // Set user to null if no token
//             return next();
//         }

//         // Verify token and check expiration
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         const user = await User.findById(decoded.id).select('-password');
//         // console.log('User:', user);

//         // Check if user exists and if the token matches the one stored in the database
//         // if (!user || user.token !== token) {
//         //     return res.status(401).json({ message: 'User not found or token mismatch' });
//         // }

//         if (!user || user.token !== token) {
//             res.locals.user = null;
//             return next();
//         }

//         req.user = user;
//         res.locals.user = user; // Make user available to views
//         next();
//     } catch (error) {
//         // res.status(401).json({ message: 'Token is invalid' });
//         res.locals.user = null;
//         next();
//     }
// };

const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.replace('Bearer ', '');
        
        // DEBUGGING
        // console.log('Auth header:', authHeader);
        console.log('Extracted token from Header:', token);
        // DEBUGGING
        
        // For API endpoints that require authentication
        if (req.path === '/me' || req.path.startsWith('/marketplace/list') || req.path.includes('/favourites')) {
            if (!token) {
                return res.status(401).json({ message: 'Authentication required' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findOne({ 
                _id: decoded.id,
                token: token 
            }).select('-password');

            if (!user) {
                return res.status(401).json({ message: 'Invalid token' });
            }

            req.user = user;
            req.token = token;
            return next();
        }
        
        // For views/pages that can handle both authenticated and unauthenticated users
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findOne({
                    _id: decoded.id,
                    token: token
                }).select('-password');
                
                req.user = user;
                res.locals.user = user;
            } catch (error) {
                console.error('Token verification failed:', error);
                res.locals.user = null;
            }
        } else {
            res.locals.user = null;
        }
        
        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ message: 'Authentication failed' });
    }
};