import mongoose from "mongoose";
import Event from "../models/Event";
import Team from "../models/Team";
import Match from "../models/Match";
import MatchCode from "../models/MatchCode";
import TeamStats from "../models/TeamStats";
import { FixtureEngine } from "../services/fixtureEngine";
import { SchedulingEngine } from "../services/schedulingEngine";
import { completeMatch, updateLeaderboard } from "../services/matchService";
import crypto from "crypto";

// Connect to MongoDB
const MONGODB_URI = "mongodb+srv://hackathon-user:hackathon-password@cluster0.mongodb.net/hackathon-db?retryWrites=true&w=majority";

async function runTest() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");

        // 1. Setup Data
        const eventId = new mongoose.Types.ObjectId();
        console.log("Event ID:", eventId);

        // Create 4 teams
        const teams = [];
        for (let i = 0; i < 4; i++) {
            const team = new Team({
                teamName: `Team ${i + 1}`,
                clubName: "Test Club",
                members: [],
                events: [eventId]
            });
            await team.save();
            teams.push(team);
        }
        console.log("Created 4 teams");

        // 2. Generate Fixtures (Knockout)
        const { matches: generatedMatches } = FixtureEngine.generateKnockout(teams, eventId.toString());
        const savedMatches = await Match.insertMany(generatedMatches);
        console.log(`Generated ${savedMatches.length} matches`);

        // 3. Schedule Matches
        const scheduled = SchedulingEngine.scheduleMatches(
            savedMatches as any,
            ["Court 1"], // courts
            new Date(), // startTime
            30, // matchDuration
            5 // buffer
        );
        await Promise.all(scheduled.map(m => m.save()));
        console.log("Scheduled matches");

        // 4. Pick the first match (Semi-Final 1)
        const match1 = await Match.findOne({ eventId, matchNumber: 1 }).populate("participants.teamId");
        if (!match1) throw new Error("Match 1 not found");
        if (!match1.participants || match1.participants.length < 2) throw new Error("Participants missing");

        const team1Name = (match1.participants[0].teamId as any).teamName;
        const team2Name = (match1.participants[1].teamId as any).teamName;
        console.log(`Match 1: ${team1Name} vs ${team2Name}`);

        // 5. Generate Match Code
        const code = "123456";
        const codeHash = crypto.createHash("sha256").update(code).digest("hex");
        await new MatchCode({
            matchId: match1._id,
            codeHash,
            expiresAt: new Date(Date.now() + 3600000)
        }).save();
        console.log("Generated match code");

        // 6. Submit Score (Team 1 wins)
        const winnerId = match1.participants[0].teamId._id.toString();
        await completeMatch(match1._id.toString(), winnerId, "21-19");
        console.log("Submitted score: Team 1 wins");

        // 7. Verify Match Status
        const updatedMatch1 = await Match.findById(match1._id);
        if (!updatedMatch1) throw new Error("Updated match not found");
        if (updatedMatch1.status !== "completed") throw new Error("Match status not completed");
        if (updatedMatch1?.winnerId?.toString() !== winnerId) throw new Error("Winner ID mismatch");
        console.log("Verified match completion");

        // 8. Verify Winner Advanced
        // Match 1 winner should go to Match 3 (Final)
        const match3 = await Match.findOne({ eventId, matchNumber: 3 });
        // Match 3 participants might be populated or not, check teamId
        const p1 = match3?.participants[0];
        const p2 = match3?.participants[1];

        // In a 4-team KO:
        // M1: T1 vs T2 -> Winner to M3 P1
        // M2: T3 vs T4 -> Winner to M3 P2

        // Check if winnerId is in M3 participants
        const advanced = (p1?.teamId?.toString() === winnerId) || (p2?.teamId?.toString() === winnerId);
        if (!advanced) {
            console.log("M3 Participants:", JSON.stringify(match3?.participants, null, 2));
            throw new Error("Winner did not advance to Match 3");
        }
        console.log("Verified winner advancement");

        // 9. Verify Leaderboard
        const stats = await TeamStats.find({ eventId }).sort({ points: -1 });
        console.log("Leaderboard:", stats.map(s => ({ team: s.teamId, pts: s.points, w: s.won })));

        const winnerStats = stats.find(s => s.teamId.toString() === winnerId);
        if (!winnerStats || winnerStats.points !== 3 || winnerStats.won !== 1) {
            throw new Error("Winner stats incorrect");
        }
        console.log("Verified leaderboard stats");

        console.log("✅ Milestone 3 Verification Passed!");

    } catch (error) {
        console.error("Test Failed:", error);
    } finally {
        // Cleanup
        // await Team.deleteMany({ clubName: "Test Club" });
        // await Match.deleteMany({});
        // await MatchCode.deleteMany({});
        // await TeamStats.deleteMany({});
        await mongoose.disconnect();
    }
}

runTest();
