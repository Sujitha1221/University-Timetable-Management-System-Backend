const logger = require("../utils/logger");
const Notification = require("../models/notification");
const Student = require("../models/student");
const Faculty = require("../models/faculty");

// Function to create a notification
const createNotification = async (recipient, message) => {
  try {
    // Create a new notification instance
    const notification = new Notification({
      recipient,
      message,
    });
    // Save the notification to the database
    await notification.save();
    logger.info("Notification sent:", notification);
  } catch (error) {
    logger.error("Error sending notification:", error);
  }
};

// Controller function to send a notification
const sendNotification = async (req, res) => {
  try {
    const { recipient, message } = req.body;
    // Check if recipient is a student
    const isStudent = await Student.exists({ studentId: recipient });
    // Check if recipient is a faculty member
    const isFaculty = await Faculty.exists({ facultyId: recipient });

    // If recipient is neither a student nor a faculty member, return a 400 error
    if (!isStudent && !isFaculty) {
      return res.status(400).send("Recipient ID is invalid");
    }

    // Create a new notification
    const notification = new Notification({
      recipient,
      message,
    });
    await notification.save();
    return res.status(200).json("Notification sent successfully");
  } catch (error) {
    logger.error(error);
    return res.status(500).json("Internal server error");
  }
};

module.exports = {
  createNotification,
  sendNotification,
};
