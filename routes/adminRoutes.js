const express = require("express");
const router = express.Router();
const {
  registerAdmin,
  getAdmin,
  getAllAdmins,
  deleteAdmin,
  updateAdmin,
  loginAdmin,
} = require("../controllers/adminController");
const validateToken = require("../middleware/validateTokenHandler");

// Route for registering a new admin
router.post("/register", registerAdmin);

// Route for logging in an admin
router.post("/login", loginAdmin);

// Route for getting all admins (requires token validation)
router.get("/", validateToken, getAllAdmins);

// Route for getting a specific admin by ID (requires token validation)
router.get("/:adminId", validateToken, getAdmin);

// Route for deleting a specific admin by ID (requires token validation)
router.delete("/:adminId", validateToken, deleteAdmin);

// Route for updating a specific admin by ID (requires token validation)
router.put("/:adminId", validateToken, updateAdmin);

module.exports = router;
