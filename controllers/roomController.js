const Room = require("../models/room");
const logger = require("../utils/logger");

// Controller function to create a room
const createRoom = async (req, res) => {
  try {
    // Check if the user is authorized as admin
    if (!req.user.adminId) {
      logger.warn(
        `Unauthorized access: ${req.user.adminId} is not authorized as admin`
      );
      return res
        .status(401)
        .json({ message: "You are not authorized as admin" });
    }
    const { floorNo, building, name, capacity, resources } = req.body;

    // Check if the required fields are provided
    if (!floorNo || !building || !name || !capacity) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingRoom = await Room.findOne({
      floorNo,
      building,
      name,
    });
    if (existingRoom) {
      return res.status(409).json({
        success: false,
        message: "Room is already created",
      });
    }
    // Create a new room instance
    const newRoom = new Room({
      floorNo,
      building,
      name,
      capacity,
      resources,
    });

    // Save the new room to the database
    await newRoom.save();
    if (newRoom) {
      res.status(201).json({
        success: true,
        message: "Room created successfully",
        room: newRoom,
      });
    } else {
      res.status(400).json({ success: false, error: "Room data not valid" });
    }
  } catch (error) {
    logger.error("Error creating room:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Controller function to retrieve all rooms
const getAllRooms = async (req, res) => {
  try {
    // Check if the user is authorized as admin
    if (!req.user.adminId) {
      logger.warn(
        `Unauthorized access: ${req.user.adminId} is not authorized as admin`
      );
      return res
        .status(401)
        .json({ message: "You are not authorized as admin" });
    }
    // Retrieve all rooms from the database
    const rooms = await Room.find();

    res.status(200).json({
      success: true,
      message: "All Rooms List",
      rooms,
    });
  } catch (error) {
    logger.error("Error getting rooms:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Controller function to update a room
const updateRoom = async (req, res) => {
  try {
    // Check if the user is authorized as admin
    if (!req.user.adminId) {
      logger.warn(
        `Unauthorized access: ${req.user.adminId} is not authorized as admin`
      );
      return res
        .status(401)
        .json({ message: "You are not authorized as admin" });
    }
    const roomId = req.params.roomId;
    const { floorNo, building, name, capacity, resources } = req.body;
    const existingRoom = await Room.findOne({
      floorNo,
      building,
      name,
    });
    if (existingRoom) {
      return res.status(409).json({
        success: false,
        message: "Room is already created",
      });
    }
    // Update the room in the database
    const updatedRoom = await Room.findOneAndUpdate(
      { roomId },
      { floorNo, building, name, capacity, resources },
      {
        new: true,
      }
    );

    if (!updatedRoom) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Room updated successfully",
      room: updatedRoom,
    });
  } catch (error) {
    logger.error("Error updating room:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Controller function to delete a room
const deleteRoom = async (req, res) => {
  try {
    // Check if the user is authorized as admin
    if (!req.user.adminId) {
      logger.warn(
        `Unauthorized access: ${req.user.adminId} is not authorized as admin`
      );
      return res
        .status(401)
        .json({ message: "You are not authorized as admin" });
    }
    const roomId = req.params.roomId;

    // Delete the room from the database
    const deletedRoom = await Room.findOneAndDelete({ roomId });

    if (!deletedRoom) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Room deleted successfully",
      room: deletedRoom,
    });
  } catch (error) {
    logger.error("Error deleting room:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

module.exports = { createRoom, getAllRooms, updateRoom, deleteRoom };
