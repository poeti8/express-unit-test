const { User } = require("./models");

const ping = (req, res) => res.status(200).send("pong");

const getPrice = async (req, res) => {
  try {
    const data = await req.crypto.getPriceInUSD();
    return res.status(200).send(data);
  } catch (error) {
    return res.status(500).send({ message: "Couldn't get USD value." });
  }
};

const createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    return res.status(200).send(user.toObject());
  } catch (error) {
    return res.status(500).send({ message: "Couldn't create user." });
  }
};

module.exports = {
  getPrice,
  ping,
  createUser,
};
