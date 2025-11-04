import mongoose from "mongoose";

const swapSchema = new mongoose.Schema({
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  mySlotId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
  theirSlotId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
  status: { type: String, enum: ["PENDING", "ACCEPTED", "REJECTED"], default: "PENDING" }
});

export default mongoose.model("SwapRequest", swapSchema);
