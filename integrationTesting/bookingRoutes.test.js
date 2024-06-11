const request = require("supertest");
const app = require("../server");

describe("Booking API", () => {
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImFkbWluSWQiOiJBMTAwMCIsImVtYWlsIjoiSm9objEyQGdtYWlsLmNvbSIsImlkIjoiNjVmOWIyZTA3MDQ5YjE3OTY3ZjdkNTE2In0sImlhdCI6MTcxMTE5NDcyNiwiZXhwIjoxNzQyNzUyMzI2fQ.LNXvUIKCrWtCPY2PGDOpv6AWnYNNPcBziZOnE9iKV2s";
  const id = `662bde9aa75db4b6dadd0286`;
  test("POST /api/bookings should create a new booking", async () => {
    const newBooking = {
      roomId: "R1000",
      courseId: "HIST201",
      dayOfWeek: 6,
      startTime: {
        hours: 11,
        minutes: 0,
      },
      endTime: {
        hours: 13,
        minutes: 0,
      },
    };

    const response = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send(newBooking);

    expect(response.status).toBe(201);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Booking created successfully");
  });

  test("GET /api/bookings should return all bookings", async () => {
    const response = await request(app)
      .get("/api/bookings")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("All Bookings List");
    expect(response.body.bookings).toBeDefined();
  });

  test("PUT /bookings/${id} should update the booking", async () => {
    const updatedBooking = {
      roomId: "R1000",
      courseId: "HIST201",
      dayOfWeek: 5,
      startTime: {
        hours: 11,
        minutes: 0,
      },
      endTime: {
        hours: 13,
        minutes: 0,
      },
    };
    const response = await request(app)
      .put(`/api/bookings/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updatedBooking);

    expect(response.status).toBe(200);
  }, 10000);
  test("DELETE /api/bookings/ should delete booking", async () => {
    const response = await request(app)
      .delete(`/api/bookings/${id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
  });
});
