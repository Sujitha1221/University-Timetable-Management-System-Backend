const express = require("express");
const router = express.Router();
const {
  createBooking,
  getAllBookings,
  updateBooking,
  deleteBooking,
} = require("../controllers/bookingController");
const validateToken = require("../middleware/validateTokenHandler");

// Route for creating a new booking (requires token validation)
router.post("/", validateToken, createBooking);

// Route for getting all bookings (requires token validation)
router.get("/", validateToken, getAllBookings);

// Route for updating a booking by ID (requires token validation)
router.put("/:id", validateToken, updateBooking);

// Route for deleting a booking by ID (requires token validation)
router.delete("/:id", validateToken, deleteBooking);

module.exports = router;
