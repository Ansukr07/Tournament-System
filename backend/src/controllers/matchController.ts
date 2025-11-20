import { Request, Response } from "express";
import Match from "../models/Match";
import MatchCode from "../models/MatchCode";
import crypto from "crypto";
import { io } from "../server";
import { completeMatch } from "../services/matchService";

export const submitScore = async (req: Request, res: Response) => {
  try {
    const { winnerId, score, matchCode } = req.body;
    const matchId = req.params.id;

    // Verify match code before allowing score submission
    if (!matchCode) {
      return res.status(400).json({ message: "Match code required for score submission" });
    }

    const codeHash = crypto.createHash("sha256").update(matchCode).digest("hex");
    const validCode = await MatchCode.findOne({
      matchId,
      codeHash,
      used: false
    });

    if (!validCode) {
      return res.status(403).json({ message: "Invalid or already used match code" });
    }

    if (validCode.expiresAt < new Date()) {
      return res.status(403).json({ message: "Match code has expired" });
    }

    // Mark code as used
    validCode.used = true;
    await validCode.save();

    // Complete the match and advance winner
    const match = await completeMatch(matchId, winnerId, score);

    res.json({
      message: "Score submitted successfully",
      match
    });
  } catch (error: any) {
    res.status(500).json({ message: "Error submitting score", error: error.message });
  }
};

export const generateMatchCode = async (req: Request, res: Response) => {
  try {
    const matchId = req.params.id;
    const { umpireId } = req.body; // Admin assigns umpire

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = crypto.createHash("sha256").update(code).digest("hex");

    // Delete any existing codes for this match
    await MatchCode.deleteMany({ matchId });

    const matchCode = new MatchCode({
      matchId,
      codeHash,
      expiresAt: new Date(Date.now() + 60 * 60000), // 1 hour expiry
    });

    await matchCode.save();

    // Assign umpire to match if provided
    if (umpireId) {
      match.umpireId = umpireId;
      await match.save();
    }

    res.json({
      code,
      expiresAt: matchCode.expiresAt,
      matchId: match._id,
      matchNumber: match.matchNumber
    });
  } catch (error: any) {
    res.status(500).json({ message: "Error generating code", error: error.message });
  }
};

export const verifyMatchCode = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;
    const matchId = req.params.id;

    if (!code) {
      return res.status(400).json({ valid: false, message: "Code is required" });
    }

    const codeHash = crypto.createHash("sha256").update(code).digest("hex");

    const matchCode = await MatchCode.findOne({ matchId, codeHash, used: false });

    if (!matchCode) {
      return res.status(400).json({ valid: false, message: "Invalid or used code" });
    }

    if (matchCode.expiresAt < new Date()) {
      return res.status(400).json({ valid: false, message: "Code expired" });
    }

    // Return match details if code is valid
    const match = await Match.findById(matchId)
      .populate("participants.playerId")
      .populate("eventId");

    res.json({
      valid: true,
      match,
      expiresAt: matchCode.expiresAt
    });
  } catch (error: any) {
    res.status(500).json({ message: "Error verifying code", error: error.message });
  }
};

export const getMatchById = async (req: Request, res: Response) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate("participants.playerId")
      .populate("winnerId")
      .populate("eventId")
      .populate("umpireId");

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    res.json(match);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching match", error: error.message });
  }
};

export const getAllMatches = async (req: Request, res: Response) => {
  try {
    const { eventId, status } = req.query;

    const filter: any = {};
    if (eventId) filter.eventId = eventId;
    if (status) filter.status = status;

    const matches = await Match.find(filter)
      .populate("participants.playerId")
      .populate("winnerId")
      .populate("eventId")
      .sort({ round: 1, matchNumber: 1 });

    res.json(matches);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching matches", error: error.message });
  }
};
