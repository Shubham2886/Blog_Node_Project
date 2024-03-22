require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { connect } = require('./config/db'); // Import the connect function from your db configuration

const app = express();

// Connect to the database
connect();

// Middleware to parse JSON and URL-encoded bodies with increased limits
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 100000 }));

// Routes
const blogRoutes = require('./routes/blog.route');
const authRoutes = require('./routes/auth.route');

app.use('/api/blogs', blogRoutes);
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack
    res.status(500).json({ message: "Internal Server Error" }); // Send a generic error response
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
