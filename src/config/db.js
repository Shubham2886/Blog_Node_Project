require("dotenv").config();
const mongoose = require('mongoose');
const express = require('express');
const app = express()

const bodyParser = require('body-parser')
app.use(bodyParser.json({
  limit: '50mb'
}));

app.use(bodyParser.urlencoded({
  limit: '50mb',
  parameterLimit: 100000,
  extended: true 
}));


exports.connect = () => {
    mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
        .then(() => {
            console.log("Successfully connected to database❤️");
        })
        .catch(err => {
            console.log("database connection failed. exiting now...");
            console.error(err);
            process.exit(1)
        })
}