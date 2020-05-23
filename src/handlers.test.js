const { Request, Response } = require("jest-express");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const handlers = require("./handler");
const helpers = require("./helpers");
const { User } = require("./models");

// describe("ping", () => {
//   const req = {};
//   const res = {};

//   beforeEach(() => {
//     res.status = jest.fn().mockReturnValue(res);
//     res.send = jest.fn().mockReturnValue(res);
//   });

//   it("should respond with ping", async () => {
//     await handlers.ping(req, res);
//     expect(res.status).toBeCalledWith(200);
//   });
// });

describe("handlers", () => {
  let mongod;
  let req;
  let res;
  let next;

  beforeAll(async () => {
    // Create an in memory MongoDB server and get its URI
    mongod = new MongoMemoryServer();
    const uri = await mongod.getUri();
    // Use our in memory database in mongoose
    await mongoose.connect(uri, { useNewUrlParser: true });
  });

  afterAll(async () => {
    // Disconnect and reset both mongoose and MongoDB server
    await mongoose.disconnect();
    await mongod.stop();
  });

  beforeEach(() => {
    req = new Request();
    res = new Response();
    next = jest.fn();
    helpers.cryptoClient(req, res, next);
  });

  describe("ping()", () => {
    it("should respond with ping", async () => {
      await handlers.ping(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith("pong");
    });
  });

  describe("getPrice()", () => {
    it("should get BTC price in USD", async () => {
      // Our mock data that we expect to receive from third-party call
      const mockData = { price: 7821, currency: "USD" };
      // Mock our external call and tell it to resolve with our mock data
      req.crypto.getPriceInUSD = jest.fn().mockResolvedValueOnce(mockData);
      // Run our handler
      await handlers.getPrice(req, res);
      // Make sure we have called our mocked function and got expected data
      expect(req.crypto.getPriceInUSD).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(mockData);
    });

    it("should throw expected error when getging BTC price in USD", async () => {
      const mockData = { price: 7821, currency: "USD" };
      // Mock our external call and tell it to reject
      req.crypto.getPriceInUSD = jest.fn().mockRejectedValueOnce();
      // Run our handler
      await handlers.getPrice(req, res);
      // Expect handler to send an error with expected message
      expect(req.crypto.getPriceInUSD).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: "Couldn't get USD value.",
      });
    });
  });

  describe("createUser()", () => {
    it("should create the user", async () => {
      // Mock request body with sample data
      req.body = {
        email: "john@example.com",
        firstName: "John",
        lastName: "Doe",
      };
      await handlers.createUser(req, res);
      // Get user from database
      const user = await User.findOne({ email: "john@example.com" });
      // Expect returned response body to match user in database
      expect(res.send).toHaveBeenCalledWith(user.toObject());
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should throw expected error", async () => {
      req.body = {
        email: "jane@example.com",
        firstName: "Jane",
        lastName: "Doe",
      };
      // "spy" on User.create() and mock it when it's called
      jest.spyOn(User, "create").mockRejectedValueOnce();
      await handlers.createUser(req, res);
      // Get user to make sure it was not created
      const user = await User.findOne({ email: "jane@example.com" });
      expect(user).toBeNull();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: "Couldn't create user.",
      });
    });
  });
});
