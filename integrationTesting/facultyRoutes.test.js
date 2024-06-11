const request = require("supertest");
const app = require("../server");

describe("Faculty API", () => {
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImFkbWluSWQiOiJBMTAwMCIsImVtYWlsIjoiSm9objEyQGdtYWlsLmNvbSIsImlkIjoiNjVmOWIyZTA3MDQ5YjE3OTY3ZjdkNTE2In0sImlhdCI6MTcxMTAzMzI1MiwiZXhwIjoxNzQyNTkwODUyfQ.j6_6nhngfqEK4iZZ-JColcSJkQQwhxdsU3qzEPZL42s";
  const facultyToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImZhY3VsdHlJZCI6IkYxMDA0IiwiZW1haWwiOiJLYXlhTWFyeUBleGFtcGxlLmNvbSIsImlkIjoiNjVmZWJlYjI2NWM3NTM4NDljYzYwMjdkIn0sImlhdCI6MTcxMTE5MzkxNywiZXhwIjoxNzExMTk0ODE3fQ.NXn7y-DdVTHoRGdyUUy270qGXezAbQ52DnGney1Xf3Y";
  const facultyId = "F1003";
  test("POST /api/faculties/register should create a new faculty", async () => {
    const newFacultyData = {
      firstName: "Kaya",
      lastName: "Mary",
      email: "KayaMary@example.com",
      address: "123 Main St",
      phone: "779362829",
      password: "Test123!@#",
      dob: "1990-01-01",
    };

    const response = await request(app)
      .post("/api/faculties/register")
      .send(newFacultyData);

    expect(response.status).toBe(201);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("New Faculty created");
    expect(response.body.data).toHaveProperty("_id");
    expect(response.body.data.firstName).toBe(newFacultyData.firstName);
    expect(response.body.data.lastName).toBe(newFacultyData.lastName);
    expect(response.body.data.email).toBe(newFacultyData.email);
  });

  test("GET /api/faculties should return all faculties", async () => {
    const response = await request(app)
      .get("/api/faculties")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("All Faculties List");
  });

  test("PUT /faculties/${facultyId} should update the faculty", async () => {
    const updatedFaculty = {
      firstName: "Kaya",
      lastName: "Mary",
      email: "KayaMary@example.com",
      address: "123 Main St",
      phone: "7789532156",
      password: "Test123!@#",
      dob: "1990-01-01",
    };

    const response = await request(app)
      .put(`/api/faculties/${facultyId}`)
      .set("Authorization", `Bearer ${facultyToken}`)
      .send(updatedFaculty);

    expect(response.status).toBe(200);
    expect(response.body.updatedFaculty).toHaveProperty(
      "firstName",
      updatedFaculty.firstName
    );
    expect(response.body.updatedFaculty).toHaveProperty(
      "lastName",
      updatedFaculty.lastName
    );
    expect(response.body.updatedFaculty).toHaveProperty(
      "email",
      updatedFaculty.email
    );
  });
  test("DELETE /api/faculties/ should delete faculty", async () => {
    const response = await request(app)
      .delete(`/api/faculties/${facultyId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
  });
});
