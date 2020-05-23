const axios = require("axios");

// Our function to call third-party service
const getPriceInUSD = () =>
  axios.get("https://example.com/api/price").then(response => response.data);

// Our custom client to be used as middleware
const cryptoClient = async (req, res, next) => {
  // Attach our client to the req object
  // To be used later as req.crypto.getPriceInUSD
  req.crypto = {
    getPriceInUSD,
  };

  next();
};

module.exports = {
  cryptoClient,
};
