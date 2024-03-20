require('dotenv').config();
const express = require('express');
require("./config/db").connect();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
//app.use(express.json());

// Routes
const blogRoutes = require('./routes/blog.route');
const authRoutes = require('./routes/auth.route');

app.use('/api/blogs', blogRoutes);
app.use('/api/auth', authRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
