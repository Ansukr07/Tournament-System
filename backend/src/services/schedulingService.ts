import Match from "../models/Match";
import Event from "../models/Event";
import mongoose from "mongoose";

interface PlayerSchedule {
    playerId: string;
    busySlots: { start: Date; end: Date }[];
}

interface CourtSchedule {
    courtId: string;
    busySlots: { start: Date; end: Date }[];
}

interface TimeSlot {
    start: Date;
    end: Date;
}

/**
 * Smart multi-court scheduling with player overlap prevention
 */
export const scheduleMatches = async (eventId: string) => {
    try {
        const event = await Event.findById(eventId);
        if (!event) throw new Error("Event not found");

        if (!event.courts || event.courts.length === 0) {
            throw new Error("Event must have at least one court defined");
        }

        // Get all unscheduled matches (sorted by round)
        const matches = await Match.find({
            eventId,
            status: { $in: ["scheduled", "pending"] },
            startTime: { $exists: false }
        }).populate("participants.playerId").sort({ round: 1, matchNumber: 1 });

        if (matches.length === 0) {
            throw new Error("No matches to schedule");
        }

        const courts = event.courts;
        const matchDuration = event.matchDuration || 15; // minutes
        const bufferMinutes = event.bufferMinutes || 5; // relaxation time
        const totalSlotDuration = matchDuration + bufferMinutes;

        console.log(`Scheduling ${matches.length} matches across ${courts.length} courts`);

        // Start time: tomorrow at 9 AM for demo purposes
        let currentTime = new Date();
        currentTime.setHours(9, 0, 0, 0);
        currentTime.setDate(currentTime.getDate() + 1);

        // Track player and court schedules
        const playerSchedules: Map<string, PlayerSchedule> = new Map();
        const courtSchedules: Map<string, CourtSchedule> = new Map();

        // Initialize court schedules
        courts.forEach(court => {
            courtSchedules.set(court, { courtId: court, busySlots: [] });
        });

        /**
         * Check if a player is available at given time
         */
        const isPlayerAvailable = (playerId: string, startTime: Date, endTime: Date): boolean => {
            const schedule = playerSchedules.get(playerId);
            if (!schedule) return true;

            // Add buffer time to end for relaxation
            const endWithBuffer = new Date(endTime.getTime() + bufferMinutes * 60000);

            return !schedule.busySlots.some(slot => {
                // Check for overlap
                return (startTime < slot.end && endWithBuffer > slot.start);
            });
        };

        /**
         * Check if a court is available at given time
         */
        const isCourtAvailable = (courtId: string, startTime: Date, endTime: Date): boolean => {
            const schedule = courtSchedules.get(courtId);
            if (!schedule) return true;

            return !schedule.busySlots.some(slot => {
                return (startTime < slot.end && endTime > slot.start);
            });
        };

        /**
         * Find the earliest available time slot for a match
         */
        const findAvailableSlot = (match: any, fromTime: Date): { court: string; startTime: Date } | null => {
            const participants = match.participants.filter((p: any) => p.playerId);

            if (participants.length === 0) {
                // No real players (shouldn't happen, but handle gracefully)
                return null;
            }

            const playerIds = participants.map((p: any) => p.playerId._id.toString());

            // Try each time slot starting from fromTime
            let tryTime = new Date(fromTime);
            const maxAttempts = 100; // Prevent infinite loop
            let attempts = 0;

            while (attempts < maxAttempts) {
                // Try each court at this time
                for (const court of courts) {
                    const endTime = new Date(tryTime.getTime() + matchDuration * 60000);

                    // Check if court is available
                    if (!isCourtAvailable(court, tryTime, endTime)) {
                        continue;
                    }

                    // Check if all players are available
                    const allPlayersAvailable = playerIds.every((playerId: string) =>
                        isPlayerAvailable(playerId, tryTime, endTime)
                    );

                    if (allPlayersAvailable) {
                        return { court, startTime: new Date(tryTime) };
                    }
                }

                // Move to next time slot
                tryTime = new Date(tryTime.getTime() + totalSlotDuration * 60000);
                attempts++;
            }

            return null;
        };

        /**
         * Book a time slot for players and court
         */
        const bookSlot = (court: string, startTime: Date, endTime: Date, playerIds: string[]) => {
            // Book court
            const courtSchedule = courtSchedules.get(court);
            if (courtSchedule) {
                courtSchedule.busySlots.push({ start: startTime, end: endTime });
            }

            // Book players
            playerIds.forEach((playerId: string) => {
                let playerSchedule = playerSchedules.get(playerId);
                if (!playerSchedule) {
                    playerSchedule = { playerId, busySlots: [] };
                    playerSchedules.set(playerId, playerSchedule);
                }
                playerSchedule.busySlots.push({ start: startTime, end: endTime });
            });
        };

        // Schedule each match
        let scheduledCount = 0;
        let searchStartTime = new Date(currentTime);

        for (const match of matches) {
            // Skip matches with BYEs or already completed
            const realParticipants = match.participants.filter((p: any) => p.playerId);

            if (realParticipants.length < 2) {
                console.log(`Skipping match ${match.matchNumber} - not enough real players`);
                continue;
            }

            const playerIds = realParticipants.map((p: any) => p.playerId._id.toString());

            // Find available slot
            const slot = findAvailableSlot(match, searchStartTime);

            if (!slot) {
                console.warn(`Could not find slot for match ${match.matchNumber}`);
                continue;
            }

            const endTime = new Date(slot.startTime.getTime() + matchDuration * 60000);

            // Assign match to slot
            match.courtId = slot.court;
            match.startTime = slot.startTime;
            match.endTime = endTime;
            match.status = "scheduled";

            await match.save();

            // Book the slot
            bookSlot(slot.court, slot.startTime, endTime, playerIds);

            scheduledCount++;
            console.log(`Scheduled Match ${match.matchNumber}: ${slot.court} at ${slot.startTime.toISOString()}`);
        }

        console.log(`Successfully scheduled ${scheduledCount}/${matches.length} matches`);

        // Return updated matches with populated player data
        const scheduledMatches = await Match.find({
            eventId,
            startTime: { $exists: true }
        })
            .populate("participants.playerId")
            .populate("winnerId")
            .sort({ startTime: 1 });

        return scheduledMatches;
    } catch (error) {
        console.error("Error scheduling matches:", error);
        throw error;
    }
};

/**
 * Reschedule a specific match (e.g., after delay)
 */
export const rescheduleMatch = async (matchId: string, newStartTime: Date) => {
    try {
        const match = await Match.findById(matchId).populate("participants.playerId");
        if (!match) throw new Error("Match not found");

        const event = await Event.findById(match.eventId);
        if (!event) throw new Error("Event not found");

        const matchDuration = event.matchDuration || 15;
        const newEndTime = new Date(newStartTime.getTime() + matchDuration * 60000);

        match.startTime = newStartTime;
        match.endTime = newEndTime;

        await match.save();

        console.log(`Rescheduled match ${matchId} to ${newStartTime.toISOString()}`);

        return match;
    } catch (error) {
        console.error("Error rescheduling match:", error);
        throw error;
    }
};
