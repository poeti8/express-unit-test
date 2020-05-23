require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const handlers = require("./handler");
const helpers = require("./helpers");

// Connect to database
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
});

// Create app
const app = express();

// Middleware functions
app.use(express.json());

// Routes
app.get("/ping", handlers.ping);
app.get("/price", helpers.cryptoClient, handlers.getPrice);
app.post("/user", handlers.createUser);

// Start the app
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
