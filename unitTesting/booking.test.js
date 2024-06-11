const {
  getAllBookings,
  updateBooking,
  createBooking,
  deleteBooking,
} = require("../controllers/bookingController");

const Booking = require("../models/Booking");
const Room = require("../models/room");
const Course = require("../models/course");
const admin = require("../models/admin");
const logger = require("../utils/logger");

//test case to create booking
jest.mock("../models/Booking");
jest.mock("../models/Room");
jest.mock("../models/Course");
jest.mock("../models/admin");
jest.mock("../utils/logger");

describe("createBooking", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { adminId: "admin123" },
      body: {
        roomId: "room123",
        courseId: "course123",
        startTime: "09:00",
        endTime: "10:00",
        dayOfWeek: "Monday",
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

    await createBooking(req, res);

    expect(logger.warn).toHaveBeenCalledWith(
      "Unauthorized access: null is not authorized as admin"
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "You are not authorized as admin",
    });
  });

  it("should return 400 if required fields are missing", async () => {
    req.body = {};

    await createBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Missing required fields",
    });
  });

  it("should return 400 if roomId is invalid", async () => {
    Room.exists.mockResolvedValue(false);

    await createBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid roomId provided",
    });
  });

  it("should return 400 if courseId is invalid", async () => {
    Room.exists.mockResolvedValue(true);
    Course.exists.mockResolvedValue(false);

    await createBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid courseId provided",
    });
  });

  it("should return 400 if adminId is invalid", async () => {
    Room.exists.mockResolvedValue(true);
    Course.exists.mockResolvedValue(true);
    admin.exists.mockResolvedValue(false);

    await createBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid adminId provided",
    });
  });

  it("should return 409 if booking already exists", async () => {
    Room.exists.mockResolvedValue(true);
    Course.exists.mockResolvedValue(true);
    admin.exists.mockResolvedValue(true);
    Booking.findOne.mockResolvedValue(true);

    await createBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Booking already exists",
    });
  });

  it("should create booking successfully", async () => {
    const newBooking = { _id: "booking123", ...req.body };
    Room.exists.mockResolvedValue(true);
    Course.exists.mockResolvedValue(true);
    admin.exists.mockResolvedValue(true);
    Booking.findOne.mockResolvedValue(false);
    Booking.prototype.save.mockResolvedValue();

    await createBooking(req, res);
  });

  it("should handle internal server error", async () => {
    const errorMessage = "Something went wrong";
    Room.exists.mockRejectedValue(new Error(errorMessage));

    await createBooking(req, res);

    expect(logger.error).toHaveBeenCalledWith(
      "Error creating booking:",
      expect.any(Error)
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error",
    });
  });
});

//test case to update booking
jest.mock("../models/Booking");
jest.mock("../models/Room");
jest.mock("../models/Course");
jest.mock("../models/admin");
jest.mock("../utils/logger");

describe("updateBooking", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { adminId: "admin123" },
      params: { id: "booking123" },
      body: {
        roomId: "room123",
        courseId: "course123",
        dayOfWeek: "Monday",
        startTime: "09:00",
        endTime: "10:00",
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

    await updateBooking(req, res);

    expect(logger.warn).toHaveBeenCalledWith(
      "Unauthorized access: null is not authorized as admin"
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "You are not authorized as admin",
    });
  });

  it("should return 400 if roomId is invalid", async () => {
    Room.exists.mockResolvedValue(false);

    await updateBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid roomId provided",
    });
  });

  it("should return 400 if courseId is invalid", async () => {
    Room.exists.mockResolvedValue(true);
    Course.exists.mockResolvedValue(false);

    await updateBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid courseId provided",
    });
  });

  it("should return 400 if adminId is invalid", async () => {
    Room.exists.mockResolvedValue(true);
    Course.exists.mockResolvedValue(true);
    admin.exists.mockResolvedValue(false);

    await updateBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid adminId provided",
    });
  });

  it("should return 409 if booking already exists", async () => {
    Room.exists.mockResolvedValue(true);
    Course.exists.mockResolvedValue(true);
    admin.exists.mockResolvedValue(true);
    Booking.findOne.mockResolvedValue(true);

    await updateBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Booking already exists",
    });
  });

  it("should update booking successfully", async () => {
    const updatedBooking = { _id: "booking123", ...req.body };
    Room.exists.mockResolvedValue(true);
    Course.exists.mockResolvedValue(true);
    admin.exists.mockResolvedValue(true);
    Booking.findOne.mockResolvedValue(false);
    Booking.findByIdAndUpdate.mockResolvedValue(updatedBooking);

    await updateBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Booking updated successfully",
      booking: updatedBooking,
    });
  });

  it("should return 404 if booking not found", async () => {
    Room.exists.mockResolvedValue(true);
    Course.exists.mockResolvedValue(true);
    admin.exists.mockResolvedValue(true);
    Booking.findOne.mockResolvedValue(false);
    Booking.findByIdAndUpdate.mockResolvedValue(null);

    await updateBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Booking not found",
    });
  });

  it("should handle internal server error", async () => {
    const errorMessage = "Something went wrong";
    Room.exists.mockRejectedValue(new Error(errorMessage));

    await updateBooking(req, res);

    expect(logger.error).toHaveBeenCalledWith(
      "Error updating booking:",
      expect.any(Error)
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error",
    });
  });
});

// test case to delete booking

jest.mock("../models/Booking");
jest.mock("../utils/logger");

describe("deleteBooking", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { adminId: "admin123" },
      params: { id: "booking123" },
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

    await deleteBooking(req, res);

    expect(logger.warn).toHaveBeenCalledWith(
      "Unauthorized access: null is not authorized as admin"
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "You are not authorized as admin",
    });
  });

  it("should return 404 if booking is not found", async () => {
    Booking.findByIdAndDelete.mockResolvedValue(null);

    await deleteBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Booking not found",
    });
  });

  it("should delete booking successfully", async () => {
    const deletedBooking = { _id: "booking123" };
    Booking.findByIdAndDelete.mockResolvedValue(deletedBooking);

    await deleteBooking(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Booking deleted successfully",
      booking: deletedBooking,
    });
  });

  it("should handle internal server error", async () => {
    const errorMessage = "Something went wrong";
    Booking.findByIdAndDelete.mockRejectedValue(new Error(errorMessage));

    await deleteBooking(req, res);

    expect(logger.error).toHaveBeenCalledWith(
      "Error deleting booking:",
      expect.any(Error)
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error",
    });
  });
});

//test case to get all bookings

jest.mock("../models/Booking");
jest.mock("../models/admin");

describe("getAllBookings", () => {
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

    await getAllBookings(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "You are not authorized as admin",
    });
  });

  it("should fetch all bookings successfully", async () => {
    const mockBookings = [{ _id: "booking1" }, { _id: "booking2" }];
    Booking.find.mockResolvedValue(mockBookings);

    await getAllBookings(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "All Bookings List",
      bookings: mockBookings,
    });
  });

  it("should handle internal server error", async () => {
    const errorMessage = "Something went wrong";
    Booking.find.mockRejectedValue(new Error(errorMessage));

    await getAllBookings(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error",
    });
  });
});
