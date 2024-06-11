const request = require("supertest");
const app = require("../server");

describe("Enrollment API", () => {
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImFkbWluSWQiOiJBMTAwMCIsImVtYWlsIjoiSm9objEyQGdtYWlsLmNvbSIsImlkIjoiNjVmOWIyZTA3MDQ5YjE3OTY3ZjdkNTE2In0sImlhdCI6MTcxMTAzMzI1MiwiZXhwIjoxNzQyNTkwODUyfQ.j6_6nhngfqEK4iZZ-JColcSJkQQwhxdsU3qzEPZL42s";
  const studentToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InN0dWRlbnRJZCI6IlMxMDAwIiwiZW1haWwiOiJCcmFuZHQ4OEBnbWFpbC5jb20iLCJpZCI6IjY1ZjliN2ZlMmU0ZmEwODYxYzBkNmJkMCJ9LCJpYXQiOjE3MTExOTA2MTcsImV4cCI6MTcxMTE5MTUxN30.tAqTJRYNHiZAI6MLVICUGMdXn5twKND0HA6VmyninQw0";
  test("POST /api/enrolments should create a new timeTable", async () => {
    const newEnrollment = { courseId: "ENG101" };

    const response = await request(app)
      .post("/api/enrolments")
      .set("Authorization", `Bearer ${studentToken}`)
      .send(newEnrollment);
  });

  test("GET /api/enrolments should return all timeTables", async () => {
    const response = await request(app)
      .get("/api/enrolments")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("All enrollments List");
    expect(response.body.status).toBe("success");
  });
});
