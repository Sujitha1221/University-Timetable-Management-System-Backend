const request = require("supertest");
const app = require("../server");

describe("Course API", () => {
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImFkbWluSWQiOiJBMTAwMCIsImVtYWlsIjoiSm9objEyQGdtYWlsLmNvbSIsImlkIjoiNjVmOWIyZTA3MDQ5YjE3OTY3ZjdkNTE2In0sImlhdCI6MTcxMTAzMzI1MiwiZXhwIjoxNzQyNTkwODUyfQ.j6_6nhngfqEK4iZZ-JColcSJkQQwhxdsU3qzEPZL42s";
  const courseCode = "SE3040";
  test("POST /api/courses should create a new course", async () => {
    const newCourseData = {
      courseCode: "SE3040",
      name: "Application Frameworks",
      description:
        "This course explores the frameworks popularly used in industry",
      credits: 4,
      faculties: ["F1000", "F1002"],
    };

    const response = await request(app)
      .post("/api/courses")
      .set("Authorization", `Bearer ${token}`)
      .send(newCourseData);

    expect(response.status).toBe(201);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Course created successfully");
  });

  test("GET /api/courses should return all courses", async () => {
    const response = await request(app).get("/api/courses");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("All Courses List");
    expect(response.body.courses).toBeDefined();
  });

  test("PUT /courses/${courseCode} should update the course", async () => {
    const updatedCourse = {
      courseCode: "SE3040",
      name: "Application Frameworks",
      description:
        "This course explores the frameworks popularly used in industry",
      credits: 4,
      faculties: ["F1000", "F1002"],
    };

    const response = await request(app)
      .put(`/api/courses/${courseCode}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updatedCourse);

    expect(response.status).toBe(200);
  });
  test("DELETE /api/courses/ should delete course", async () => {
    const response = await request(app)
      .delete(`/api/courses/${courseCode}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
  });
});
