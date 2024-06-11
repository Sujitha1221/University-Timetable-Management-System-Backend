const {
  createRoom,
  getAllRooms,
  updateRoom,
  deleteRoom,
} = require("../controllers/roomController");
const Room = require("../models/room");
const logger = require("../utils/logger");

//test case to get all rooms
describe("getAllRooms function", () => {
  // Mocking req, res, and logger
  const req = { user: { adminId: "admin123" } };
  const res = {
    status: jest.fn(() => res),
    json: jest.fn(),
  };
  const logger = { warn: jest.fn(), error: jest.fn() };

  test("should return all rooms when user is authorized as admin", async () => {
    // Mocking Room.find() to return some rooms
    Room.find = jest.fn().mockResolvedValue(["room1", "room2"]);

    await getAllRooms(req, res);

    expect(Room.find).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "All Rooms List",
      rooms: ["room1", "room2"],
    });
  });

  test("should return unauthorized message when user is not authorized as admin", async () => {
    req.user.adminId = ""; // Empty adminId to simulate unauthorized access

    await getAllRooms(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "You are not authorized as admin",
    });
  });

  test("should return internal server error message when an error occurs", async () => {
    // Mocking Room.find() to throw an error
    Room.find = jest.fn().mockRejectedValue(new Error("Database error"));

    await getAllRooms(req, res);
  });
});

// //test case to create room
// Mocking dependencies
jest.mock("../models/room");
jest.mock("../utils/logger");

describe("createRoom", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      user: {
        adminId: "adminId", // Assuming adminId is provided
      },
      body: {
        floorNo: 1,
        building: "Building A",
        name: "Room A",
        capacity: 10,
        resources: ["Projector", "Whiteboard"],
      },
    };

    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create a room successfully", async () => {
    // Mocking Room.findOne to return null, indicating no existing room
    Room.findOne.mockResolvedValue(null);
    // Mocking Room.prototype.save to resolve with req.body
    Room.prototype.save.mockResolvedValue(req.body);

    // Call createRoom with the mocked req and res
    await createRoom(req, res);
  });

  it("should return 409 status code if room already exists", async () => {
    Room.findOne.mockResolvedValue(true); // Assuming room already exists

    await createRoom(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Room is already created",
    });
  });

  it("should return 401 status code if user is not authorized as admin", async () => {
    req.user.adminId = undefined;

    await createRoom(req, res);

    expect(logger.warn).toHaveBeenCalledWith(
      "Unauthorized access: undefined is not authorized as admin"
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "You are not authorized as admin",
    });
  });

  it("should return 400 status code if required fields are missing", async () => {
    req.body = {}; // Missing required fields

    await createRoom(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Missing required fields",
    });
  });

  it("should return 500 status code for internal server error", async () => {
    Room.findOne.mockRejectedValue(new Error("Database error"));

    await createRoom(req, res);

    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error",
    });
  });
});

//test case to delete room
jest.mock("../models/room"); // mock the Room module
jest.mock("../utils/logger"); // mock the logger module

describe("deleteRoom function", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { adminId: "admin123" },
      params: { roomId: "room123" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if user is not authorized", async () => {
    req.user.adminId = "";

    await deleteRoom(req, res);

    expect(logger.warn).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "You are not authorized as admin",
    });
  });

  it("should return 404 if room not found", async () => {
    Room.findOneAndDelete.mockResolvedValueOnce(null);

    await deleteRoom(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Room not found",
    });
  });

  it("should delete room and return 200 with deleted room", async () => {
    const deletedRoomMock = {
      _id: "room123",
      floorNo: 1,
      building: "A",
      name: "Room 101",
      capacity: 50,
      resources: ["projector", "whiteboard"],
    };

    Room.findOneAndDelete.mockResolvedValueOnce(deletedRoomMock);

    await deleteRoom(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Room deleted successfully",
      room: deletedRoomMock,
    });
  });

  it("should handle internal server error", async () => {
    Room.findOneAndDelete.mockRejectedValueOnce(new Error("Database error")); // mock that an error occurred

    await deleteRoom(req, res);

    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error",
    });
  });
});

//test case to update room
jest.mock("../models/room.js"); // mock the Room module
jest.mock("../utils/logger"); // mock the logger module

describe("updateRoom function", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { adminId: "admin123" },
      params: { roomId: "room123" },
      body: {
        floorNo: 1,
        building: "A",
        name: "Room 101",
        capacity: 50,
        resources: ["projector", "whiteboard"],
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if user is not authorized", async () => {
    req.user.adminId = ""; // setting adminId to empty string to simulate unauthorized user

    await updateRoom(req, res);

    expect(logger.warn).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "You are not authorized as admin",
    });
  });

  it("should return 409 if room already exists", async () => {
    Room.findOne.mockResolvedValueOnce(true); // mock that room already exists

    await updateRoom(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Room is already created",
    });
  });

  it("should return 404 if room not found", async () => {
    Room.findOneAndUpdate.mockResolvedValueOnce(null); // mock that room is not found

    await updateRoom(req, res);
  });

  it("should update room and return 200 with updated room", async () => {
    const updatedRoomMock = {
      _id: "room123",
      floorNo: 1,
      building: "A",
      name: "Room 101",
      capacity: 50,
      resources: ["projector", "whiteboard"],
    };

    Room.findOne.mockResolvedValueOnce(null); // mock that room is not found
    Room.findOneAndUpdate.mockResolvedValueOnce(updatedRoomMock); // mock that room is updated

    await updateRoom(req, res);
  });

  it("should handle internal server error", async () => {
    Room.findOne.mockRejectedValueOnce(new Error("Database error")); // mock that an error occurred

    await updateRoom(req, res);

    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error",
    });
  });
});
