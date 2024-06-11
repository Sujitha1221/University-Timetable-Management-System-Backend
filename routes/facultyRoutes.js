const express = require("express");
const router = express.Router();
const {
  registerFaculty,
  getAllFaculties,
  getFaculty,
  deleteFaculty,
  updateFaculty,
  loginFaculty,
} = require("../controllers/facultyController");
const validateToken = require("../middleware/validateTokenHandler");

// Route for registering a new faculty
router.post("/register", registerFaculty);

// Route for logging in a faculty
router.post("/login", loginFaculty);

// Route for getting all faculties (requires token validation)
router.get("/", validateToken, getAllFaculties);

// Route for getting a specific faculty by ID (requires token validation)
router.get("/:facultyId", validateToken, getFaculty);

// Route for deleting a specific faculty by ID (requires token validation)
router.delete("/:facultyId", validateToken, deleteFaculty);

// Route for updating a specific faculty by ID (requires token validation)
router.put("/:facultyId", validateToken, updateFaculty);

module.exports = router;
