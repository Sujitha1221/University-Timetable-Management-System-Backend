const express = require("express");
const databaseConnection = require("./config/dbConnection");
const dotenv = require("dotenv");
const expressWinston = require("express-winston");
const winston = require("winston");
dotenv.config();
const app = express();
const port = process.env.PORT || 8090;

app.use(
  expressWinston.logger({
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: "http.log" }),
    ],
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.json()
    ),
    meta: true,
    msg: "HTTP {{req.method}} {{req.url}}",
    expressFormat: true,
    colorize: false,
  })
);

app.use(express.json());
app.use("/api/admins", require("./routes/adminRoutes"));
app.use("/api/faculties", require("./routes/facultyRoutes"));
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/rooms", require("./routes/roomRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/enrolments", require("./routes/studentCourseEnrollmentRoutes"));
app.use("/api/timetables", require("./routes/timeTableRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  databaseConnection();
});

module.exports = app;
