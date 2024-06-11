const Student = require("../models/student");
const {
  isValidEmail,
  validatePhoneNumber,
  validatePassword,
} = require("../utils/commonFunctions");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

// Controller to register a new student
const registerStudent = async (req, res) => {
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
    // Check if the student already exists
    const existingUser = await Student.findOne({ email });
    if (existingUser) {
      logger.warn(
        `Student with email: ${email} already exists during student registration`
      );
      return res.status(409).json({
        success: false,
        message: "Student already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Create a new student
    const student = await Student.create({
      firstName,
      lastName,
      email,
      address,
      phone,
      password: hashedPassword,
      dob,
    });
    if (student) {
      res
        .status(201)
        .json({ success: true, message: "New Student created", data: student });
    } else {
      logger.error("User data not valid during student registration");
      res.status(400).json({ success: false, error: "User data not valid" });
    }
  } catch (error) {
    logger.error("Error while registering the student:", error);
    res.status(500).json({
      success: false,
      error,
      message: "Error while registering the student",
    });
  }
};

// Controller to login a student
const loginStudent = async (req, res) => {
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
    // Find the user by email
    const user = await Student.findOne({ email });
    // Check if user exists and password matches
    if (user && (await bcrypt.compare(password, user.password))) {
      // Generate access token
      const accessToken = jwt.sign(
        {
          user: {
            studentId: user.studentId,
            email: user.email,
            id: user.id,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );
      res.status(200).json({ accessToken });
    } else {
      logger.warn("Email or password is not valid during student login");
      res
        .status(400)
        .json({ success: false, error: "Email or password is not valid" });
    }
  } catch (error) {
    logger.error("Error while logging in as a student:", error);
    res.status(500).json({
      success: false,
      error,
      message: "Error while logging in as a student",
    });
  }
};

// Controller to get all students
const getAllStudents = async (req, res) => {
  try {
    if (!req.user.adminId) {
      // Check if the user is authorized as admin
      logger.warn(
        `Unauthorized access: ${req.user.adminId} is not authorized as admin`
      );
      return res
        .status(401)
        .json({ message: "You are not authorized as admin" });
    }
    // Retrieve all students from the database
    const students = await Student.find();
    // Return the list of students
    res.status(200).json({
      success: true,
      message: "All Students List",
      students,
    });
  } catch (error) {
    logger.error("Error while getting all students:", error);
    res.status(500).json({
      success: false,
      error,
      message: "Error while getting all Students",
    });
  }
};

// Controller to get a student by ID
const getStudent = async (req, res) => {
  try {
    if (!req.user.studentId) {
      // Check if the user is authorized as admin
      logger.warn(
        `Unauthorized access: ${req.user.studentId} is not authorized as admin`
      );
      return res
        .status(401)
        .json({ message: "You are not authorized as Student" });
    }
    // Check if the requested student ID matches the user's student ID
    if (req.user.studentId !== req.params.studentId) {
      logger.warn(
        `Unauthorized access: User ID ${req.user.studentId} does not match student ID ${req.params.studentId}`
      );
      return res
        .status(401)
        .json({ message: "You are not authorized to access this student" });
    }
    // Find the student by ID
    const student = await Student.findOne({ studentId: req.params.studentId });

    if (!student) {
      logger.warn(`Student with studentId: ${req.params.studentId} not found`);
      return res.status(404).json({
        success: false,
        message: "student not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Retrieved student successfully",
      student,
    });
  } catch (error) {
    logger.error("Error while getting student:", error);
    res.status(500).json({
      success: false,
      error,
      message: "Error while getting student",
    });
  }
};

// Controller to delete a student by ID
const deleteStudent = async (req, res) => {
  try {
    if (!req.user.adminId) {
      // Check if the user is authorized as admin
      logger.warn(
        `Unauthorized access: ${req.user.adminId} is not authorized as admin`
      );
      return res
        .status(401)
        .json({ message: "You are not authorized as admin" });
    }
    const student = await Student.findOneAndDelete({
      studentId: req.params.studentId,
    });
    if (!student) {
      logger.error(
        `student with student Id ${req.params.studentId} not found for delete`
      );
      return res.status(404).json({
        success: false,
        message: "student not found",
      });
    }
    res.status(200).send({
      success: true,
      message: "student deleted successfully",
    });
  } catch (error) {
    logger.error("Error while deleting Student:", error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in deleting student",
    });
  }
};

//controller to update student
const updateStudent = async (req, res) => {
  try {
    // Check if the user is authorized as a student
    if (!req.user.studentId) {
      logger.warn(
        `Unauthorized access: ${req.user.studentId} is not authorized as student`
      );
      return res
        .status(401)
        .json({ message: "You are not authorized as Student" });
    }
    const { firstName, lastName, email, address, phone, password, dob } =
      req.body;
    // Check if the requested student ID matches the user's student ID
    if (req.user.studentId !== req.params.studentId) {
      logger.warn(
        `Unauthorized access: User ID ${req.user.studentId} does not match student ID ${req.params.studentId}`
      );
      return res
        .status(401)
        .json({ message: "You are not authorized to access this student" });
    }
    // Find the student by ID
    const student = await Student.findOne({ studentId: req.params.studentId });
    if (!student) {
      logger.error(
        `student with student Id ${req.params.studentId} not found for update`
      );
      return res.status(404).json({
        success: false,
        message: "student not found",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    // Update the student
    const updatedStudent = await Student.findOneAndUpdate(
      { studentId: req.params.studentId },
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
      message: "Student Updated Successfully",
      updatedStudent,
    });
  } catch (error) {
    logger.error("Error while updating Student:", error);
    res.status(500).send({
      success: false,
      error,
      message: "Error while updating Student",
    });
  }
};

module.exports = {
  registerStudent,
  getAllStudents,
  getStudent,
  deleteStudent,
  updateStudent,
  loginStudent,
};
