const express = require('express');
const app = express();

const mongoose = require('mongoose');
const authroute = require("./routes/auth"); //authentication part
const userRoute = require("./routes/users");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authroute);
app.use("/api/users",userRoute);


mongoose.connect("")
.then(console.log("Connected"))
.catch((err) => console.log(err));



const blogsRouter = require('./routes/Blogs');

// Register the blogs API routes
app.use('/blogs', blogsRouter);


app.listen("5000", ()=>{

    console.log("Backend is running");
})
