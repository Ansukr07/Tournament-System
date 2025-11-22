import express from "express";
import {
  createEvent,
  getEvents,
  getEventById,
  generateFixtures,
  scheduleEventMatches,
  getEventMatches,
  getEventLeaderboard,
} from "../controllers/eventController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", authMiddleware, createEvent);
router.get("/", getEvents);
router.get("/:id", getEventById);
router.get("/:id/matches", getEventMatches);
router.get("/:id/leaderboard", getEventLeaderboard);
router.post("/:id/generate-fixtures", authMiddleware, generateFixtures);
router.post("/:id/schedule", authMiddleware, scheduleEventMatches);

export default router;
