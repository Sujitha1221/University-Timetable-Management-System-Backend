const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const timeTableSchema = new Schema(
  {
    courseId: {
      type: String,
      required: true,
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
    faculty: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const TimeTable = mongoose.model("timeTable", timeTableSchema);

module.exports = TimeTable;
