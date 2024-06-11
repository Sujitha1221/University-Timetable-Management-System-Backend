const winston = require("winston");

const { createLogger, transports, format } = winston;

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "error.log", level: "error" }),
    new transports.File({ filename: "combined.log" }),
  ],
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception: ", err.message);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Rejection: ", err.message);
  process.exit(1);
});

module.exports = logger;
