const {
  createCourse,
  getAllCourses,
  updateCourse,
  deleteCourse,
} = require("../controllers/courseController"); // Import your function

// Mocking dependencies
const Course = require("../models/course");
const Faculty = require("../models/faculty");
const logger = require("../utils/logger");

//test case to get all courses
jest.mock("../models/course");
jest.mock("../utils/logger");

describe("getAllCourses", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return all courses", async () => {
    const mockCourses = [
      { _id: "course1", courseCode: "CS101", name: "Course 1" },
      { _id: "course2", courseCode: "CS102", name: "Course 2" },
    ];
    Course.find.mockResolvedValue(mockCourses);

    await getAllCourses(req, res);

    expect(Course.find).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "All Courses List",
      courses: mockCourses,
    });
  });

  it("should handle error getting courses", async () => {
    const errorMessage = "Internal server error";
    Course.find.mockRejectedValue(new Error(errorMessage));

    await getAllCourses(req, res);

    expect(logger.error).toHaveBeenCalledWith(
      "Error getting Courses:",
      expect.any(Error)
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error",
    });
  });
});

//test case to delete course
jest.mock("../models/course");
jest.mock("../utils/logger");

describe("deleteCourse", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: {
        adminId: "admin123",
      },
      params: {
        courseCode: "CS101",
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

    await deleteCourse(req, res);

    expect(logger.warn).toHaveBeenCalledWith(
      "Unauthorized access: undefined is not authorized as admin"
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "You are not authorized as admin",
    });
  });

  it("should delete course successfully", async () => {
    const mockCourse = {
      _id: "course123",
      courseCode: req.params.courseCode,
      name: "Course Name",
      description: "Course Description",
      credits: 3,
      faculties: ["faculty123", "faculty456"],
    };
    Course.findOneAndDelete.mockResolvedValue(mockCourse);

    await deleteCourse(req, res);

    expect(Course.findOneAndDelete).toHaveBeenCalledWith({
      courseCode: req.params.courseCode,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Course deleted successfully",
      course: mockCourse,
    });
  });

  it("should handle course not found", async () => {
    Course.findOneAndDelete.mockResolvedValue(null);

    await deleteCourse(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Course not found",
    });
  });

  it("should handle error deleting course", async () => {
    const errorMessage = "Internal server error";
    Course.findOneAndDelete.mockRejectedValue(new Error(errorMessage));

    await deleteCourse(req, res);

    expect(logger.error).toHaveBeenCalledWith(
      "Error deleting Course:",
      expect.any(Error)
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error",
    });
  });
});

//test case to update course
jest.mock("../models/course");
jest.mock("../models/faculty");
jest.mock("../utils/logger");

describe("updateCourse", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: {
        adminId: "admin123",
      },
      params: {
        courseCode: "CS101",
      },
      body: {
        name: "Updated Course",
        description: "Updated course description",
        credits: 4,
        faculties: ["faculty123", "faculty456"],
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

    await updateCourse(req, res);

    expect(logger.warn).toHaveBeenCalledWith(
      "Unauthorized access: undefined is not authorized as admin"
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "You are not authorized as admin",
    });
  });

  it("should update course successfully", async () => {
    const mockUpdatedCourse = {
      _id: "course123",
      courseCode: req.params.courseCode,
      name: req.body.name,
      description: req.body.description,
      credits: req.body.credits,
      faculties: req.body.faculties,
    };
    const mockExistingFaculties = [
      { _id: "faculty123", name: "Faculty of Science" },
      { _id: "faculty456", name: "Faculty of Engineering" },
    ];
    Course.findOneAndUpdate.mockResolvedValue(mockUpdatedCourse);
    Faculty.find.mockResolvedValue(mockExistingFaculties);

    await updateCourse(req, res);
  });

  it("should handle invalid faculty IDs", async () => {
    Faculty.find.mockResolvedValue([
      { _id: "faculty123", name: "Faculty of Science" },
    ]);
    req.body.faculties.push("invalidFacultyId");

    await updateCourse(req, res);
  });

  it("should handle course not found", async () => {
    Course.findOneAndUpdate.mockResolvedValue(null);

    await updateCourse(req, res);
  });

  it("should handle error updating course", async () => {
    const errorMessage = "Internal server error";
    Course.findOneAndUpdate.mockRejectedValue(new Error(errorMessage));

    await updateCourse(req, res);
  });
});

//test case to create course
jest.mock("../models/course");
jest.mock("../models/faculty");
jest.mock("../utils/logger");

describe("createCourse", () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: {
        adminId: "admin123",
      },
      body: {
        courseCode: "CS101",
        name: "Introduction to Computer Science",
        description: "An introductory course to computer science",
        credits: 3,
        faculties: ["faculty123", "faculty456"],
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

    await createCourse(req, res);

    expect(logger.warn).toHaveBeenCalledWith(
      "Unauthorized access: undefined is not authorized as admin"
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "You are not authorized as admin",
    });
  });

  it("should create course successfully", async () => {
    const mockCourse = {
      _id: "course123",
      courseCode: req.body.courseCode,
      name: req.body.name,
      description: req.body.description,
      credits: req.body.credits,
      faculties: req.body.faculties,
    };
    const mockExistingFaculties = [
      { _id: "faculty123", name: "Faculty of Science" },
      { _id: "faculty456", name: "Faculty of Engineering" },
    ];
    Course.findOne.mockResolvedValue(null);
    Faculty.find.mockResolvedValue(mockExistingFaculties);
    Course.prototype.save.mockResolvedValue(mockCourse);

    await createCourse(req, res);
  });

  it("should handle existing course", async () => {
    Course.findOne.mockResolvedValue({ _id: "existingCourse123" });

    await createCourse(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Course already exists",
    });
  });

  it("should handle invalid faculty IDs", async () => {
    Faculty.find.mockResolvedValue([
      { _id: "faculty123", name: "Faculty of Science" },
    ]);
    req.body.faculties.push("invalidFacultyId");

    await createCourse(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid faculty IDs provided",
    });
  });

  it("should handle error creating course", async () => {
    const errorMessage = "Internal server error";
    Course.findOne.mockRejectedValue(new Error(errorMessage));

    await createCourse(req, res);
  });
});
