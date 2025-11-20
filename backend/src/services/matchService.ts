import Match from "../models/Match";
import { advanceWinner } from "./fixtureService";
import { io } from "../server";

/**
 * Complete a match and advance winner to next round
 */
export const completeMatch = async (matchId: string, winnerId: string, score?: string) => {
    try {
        const match = await Match.findById(matchId)
            .populate("participants.playerId")
            .populate("eventId");

        if (!match) {
            throw new Error("Match not found");
        }

        // Validate winner is actually a participant
        const isValidWinner = match.participants.some(
            (p: any) => p.playerId && p.playerId._id.toString() === winnerId
        );

        if (!isValidWinner) {
            throw new Error("Winner must be one of the match participants");
        }

        // Update match
        match.winnerId = winnerId as any;
        match.status = "completed";
        await match.save();

        console.log(`Match ${match.matchNumber} completed. Winner: ${winnerId}`);

        // Advance winner to next round
        await advanceWinner(matchId, winnerId);

        // Emit real-time update
        if (io) {
            io.emit("matchCompleted", {
                matchId,
                winnerId,
                round: match.round,
                eventId: match.eventId
            });
        }

        // Update leaderboard
        await updateLeaderboard(match.eventId.toString());

        return match;
    } catch (error) {
        console.error("Error completing match:", error);
        throw error;
    }
};

/**
 * Update leaderboard after match completion
 */
export const updateLeaderboard = async (eventId: string) => {
    try {
        const matches = await Match.find({
            eventId,
            status: "completed"
        }).populate("winnerId");

        // Count wins per player
        const winCounts: { [playerId: string]: number } = {};

        matches.forEach(match => {
            if (match.winnerId) {
                const winnerId = match.winnerId.toString();
                winCounts[winnerId] = (winCounts[winnerId] || 0) + 1;
            }
        });

        // Emit leaderboard update
        if (io) {
            io.emit("leaderboardUpdate", {
                eventId,
                standings: winCounts
            });
        }

        console.log("Leaderboard updated for event:", eventId);

        return winCounts;
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
            .populate("participants.playerId")
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
        (p: any) => p.playerId && !p.placeholder
    );
    return realParticipants.length === 2;
};
