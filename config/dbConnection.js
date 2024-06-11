const logger = require("../utils/logger.js");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();
const URL = process.env.MONGODB_URL;

const databaseConnection = () => {
  mongoose.connect(URL);
  mongoose.set("strictQuery", true);

  const connection = mongoose.connection;
  connection.once("open", () => {
    logger.info(`Database Connection Success`);
  });
};

module.exports = databaseConnection;
