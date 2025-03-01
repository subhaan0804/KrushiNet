// marketAnalysisController.js
const MarketIntelligence = require('../services/marketIntelligence');
const MarketData = require('../models/marketDataModel');

// Instead of class, use object with methods
const marketAnalysisController = {
    // Get complete market analysis
    getCompleteAnalysis: async (req, res) => {
        try {
            console.log("complete analysis is called.")
            const { commodity, location } = req.params;
            const { days } = req.query;
            
            const intelligence = new MarketIntelligence(MarketData);

            const [trends, anomalies, prediction, health] = await Promise.all([
                intelligence.analyzePriceTrends(commodity, location, days),
                intelligence.detectPriceAnomalies(commodity, location),
                intelligence.predictNextDayPrice(commodity, location),
                intelligence.calculateMarketHealth(commodity, location)
            ]);

            res.json({
                success: true,
                data: {
                    commodity,
                    location,
                    analysis: {
                        trends,
                        anomalies,
                        prediction,
                        health
                    }
                }
            });
        } catch (error) {
            console.error('Analysis error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    // Other methods follow the same pattern
    getPriceTrends: async (req, res) => {
        try {
            const { commodity, location } = req.params;
            const { days = 30 } = req.query;
            
            

            const intelligence = new MarketIntelligence(MarketData);


            const trends = await intelligence.analyzePriceTrends(
                commodity,
                location,
                parseInt(days)
            );

            // console.log(trends)

            res.json({
                success: true,
                data: trends
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },

    getAnomalies: async (req, res) => {
        try {
            const { commodity, location, limit } = req.params;
            const intelligence = new MarketIntelligence(MarketData);
            const anomalies = await intelligence.detectPriceAnomalies(commodity, location, limit);
            res.json({ success: true, data: anomalies });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },
    
    getPricePrediction: async (req, res) => {
        try {
            const { commodity, location, limit } = req.params;
            const intelligence = new MarketIntelligence(MarketData);
            const prediction = await intelligence.predictNextDayPrice(commodity, location, limit);
            res.json({ success: true, data: prediction });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },
    
    getMarketHealth: async (req, res) => {
        try {
            const { commodity, location } = req.params;

            // debugging 
            // const data = await MarketData.find({commodity, location, days: 30});
            // console.log(data)

            const intelligence = new MarketIntelligence(MarketData);
            const health = await intelligence.calculateMarketHealth(commodity, location, limit);
            res.json({ success: true, data: health });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    validateInputs: (req, res, next) => {
        const { commodity, location, limit } = req.params;
        
        if (!commodity || !location || !limit) {
            return res.status(400).json({
                success: false,
                error: 'Commodity and location are required'
            });
        }
        next();
    }
};

module.exports = marketAnalysisController;