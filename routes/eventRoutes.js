import express from "express";
import Event from "../models/Event.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Get my events
router.get("/", authMiddleware, async (req, res) => {
  const events = await Event.find({ userId: req.user.id });
  res.json(events);
});

// Create event
router.post("/", authMiddleware, async (req, res) => {
  const { title, startTime, endTime } = req.body;
  const event = await Event.create({ title, startTime, endTime, userId: req.user.id });
  res.json(event);
});

// Update event status
router.put("/:id", authMiddleware, async (req, res) => {
  const { status } = req.body;
  const event = await Event.findByIdAndUpdate(req.params.id, { status }, { new: true });
  res.json(event);
});

export default router;
