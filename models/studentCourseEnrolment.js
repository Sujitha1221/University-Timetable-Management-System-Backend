const mongoose = require("mongoose");

const studentEnrollmentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
  },
  courseId: {
    type: String,
    required: true,
  },
});

const StudentEnrollment = mongoose.model(
  "StudentEnrollment",
  studentEnrollmentSchema
);

module.exports = StudentEnrollment;
