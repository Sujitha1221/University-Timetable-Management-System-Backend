const mongoose = require("mongoose");

// Schema for Room collection
const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
  },
  floorNo: {
    type: String,
    required: true,
  },
  building: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  resources: [String],
});

roomSchema.pre("save", async function (next) {
  const room = this;
  if (!room.isNew) {
    return next();
  }
  try {
    const count = await room.constructor.countDocuments({});
    room.roomId = `R${1000 + count}`;
    next();
  } catch (error) {
    return next(error);
  }
});

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
