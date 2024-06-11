const request = require("supertest");
const app = require("../server");

describe("Admin API", () => {
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImFkbWluSWQiOiJBMTAwMCIsImVtYWlsIjoiSm9objEyQGdtYWlsLmNvbSIsImlkIjoiNjVmOWIyZTA3MDQ5YjE3OTY3ZjdkNTE2In0sImlhdCI6MTcxMTAzMzI1MiwiZXhwIjoxNzQyNTkwODUyfQ.j6_6nhngfqEK4iZZ-JColcSJkQQwhxdsU3qzEPZL42s";
  const newAdminToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImFkbWluSWQiOiJBMTAwNSIsImVtYWlsIjoiS2F5YU1hcnlAZXhhbXBsZS5jb20iLCJpZCI6IjY1ZmViZDA0YWQ3NTg5ZWZhNTQ0ODg0NyJ9LCJpYXQiOjE3MTExOTM1MTAsImV4cCI6MTc0Mjc1MTExMH0.t5tsoR0OLO1fh2CfGvyq9TnnMrSVUJAgBCfyUMpvd5k";
  const adminID = "A1005";
  test("POST /api/admins/register should create a new admin", async () => {
    const newAdminData = {
      firstName: "Kaya",
      lastName: "Mary",
      email: "KayaMary@example.com",
      address: "123 Main St",
      phone: "779362829",
      password: "Test123!@#",
      dob: "1990-01-01",
    };

    const response = await request(app)
      .post("/api/admins/register")
      .send(newAdminData);

    expect(response.status).toBe(201);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("New Admin created");
    expect(response.body.data).toHaveProperty("_id");
    expect(response.body.data.firstName).toBe(newAdminData.firstName);
    expect(response.body.data.lastName).toBe(newAdminData.lastName);
    expect(response.body.data.email).toBe(newAdminData.email);
  });

  test("GET /api/admins should return all admins", async () => {
    const response = await request(app)
      .get("/api/admins")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("All Admins List");
    expect(response.body.admins).toBeDefined();
  });

  test("PUT /admins/${adminID} should update the admin", async () => {
    const updatedAdmin = {
      firstName: "Kaya",
      lastName: "Mary",
      email: "KayaMary@example.com",
      address: "123 Main St",
      phone: "7789532156",
      password: "Test123!@#",
      dob: "1990-01-01",
    };

    const response = await request(app)
      .put(`/api/admins/${adminID}`)
      .set("Authorization", `Bearer ${newAdminToken}`)
      .send(updatedAdmin);

    expect(response.status).toBe(200);
    expect(response.body.updatedAdmin).toHaveProperty(
      "firstName",
      updatedAdmin.firstName
    );
    expect(response.body.updatedAdmin).toHaveProperty(
      "lastName",
      updatedAdmin.lastName
    );
    expect(response.body.updatedAdmin).toHaveProperty(
      "email",
      updatedAdmin.email
    );
  });
  test("DELETE /api/admins/ should delete admin", async () => {
    const response = await request(app)
      .delete(`/api/admins/${adminID}`)
      .set("Authorization", `Bearer ${newAdminToken}`);

    expect(response.status).toBe(200);
  });
});
