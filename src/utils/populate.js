const mongoose = require('mongoose');
const MarketData = require('../api/models/marketDataModel');
const completeData = require('./dataset.json'); // Load the dummy dataset

mongoose.connect('mongodb+srv://rijhan:rijhan@cluster0.xuzue.mongodb.net/farmerMarketplace?retryWrites=true&w=majority&appName=Cluster0');

const insertData = async () => {
  try {
    await MarketData.insertMany(completeData);
    console.log('Data inserted successfully');
  } catch (error) {
    console.error('Error inserting data:', error);
  } finally {
    mongoose.connection.close();
  }
};

insertData();