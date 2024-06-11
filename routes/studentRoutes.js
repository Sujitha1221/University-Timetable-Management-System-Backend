const express = require("express");
const router = express.Router();
const {
  registerStudent,
  getAllStudents,
  getStudent,
  deleteStudent,
  updateStudent,
  loginStudent,
} = require("../controllers/studentController");
const validateToken = require("../middleware/validateTokenHandler");

// Route for registering a new student
router.post("/register", registerStudent);

// Route for logging in an student
router.post("/login", loginStudent);

// Route for getting all students (requires token validation)
router.get("/", validateToken, getAllStudents);

// Route for getting a specific student by ID (requires token validation)
router.get("/:studentId", validateToken, getStudent);

// Route for deleting a specific student by ID (requires token validation)
router.delete("/:studentId", validateToken, deleteStudent);

// Route for updating a specific student by ID (requires token validation)
router.put("/:studentId", validateToken, updateStudent);

module.exports = router;
