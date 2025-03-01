const _ = require('lodash');

class MarketIntelligence {
  constructor(MarketData) {
    this.MarketData = MarketData;
  }

  // 1. Price Trend Analysis
  // async analyzePriceTrends(commodity, location, limit = 10, days = 120) {
  //   const data = await this.MarketData.find({
  //     commodity,
  //     location,
  //     date: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
  //   }).sort({ date: 1 })
  //   .limit(limit);
    
  //   console.log(data);

  //   const trend = {
  //     overallTrend: this.calculateTrend(data.map(d => d.price)),
  //     volatility: this.calculateVolatility(data.map(d => d.price)),
  //     averagePrice: _.meanBy(data, 'price'),
  //     minPrice: _.minBy(data, 'price')?.price,
  //     maxPrice: _.maxBy(data, 'price')?.price
  //   };


  //   return {
  //     commodity,
  //     location,
  //     period: `${days} days`,
  //     trend
  //   };
  // }
  // Modified analyzePriceTrends method
async analyzePriceTrends(commodity, location, limit = 10, days = 120) {
  const data = await this.MarketData.find({
      commodity,
      location,
      date: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
  })
  .sort({ date: 1 })
  .limit(limit);
  
  const prices = data.map(d => d.price);
  const dates = data.map(d => d.date);
  
  const trend = {
      overallTrend: this.calculateTrend(prices),
      volatility: this.calculateVolatility(prices), // Now returns array of daily volatilities
      averagePrice: _.meanBy(data, 'price'),
      minPrice: _.minBy(data, 'price')?.price,
      maxPrice: _.maxBy(data, 'price')?.price,
      dates: dates // Include dates for plotting
  };

  return {
      commodity,
      location,
      period: `${days} days`,
      trend
  };
}

  // 2. Anomaly Detection
  async detectPriceAnomalies(commodity, location, threshold = 1.7, limit=30, days=120) {
    const data = await this.MarketData.find({
      commodity,
      location,
      date: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
    }).sort({ date: 1 })
    .limit(limit)
    console.log("anomoly data: ", data)

  
    const prices = data.map(d => d.price);
    const mean = _.mean(prices);
    const stdDev = this.calculateStdDev(prices);

    console.log(prices, mean, stdDev)

    const anomalies = data.filter(item => {
      const zScore = Math.abs((item.price - mean) / stdDev);
      return zScore > threshold;
    });

    console.log(anomalies)

    if (stdDev === 0 || isNaN(stdDev)) {
      console.warn("Standard deviation is zero or invalid, skipping anomaly detection.");
      return { commodity, location, anomalies: [] };
    }

    return {
      commodity,
      location,
      totalPricesChecked: data.length,
      anomalies: anomalies.map(a => ({
        date: a.date,
        price: a.price,
        deviation: ((a.price - mean) / mean) * 100,
      }))
    };
  }

  // 3. Price Prediction (Simple moving average based)
  async predictNextDayPrice(commodity, location, limit=10, days=120) {
    const recentData = await this.MarketData.find({
      commodity,
      location,
      date: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
    }).sort({ date: -1 })
    .limit(limit);
    // console.log(recentData)


    const prices = recentData.map(d => d.price);
    const movingAverage = this.calculateMovingAverage(prices, 3);
    const trend = this.calculateTrend(prices);

    
    const predictedPrice = movingAverage * (1 + (trend / 100));
    console.log(predictedPrice)

    return {
      commodity,
      location,
      currentPrice: prices[0],
      predictedPrice: Math.round(predictedPrice * 100) / 100,
      confidence: this.calculatePredictionConfidence(prices),
      trend: `${trend > 0 ? 'Upward' : 'Downward'} (${Math.abs(trend)}%)`
    };
  }

  // 4. Market Health Score
  // async calculateMarketHealth(commodity, location) {
  //   console.log("Commodity:", commodity); // Debugging
  //   console.log("Location:", location); // Debugging

  //   console.log(typeof commodity)
  //   const data = await this.MarketData
  //   .find({commodity: commodity, location: location})
  //   .limit(10)
  //   // .sort({ date: 1 });
  //   // date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  //   console.log(data)

  //   // const testData = await this.MarketData
  //   // .find({commodity: "blueberry", location: "MH"})
  //   // .limit(10)
  //   // console.log(testData);




  //   const prices = data.map(d => d.price);
  //   // console.log(prices)
  //   const volatility = this.calculateVolatility(prices);
  //   const trend = this.calculateTrend(prices);
  //   const tradingVolume = data.length;

  //   // Health score (0-100) based on multiple factors
  //   const healthScore = Math.min(100, Math.max(0,
  //     50 + // Base score
  //     (trend * 2) + // Positive trend adds to health
  //     (20 * (1 - volatility)) + // Lower volatility is better
  //     (Math.min(30, tradingVolume)) // More trading activity is better
  //   ));
    
  //   return {
  //     commodity,
  //     location,
  //     healthScore: Math.round(healthScore),
  //     components: {
  //       trend,
  //       volatility,
  //       tradingVolume
  //     },
  //     status: this.getHealthStatus(healthScore)
  //   };
  // }

  // Helper Methods
  calculateTrend(prices) {
    if (prices.length < 2) return 0;
    console.log(prices); // Debugging
    const firstPrice = prices[prices.length - 1];
    const lastPrice = prices[0];
    return Math.round(((lastPrice - firstPrice) / firstPrice) * 100 * 100) / 100;
  }

  // calculateVolatility(prices) {
  //   const returns = [];
  //   for (let i = 1; i < prices.length; i++) {
  //     returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  //   }
  //   return this.calculateStdDev(returns);
  // }

  calculateVolatility(prices, window = 5) {
    if (prices.length < window) {
        return new Array(prices.length).fill(0);
    }

    const volatilities = [];
    
    // For the first window-1 days, we calculate with available data
    for (let i = 0; i < window - 1; i++) {
        const windowSlice = prices.slice(0, i + 1);
        const mean = _.mean(windowSlice);
        const squareDiffs = windowSlice.map(value => Math.pow(value - mean, 2));
        const variance = _.mean(squareDiffs);
        volatilities.push(Math.sqrt(variance) / mean * 100); // Convert to percentage
    }
    
    // For remaining days, use rolling window
    for (let i = window - 1; i < prices.length; i++) {
        const windowSlice = prices.slice(i - window + 1, i + 1);
        const mean = _.mean(windowSlice);
        const squareDiffs = windowSlice.map(value => Math.pow(value - mean, 2));
        const variance = _.mean(squareDiffs);
        volatilities.push(Math.sqrt(variance) / mean * 100); // Convert to percentage
    }
    
    return volatilities;
  }

  calculateStdDev(numbers) {
    const mean = _.mean(numbers);
    const squareDiffs = numbers.map(value => Math.pow(value - mean, 2));
    return Math.sqrt(_.mean(squareDiffs));
  }

  calculateMovingAverage(prices, window) {
    return _.mean(prices.slice(0, window));
  }

  calculatePredictionConfidence(prices) {
    const volatility = this.calculateVolatility(prices);
    return Math.round((1 - Math.min(volatility, 0.5)) * 100);
  }

  getHealthStatus(score) {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    if (score >= 20) return 'Poor';
    return 'Critical';
  }
}

module.exports = MarketIntelligence;
