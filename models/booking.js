const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
    },
    courseId: {
      type: String,
      required: true,
    },
    bookedBy: {
      type: String,
    },
    dayOfWeek: {
      type: Number,
      min: 1,
      max: 7,
      required: true,
    },
    startTime: {
      hours: {
        type: Number,
        required: true,
      },
      minutes: {
        type: Number,
        required: true,
      },
    },
    endTime: {
      hours: {
        type: Number,
        required: true,
      },
      minutes: {
        type: Number,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
