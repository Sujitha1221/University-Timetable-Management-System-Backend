const Admin = require("../models/admin");
const {
  isValidEmail,
  validatePhoneNumber,
  validatePassword,
} = require("../utils/commonFunctions");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

// Controller for registering a new admin
const registerAdmin = async (req, res) => {
  const { firstName, lastName, email, address, phone, password, dob } =
    req.body;
  try {
    // Check for missing required fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !address ||
      !phone ||
      !password ||
      !dob
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }
    // Validate email
    if (!isValidEmail(email)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid email format" });
    }

    // Validate phone number
    if (!validatePhoneNumber(phone)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid Sri Lankan phone number" });
    }

    // Validate password
    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        error:
          "Password should be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number",
      });
    }

    // Check if admin with provided email already exists
    const existingUser = await Admin.findOne({ email });
    if (existingUser) {
      logger.warn(
        `Admin with email : ${email} already exists during admin registration`
      );
      return res.status(409).json({
        success: false,
        message: "Admin already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Create a new admin
    const admin = await Admin.create({
      firstName,
      lastName,
      email,
      address,
      phone,
      password: hashedPassword,
      dob,
    });
    if (admin) {
      res
        .status(201)
        .json({ success: true, message: "New Admin created", data: admin });
    } else {
      logger.error("User data not valid during admin registration");
      res.status(400).json({ success: false, error: "User data not valid" });
    }
  } catch (error) {
    logger.error("Error while registering the admin:", error);
    res.status(500).json({
      success: false,
      error,
      message: "Error while registering the admin",
    });
  }
};

// Controller for logging in an admin
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!isValidEmail(email)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid email format" });
    }
    // Validate password
    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        error:
          "Password should be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number",
      });
    }
    // Find admin by email
    const user = await Admin.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      // Create and send access token
      const accessToken = jwt.sign(
        {
          user: {
            adminId: user.adminId,
            email: user.email,
            id: user.id,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1y" }
      );
      res.status(200).json({ accessToken });
    } else {
      logger.warn("Email or password is not valid during admin login");
      res
        .status(400)
        .json({ success: false, error: "Email or password is not valid" });
    }
  } catch (error) {
    logger.error("Error while logging in:", error);
    res.status(500).json({
      success: false,
      error,
      message: "Error while loggig in",
    });
  }
};

// Controller to get all admins
const getAllAdmins = async (req, res) => {
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
    const admins = await Admin.find();
    res.status(200).json({
      success: true,
      message: "All Admins List",
      admins,
    });
  } catch (error) {
    logger.error("Error while getting all admins:", error);
    res.status(500).json({
      success: false,
      error,
      message: "Error while getting all Admins",
    });
  }
};

// Controller function to get a single admin
const getAdmin = async (req, res) => {
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
    const admin = await Admin.findOne({ adminId: req.params.adminId });

    if (!admin) {
      logger.error(`Admin with admin Id ${req.params.adminId} not found`);
      return res.status(404).json({
        success: false,
        message: "admin not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Retrieved admin successfully",
      admin,
    });
  } catch (error) {
    logger.error("Error while retrieving Admin:", error);
    res.status(500).json({
      success: false,
      error,
      message: "Error while getting admin",
    });
  }
};

// Controller function to delete an admin
const deleteAdmin = async (req, res) => {
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
    const admin = await Admin.findOneAndDelete({
      adminId: req.params.adminId,
    });
    if (!admin) {
      logger.error(
        `Admin with admin Id ${req.params.adminId} not found for update`
      );
      return res.status(404).json({
        success: false,
        message: "admin not found",
      });
    }
    res.status(200).send({
      success: true,
      message: "admin deleted successfully",
    });
  } catch (error) {
    logger.error("Error while deleting Admin:", error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in deleting admin",
    });
  }
};

// Controller function to update an admin
const updateAdmin = async (req, res) => {
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
    // Check if the requester is updating their own profile
    if (req.user.adminId !== req.params.adminId) {
      logger.warn(
        `Unauthorized access: User ID ${req.user.adminId} does not match admin ID ${req.params.adminId}`
      );
      return res
        .status(401)
        .json({ message: "You are not authorized to access this admin" });
    }
    const { firstName, lastName, email, address, phone, password, dob } =
      req.body;
    const admin = await Admin.findOne({ adminId: req.params.adminId });
    if (!admin) {
      logger.error(
        `Admin with admin Id ${req.params.adminId} not found for update`
      );
      return res.status(404).json({
        success: false,
        message: "admin not found",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedAdmin = await Admin.findOneAndUpdate(
      { adminId: req.params.adminId },
      {
        firstName,
        lastName,
        email,
        address,
        phone,
        password: hashedPassword,
        dob,
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Admin Updated Successfully",
      updatedAdmin,
    });
  } catch (error) {
    logger.error("Error while updating Admin:", error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while updating Admin",
    });
  }
};

module.exports = {
  registerAdmin,
  getAllAdmins,
  getAdmin,
  deleteAdmin,
  updateAdmin,
  loginAdmin,
};
