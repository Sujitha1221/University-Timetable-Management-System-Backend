const {
  createTimeTableEntry,
  deleteTimeTableEntry,
  getAllTimeTableEntries,
  updateTimeTableEntry,
} = require("../controllers/timeTableController");
const TimeTable = require("../models/timeTable");
const Course = require("../models/course");
const Faculty = require("../models/faculty");
const Booking = require("../models/Booking");
const logger = require("../utils/logger");

//test case to create time table
describe("createTimeTableEntry", () => {
  let mockRequest, mockResponse;

  beforeEach(() => {
    mockRequest = {
      user: { adminId: "admin123" },
      body: {
        courseId: "CS101",
        dayOfWeek: "Monday",
        startTime: "09:00",
        endTime: "10:00",
        faculty: "faculty123",
        location: "room123",
      },
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if user is not authorized as admin", async () => {
    mockRequest.user.adminId = null;
    await createTimeTableEntry(mockRequest, mockResponse);
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "You are not authorized as admin",
    });
  });

  it("should return 400 if any required field is missing", async () => {
    delete mockRequest.body.courseId;
    await createTimeTableEntry(mockRequest, mockResponse);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Missing required fields",
    });
  });

  it("should return 409 if course does not exist", async () => {
    Course.findOne = jest.fn().mockResolvedValue(null);
    await createTimeTableEntry(mockRequest, mockResponse);
    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Course should be there to create the timetable",
    });
  });

  it("should return 409 if faculty does not exist", async () => {
    Faculty.findOne = jest.fn().mockResolvedValue(null);
    await createTimeTableEntry(mockRequest, mockResponse);
  });

  it("should return 409 if booking does not exist", async () => {
    Booking.findOne = jest.fn().mockResolvedValue(null);
    await createTimeTableEntry(mockRequest, mockResponse);
  });

  it("should return 400 if timetable entry already exists", async () => {
    TimeTable.findOne = jest.fn().mockResolvedValue({});
    await createTimeTableEntry(mockRequest, mockResponse);
  });

  it("should create and return the timetable entry if all conditions are met", async () => {
    TimeTable.findOne = jest.fn().mockResolvedValue(null);
    TimeTable.prototype.save = jest.fn().mockResolvedValue({
      _id: "timetable123",
      courseId: "CS101",
      dayOfWeek: "Monday",
      startTime: "09:00",
      endTime: "10:00",
      faculty: "faculty123",
      location: "room123",
    });
    await createTimeTableEntry(mockRequest, mockResponse);
  });

  it("should return 500 if an error occurs during timetable creation", async () => {
    TimeTable.findOne = jest
      .fn()
      .mockRejectedValue(new Error("Database error"));
    await createTimeTableEntry(mockRequest, mockResponse);
  });
});

//test case to delete time table

// Mocking dependencies
jest.mock("../models/TimeTable");
jest.mock("../utils/logger");

describe("deleteTimeTableEntry", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { adminId: "admin123" },
      params: { id: "timetable123" },
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

    await deleteTimeTableEntry(req, res);

    expect(logger.warn).toHaveBeenCalledWith(
      "Unauthorized access: null is not authorized as admin"
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "You are not authorized as admin",
    });
  });

  it("should return 404 if timetable entry is not found", async () => {
    TimeTable.findByIdAndDelete.mockResolvedValue(null);

    await deleteTimeTableEntry(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Timetable entry not found",
    });
  });

  it("should delete timetable entry successfully", async () => {
    const deletedTimeTableEntry = { _id: "timetable123" };
    TimeTable.findByIdAndDelete.mockResolvedValue(deletedTimeTableEntry);

    await deleteTimeTableEntry(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "Timetable entry deleted successfully",
    });
  });

  it("should handle internal server error", async () => {
    const errorMessage = "Something went wrong";
    TimeTable.findByIdAndDelete.mockRejectedValue(new Error(errorMessage));

    await deleteTimeTableEntry(req, res);

    expect(logger.error).toHaveBeenCalledWith(
      "Error deleting timetable entry:",
      expect.any(Error)
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error",
    });
  });
});

//test case to get all time tables

jest.mock("../models/TimeTable");
jest.mock("../utils/logger");

describe("getAllTimeTableEntries", () => {
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

    await getAllTimeTableEntries(req, res);

    expect(logger.warn).toHaveBeenCalledWith(
      "Unauthorized access: null is not authorized as admin"
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "You are not authorized as admin",
    });
  });

  it("should fetch timetable entries successfully", async () => {
    const mockTimeTableEntries = [{ _id: "entry1" }, { _id: "entry2" }];
    TimeTable.find.mockResolvedValue(mockTimeTableEntries);

    await getAllTimeTableEntries(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      status: "success",
      data: mockTimeTableEntries,
    });
  });

  it("should handle internal server error", async () => {
    const errorMessage = "Something went wrong";
    TimeTable.find.mockRejectedValue(new Error(errorMessage));

    await getAllTimeTableEntries(req, res);

    expect(logger.error).toHaveBeenCalledWith(
      "Error fetching timetable entries:",
      expect.any(Error)
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error",
    });
  });
});

//test case to update time tables

jest.mock("../models/booking.js");
jest.mock("../models/course");
jest.mock("../models/faculty");
jest.mock("../models/TimeTable");
jest.mock("../utils/logger");

describe("updateTimeTableEntry", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { adminId: "admin123" },
      params: { id: "timetable123" },
      body: {
        courseId: "course123",
        dayOfWeek: "Monday",
        startTime: "09:00",
        endTime: "10:00",
        faculty: "faculty123",
        location: "room123",
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

  it("should return 401 if user is not an admin", async () => {
    req.user.adminId = null;

    await updateTimeTableEntry(req, res);

    expect(logger.warn).toHaveBeenCalledWith(
      "Unauthorized access: null is not authorized as admin"
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "You are not authorized as admin",
    });
  });

  it("should return 409 if booking does not exist", async () => {
    Booking.findOne.mockResolvedValue(null);

    await updateTimeTableEntry(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Booking should be there to create the timetable",
    });
  });

  it("should return 409 if course does not exist", async () => {
    Booking.findOne.mockResolvedValue(true);
    Course.findOne.mockResolvedValue(null);

    await updateTimeTableEntry(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Course should be there to create the timetable",
    });
  });

  it("should return 409 if faculty does not exist", async () => {
    Booking.findOne.mockResolvedValue(true);
    Course.findOne.mockResolvedValue(true);
    Faculty.findOne.mockResolvedValue(null);

    await updateTimeTableEntry(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Faculty should be there to create the timetable",
    });
  });

  it("should return 400 if timetable already exists", async () => {
    Booking.findOne.mockResolvedValue(true);
    Course.findOne.mockResolvedValue(true);
    Faculty.findOne.mockResolvedValue(true);
    TimeTable.findOne.mockResolvedValue(true);

    await updateTimeTableEntry(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "TImetable already exists",
    });
  });

  it("should update timetable entry successfully", async () => {
    const updatedTimeTableEntry = { _id: "timetable123", ...req.body };
    Booking.findOne.mockResolvedValue(true);
    Course.findOne.mockResolvedValue(true);
    Faculty.findOne.mockResolvedValue(true);
    TimeTable.findOne.mockResolvedValue(false);
    TimeTable.findByIdAndUpdate.mockResolvedValue(updatedTimeTableEntry);

    await updateTimeTableEntry(req, res);
  }, 15000);

  it("should return 404 if timetable entry not found", async () => {
    Booking.findOne.mockResolvedValue(true);
    Course.findOne.mockResolvedValue(true);
    Faculty.findOne.mockResolvedValue(true);
    TimeTable.findOne.mockResolvedValue(false); // Assume no existing timetable entry
    TimeTable.findByIdAndUpdate.mockResolvedValue(null);

    await updateTimeTableEntry(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Timetable entry not found",
    });
  });

  it("should handle internal server error", async () => {
    const errorMessage = "Something went wrong";
    Booking.findOne.mockRejectedValue(new Error(errorMessage));

    await updateTimeTableEntry(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error",
    });
  });
});
