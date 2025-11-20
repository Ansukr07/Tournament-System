import Match from "../models/Match";
import Player from "../models/Player";
import Event from "../models/Event";
import mongoose from "mongoose";

/**
 * Calculate the number of rounds needed for knockout tournament
 */
function calculateRounds(playerCount: number): number {
    return Math.ceil(Math.log2(playerCount));
}

/**
 * Calculate the next power of 2 (for bracket size)
 */
function nextPowerOfTwo(n: number): number {
    return Math.pow(2, Math.ceil(Math.log2(n)));
}

/**
 * Shuffle array while trying to avoid same-club matchups in early rounds
 */
function sortPlayersForClubAvoidance(players: any[]): any[] {
    // Group players by club
    const clubGroups: { [key: string]: any[] } = {};
    const noClubPlayers: any[] = [];

    players.forEach(player => {
        if (player.clubId) {
            const clubId = player.clubId.toString();
            if (!clubGroups[clubId]) {
                clubGroups[clubId] = [];
            }
            clubGroups[clubId].push(player);
        } else {
            noClubPlayers.push(player);
        }
    });

    // Interleave players from different clubs
    const result: any[] = [];
    const clubIds = Object.keys(clubGroups);
    let clubIndex = 0;

    while (Object.values(clubGroups).some(group => group.length > 0)) {
        const clubId = clubIds[clubIndex % clubIds.length];
        if (clubGroups[clubId] && clubGroups[clubId].length > 0) {
            result.push(clubGroups[clubId].shift()!);
        }
        clubIndex++;
    }

    // Add players without clubs at the end
    return [...result, ...noClubPlayers];
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

        // Get all players registered for this event
        const players = await Player.find({ events: eventId }).populate("clubId");

        if (players.length < 2) {
            throw new Error("Need at least 2 players to generate fixtures");
        }

        console.log(`Generating knockout fixtures for ${players.length} players`);

        // Sort players to avoid same-club matchups
        const sortedPlayers = sortPlayersForClubAvoidance(players);

        const totalRounds = calculateRounds(sortedPlayers.length);
        const bracketSize = nextPowerOfTwo(sortedPlayers.length);
        const byeCount = bracketSize - sortedPlayers.length;

        console.log(`Total rounds: ${totalRounds}, Bracket size: ${bracketSize}, BYEs: ${byeCount}`);

        const allMatches: any[] = [];
        let matchCounter = 1;

        // Round 1: Create matches with real players and BYEs
        const round1Players = [...sortedPlayers];
        const round1Matches: any[] = [];

        for (let i = 0; i < bracketSize / 2; i++) {
            const player1 = round1Players[i * 2];
            const player2 = round1Players[i * 2 + 1];

            const match = {
                eventId,
                round: 1,
                matchNumber: matchCounter++,
                participants: [
                    player1 ? { playerId: player1._id } : { placeholder: "BYE" },
                    player2 ? { playerId: player2._id } : { placeholder: "BYE" }
                ],
                status: (!player1 || !player2) ? "completed" : "pending",
                winnerId: !player2 && player1 ? player1._id : (!player1 && player2 ? player2._id : undefined)
            };

            round1Matches.push(match);
            allMatches.push(match);
        }

        // Generate subsequent rounds with TBD placeholders
        let previousRoundMatches = round1Matches.length;

        for (let round = 2; round <= totalRounds; round++) {
            const matchesInRound = previousRoundMatches / 2;

            for (let i = 0; i < matchesInRound; i++) {
                const match = {
                    eventId,
                    round,
                    matchNumber: matchCounter++,
                    participants: [
                        { placeholder: `Winner of Match ${round1Matches.length - previousRoundMatches + i * 2 + 1}` },
                        { placeholder: `Winner of Match ${round1Matches.length - previousRoundMatches + i * 2 + 2}` }
                    ],
                    status: "pending"
                };

                allMatches.push(match);
            }

            previousRoundMatches = matchesInRound;
        }

        // Save all matches
        const savedMatches = await Match.insertMany(allMatches);

        console.log(`Created ${savedMatches.length} matches across ${totalRounds} rounds`);

        // Auto-advance BYE winners
        for (const match of savedMatches) {
            if (match.winnerId) {
                await advanceWinner(match._id.toString(), match.winnerId.toString());
            }
        }

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

        const players = await Player.find({ events: eventId }).populate("clubId");

        if (players.length < 2) {
            throw new Error("Need at least 2 players to generate fixtures");
        }

        console.log(`Generating round-robin fixtures for ${players.length} players`);

        const matches: any[] = [];
        let matchCounter = 1;
        let round = 1;

        // Round robin: every player plays every other player
        for (let i = 0; i < players.length; i++) {
            for (let j = i + 1; j < players.length; j++) {
                const player1 = players[i];
                const player2 = players[j];

                // Check if same club (for prioritization, not blocking)
                const sameClub = player1.clubId && player2.clubId &&
                    player1.clubId.toString() === player2.clubId.toString();

                const match = {
                    eventId,
                    round: sameClub ? round + 1 : round, // Push same-club matches to later rounds
                    matchNumber: matchCounter++,
                    participants: [
                        { playerId: player1._id },
                        { playerId: player2._id }
                    ],
                    status: "pending"
                };

                matches.push(match);
            }
        }

        // Sort by round
        matches.sort((a, b) => a.round - b.round);

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
        const match = await Match.findById(matchId);
        if (!match) throw new Error("Match not found");

        const currentRound = match.round;
        const matchNumber = match.matchNumber || 0;

        // Find the next round match where this winner should go
        const nextRoundMatches = await Match.find({
            eventId: match.eventId,
            round: currentRound + 1
        }).sort({ matchNumber: 1 });

        if (nextRoundMatches.length === 0) {
            console.log("No next round - tournament complete!");
            return;
        }

        // Determine which next match and which position
        const nextMatchIndex = Math.floor((matchNumber - 1) / 2);
        const position = (matchNumber - 1) % 2;

        if (nextMatchIndex < nextRoundMatches.length) {
            const nextMatch = nextRoundMatches[nextMatchIndex];

            // Update the participant
            if (position === 0) {
                nextMatch.participants[0] = { playerId: new mongoose.Types.ObjectId(winnerId) };
            } else {
                nextMatch.participants[1] = { playerId: new mongoose.Types.ObjectId(winnerId) };
            }

            // Check if both participants are now filled
            const bothFilled = nextMatch.participants[0].playerId && nextMatch.participants[1].playerId;
            if (bothFilled && nextMatch.status === "pending") {
                nextMatch.status = "scheduled";
            }

            await nextMatch.save();
            console.log(`Advanced winner to Match ${nextMatch.matchNumber} in Round ${nextMatch.round}`);
        }
    } catch (error) {
        console.error("Error advancing winner:", error);
        throw error;
    }
};
