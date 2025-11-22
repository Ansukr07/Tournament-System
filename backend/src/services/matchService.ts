import Match from "../models/Match";
import TeamStats from "../models/TeamStats";
import { advanceWinner } from "./fixtureService";
import { io } from "../server";
import mongoose from "mongoose";

/**
 * Complete a match and advance winner to next round
 */
export const completeMatch = async (matchId: string, winnerId: string, score?: string) => {
    try {
        const match = await Match.findById(matchId)
            .populate("participants.teamId")
            .populate("eventId");

        if (!match) {
            throw new Error("Match not found");
        }

        // Validate winner is actually a participant
        // Note: participants.teamId is populated, so we check _id
        const isValidWinner = match.participants.some(
            (p: any) => p.teamId && p.teamId._id.toString() === winnerId
        );

        if (!isValidWinner && winnerId !== "draw") {
            throw new Error("Winner must be one of the match participants");
        }

        // Update match
        if (winnerId !== "draw") {
            match.winnerId = new mongoose.Types.ObjectId(winnerId);
        }
        match.status = "completed";
        await match.save();

        console.log(`Match ${match.matchNumber} completed. Winner: ${winnerId}`);

        // Update stats for both teams
        await updateTeamStats(match, winnerId);

        // Advance winner to next round (only if not a draw)
        if (winnerId !== "draw") {
            await advanceWinner(matchId, winnerId);
        }

        // Emit real-time update
        if (io) {
            io.emit("matchCompleted", {
                matchId,
                winnerId,
                round: match.round,
                eventId: match.eventId
            });
        }

        // Update leaderboard (emit new stats)
        // Extract eventId properly - if populated, use _id
        const eventIdStr = (match.eventId._id || match.eventId).toString();
        await updateLeaderboard(eventIdStr);

        return match;
    } catch (error) {
        console.error("Error completing match:", error);
        throw error;
    }
};

/**
 * Update team stats after a match
 */
const updateTeamStats = async (match: any, winnerId: string) => {
    try {
        // Extract IDs safely - if populated, get _id, otherwise use as-is
        // Convert to mongoose ObjectId to ensure proper type
        const eventId = new mongoose.Types.ObjectId(
            match.eventId?._id || match.eventId
        );

        for (const p of match.participants) {
            if (!p.teamId) continue;

            const teamId = new mongoose.Types.ObjectId(
                p.teamId?._id || p.teamId
            );
            const isWinner = teamId.toString() === winnerId.toString();
            const isDraw = winnerId === "draw";

            let stats = await TeamStats.findOne({ eventId, teamId });
            if (!stats) {
                stats = new TeamStats({ eventId, teamId });
            }

            stats.played += 1;

            if (isDraw) {
                stats.draw += 1;
                stats.points += 1;
            } else if (isWinner) {
                stats.won += 1;
                stats.points += 3;
            } else {
                stats.lost += 1;
                // 0 points for loss
            }

            await stats.save();
        }
    } catch (error) {
        console.error("Error updating team stats:", error);
        // Don't throw, just log. Stats error shouldn't fail the match completion.
    }
};

/**
 * Update leaderboard after match completion
 */
export const updateLeaderboard = async (eventId: string) => {
    try {
        // Fetch stats sorted by points (desc), then goal diff (desc), then won (desc)
        const stats = await TeamStats.find({ eventId })
            .populate("teamId", "teamName clubName")
            .sort({ points: -1, goalDifference: -1, won: -1 });

        // Emit leaderboard update
        if (io) {
            io.emit("leaderboardUpdate", {
                eventId,
                standings: stats
            });
        }

        console.log("Leaderboard updated for event:", eventId);

        return stats;
    } catch (error) {
        console.error("Error updating leaderboard:", error);
        throw error;
    }
};

/**
 * Get match details including status and participants
 */
export const getMatchDetails = async (matchId: string) => {
    try {
        const match = await Match.findById(matchId)
            .populate("participants.teamId")
            .populate("winnerId")
            .populate("eventId")
            .populate("umpireId");

        if (!match) {
            throw new Error("Match not found");
        }

        return match;
    } catch (error) {
        console.error("Error getting match details:", error);
        throw error;
    }
};

/**
 * Check if a match is ready to start (both participants confirmed)
 */
export const isMatchReady = (match: any): boolean => {
    const realParticipants = match.participants.filter(
        (p: any) => p.teamId && !p.placeholder
    );
    return realParticipants.length === 2;
};

/**
 * Generate a match code for a specific match
 */
import MatchCode from "../models/MatchCode";
import crypto from "crypto";

export const generateMatchCodeForMatch = async (matchId: string, umpireId?: string) => {
    try {
        const match = await Match.findById(matchId);
        if (!match) {
            throw new Error("Match not found");
        }

        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const codeHash = crypto.createHash("sha256").update(code).digest("hex");

        // Delete any existing codes for this match
        await MatchCode.deleteMany({ matchId });

        const matchCode = new MatchCode({
            matchId,
            codeHash,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hour expiry
        });

        await matchCode.save();

        // Update match with code (for display/reference if needed, though we usually verify against hash)
        // Also assign umpire if provided
        if (umpireId) {
            match.umpireId = new mongoose.Types.ObjectId(umpireId);
        }
        match.matchCode = code; // Store plain code in match for easy access/display in UI (if allowed) or just for logs
        await match.save();

        console.log(`[MatchCode] Generated code for Match ${match.matchNumber}: ${code}`);

        return {
            code,
            expiresAt: matchCode.expiresAt,
            match
        };
    } catch (error) {
        console.error("Error generating match code:", error);
        throw error;
    }
};
