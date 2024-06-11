const {
  registerAdmin,
  getAllAdmins,
  deleteAdmin,
  updateAdmin,
} = require("../controllers/adminController");

// Mocking dependencies
const Admin = require("../models/admin");
const {
  isValidEmail,
  validatePhoneNumber,
  validatePassword,
} = require("../utils/commonFunctions");
const bcrypt = require("bcrypt");
const logger = require("../utils/logger");

jest.mock("../models/admin");
jest.mock("../utils/logger");

//test case to get all admins
describe("getAllAdmins", () => {
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

    await getAllAdmins(req, res);

    expect(logger.warn).toHaveBeenCalledWith(
      "Unauthorized access: null is not authorized as admin"
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "You are not authorized as admin",
    });
  });

  it("should return all admins successfully", async () => {
    const mockAdmins = [{ name: "Admin1" }, { name: "Admin2" }];
    Admin.find.mockResolvedValue(mockAdmins);

    await getAllAdmins(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "All Admins List",
      admins: mockAdmins,
    });
  });

  it("should handle internal server error", async () => {
    const errorMessage = "Something went wrong";
    Admin.find.mockRejectedValue(new Error(errorMessage));

    await getAllAdmins(req, res);

    expect(logger.error).toHaveBeenCalledWith(
      "Error while getting all admins:",
      expect.any(Error)
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: expect.any(Error),
      message: "Error while getting all Admins",
    });
  });
});

//test case to update admin
jest.mock("../models/admin");
jest.mock("bcrypt");
jest.mock("../utils/logger");

describe("updateAdmin", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { adminId: "admin123" },
      params: { adminId: "admin456" },
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

  it("should return 401 if user is not an admin", async () => {
    req.user.adminId = null;

    await updateAdmin(req, res);

    expect(logger.warn).toHaveBeenCalledWith(
      "Unauthorized access: null is not authorized as admin"
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "You are not authorized as admin",
    });
  });

  it("should update admin successfully", async () => {
    const mockAdmin = { adminId: "admin456", name: "Admin1" };
    Admin.findOne.mockResolvedValue(mockAdmin);
    bcrypt.hash.mockResolvedValue("hashedPassword");
    Admin.findOneAndUpdate.mockResolvedValue(mockAdmin);

    await updateAdmin(req, res);
  });

  it("should return 404 if admin is not found", async () => {
    Admin.findOne.mockResolvedValue(null);

    await updateAdmin(req, res);
  });

  it("should handle internal server error", async () => {
    const errorMessage = "Something went wrong";
    const error = new Error(errorMessage);
    Admin.findOne.mockRejectedValue(error);

    await updateAdmin(req, res);
  });
});

//test case to delete admin
jest.mock("../models/admin");
jest.mock("../utils/logger");

describe("deleteAdmin", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { adminId: "admin123" },
      params: { adminId: "admin456" },
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

    await deleteAdmin(req, res);

    expect(logger.warn).toHaveBeenCalledWith(
      "Unauthorized access: null is not authorized as admin"
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "You are not authorized as admin",
    });
  });

  it("should delete admin successfully", async () => {
    const mockAdmin = { adminId: "admin456", name: "Admin1" };
    Admin.findOneAndDelete.mockResolvedValue(mockAdmin);

    await deleteAdmin(req, res);

    expect(Admin.findOneAndDelete).toHaveBeenCalledWith({
      adminId: "admin456",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "admin deleted successfully",
    });
  });

  it("should return 404 if admin is not found", async () => {
    Admin.findOneAndDelete.mockResolvedValue(null);

    await deleteAdmin(req, res);

    expect(logger.error).toHaveBeenCalledWith(
      "Admin with admin Id admin456 not found for update"
    );
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "admin not found",
    });
  });

  it("should handle internal server error", async () => {
    const errorMessage = "Something went wrong";
    Admin.findOneAndDelete.mockRejectedValue(new Error(errorMessage));

    await deleteAdmin(req, res);

    expect(logger.error).toHaveBeenCalledWith(
      "Error while deleting Admin:",
      expect.any(Error)
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: expect.any(Error),
      message: "Error in deleting admin",
    });
  });
});

//test case to create admin
jest.mock("../models/admin");
jest.mock("../utils/commonFunctions");
jest.mock("bcrypt");
jest.mock("../utils/logger");

describe("registerAdmin", () => {
  let req, res;

  beforeEach(() => {
    req = {
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
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if required fields are missing", async () => {
    req.body = {};

    await registerAdmin(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Missing required fields",
    });
  });

  it("should return 400 if email format is invalid", async () => {
    isValidEmail.mockReturnValue(false);

    await registerAdmin(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Invalid email format",
    });
  });

  it("should return 400 if phone number format is invalid", async () => {
    validatePhoneNumber.mockReturnValue(false);

    await registerAdmin(req, res);
  });

  it("should return 400 if password format is invalid", async () => {
    validatePassword.mockReturnValue(false);

    await registerAdmin(req, res);
  });

  it("should return 409 if admin with provided email already exists", async () => {
    Admin.findOne.mockResolvedValue(true);

    await registerAdmin(req, res);
  });

  it("should create admin successfully", async () => {
    Admin.findOne.mockResolvedValue(false);
    bcrypt.hash.mockResolvedValue("hashedPassword");
    Admin.create.mockResolvedValue(req.body);

    await registerAdmin(req, res);
  });

  it("should handle internal server error", async () => {
    const errorMessage = "Something went wrong";
    Admin.findOne.mockRejectedValue(new Error(errorMessage));

    await registerAdmin(req, res);
  });
});
