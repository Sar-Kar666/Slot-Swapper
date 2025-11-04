import express from "express";
import Event from "../models/Event.js";
import SwapRequest from "../models/SwapRequest.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all swappable slots (excluding my own)
router.get("/swappable-slots", authMiddleware, async (req, res) => {
  const slots = await Event.find({
    userId: { $ne: req.user.id },
    status: "SWAPPABLE"
  });
  res.json(slots);
});

// Create swap request
router.post("/swap-request", authMiddleware, async (req, res) => {
  const { mySlotId, theirSlotId } = req.body;
  const mySlot = await Event.findById(mySlotId);
  const theirSlot = await Event.findById(theirSlotId);

  if (!mySlot || !theirSlot)
    return res.status(400).json({ message: "Invalid slot(s)" });

  if (mySlot.status !== "SWAPPABLE" || theirSlot.status !== "SWAPPABLE")
    return res.status(400).json({ message: "Slots not available" });

  await Event.findByIdAndUpdate(mySlotId, { status: "SWAP_PENDING" });
  await Event.findByIdAndUpdate(theirSlotId, { status: "SWAP_PENDING" });

  const swap = await SwapRequest.create({
    requesterId: req.user.id,
    receiverId: theirSlot.userId,
    mySlotId,
    theirSlotId
  });

  res.json(swap);
});

// Respond to swap request
router.post("/swap-response/:id", authMiddleware, async (req, res) => {
  const { accept } = req.body;
  const swap = await SwapRequest.findById(req.params.id);

  if (!swap) return res.status(404).json({ message: "Swap not found" });

  if (accept) {
    swap.status = "ACCEPTED";

    // Swap userIds
    const mySlot = await Event.findById(swap.mySlotId);
    const theirSlot = await Event.findById(swap.theirSlotId);

    const tempUser = mySlot.userId;
    mySlot.userId = theirSlot.userId;
    theirSlot.userId = tempUser;

    mySlot.status = "BUSY";
    theirSlot.status = "BUSY";

    await mySlot.save();
    await theirSlot.save();
  } else {
    swap.status = "REJECTED";

    await Event.findByIdAndUpdate(swap.mySlotId, { status: "SWAPPABLE" });
    await Event.findByIdAndUpdate(swap.theirSlotId, { status: "SWAPPABLE" });
  }

  await swap.save();
  res.json(swap);
});

export default router;
