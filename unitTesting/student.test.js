const {
  updateStudent,
  deleteStudent,
  getAllStudents,
  registerStudent,
} = require("../controllers/studentController");

const {
  isValidEmail,
  validatePhoneNumber,
  validatePassword,
} = require("../utils/commonFunctions");
const Student = require("../models/student");
const bcrypt = require("bcrypt");
const logger = require("../utils/logger");

//test case to create student
jest.mock("../models/student");
jest.mock("../utils/commonFunctions");
jest.mock("bcrypt");
jest.mock("../utils/logger");

describe("registerStudent", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        address: "123 Main St",
        phone: "1234567890",
        password: "Password123",
        dob: "1990-01-01",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if missing required fields", async () => {
    req.body = {};

    await registerStudent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Missing required fields",
    });
  });

  it("should return 400 if email is invalid", async () => {
    isValidEmail.mockReturnValue(false);

    await registerStudent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Invalid email format",
    });
  });

  it("should return 400 if phone number is invalid", async () => {
    validatePhoneNumber.mockReturnValue(false);

    await registerStudent(req, res);
  });

  it("should return 400 if password is invalid", async () => {
    validatePassword.mockReturnValue(false);

    await registerStudent(req, res);
  });

  it("should return 409 if student already exists", async () => {
    Student.findOne.mockResolvedValue(true);

    await registerStudent(req, res);
  });

  it("should create new student successfully", async () => {
    const mockStudent = {
      _id: "student123",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
    };
    Student.create.mockResolvedValue(mockStudent);
    bcrypt.hash.mockResolvedValue("hashedPassword");

    await registerStudent(req, res);
  });

  it("should handle internal server error", async () => {
    const errorMessage = "Something went wrong";
    Student.create.mockRejectedValue(new Error(errorMessage));

    await registerStudent(req, res);
  });
});

//test case to get all students
jest.mock("../models/student");
jest.mock("../utils/logger");

describe("getAllStudents", () => {
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

    await getAllStudents(req, res);

    expect(logger.warn).toHaveBeenCalledWith(
      "Unauthorized access: null is not authorized as admin"
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "You are not authorized as admin",
    });
  });

  it("should get all students successfully", async () => {
    const mockStudents = [
      { studentId: "student1", name: "John Doe" },
      { studentId: "student2", name: "Jane Smith" },
    ];
    Student.find.mockResolvedValue(mockStudents);

    await getAllStudents(req, res);

    expect(Student.find).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "All Students List",
      students: mockStudents,
    });
  });

  it("should handle internal server error", async () => {
    const errorMessage = "Something went wrong";
    Student.find.mockRejectedValue(new Error(errorMessage));

    await getAllStudents(req, res);

    expect(logger.error).toHaveBeenCalledWith(
      "Error while getting all students:",
      expect.any(Error)
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: expect.any(Error),
      message: "Error while getting all Students",
    });
  });
});

//test case to delete student
jest.mock("../models/student");
jest.mock("../utils/logger");

describe("deleteStudent", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { adminId: "admin123" },
      params: { studentId: "student456" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if user is not an admin", async () => {
    req.user.adminId = null;

    await deleteStudent(req, res);

    expect(logger.warn).toHaveBeenCalledWith(
      "Unauthorized access: null is not authorized as admin"
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "You are not authorized as admin",
    });
  });

  it("should delete student successfully", async () => {
    const mockStudent = { studentId: "student456", name: "John Doe" };
    Student.findOneAndDelete.mockResolvedValue(mockStudent);

    await deleteStudent(req, res);

    expect(Student.findOneAndDelete).toHaveBeenCalledWith({
      studentId: "student456",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "student deleted successfully",
    });
  });

  it("should return 404 if student is not found", async () => {
    Student.findOneAndDelete.mockResolvedValue(null);

    await deleteStudent(req, res);

    expect(logger.error).toHaveBeenCalledWith(
      "student with student Id student456 not found for delete"
    );
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "student not found",
    });
  });

  it("should handle internal server error", async () => {
    const errorMessage = "Something went wrong";
    Student.findOneAndDelete.mockRejectedValue(new Error(errorMessage));

    await deleteStudent(req, res);

    expect(logger.error).toHaveBeenCalledWith(
      "Error while deleting Student:",
      expect.any(Error)
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: expect.any(Error),
      message: "Error in deleting student",
    });
  });
});

//test case to update student
jest.mock("../models/student");
jest.mock("bcrypt");
jest.mock("../utils/logger");

describe("updateStudent", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { studentId: "student123" },
      params: { studentId: "student456" },
      body: {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        address: "123 Main St",
        phone: "0771234567",
        password: "Password123",
        dob: "1990-01-01",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if user is not a student", async () => {
    req.user.studentId = null;

    await updateStudent(req, res);

    expect(logger.warn).toHaveBeenCalledWith(
      "Unauthorized access: null is not authorized as student"
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "You are not authorized as Student",
    });
  });

  it("should update student successfully", async () => {
    const mockStudent = { studentId: "student456", name: "John Doe" };
    Student.findOne.mockResolvedValue(mockStudent);
    bcrypt.hash.mockResolvedValue("hashedPassword");
    Student.findOneAndUpdate.mockResolvedValue(mockStudent);

    await updateStudent(req, res);
  });

  it("should return 404 if student is not found", async () => {
    Student.findOne.mockResolvedValue(null);

    await updateStudent(req, res);
  });

  it("should handle internal server error", async () => {
    const errorMessage = "Something went wrong";
    Student.findOne.mockRejectedValue(new Error(errorMessage));

    await updateStudent(req, res);
  });
});
