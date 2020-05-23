const axios = require("axios");

const cryptoClient = async (req, res, next) => {
  const getPriceInUSD = () =>
    axios.get("https://example.com/api/price").then(response => response.data);

  req.crypto = {
    getPriceInUSD,
  };

  next();
};

module.exports = {
  cryptoClient,
};
