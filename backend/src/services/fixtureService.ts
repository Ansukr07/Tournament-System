import Match from "../models/Match";
import Team from "../models/Team";
import Event from "../models/Event";
import mongoose from "mongoose";
import { FixtureEngine } from "./fixtureEngine";

interface TeamWithClub {
    _id: mongoose.Types.ObjectId;
    teamName: string;
    clubName: string;
    clubId: mongoose.Types.ObjectId;
}

/**
 * Generate complete knockout bracket with all rounds
 */
export const generateKnockoutFixtures = async (eventId: string) => {
    try {
        const event = await Event.findById(eventId);
        if (!event) throw new Error("Event not found");

        // Clear existing matches for this event
        await Match.deleteMany({ eventId });

        // Get all teams registered for this event
        const teams = await Team.find({ events: eventId }) as TeamWithClub[];

        if (teams.length < 2) {
            throw new Error("Need at least 2 teams to generate fixtures");
        }

        console.log(`Generating knockout fixtures for ${teams.length} teams`);

        // Use the FixtureEngine to generate the bracket and matches
        const { matches } = FixtureEngine.generateKnockout(teams, eventId);

        // Save all matches
        const savedMatches = await Match.insertMany(matches);

        // Link matches to next round using _nextMatchNumber
        const matchMap = new Map<number, any>();
        savedMatches.forEach(m => {
            if (m.matchNumber) matchMap.set(m.matchNumber, m);
        });

        const updates = [];
        // Iterate over the *original* matches array to access _nextMatchNumber
        for (let i = 0; i < matches.length; i++) {
            const originalMatch = matches[i];
            const savedMatch = savedMatches[i];

            if (originalMatch._nextMatchNumber) {
                const nextMatch = matchMap.get(originalMatch._nextMatchNumber);
                if (nextMatch) {
                    updates.push(Match.updateOne(
                        { _id: savedMatch._id },
                        { $set: { nextMatchId: nextMatch._id } }
                    ));
                    // Also set it in memory for auto-advancement logic below
                    savedMatch.nextMatchId = nextMatch._id;
                }
            }
        }
        await Promise.all(updates);

        // Auto-advance teams with BYE matches
        console.log("Checking for BYE matches to auto-advance...");
        for (const match of savedMatches) {
            console.log(`Match ${match.matchNumber}: status=${match.status}, hasNextMatch=${!!match.nextMatchId}`);
            if (match.status === "auto_advance" && match.nextMatchId && match.participants) {
                // Find the team (not BYE participant)
                const nonByeParticipant = match.participants.find(p => p.teamId);
                if (nonByeParticipant?.teamId) {
                    console.log(`Auto-advancing team ${nonByeParticipant.teamId} from BYE Match ${match.matchNumber} to next round`);
                    await advanceWinner(match._id.toString(), nonByeParticipant.teamId.toString());
                } else {
                    console.log(`No team found in BYE match ${match.matchNumber}`);
                }
            }
        }

        console.log(`Created ${savedMatches.length} matches.`);

        return savedMatches;
    } catch (error) {
        console.error("Error generating knockout fixtures:", error);
        throw error;
    }
};

/**
 * Generate round-robin fixtures (optional)
 */
export const generateRoundRobinFixtures = async (eventId: string) => {
    try {
        const event = await Event.findById(eventId);
        if (!event) throw new Error("Event not found");

        await Match.deleteMany({ eventId });

        const teams = await Team.find({ events: eventId }) as TeamWithClub[];

        if (teams.length < 2) {
            throw new Error("Need at least 2 teams to generate fixtures");
        }

        console.log(`Generating round-robin fixtures for ${teams.length} teams`);

        const matches = FixtureEngine.generateRoundRobin(teams, eventId);
        const savedMatches = await Match.insertMany(matches);

        console.log(`Created ${savedMatches.length} round-robin matches`);

        return savedMatches;
    } catch (error) {
        console.error("Error generating round-robin fixtures:", error);
        throw error;
    }
};

/**
 * Advance winner to next round
 */
export const advanceWinner = async (matchId: string, winnerId: string) => {
    try {
        const match = await Match.findById(matchId).populate('eventId');
        if (!match) throw new Error("Match not found");

        // If nextMatchId is set, use it directly
        if (match.nextMatchId) {
            const nextMatch = await Match.findById(match.nextMatchId);
            if (nextMatch) {
                const winnerPlaceholder = `Winner of Match ${match.matchNumber}`;

                let position = -1;
                if (nextMatch.participants[0].placeholder === winnerPlaceholder) position = 0;
                else if (nextMatch.participants[1].placeholder === winnerPlaceholder) position = 1;

                // Fallback
                if (position === -1) {
                    position = (match.matchNumber! % 2 === 1) ? 0 : 1;
                }

                if (position === 0) {
                    nextMatch.participants[0] = { teamId: new mongoose.Types.ObjectId(winnerId) };
                } else {
                    nextMatch.participants[1] = { teamId: new mongoose.Types.ObjectId(winnerId) };
                }

                // Check if both participants are now filled
                const bothFilled = nextMatch.participants[0].teamId && nextMatch.participants[1].teamId;
                if (bothFilled && nextMatch.status === "pending") {
                    nextMatch.status = "scheduled";

                    // Auto-schedule the next match if it's not already scheduled
                    if (!nextMatch.startTime && match.eventId) {
                        const event: any = match.eventId;
                        const matchDuration = event.matchDuration || 30;
                        const bufferMinutes = event.bufferMinutes || 10;

                        // Schedule the next match to start after this match ends + buffer
                        if (match.endTime) {
                            nextMatch.startTime = new Date(match.endTime.getTime() + bufferMinutes * 60000);
                            nextMatch.endTime = new Date(nextMatch.startTime.getTime() + matchDuration * 60000);
                            nextMatch.courtId = match.courtId; // Use same court as current match

                            console.log(`Auto-scheduled Match ${nextMatch.matchNumber} on ${match.courtId} at ${nextMatch.startTime.toLocaleTimeString()}`);
                        }
                    }
                }

                await nextMatch.save();
                console.log(`Advanced winner to Match ${nextMatch.matchNumber} in Round ${nextMatch.round}`);
            }
        } else {
            console.log("No next match linked - tournament complete or error.");
        }
    } catch (error) {
        console.error("Error advancing winner:", error);
        throw error;
    }
};
