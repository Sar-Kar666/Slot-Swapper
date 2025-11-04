import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: String,
  startTime: Date,
  endTime: Date,
  status: {
    type: String,
    enum: ["BUSY", "SWAPPABLE", "SWAP_PENDING"],
    default: "BUSY"
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

export default mongoose.model("Event", eventSchema);
