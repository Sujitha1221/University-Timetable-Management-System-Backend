const Course = require("../models/course");
const Student = require("../models/student");
const StudentEnrollment = require("../models/studentCourseEnrolment");
const logger = require("../utils/logger");

// Controller to create a new enrollment
const createEnrollment = async (req, res) => {
  try {
    // Check if the user is authorized as a student
    if (!req.user.studentId) {
      logger.warn(
        `Unauthorized access: ${req.user.studentId} is not authorized as student`
      );
      return res
        .status(401)
        .json({ message: "You are not authorized as student" });
    }
    const { courseId } = req.body;

    // Check if the student exists
    const studentExists = await Student.exists({
      studentId: req.user.studentId,
    });
    if (!studentExists) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid student Id provided" });
    }
    // Check if the course exists
    const courseExists = await Course.exists({ courseCode: courseId });
    if (!courseExists) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid course Id provided" });
    }

    // Check if the enrollment already exists
    const existingEnrollment = await StudentEnrollment.findOne({
      studentId: req.user.studentId,
      courseId,
    });
    if (existingEnrollment) {
      return res
        .status(400)
        .json({ success: false, message: "Enrollment already exists" });
    }

    // Create a new enrollment
    const enrollment = await StudentEnrollment.create({
      studentId: req.user.studentId,
      courseId,
    });

    res.status(201).json({
      status: "success",
      message: "Enrollment done successfully",
      data: enrollment,
    });
  } catch (error) {
    logger.error("Error enrolling student:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Controller to get all enrollments
const getAllEnrollments = async (req, res) => {
  try {
    // Check if the user is authorized as an admin
    if (!req.user.adminId) {
      logger.warn(
        `Unauthorized access: ${req.user.adminId} is not authorized as admin`
      );
      return res
        .status(401)
        .json({ message: "You are not authorized as admin" });
    }
    // Retrieve all enrollments from the database
    const enrollments = await StudentEnrollment.find();

    res.status(200).json({
      status: "success",
      message: "All enrollments List",
      data: enrollments,
    });
  } catch (err) {
    logger.error("Error getting enrollments:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Controller function to get enrolled courses for a student
const getEnrolledCourses = async (req, res) => {
  try {
    // Check if the user is authorized as a student
    if (!req.user.studentId) {
      logger.warn(
        `Unauthorized access: ${req.user.studentId} is not authorized as student`
      );
      return res
        .status(401)
        .json({ message: "You are not authorized as student" });
    }
    // Retrieve enrollments for the student
    const enrollments = await StudentEnrollment.find({
      studentId: req.user.studentId,
    });

    if (!enrollments || enrollments.length === 0) {
      return res
        .status(404)
        .json({ message: "No courses found for the student" });
    }

    // Extract courseIds from enrollments
    const courseIds = enrollments.map((enrollment) => enrollment.courseId);

    // Find courses based on the extracted courseIds
    const courses = await Course.find({ courseCode: { $in: courseIds } });

    // Return the courses
    return res.status(200).json({ courses });
  } catch (error) {
    logger.error("Error fetching enrolled courses:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { createEnrollment, getAllEnrollments, getEnrolledCourses };
