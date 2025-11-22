/**
 * Simple 5-team test with detailed console output
 */

import { FixtureEngine } from "./src/services/fixtureEngine";

console.log("Testing 5 teams knockout generation...\n");

const mockTeams = [
    { _id: "team1", teamName: "Team 1" },
    { _id: "team2", teamName: "Team 2" },
    { _id: "team3", teamName: "Team 3" },
    { _id: "team4", teamName: "Team 4" },
    { _id: "team5", teamName: "Team 5" },
];

try {
    const { matches } = FixtureEngine.generateKnockout(mockTeams as any, "test-event");

    console.log("\n📋 GENERATED MATCHES:");
    console.log("=".repeat(70));

    matches.forEach(m => {
        const p1 = m.participants?.[0];
        const p2 = m.participants?.[1];
        const p1Name = p1?.teamId ? `Team(${p1.teamId})` : (p1?.placeholder || "Unknown");
        const p2Name = p2?.teamId ? `Team(${p2.teamId})` : (p2?.placeholder || "Unknown");

        console.log(`Match ${m.matchNumber} (${m.matchCode}) - Round ${m.round}:`);
        console.log(`  ${p1Name} vs ${p2Name}`);
    });

    console.log("\n📊 SUMMARY:");
    console.log(`Total matches: ${matches.length}`);
    console.log(`Match numbers: ${matches.map(m => m.matchNumber).join(", ")}`);
    console.log(`Match codes: ${matches.map(m => m.matchCode).join(", ")}`);

    const byRound = matches.reduce((acc, m) => {
        acc[m.round!] = (acc[m.round!] || 0) + 1;
        return acc;
    }, {} as Record<number, number>);

    console.log("\nMatches by round:");
    Object.entries(byRound).forEach(([round, count]) => {
        console.log(`  Round ${round}: ${count} matches`);
    });

    console.log("\n✅ Test completed successfully!");
} catch (error: any) {
    console.error("\n❌ ERROR:", error.message);
    console.error(error.stack);
}
