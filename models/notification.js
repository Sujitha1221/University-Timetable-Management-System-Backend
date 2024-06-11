// notification.model.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipient: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
