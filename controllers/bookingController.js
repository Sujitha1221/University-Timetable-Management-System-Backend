const Booking = require("../models/Booking");
const admin = require("../models/admin");
const Course = require("../models/course");
const Room = require("../models/room");
const logger = require("../utils/logger");

// Create a new booking
const createBooking = async (req, res) => {
  try {
    if (!req.user.adminId) {
      // Check if the requester is an admins
      logger.warn(
        `Unauthorized access: ${req.user.adminId} is not authorized as admin`
      );
      return res
        .status(401)
        .json({ message: "You are not authorized as admin" });
    }
    const { roomId, courseId, startTime, endTime, dayOfWeek } = req.body;

    // Check if the required fields are provided
    if (!roomId || !courseId || !dayOfWeek || !startTime || !endTime) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // Check if roomId exists
    const roomExists = await Room.exists({ roomId: roomId });
    if (!roomExists) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid roomId provided" });
    }

    // Check if courseId exists
    const courseExists = await Course.exists({ courseCode: courseId });
    if (!courseExists) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid courseId provided" });
    }

    // Check if adminId exists
    const adminExists = await admin.exists({ adminId: req.user.adminId });
    if (!adminExists) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid adminId provided" });
    }

    const existingBooking = await Booking.findOne({
      roomId,
      dayOfWeek,
      startTime,
      endTime,
    });
    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: "Booking already exists",
      });
    }
    const newBooking = new Booking({
      roomId,
      courseId,
      bookedBy: req.user.adminId,
      dayOfWeek,
      startTime,
      endTime,
    });

    // Save the new booking to the database
    await newBooking.save();
    if (newBooking) {
      res.status(201).json({
        success: true,
        message: "Booking created successfully",
        booking: newBooking,
      });
    } else {
      res.status(400).json({ success: false, error: "Booking data not valid" });
    }
  } catch (err) {
    logger.error("Error creating booking:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Update an existing booking
const updateBooking = async (req, res) => {
  try {
    // Check if the requester is an admin
    if (!req.user.adminId) {
      logger.warn(
        `Unauthorized access: ${req.user.adminId} is not authorized as admin`
      );
      return res
        .status(401)
        .json({ message: "You are not authorized as admin" });
    }
    const { id } = req.params;
    const { roomId, courseId, dayOfWeek, startTime, endTime } = req.body;

    // Check if roomId exists
    const roomExists = await Room.exists({ roomId: roomId });
    if (!roomExists) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid roomId provided" });
    }

    // Check if courseId exists
    const courseExists = await Course.exists({ courseCode: courseId });
    if (!courseExists) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid courseId provided" });
    }

    // Check if adminId exists
    const adminExists = await admin.exists({ adminId: req.user.adminId });
    if (!adminExists) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid adminId provided" });
    }

    const existingBooking = await Booking.findOne({
      roomId,
      startTime,
      dayOfWeek,
      endTime,
    });
    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: "Booking already exists",
      });
    }
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      {
        roomId,
        courseId,
        bookedBy: req.user.adminId,
        dayOfWeek,
        startTime,
        endTime,
      },
      {
        new: true,
      }
    );
    if (!updatedBooking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      booking: updatedBooking,
    });
  } catch (err) {
    logger.error("Error updating booking:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Delete a booking
const deleteBooking = async (req, res) => {
  try {
    // Check if the requester is an admin
    if (!req.user.adminId) {
      logger.warn(
        `Unauthorized access: ${req.user.adminId} is not authorized as admin`
      );
      return res
        .status(401)
        .json({ message: "You are not authorized as admin" });
    }
    const { id } = req.params;
    const deletedBooking = await Booking.findByIdAndDelete(id);
    if (!deletedBooking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
      booking: deletedBooking,
    });
  } catch (err) {
    logger.error("Error deleting booking:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Get all bookings
const getAllBookings = async (req, res) => {
  try {
    // Check if the requester is an admin
    if (!req.user.adminId) {
      logger.warn(
        `Unauthorized access: ${req.user.adminId} is not authorized as admin`
      );
      return res
        .status(401)
        .json({ message: "You are not authorized as admin" });
    }
    const bookings = await Booking.find();
    res.status(200).json({
      success: true,
      message: "All Bookings List",
      bookings,
    });
  } catch (err) {
    logger.error("Error getting bookings:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  updateBooking,
  deleteBooking,
};
