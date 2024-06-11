const request = require("supertest");
const app = require("../server");

describe("TimeTable API", () => {
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImFkbWluSWQiOiJBMTAwMCIsImVtYWlsIjoiSm9objEyQGdtYWlsLmNvbSIsImlkIjoiNjVmOWIyZTA3MDQ5YjE3OTY3ZjdkNTE2In0sImlhdCI6MTcxMTAzMzI1MiwiZXhwIjoxNzQyNTkwODUyfQ.j6_6nhngfqEK4iZZ-JColcSJkQQwhxdsU3qzEPZL42s";
  const id = '662be46061a335b008262fa0';
  test("POST /api/timetables should create a new timeTable", async () => {
    const newTimeTable = {
      courseId: "COMP101",
      dayOfWeek: 1,
      startTime: {
        hours: 9,
        minutes: 0,
      },
      endTime: {
        hours: 11,
        minutes: 0,
      },
      faculty: "F1002",
      location: "R1000",
    };

    const response = await request(app)
      .post("/api/timetables")
      .set("Authorization", `Bearer ${token}`)
      .send(newTimeTable);

    expect(response.status).toBe(201);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Timetable created successfully");
  });

  test("GET /api/timetables should return all timeTables", async () => {
    const response = await request(app)
      .get("/api/timetables")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.status).toBe("success");
  });

  test("PUT /timetables/${id} should update the timeTable", async () => {
    const updatedTimeTable = {
      courseId: "COMP101",
      dayOfWeek: 1,
      startTime: {
        hours: 9,
        minutes: 0,
      },
      endTime: {
        hours: 11,
        minutes: 0,
      },
      faculty: "F1001",
      location: "R1000",
    };

    const response = await request(app)
      .put(`/api/timetables/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updatedTimeTable);

    expect(response.status).toBe(200);
  });

  test("DELETE /api/timetables/ should delete timeTable", async () => {
    const response = await request(app)
      .delete(`/api/timetables/${id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
  });
});
