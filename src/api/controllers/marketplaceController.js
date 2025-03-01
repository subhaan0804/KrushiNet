const Listing = require('../models/listingModel');
const Transaction = require('../models/transactionModel');
const User = require('../models/userModel');

// listings
exports.getListings = async (req, res) => {
    try {
        const { page = 1, limit = 10, category, minPrice, maxPrice, sort } = req.query;
        
        const query = {};
        if (category) query.category = category;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        const sortOptions = {};
        if (sort) {
            const [field, order] = sort.split(':');
            sortOptions[field] = order === 'desc' ? -1 : 1;
        }

        const listings = await Listing.find(query)
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('sellerId', 'name location rating');

        const total = await Listing.countDocuments(query);

        res.json({
            listings,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// exports.createListing = async (req, res) => {
//     try {
        
//         // Get user's location from their profile
//         const user = await User.findById(req.user._id);
//         if (!user.location) {
//             return res.status(400).json({ message: 'User location not found' });
//         }

//         const listing = new Listing({
//             ...req.body,
//             location: user.location, // Use user's stored location
//             sellerId: req.user._id
//         });
//         console.log(listing);
//         await listing.save();
//         res.status(201).json(listing);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// };

exports.createListing = async (req, res) => {
    try {

        //DEBUGGING
        console.log(req.user);

        if (!req.user) {
            return res.status(401).json({ message: 'Please login to review the product.' });
        }

        // Get user's location from their profile
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (!user.location) {
            return res.status(400).json({ message: 'User location not found' });
        }

        const listing = new Listing({
            ...req.body,
            location: user.location, // Use user's stored location
            sellerId: req.user._id
        });

        await listing.save();
        res.status(201).json(listing);
    } catch (error) {
        console.error('Error creating listing:', error);
        res.status(400).json({ message: error.message });
    }
};

exports.getListingById = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id)
            .populate({
                path: 'sellerId',
                select: 'firstName lastName city state phoneNo email'
            });
        
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        // console.log('Fetched listing with seller:', listing); // Debug log
        res.json(listing);
    } catch (error) {
        console.error('Error fetching listing:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.updateListing = async (req, res) => {
    try {
        const listing = await Listing.findOneAndUpdate(
            { _id: req.params.id, sellerId: req.user.id },
            req.body,
            { new: true }
        );

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found or unauthorized' });
        }

        res.json(listing);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteListing = async (req, res) => {
    try {
        const listing = await Listing.findOneAndDelete({
            _id: req.params.id,
            sellerId: req.user.id
        });

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found or unauthorized' });
        }

        res.json({ message: 'Listing deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.searchListings = async (req, res) => {
    try {
        console.log("Search query received:", req.query);
        const { q } = req.query;
        
        const query = {
            $or: [
                { name: { $regex: new RegExp(q, 'i') } },
                { category: { $regex: new RegExp(q, 'i') } }
            ]
        };

        console.log("MongoDB query:", query);
        
        const listings = await Listing.find(query)
            .populate('sellerId', 'firstName lastName city state phoneNo');
        
        // console.log(`Found ${listings.length} listings:`, listings); // Debug log
        
        res.json({
            listings: listings,
            total: listings.length,
            currentPage: 1,
            totalPages: 1
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: error.message });
    }
};

// exports.searchListings = async (req, res) => {
//     try {
//         console.log("Search query received:", req.query);
//         const { q, category } = req.query;
        
//         const query = {};
        
//         if (q) {
//             query.$or = [
//                 { name: { $regex: q, $options: 'i' } },
//                 { description: { $regex: q, $options: 'i' } },
//                 { category: { $regex: q, $options: 'i' } }
//             ];
//         }

//         console.log("MongoDB query:", query);
        
//         const listings = await Listing.find(query)
//             .populate('sellerId', 'firstName lastName city state phoneNo');
        
//         console.log(`Found ${listings.length} listings`);
        
//         // Return in the same format as getListings
//         res.json({
//             listings: listings,
//             total: listings.length,
//             currentPage: 1,
//             totalPages: 1
//         });
//     } catch (error) {
//         console.error('Search error:', error);
//         res.status(500).json({ message: error.message });
//     }
// };

// transactions 
exports.createPurchase = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }
        
        if (listing.status !== 'active') {
            return res.status(400).json({ message: 'Listing is no longer active' });
        }
        
        const transaction = new Transaction({
            listing: listing._id,
            buyer: req.user.id,
            seller: listing.seller,
            amount: listing.price,
            quantity: req.body.quantity || 1
        });
        
        await transaction.save();
        
        listing.status = 'pending';
        await listing.save();
        
        res.status(201).json(transaction);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({
            $or: [{ buyer: req.user.id }, { seller: req.user.id }]
        }).populate('listing seller buyer');
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateTransactionStatus = async (req, res) => {
    try {
        const transaction = await Transaction.findOneAndUpdate(
            {
                _id: req.params.id,
                $or: [{ buyer: req.user.id }, { seller: req.user.id }]
            },
            { status: req.body.status },
            { new: true }
        );

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found or unauthorized' });
        }

        res.json(transaction);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};