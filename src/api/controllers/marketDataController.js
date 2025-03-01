const MarketData = require('../models/marketDataModel');

exports.getData = async (req, res) => {
    try {
        console.log("marketdata getdata called");
        let {
            commodity = 'Rice',
            category,
            location,
            startDate,
            endDate,
            minPrice,
            maxPrice,
            page = 1,
            limit = 30,
            sortBy = 'date',
            sortOrder = 'asc'
        } = req.query;


        // Build filter object
        const filter = {};

        // Add commodity filter if provided
        if (commodity) {
            filter.commodity = new RegExp(commodity, 'i'); // Case-insensitive search
        }

        // Add category filter if provided
        if (category) {
            filter.category = new RegExp(category, 'i');
        }

        // Add location filter if provided
        if (location) {
            filter.location = location.toUpperCase();
        }

        // Add date range filter if provided
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                filter.date.$gte = start;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                filter.date.$lte = end;
            }
        }

        // Add price range filter if provided
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Calculate skip value for pagination
        const skip = (Number(page) - 1) * Number(limit);

        // console.log("filter: ", filter)

        // Execute query with pagination
        const data = await MarketData
            .find(filter)
            .sort(sort)
            .skip(skip)
            .limit(Number(limit));

        // console.log(data)


        // const testData = await MarketData
        // .find({commodity: "blueberry", location: "MH"})
        // .limit(10)
        // console.log(testData);


        // Get total count for pagination
        const total = await MarketData.countDocuments(filter);

        // console.log(checkdata)

        // Send response
        res.status(200).json({
            success: true,
            data,
            pagination: {
                total,
                page: Number(page),
                totalPages: Math.ceil(total / limit),
                hasMore: skip + data.length < total
            },
            filter: {
                ...filter,
                appliedFilters: Object.keys(filter)
            }
        });

    } catch (error) {
        console.error('Error in getData:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching market data',
            error: error.message
        });
    }
};

// market-data?commodity=Rice&category=Crops 

exports.postData = async (req, res) => {
    try {
        const newData = new MarketData(req.body);
        const savedData = await newData.save();
        res.status(201).json(savedData);
    } catch (error) {
        res.status(500).json({ message: 'Error saving market data', error });
    }
};

exports.deleteData = async (req, res) => {
    try {
        const { id } = req.params;
        await MarketData.findByIdAndDelete(id);
        res.status(200).json({ message: 'Market data deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting market data', error });
    }
};
