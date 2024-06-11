const Booking = require("../models/Booking");
const Course = require("../models/course");
const TimeTable = require("../models/timeTable");
const StudentEnrollment = require("../models/studentCourseEnrolment");
const Faculty = require("../models/faculty");
const logger = require("../utils/logger");
const { createNotification } = require("./notificationController");

// Controller function to create a new timetable entry
const createTimeTableEntry = async (req, res) => {
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
    const { courseId, dayOfWeek, startTime, endTime, faculty, location } =
      req.body;

    // Check if any required field is missing
    if (
      !courseId ||
      !dayOfWeek ||
      !startTime ||
      !endTime ||
      !faculty ||
      !location
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if the course exists
    const existingCourse = await Course.findOne({ courseCode: courseId });
    if (!existingCourse) {
      return res.status(409).json({
        success: false,
        message: "Course should be there to create the timetable",
      });
    }

    // Check if the faculty exists
    const existingFaculty = await Faculty.findOne({ facultyId: faculty });
    if (!existingFaculty) {
      return res.status(409).json({
        success: false,
        message: "Faculty should be there to create the timetable",
      });
    }

    // Check if the booking exists
    const existingBooking = await Booking.findOne({
      roomId: location,
      courseId: courseId,
      startTime: startTime,
      endTime: endTime,
    });
    if (!existingBooking) {
      return res.status(409).json({
        success: false,
        message: "Booking should be there to create the timetable",
      });
    }

    // Check if the timetable entry already exists
    const existingTimeTable = await TimeTable.findOne({
      courseId,
      dayOfWeek,
      startTime,
      endTime,
      faculty,
      location,
    });
    if (existingTimeTable) {
      return res
        .status(400)
        .json({ success: false, message: "TImetable already exists" });
    }

    // Create a new timetable entry
    const timeTableEntry = await TimeTable({
      courseId,
      dayOfWeek,
      startTime,
      endTime,
      faculty,
      location,
    });

    // Save the new timetable entry to the database
    await timeTableEntry.save();
    if (timeTableEntry) {
      res.status(201).json({
        success: true,
        message: "Timetable created successfully",
        timeTable: timeTableEntry,
      });
    } else {
      res
        .status(400)
        .json({ success: false, error: "Timetable data not valid" });
    }
  } catch (error) {
    logger.error("Error creating timetable entry:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Controller function to get all timetable entries
const getAllTimeTableEntries = async (req, res) => {
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
    // Retrieve all timetable entries from the database
    const timeTableEntries = await TimeTable.find();

    // Return all timetable entries
    res.status(200).json({
      success: true,
      status: "success",
      data: timeTableEntries,
    });
  } catch (error) {
    logger.error("Error fetching timetable entries:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Controller function to update a timetable entry
const updateTimeTableEntry = async (req, res) => {
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
    const { id } = req.params;
    const { courseId, dayOfWeek, startTime, endTime, faculty, location } =
      req.body;

    // Check if the booking exists
    const existingBooking = await Booking.findOne({
      roomId: location,
      startTime: startTime,
      endTime: endTime,
    });
    if (!existingBooking) {
      return res.status(409).json({
        success: false,
        message: "Booking should be there to create the timetable",
      });
    }

    // Check if the course exists
    const existingCourse = await Course.findOne({ courseCode: courseId });
    if (!existingCourse) {
      return res.status(409).json({
        success: false,
        message: "Course should be there to create the timetable",
      });
    }

    // Check if the faculty exists
    const existingFaculty = await Faculty.findOne({ facultyId: faculty });
    if (!existingFaculty) {
      return res.status(409).json({
        success: false,
        message: "Faculty should be there to create the timetable",
      });
    }

    // Check if the timetable entry already exists
    const existingTimeTable = await TimeTable.findOne({
      courseId,
      dayOfWeek,
      startTime,
      endTime,
      faculty,
      location,
    });
    if (existingTimeTable) {
      return res
        .status(400)
        .json({ success: false, message: "TImetable already exists" });
    }

    // Find the timetable entry by ID and update it
    const updatedTimeTableEntry = await TimeTable.findByIdAndUpdate(
      id,
      {
        courseId,
        dayOfWeek,
        startTime,
        endTime,
        faculty,
        location,
      },
      { new: true }
    );

    if (!updatedTimeTableEntry) {
      return res
        .status(404)
        .json({ success: false, message: "Timetable entry not found" });
    }
    res.status(200).json({
      status: "success",
      message: "Timetable entry updated successfully",
      data: updatedTimeTableEntry,
    });
    const studentEnrollments = await StudentEnrollment.find({ courseId });
    const studentIds = studentEnrollments.map(
      (enrollment) => enrollment.studentId
    );
    const message = `Timetable updated for your course ${updatedTimeTableEntry.courseId}`;
    const notificationPromises = studentIds.map(async (studentId) => {
      await createNotification(studentId, message);
    });
    notificationPromises.push(createNotification(faculty, message));
    await Promise.all(notificationPromises);
  } catch (error) {
    console.error("Error updating timetable entry:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

//controller to delete timetable
const deleteTimeTableEntry = async (req, res) => {
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
    const { id } = req.params;

    // Find the timetable entry by ID and delete it
    const deletedTimeTableEntry = await TimeTable.findByIdAndDelete(id);

    if (!deletedTimeTableEntry) {
      return res
        .status(404)
        .json({ success: false, message: "Timetable entry not found" });
    }

    res.status(200).json({
      status: "success",
      message: "Timetable entry deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting timetable entry:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

//controller to get student time tables
const getStudentTimeTable = async (req, res) => {
  try {
    // Check if the user is authorized as student
    const studentId = req.user.studentId;
    if (!studentId) {
      logger.warn(
        `Unauthorized access: ${studentId} is not authorized as student`
      );
      return res
        .status(401)
        .json({ message: "You are not authorized as student" });
    }
    // Find enrollments for the student
    const enrollments = await StudentEnrollment.find({ studentId });

    // Extract course IDs from enrollments
    const courseIds = enrollments.map((enrollment) => enrollment.courseId);

    // Find timetables for the extracted course IDs
    const timetables = await TimeTable.find({ courseId: { $in: courseIds } });

    res.json(timetables);
  } catch (error) {
    logger.error("Error fetching timetables:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//controller to get tometables of faculty
const getFacultyTimeTable = async (req, res) => {
  try {
    const facultyId = req.user.facultyId;
    // Check if the user is authorized as faculty
    if (!facultyId) {
      logger.warn(
        `Unauthorized access: ${facultyId} is not authorized as faculty`
      );
      return res
        .status(401)
        .json({ message: "You are not authorized as faculty" });
    }
    // Find courses associated with the faculty
    const courses = await Course.find({ faculties: facultyId });

    // Extract course IDs from courses
    const courseIds = courses.map((course) => course.courseCode);

    // Find timetables for the extracted course IDs
    const timetables = await TimeTable.find({ courseId: { $in: courseIds } });

    res.json(timetables);
  } catch (error) {
    logger.error("Error fetching timetables:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
module.exports = {
  createTimeTableEntry,
  getAllTimeTableEntries,
  deleteTimeTableEntry,
  updateTimeTableEntry,
  getStudentTimeTable,
  getFacultyTimeTable,
};
