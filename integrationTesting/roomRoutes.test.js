const request = require("supertest");
const app = require("../server");

describe("Room API", () => {
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImFkbWluSWQiOiJBMTAwMCIsImVtYWlsIjoiSm9objEyQGdtYWlsLmNvbSIsImlkIjoiNjVmOWIyZTA3MDQ5YjE3OTY3ZjdkNTE2In0sImlhdCI6MTcxMTAzMzI1MiwiZXhwIjoxNzQyNTkwODUyfQ.j6_6nhngfqEK4iZZ-JColcSJkQQwhxdsU3qzEPZL42s";
  const roomId = "R1003";
  test("POST /api/rooms should create a new room", async () => {
    const newRoomData = {
      floorNo: "5",
      building: "Architecture Building",
      name: "Laboratory",
      capacity: 50,
      resources: ["Projector", "Laptops"],
    };

    const response = await request(app)
      .post("/api/rooms")
      .set("Authorization", `Bearer ${token}`)
      .send(newRoomData);

    expect(response.status).toBe(201);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Room created successfully");
  });

  test("GET /api/rooms should return all rooms", async () => {
    const response = await request(app)
      .get("/api/rooms")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("All Rooms List");
  });

  test("PUT /rooms/${roomId} should update the room", async () => {
    const updatedRoom = {
      floorNo: "5",
      building: "Architecture",
      name: "Laboratories",
      capacity: 50,
      resources: ["Projectors", "Laptops"],
    };

    const response = await request(app)
      .put(`/api/rooms/${roomId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updatedRoom);

    expect(response.status).toBe(200);
  });
  test("DELETE /api/rooms/ should delete the room", async () => {
    const response = await request(app)
      .delete(`/api/rooms/${roomId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
  });
});
