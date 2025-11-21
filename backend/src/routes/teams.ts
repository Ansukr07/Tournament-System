import express from "express";
import {
    createTeam,
    getTeamById,
    getAllTeams,
    registerTeamToEvent,
    getTeamsByEvent,
} from "../controllers/teamController";

const router = express.Router();

router.post("/", createTeam);
router.get("/:id", getTeamById);
router.get("/", getAllTeams);
router.post("/register-to-event", registerTeamToEvent);
router.get("/event/:eventId", getTeamsByEvent);

export default router;
