const express = require("express");
const router = express.Router();
const {
  createRoom,
  getAllRooms,
  updateRoom,
  deleteRoom,
} = require("../controllers/roomController");
const validateToken = require("../middleware/validateTokenHandler");

// Route for creating a new room (requires token validation)
router.post("/", validateToken, createRoom);

// Route for getting all rooms (requires token validation)
router.get("/", validateToken, getAllRooms);

// Route for updating a room by course room Id (requires token validation)
router.put("/:roomId", validateToken, updateRoom);

// Route for deleting a course by room Id (requires token validation)
router.delete("/:roomId", validateToken, deleteRoom);

module.exports = router;
