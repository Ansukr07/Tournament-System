import express from "express";
import {
    submitScore,
    generateMatchCode,
    verifyMatchCode,
    getMatchById,
    getAllMatches
} from "../controllers/matchController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", getAllMatches);
router.get("/:id", getMatchById);
router.post("/:id/submit-score", submitScore);
router.post("/:id/generate-code", authMiddleware, generateMatchCode);
router.post("/:id/verify-code", verifyMatchCode);

export default router;
