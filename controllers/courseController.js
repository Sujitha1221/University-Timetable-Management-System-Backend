const Course = require("../models/course");
const Faculty = require("../models/faculty");
const logger = require("../utils/logger");

// Controller function to create a new course
const createCourse = async (req, res) => {
  try {
    // Checking if user is authorized as admin
    if (!req.user.adminId) {
      logger.warn(
        `Unauthorized access: ${req.user.adminId} is not authorized as admin`
      );
      return res
        .status(401)
        .json({ message: "You are not authorized as admin" });
    }
    const { courseCode, name, description, credits, faculties } = req.body;

    // Check if the required fields are provided
    if (!courseCode || !name || !description || !credits || !faculties) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if faculties exist
    const existingFaculties = await Faculty.find({
      facultyId: { $in: faculties },
    });
    if (existingFaculties.length !== faculties.length) {
      return res.status(400).json({ message: "Invalid faculty IDs provided" });
    }

    // Check if course already exists
    const existingCourse = await Course.findOne({ courseCode });
    if (existingCourse) {
      return res.status(409).json({
        success: false,
        message: "Course already exists",
      });
    }
    // Create new course
    const course = new Course({
      courseCode,
      name,
      description,
      credits,
      faculties,
    });
    await course.save();
    if (course) {
      res.status(201).json({
        success: true,
        message: "Course created successfully",
        course,
      });
    } else {
      res.status(400).json({ success: false, error: "Course data not valid" });
    }
  } catch (err) {
    logger.error("Error creating course", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Controller function to update a course by ID
const updateCourse = async (req, res) => {
  try {
    // Checking if user is authorized as admin
    if (!req.user.adminId) {
      logger.warn(
        `Unauthorized access: ${req.user.adminId} is not authorized as admin`
      );
      return res
        .status(401)
        .json({ message: "You are not authorized as admin" });
    }
    const { name, description, credits, faculties } = req.body;
    // Check if faculties exist
    const existingFaculties = await Faculty.find({
      facultyId: { $in: faculties },
    });
    if (existingFaculties.length !== faculties.length) {
      return res.status(400).json({ message: "Invalid faculty IDs provided" });
    }

    // Update course
    const course = await Course.findOneAndUpdate(
      { courseCode: req.params.courseCode },
      { name, description, credits, faculties },
      { new: true }
    );
    if (!course) {
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      course,
    });
  } catch (err) {
    logger.error("Error updating Course:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Controller function to delete a course by ID
const deleteCourse = async (req, res) => {
  try {
    // Checking if user is authorized as admin
    if (!req.user.adminId) {
      logger.warn(
        `Unauthorized access: ${req.user.adminId} is not authorized as admin`
      );
      return res
        .status(401)
        .json({ message: "You are not authorized as admin" });
    }
    // Delete course
    const course = await Course.findOneAndDelete({
      courseCode: req.params.courseCode,
    });
    if (!course) {
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });
    }
    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
      course,
    });
  } catch (err) {
    logger.error("Error deleting Course:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Controller function to get all courses
const getAllCourses = async (req, res) => {
  try {
    // Fetch all courses
    const courses = await Course.find();
    res.status(200).json({
      success: true,
      message: "All Courses List",
      courses,
    });
  } catch (error) {
    logger.error("Error getting Courses:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Controller function to get all courses by faculty ID
const getAllCoursesByFacultyId = async (req, res) => {
  try {
    // Checking if user is authorized as faculty
    if (!req.user.facultyId) {
      logger.warn(
        `Unauthorized access: ${req.user.facultyId} is not authorized as faculty`
      );
      return res
        .status(401)
        .json({ message: "You are not authorized as admin" });
    }
    // Find faculty
    const faculty = await Faculty.findOne({ facultyId: req.user.facultyId });
    if (!faculty) {
      return res
        .status(404)
        .json({ success: false, message: "Faculty not found" });
    }
    // Find courses assigned to the faculty
    const courses = await Course.find({ faculties: req.user.facultyId });

    res.status(200).json({
      success: true,
      message: `Courses assigned to faculty with ID ${req.user.facultyId}`,
      courses,
    });
  } catch (error) {
    logger.error("Error getting courses:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  updateCourse,
  deleteCourse,
  getAllCoursesByFacultyId,
};
