const express = require("express");
const router = express.Router();
const {
  createCourse,
  getAllCourses,
  updateCourse,
  deleteCourse,
  getAllCoursesByFacultyId,
} = require("../controllers/courseController");
const validateToken = require("../middleware/validateTokenHandler");

// Route for creating a new course (requires token validation)
router.post("/", validateToken, createCourse);

// Route for getting all courses
router.get("/", getAllCourses);

// Route for getting all courses of a specific faculty (requires token validation)
router.get("/faculty-courses", validateToken, getAllCoursesByFacultyId);

// Route for updating a course by course code (requires token validation)
router.put("/:courseCode", validateToken, updateCourse);

// Route for deleting a course by course code (requires token validation)
router.delete("/:courseCode", validateToken, deleteCourse);

module.exports = router;
