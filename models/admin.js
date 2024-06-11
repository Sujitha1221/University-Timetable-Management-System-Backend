const mongoose = require("mongoose");
const adminSchema = mongoose.Schema(
  {
    adminId: {
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

adminSchema.pre("save", async function (next) {
  const admin = this;
  if (!admin.isNew) {
    return next();
  }
  try {
    const count = await admin.constructor.countDocuments({});
    admin.adminId = `A${1000 + count}`;
    next();
  } catch (error) {
    return next(error);
  }
});
const admin = mongoose.model("Admin", adminSchema);

module.exports = admin;
