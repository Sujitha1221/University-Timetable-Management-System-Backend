const {
  createEnrollment,
  getAllEnrollments,
} = require("../controllers/studentCourseEnrollmentController");

// Mocking dependencies
const Course = require("../models/course");
const Student = require("../models/student");
const StudentEnrollment = require("../models/studentCourseEnrolment");
const logger = require("../utils/logger");

// test case to create student enrollment to course
jest.mock("../models/course");
jest.mock("../models/student");
jest.mock("../models/studentCourseEnrolment");
jest.mock("../utils/logger");

describe("createEnrollment", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { studentId: "student123" },
      body: { courseId: "course123" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if user is not a student", async () => {
    req.user.studentId = null;

    await createEnrollment(req, res);

    expect(logger.warn).toHaveBeenCalledWith(
      "Unauthorized access: null is not authorized as student"
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "You are not authorized as student",
    });
  });

  it("should return 400 if student does not exist", async () => {
    Student.exists.mockResolvedValue(false);

    await createEnrollment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid student Id provided",
    });
  });

  it("should return 400 if course does not exist", async () => {
    Student.exists.mockResolvedValue(true);
    Course.exists.mockResolvedValue(false);

    await createEnrollment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid course Id provided",
    });
  });

  it("should return 400 if enrollment already exists", async () => {
    Student.exists.mockResolvedValue(true);
    Course.exists.mockResolvedValue(true);
    StudentEnrollment.findOne.mockResolvedValue(true);

    await createEnrollment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Enrollment already exists",
    });
  });

  it("should create enrollment successfully", async () => {
    const enrollment = {
      _id: "enrollment123",
      studentId: "student123",
      courseId: "course123",
    };
    Student.exists.mockResolvedValue(true);
    Course.exists.mockResolvedValue(true);
    StudentEnrollment.findOne.mockResolvedValue(false); // Assume no existing enrollment
    StudentEnrollment.create.mockResolvedValue(enrollment);

    await createEnrollment(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "Enrollment done successfully",
      data: enrollment,
    });
  });

  it("should handle internal server error", async () => {
    const errorMessage = "Something went wrong";
    Student.exists.mockRejectedValue(new Error(errorMessage));

    await createEnrollment(req, res);

    expect(logger.error).toHaveBeenCalledWith(
      "Error enrolling student:",
      expect.any(Error)
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error",
    });
  });
});

// test case to get all students and enrolled course details

jest.mock("../models/studentCourseEnrolment");
jest.mock("../models/course");
jest.mock("../utils/logger");

describe("getAllEnrollments", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { adminId: "admin123" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if user is not an admin", async () => {
    req.user.adminId = null;

    await getAllEnrollments(req, res);

    expect(logger.warn).toHaveBeenCalledWith(
      "Unauthorized access: null is not authorized as admin"
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "You are not authorized as admin",
    });
  });

  it("should fetch all enrollments successfully", async () => {
    const mockEnrollments = [{ _id: "enrollment1" }, { _id: "enrollment2" }];
    StudentEnrollment.find.mockResolvedValue(mockEnrollments);

    await getAllEnrollments(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "All enrollments List",
      data: mockEnrollments,
    });
  });

  it("should handle internal server error", async () => {
    const errorMessage = "Something went wrong";
    StudentEnrollment.find.mockRejectedValue(new Error(errorMessage));

    await getAllEnrollments(req, res);

    expect(logger.error).toHaveBeenCalledWith(
      "Error getting enrollments:",
      expect.any(Error)
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error",
    });
  });
});
