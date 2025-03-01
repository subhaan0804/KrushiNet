// const express = require('express');
// const app = express();  
// const dotenv = require('dotenv');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const connectDB = require('./db');
// const authRoute = require('../api/routes/authRoute');
// const marketplaceRoute = require('../api/routes/marketplaceRoute');
// const cookieParser = require('cookie-parser');
// app.use(cookieParser());
// dotenv.config();

// // Connecting to MongoDB
// connectDB();

// // Middleware
// app.use(express.json());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cors());

// // Set the view engine to EJS
// app.set('view engine', 'ejs');
// app.set('views', './src/views');

// // Serve static files from the public folder
// app.use(express.static('public'));

// // Routes
// app.get('/', (req, res) => {
//     res.type('text/plain');
//     res.status(200).send('Hello Codesmith!');
// });

// // API routes
// app.use('/auth', authRoute); // Use the auth route
// app.use('/marketplace', marketplaceRoute); // Use the marketplace route

// // Start the server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });


// PS: Creating a system for real-time market intelligence and direct market access for farmers in india.

const express = require('express');
const app = express();  
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./src/config/db');
const path = require('path');
const cookieParser = require('cookie-parser');
dotenv.config();
const testCloudinaryRoute = require('./src/api/routes/testCloudinaryRoute');

// Database connection
connectDB();

// Set EJS (Embedded JavaScript) as the templating engine
app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, '../src/views'));
app.set('views', path.join(process.cwd(), 'src', 'views'));
console.log(path.join(process.cwd(), 'src', 'views'))
// 1console.log("Initializing", path.join(__dirname, '../src/views')) // debugging


// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
console.log(path.join(__dirname, 'public')) // debugging
app.use('/images', express.static(path.join(__dirname, 'public/images')));

//Middleware
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// API routes
const authRoute = require('./src/api/routes/authRoute');
const marketplaceRoute = require('./src/api/routes/marketplaceRoute');
const marketDataRoute = require('./src/api/routes/marketDataRoute');
const chatbotRoute = require('./src/api/routes/chatbotRoute');
const profileRoute = require('./src/api/routes/profileRoute');
const testUploadRoute = require('./src/api/routes/testUploadRoute');
// const searchRoute = require('./api/routes/searchRoute');


app.use('/auth', authRoute);
app.use('/marketplace', marketplaceRoute);
app.use('/marketData', marketDataRoute);
app.use('/chatbot', chatbotRoute);
app.use('/user', profileRoute);
// app.use('/test-cloudinary', testCloudinaryRoute);
// app.use('/search', searchRoute);
app.use('/test', testUploadRoute);



// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

