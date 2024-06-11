const request = require("supertest");
const app = require("../server");

describe("Student API", () => {
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImFkbWluSWQiOiJBMTAwMCIsImVtYWlsIjoiSm9objEyQGdtYWlsLmNvbSIsImlkIjoiNjVmOWIyZTA3MDQ5YjE3OTY3ZjdkNTE2In0sImlhdCI6MTcxMTAzMzI1MiwiZXhwIjoxNzQyNTkwODUyfQ.j6_6nhngfqEK4iZZ-JColcSJkQQwhxdsU3qzEPZL42s";
  const studentToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InN0dWRlbnRJZCI6IlMxMDAzIiwiZW1haWwiOiJLYXlhTWFyeUBleGFtcGxlLmNvbSIsImlkIjoiNjVmZWMxMjE5MjMwNWFmYzZmMWVlMGUzIn0sImlhdCI6MTcxMTE5NDUyMSwiZXhwIjoxNzExMTk1NDIxfQ.9D5331RopCcK-ioa4O681lXhzyYE5iJPY3i0wEX0oiE";
  const studentID = "S1003";
  test("POST /api/students/register should create a new student", async () => {
    const newStudentData = {
      firstName: "Kaya",
      lastName: "Mary",
      email: "KayaMary@example.com",
      address: "123 Main St",
      phone: "779362829",
      password: "Test123!@#",
      dob: "1990-01-01",
    };

    const response = await request(app)
      .post("/api/students/register")
      .send(newStudentData);

    expect(response.status).toBe(201);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("New Student created");
    expect(response.body.data).toHaveProperty("_id");
    expect(response.body.data.firstName).toBe(newStudentData.firstName);
    expect(response.body.data.lastName).toBe(newStudentData.lastName);
    expect(response.body.data.email).toBe(newStudentData.email);
  });

  test("GET /api/students should return all students", async () => {
    const response = await request(app)
      .get("/api/students")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("All Students List");
    expect(response.body.students).toBeDefined();
  });

  test("PUT /students/${studentID} should update the student", async () => {
    const updatedStudent = {
      firstName: "Kaya",
      lastName: "Mary",
      email: "KayaMary@example.com",
      address: "123 Main St",
      phone: "7789532156",
      password: "Test123!@#",
      dob: "1990-01-01",
    };

    const response = await request(app)
      .put(`/api/students/${studentID}`)
      .set("Authorization", `Bearer ${studentToken}`)
      .send(updatedStudent);

    expect(response.status).toBe(200);
    expect(response.body.updatedStudent).toHaveProperty(
      "firstName",
      updatedStudent.firstName
    );
    expect(response.body.updatedStudent).toHaveProperty(
      "lastName",
      updatedStudent.lastName
    );
    expect(response.body.updatedStudent).toHaveProperty(
      "email",
      updatedStudent.email
    );
  });
  test("DELETE /api/students/ should delete student", async () => {
    const response = await request(app)
      .delete(`/api/students/${studentID}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
  });
});
