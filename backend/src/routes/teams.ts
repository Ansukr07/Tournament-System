import express from "express";
import {
    createTeam,
    getTeamById,
    getAllTeams,
    registerTeamToEvent,
    getTeamsByEvent,
    getLeaderboard, // Added import
} from "../controllers/teamController";

const router = express.Router();

router.post("/", createTeam);
router.get("/leaderboard", getLeaderboard); // Added route BEFORE /:id
router.get("/:id", getTeamById);
router.get("/", getAllTeams);
router.post("/register-to-event", registerTeamToEvent);
router.get("/event/:eventId", getTeamsByEvent);

export default router;
