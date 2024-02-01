const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require('dotenv').config(); // Load environment variables from .env file

const port = process.env.PORT || 2004;
const Routes = require("./Routes/user");

const app = express();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
   // useNewUrlParser: true,
   // useUnifiedTopology: true,
   // useCreateIndex: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
});

// Routes
app.use("/", Routes);

// Start server
app.listen(port, () => {
    console.log("Server is running at port", port);
});
