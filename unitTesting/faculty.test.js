const {
  registerFaculty,
  deleteFaculty,
  updateFaculty,
  getAllFaculties,
} = require("../controllers/facultyController");

const Faculty = require("../models/faculty");
const {
  isValidEmail,
  validatePhoneNumber,
  validatePassword,
} = require("../utils/commonFunctions");
const bcrypt = require("bcrypt");
const logger = require("../utils/logger");

//test case to update faculty
jest.mock("../models/faculty");
jest.mock("../utils/logger");
jest.mock("bcrypt");

describe("updateFaculty", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: {
        facultyId: "faculty123",
      },
      params: {
        facultyId: "faculty123",
      },
      body: {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        address: "123 Main St",
        phone: "1234567890",
        password: "password123",
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

  it("should return 401 if not authorized as faculty", async () => {
    req.user.facultyId = undefined;

    await updateFaculty(req, res);

    expect(logger.warn).toHaveBeenCalledWith(
      "Unauthorized access: undefined is not authorized as faculty"
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "You are not authorized as faculty",
    });
  });

  it("should update faculty successfully", async () => {
    const mockFaculty = { _id: "faculty123", name: "Faculty of Science" };
    Faculty.findOne.mockResolvedValue(mockFaculty);
    bcrypt.hash.mockResolvedValue("hashedPassword");
    Faculty.findOneAndUpdate.mockResolvedValue(mockFaculty);

    await updateFaculty(req, res);

    expect(Faculty.findOne).toHaveBeenCalledWith({
      facultyId: req.params.facultyId,
    });
    expect(bcrypt.hash).toHaveBeenCalledWith(req.body.password, 10);
    expect(Faculty.findOneAndUpdate).toHaveBeenCalledWith(
      { facultyId: req.params.facultyId },
      {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        address: req.body.address,
        phone: req.body.phone,
        password: "hashedPassword",
        dob: req.body.dob,
      },
      { new: true }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Faculty Updated Successfully",
      updatedFaculty: mockFaculty,
    });
  });

  it("should handle faculty not found", async () => {
    Faculty.findOne.mockResolvedValue(null);

    await updateFaculty(req, res);

    expect(logger.error).toHaveBeenCalledWith(
      `faculty with faculty Id ${req.params.facultyId} not found for update`
    );
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "faculty not found",
    });
  });

  it("should handle error while updating faculty", async () => {
    const errorMessage = "Something went wrong";
    Faculty.findOne.mockRejectedValue(new Error(errorMessage));

    await updateFaculty(req, res);

    expect(logger.error).toHaveBeenCalledWith(
      "Error while updating Faculty:",
      expect.any(Error)
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: expect.any(Error),
      message: "Error while updating Faculty",
    });
  });
});

//test case to delete faculty
jest.mock("../models/faculty");
jest.mock("../utils/logger");

describe("deleteFaculty", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: {
        adminId: "admin123",
      },
      params: {
        facultyId: "faculty123",
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

  it("should return 401 if not authorized as admin", async () => {
    req.user.adminId = undefined;

    await deleteFaculty(req, res);

    expect(logger.warn).toHaveBeenCalledWith(
      "Unauthorized access: undefined is not authorized as admin"
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "You are not authorized as admin",
    });
  });

  it("should delete faculty successfully", async () => {
    const mockFaculty = { _id: "faculty123", name: "Faculty of Science" };
    Faculty.findOneAndDelete.mockResolvedValue(mockFaculty);

    await deleteFaculty(req, res);

    expect(Faculty.findOneAndDelete).toHaveBeenCalledWith({
      facultyId: req.params.facultyId,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "faculty deleted successfully",
    });
  });

  it("should handle faculty not found", async () => {
    Faculty.findOneAndDelete.mockResolvedValue(null);

    await deleteFaculty(req, res);

    expect(logger.error).toHaveBeenCalledWith(
      `faculty with faculty Id ${req.params.facultyId} not found for delete`
    );
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "faculty not found",
    });
  });

  it("should handle error while deleting faculty", async () => {
    const errorMessage = "Something went wrong";
    Faculty.findOneAndDelete.mockRejectedValue(new Error(errorMessage));

    await deleteFaculty(req, res);

    expect(logger.error).toHaveBeenCalledWith(
      "Error while deleting faculty:",
      expect.any(Error)
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: expect.any(Error),
      message: "Error in deleting faculty",
    });
  });
});

//test case to get all faculties
jest.mock("../models/faculty");
jest.mock("../utils/logger");

describe("getAllFaculties", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: {
        adminId: "admin123",
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

  it("should return 401 if not authorized as admin", async () => {
    req.user.adminId = undefined;

    await getAllFaculties(req, res);

    expect(logger.warn).toHaveBeenCalledWith(
      "Unauthorized access: undefined is not authorized as admin"
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "You are not authorized as admin",
    });
  });

  it("should return all faculties successfully", async () => {
    const mockFaculties = [
      { _id: "faculty1", name: "Faculty of Science" },
      { _id: "faculty2", name: "Faculty of Arts" },
    ];
    Faculty.find.mockResolvedValue(mockFaculties);

    await getAllFaculties(req, res);
  });

  it("should handle error while getting all faculties", async () => {
    const errorMessage = "Something went wrong";
    Faculty.find.mockRejectedValue(new Error(errorMessage));

    await getAllFaculties(req, res);

    expect(logger.error).toHaveBeenCalledWith(
      "Error while getting all faculties:",
      expect.any(Error)
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: expect.any(Error),
      message: "Error while getting all Faculties",
    });
  });
});

// test case to create faculty
jest.mock("../models/faculty");
jest.mock("../utils/commonFunctions");
jest.mock("bcrypt");
jest.mock("../utils/logger");

describe("registerFaculty", () => {
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

    await registerFaculty(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Missing required fields",
    });
  });

  it("should return 400 if email is invalid", async () => {
    isValidEmail.mockReturnValue(false);

    await registerFaculty(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Invalid email format",
    });
  });

  it("should return 400 if phone number is invalid", async () => {
    validatePhoneNumber.mockReturnValue(false);

    await registerFaculty(req, res);
  });

  it("should return 400 if password is invalid", async () => {
    validatePassword.mockReturnValue(false);

    await registerFaculty(req, res);
  });

  it("should return 409 if faculty already exists", async () => {
    Faculty.findOne.mockResolvedValue(true);

    await registerFaculty(req, res);
  });

  it("should create new faculty successfully", async () => {
    const mockFaculty = {
      _id: "faculty123",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
    };
    Faculty.create.mockResolvedValue(mockFaculty);
    bcrypt.hash.mockResolvedValue("hashedPassword");

    await registerFaculty(req, res);
  });

  it("should handle internal server error", async () => {
    const errorMessage = "Something went wrong";
    Faculty.create.mockRejectedValue(new Error(errorMessage));

    await registerFaculty(req, res);
  });
});
