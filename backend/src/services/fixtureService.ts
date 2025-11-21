import Match from "../models/Match";
import Team from "../models/Team";
import Event from "../models/Event";
import mongoose from "mongoose";

interface TeamWithClub {
    _id: mongoose.Types.ObjectId;
    teamName: string;
    clubName: string;
    clubId: mongoose.Types.ObjectId;
}

/**
 * Calculate the number of rounds needed for knockout tournament
 */
function calculateRounds(teamCount: number): number {
    return Math.ceil(Math.log2(teamCount));
}

/**
 * Calculate the next power of 2 (for bracket size)
 */
function nextPowerOfTwo(n: number): number {
    return Math.pow(2, Math.ceil(Math.log2(n)));
}

/**
 * Shuffle teams while trying to avoid same-club matchups in early rounds
 */
function sortTeamsForClubAvoidance(teams: TeamWithClub[]): TeamWithClub[] {
    // Group teams by club
    const clubGroups: { [key: string]: TeamWithClub[] } = {};
    const noClubTeams: TeamWithClub[] = [];

    teams.forEach(team => {
        if (team.clubName) {
            const clubKey = team.clubName;
            if (!clubGroups[clubKey]) {
                clubGroups[clubKey] = [];
            }
            clubGroups[clubKey].push(team);
        } else {
            noClubTeams.push(team);
        }
    });

    // Interleave teams from different clubs
    const result: TeamWithClub[] = [];
    const clubNames = Object.keys(clubGroups);
    let clubIndex = 0;

    while (Object.values(clubGroups).some(group => group.length > 0)) {
        const clubName = clubNames[clubIndex % clubNames.length];
        if (clubGroups[clubName] && clubGroups[clubName].length > 0) {
            result.push(clubGroups[clubName].shift()!);
        }
        clubIndex++;
    }

    // Add teams without clubs at the end
    return [...result, ...noClubTeams];
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

        // Sort teams to avoid same-club matchups
        const sortedTeams = sortTeamsForClubAvoidance(teams);

        const totalRounds = calculateRounds(sortedTeams.length);
        const bracketSize = nextPowerOfTwo(sortedTeams.length);
        const byeCount = bracketSize - sortedTeams.length;

        console.log(`Total rounds: ${totalRounds}, Bracket size: ${bracketSize}, BYEs: ${byeCount}`);

        const allMatches: any[] = [];
        let matchCounter = 1;

        // Round 1: Create matches with real teams and BYEs
        const round1Teams = [...sortedTeams];
        const round1Matches: any[] = [];

        for (let i = 0; i < bracketSize / 2; i++) {
            const team1 = round1Teams[i * 2];
            const team2 = round1Teams[i * 2 + 1];

            const match = {
                eventId,
                round: 1,
                matchNumber: matchCounter++,
                participants: [
                    team1 ? { teamId: team1._id } : { placeholder: "BYE" },
                    team2 ? { teamId: team2._id } : { placeholder: "BYE" }
                ],
                status: (!team1 || !team2) ? "completed" : "pending",
                winnerId: !team2 && team1 ? team1._id : (!team1 && team2 ? team2._id : undefined)
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

        // Link matches to next round
        for (let i = 0; i < savedMatches.length; i++) {
            const match = savedMatches[i];
            const nextRound = match.round + 1;

            if (nextRound <= totalRounds) {
                const nextMatchNumber = Math.ceil(match.matchNumber / 2);
                const nextMatch = savedMatches.find(
                    m => m.round === nextRound && m.matchNumber === nextMatchNumber
                );

                if (nextMatch) {
                    match.nextMatchId = nextMatch._id;
                    await match.save();
                }
            }
        }

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

        const teams = await Team.find({ events: eventId }) as TeamWithClub[];

        if (teams.length < 2) {
            throw new Error("Need at least 2 teams to generate fixtures");
        }

        console.log(`Generating round-robin fixtures for ${teams.length} teams`);

        const matches: any[] = [];
        let matchCounter = 1;
        let round = 1;

        // Round robin: every team plays every other team
        for (let i = 0; i < teams.length; i++) {
            for (let j = i + 1; j < teams.length; j++) {
                const team1 = teams[i];
                const team2 = teams[j];

                // Check if same club (for prioritization, not blocking)
                const sameClub = team1.clubName && team2.clubName &&
                    team1.clubName === team2.clubName;

                const match = {
                    eventId,
                    round: sameClub ? round + 1 : round, // Push same-club matches to later rounds
                    matchNumber: matchCounter++,
                    participants: [
                        { teamId: team1._id },
                        { teamId: team2._id }
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

        // If nextMatchId is set, use it directly
        if (match.nextMatchId) {
            const nextMatch = await Match.findById(match.nextMatchId);
            if (nextMatch) {
                // Determine position based on match number
                const position = (match.matchNumber! - 1) % 2;

                if (position === 0) {
                    nextMatch.participants[0] = { teamId: new mongoose.Types.ObjectId(winnerId) };
                } else {
                    nextMatch.participants[1] = { teamId: new mongoose.Types.ObjectId(winnerId) };
                }

                // Check if both participants are now filled
                const bothFilled = nextMatch.participants[0].teamId && nextMatch.participants[1].teamId;
                if (bothFilled && nextMatch.status === "pending") {
                    nextMatch.status = "scheduled";
                }

                await nextMatch.save();
                console.log(`Advanced winner to Match ${nextMatch.matchNumber} in Round ${nextMatch.round}`);
            }
        } else {
            // Fallback: find next match by round and match number
            const currentRound = match.round;
            const matchNumber = match.matchNumber || 0;

            const nextRoundMatches = await Match.find({
                eventId: match.eventId,
                round: currentRound + 1
            }).sort({ matchNumber: 1 });

            if (nextRoundMatches.length === 0) {
                console.log("No next round - tournament complete!");
                return;
            }

            const nextMatchIndex = Math.floor((matchNumber - 1) / 2);
            const position = (matchNumber - 1) % 2;

            if (nextMatchIndex < nextRoundMatches.length) {
                const nextMatch = nextRoundMatches[nextMatchIndex];

                if (position === 0) {
                    nextMatch.participants[0] = { teamId: new mongoose.Types.ObjectId(winnerId) };
                } else {
                    nextMatch.participants[1] = { teamId: new mongoose.Types.ObjectId(winnerId) };
                }

                const bothFilled = nextMatch.participants[0].teamId && nextMatch.participants[1].teamId;
                if (bothFilled && nextMatch.status === "pending") {
                    nextMatch.status = "scheduled";
                }

                await nextMatch.save();
                console.log(`Advanced winner to Match ${nextMatch.matchNumber} in Round ${nextMatch.round}`);
            }
        }
    } catch (error) {
        console.error("Error advancing winner:", error);
        throw error;
    }
};
