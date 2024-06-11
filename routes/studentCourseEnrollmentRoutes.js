const express = require("express");
const router = express.Router();
const {
  createEnrollment,
  getAllEnrollments,
  getEnrolledCourses,
} = require("../controllers/studentCourseEnrollmentController");
const validateToken = require("../middleware/validateTokenHandler");

// Route for creating a new enrollment (requires token validation)
router.post("/", validateToken, createEnrollment);

// Route for getting all enrolments (requires token validation)
router.get("/", validateToken, getAllEnrollments);

// Route for getting all bookings of a particular student(requires token validation)
router.get("/students", validateToken, getEnrolledCourses);

module.exports = router;
