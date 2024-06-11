const express = require("express");
const router = express.Router();
const {
  createTimeTableEntry,
  getAllTimeTableEntries,
  updateTimeTableEntry,
  deleteTimeTableEntry,
  getStudentTimeTable,
  getFacultyTimeTable,
} = require("../controllers/timeTableController");
const validateToken = require("../middleware/validateTokenHandler");

// Route for creating a new time table entry (requires token validation)
router.post("/", validateToken, createTimeTableEntry);

// Route for getting all time table entries (requires token validation)
router.get("/", validateToken, getAllTimeTableEntries);

// Route for updating a time table entry by ID (requires token validation)
router.put("/:id", validateToken, updateTimeTableEntry);

// Route for deleting a time table entry by ID (requires token validation)
router.delete("/:id", validateToken, deleteTimeTableEntry);

// Route for getting time table entries for a paticular student (requires token validation)
router.get("/students", validateToken, getStudentTimeTable);

// Route for getting time table entries for a paticular faculty (requires token validation)
router.get("/faculties", validateToken, getFacultyTimeTable);

module.exports = router;
