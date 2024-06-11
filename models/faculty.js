const mongoose = require("mongoose");
const facultySchema = mongoose.Schema(
  {
    facultyId: {
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

facultySchema.pre("save", async function (next) {
  const faculty = this;
  if (!faculty.isNew) {
    return next();
  }
  try {
    const count = await faculty.constructor.countDocuments({});
    faculty.facultyId = `F${1000 + count}`;
    next();
  } catch (error) {
    return next(error);
  }
});
// Create the faculty model
const faculty = mongoose.model("Faculty", facultySchema);

module.exports = faculty;
