const mongoose = require("mongoose");
const studentSchema = mongoose.Schema(
  {
    studentId: {
      type: String,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    dob: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

studentSchema.pre("save", async function (next) {
  const student = this;
  if (!student.isNew) {
    return next();
  }
  try {
    const count = await student.constructor.countDocuments({});
    student.studentId = `S${1000 + count}`;
    next();
  } catch (error) {
    return next(error);
  }
});
// Create the Student model
const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
