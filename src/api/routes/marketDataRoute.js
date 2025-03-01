const express = require('express');
const router = express.Router();
const marketDataController = require('../controllers/marketDataController');
const marketAnalysisController = require('../controllers/marketAnalysisController');

router.get('/getCommodityData', marketDataController.getData); 
router.post('/postCommodityData', marketDataController.postData); 
router.delete('/deleteCommodityData/:id', marketDataController.deleteData); 


// Apply validation middleware to all routes
router.use('/:commodity/:location/:limit', marketAnalysisController.validateInputs);

// Complete analysis
router.get('/analysis/:commodity/:location/:limit', marketAnalysisController.getCompleteAnalysis);

// Individual analysis endpoints
router.get('/trends/:commodity/:location/:limit', marketAnalysisController.getPriceTrends);
router.get('/anomalies/:commodity/:location/:limit', marketAnalysisController.getAnomalies);
router.get('/prediction/:commodity/:location/:limit', marketAnalysisController.getPricePrediction);
// router.get('/health/:commodity/:location/:limit', marketAnalysisController.getMarketHealth);

module.exports = router;