require('dotenv').config();
const express = require('express');
require("./config/db").connect();
//const connectDB = require('./config/db'); // Import database connection configuration


const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
//connectDB();

// Middleware
//app.use(express.json());

// Routes
//const blogRoutes = require('./routes/blogRoutes');
// const authRoutes = require('./routes/authRoutes');

// app.use('/api/blogs', blogRoutes);
// app.use('/api/auth', authRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
