const express = require("express");
const router = express.Router();
const {
  createNotification,
  sendNotification,
} = require("../controllers/notificationController");

// Route for creating a new notification when timetable changes
router.post("/", createNotification);

// Route for creating a new notification manually
router.post("/notification", sendNotification);

module.exports = router;
