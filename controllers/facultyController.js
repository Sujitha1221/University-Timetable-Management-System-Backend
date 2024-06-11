const Faculty = require("../models/faculty");
const {
  isValidEmail,
  validatePhoneNumber,
  validatePassword,
} = require("../utils/commonFunctions");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

// Controller function to register a new faculty member
const registerFaculty = async (req, res) => {
  const { firstName, lastName, email, address, phone, password, dob } =
    req.body;
  try {
    // Check if required fields are provided
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
    // Check if faculty with the same email already exists
    const existingUser = await Faculty.findOne({ email });
    if (existingUser) {
      logger.warn(
        `Faculty with email: ${email} already exists during faculty registration`
      );
      return res.status(409).json({
        success: false,
        message: "Faculty already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Create new faculty
    const faculty = await Faculty.create({
      firstName,
      lastName,
      email,
      address,
      phone,
      password: hashedPassword,
      dob,
    });
    if (faculty) {
      res
        .status(201)
        .json({ success: true, message: "New Faculty created", data: faculty });
    } else {
      logger.error("User data not valid during faculty registration");
      res.status(400).json({ success: false, error: "User data not valid" });
    }
  } catch (error) {
    logger.error("Error while registering the faculty:", error);
    console.log(error);
    res.status(500).json({
      success: false,
      error,
      message: "Error while registering the faculty",
    });
  }
};

// Controller function to authenticate and login a faculty member
const loginFaculty = async (req, res) => {
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
    const user = await Faculty.findOne({ email });
    // Check if user exists and password matches
    if (user && (await bcrypt.compare(password, user.password))) {
      // Generate access token
      const accessToken = jwt.sign(
        {
          user: {
            facultyId: user.facultyId,
            email: user.email,
            id: user.id,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );
      res.status(200).json({ accessToken });
    } else {
      logger.warn("Email or password is not valid during faculty login");

      res
        .status(400)
        .json({ success: false, error: "Email or password is not valid" });
    }
  } catch (error) {
    logger.error("Error while logging in as a faculty:", error);
    res.status(500).json({
      success: false,
      error,
      message: "Error while loggig in",
    });
  }
};

// Controller to get all facultys
const getAllFaculties = async (req, res) => {
  try {
    // Check if user is authorized as admin
    if (!req.user.adminId) {
      logger.warn(
        `Unauthorized access: ${req.user.adminId} is not authorized as admin`
      );
      return res
        .status(401)
        .json({ message: "You are not authorized as admin" });
    }
    const facultys = await Faculty.find();
    res.status(200).json({
      success: true,
      message: "All Faculties List",
      facultys,
    });
  } catch (error) {
    logger.error("Error while getting all faculties:", error);
    res.status(500).json({
      success: false,
      error,
      message: "Error while getting all Faculties",
    });
  }
};

// Controller function to get a faculty member by ID
const getFaculty = async (req, res) => {
  try {
    // Check if user is authorized as faculty
    if (!req.user.facultyId) {
      logger.warn(
        `Unauthorized access: ${req.user.facultyId} is not authorized as faculty`
      );
      return res
        .status(401)
        .json({ message: "You are not authorized as Faculty" });
    }
    const faculty = await Faculty.findOne({ facultyId: req.params.facultyId });

    if (!faculty) {
      logger.warn(`faculty with facultyId: ${req.params.facultyId} not found`);
      return res.status(404).json({
        success: false,
        message: "faculty not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Retrieved faculty successfully",
      faculty,
    });
  } catch (error) {
    logger.error("Error while getting faculty:", error);
    res.status(500).json({
      success: false,
      error,
      message: "Error while getting faculty",
    });
  }
};

// Controller function to delete a faculty member by ID
const deleteFaculty = async (req, res) => {
  try {
    // Check if user is authorized as admin
    if (!req.user.adminId) {
      logger.warn(
        `Unauthorized access: ${req.user.adminId} is not authorized as admin`
      );
      return res
        .status(401)
        .json({ message: "You are not authorized as admin" });
    }
    const faculty = await Faculty.findOneAndDelete({
      facultyId: req.params.facultyId,
    });
    if (!faculty) {
      logger.error(
        `faculty with faculty Id ${req.params.facultyId} not found for delete`
      );
      return res.status(404).json({
        success: false,
        message: "faculty not found",
      });
    }
    res.status(200).send({
      success: true,
      message: "faculty deleted successfully",
    });
  } catch (error) {
    logger.error("Error while deleting faculty:", error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in deleting faculty",
    });
  }
};

// Controller function to update a faculty member by ID
const updateFaculty = async (req, res) => {
  try {
    // Check if user is authorized as faculty
    if (!req.user.facultyId) {
      logger.warn(
        `Unauthorized access: ${req.user.facultyId} is not authorized as faculty`
      );
      return res
        .status(401)
        .json({ message: "You are not authorized as faculty" });
    }
    if (req.user.facultyId !== req.params.facultyId) {
      logger.warn(
        `Unauthorized access: User ID ${req.user.facultyId} does not match faculty ID ${req.params.facultyId}`
      );
      return res
        .status(401)
        .json({ message: "You are not authorized to access this faculty" });
    }
    const { firstName, lastName, email, address, phone, password, dob } =
      req.body;
    const faculty = await Faculty.findOne({ facultyId: req.params.facultyId });
    if (!faculty) {
      logger.error(
        `faculty with faculty Id ${req.params.facultyId} not found for update`
      );
      return res.status(404).json({
        success: false,
        message: "faculty not found",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedFaculty = await Faculty.findOneAndUpdate(
      { facultyId: req.params.facultyId },
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
      message: "Faculty Updated Successfully",
      updatedFaculty,
    });
  } catch (error) {
    logger.error("Error while updating Faculty:", error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while updating Faculty",
    });
  }
};

module.exports = {
  registerFaculty,
  getAllFaculties,
  getFaculty,
  deleteFaculty,
  updateFaculty,
  loginFaculty,
};
