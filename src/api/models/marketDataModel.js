const mongoose = require("mongoose");

const marketDataSchema = new mongoose.Schema({
    commodity: { type: String, required: true }, // Name of the commodity (rice, wheat, etc.)
    category: { type: String, required: true, enum: ["Crops", "Root Vegetables", "Fruits","Spices", "Organic","Nursery and Plants","Dry Fruits","Animals","Seeds"] },
    price: { type: Number, required: true }, // Price per unit
    unit: { type: String, required: true, enum: ["KG", "Ltr", "Per Dozen", "Per Animal"] }, // Based on commodity type
    location: { type: String, required: true }, // StateCode (e.g., MH, GJ, UP)
    date: { type: Date, required: true, default: Date.now }, // Use Date type for better querying // Market trend analysis
});

// Export model
const MarketData = mongoose.model("MarketData", marketDataSchema, "marketAnalysisData");
module.exports = MarketData;