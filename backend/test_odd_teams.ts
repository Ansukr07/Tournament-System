/**
 * Test script to validate knockout fixture generation with odd team counts
 * Run: npx ts-node test_odd_teams.ts
 */

interface IParticipant {
    _id: string;
    teamName: string;
}

// Simulate the seeding function
function getSeededIndices(n: number): number[] {
    if (n === 2) return [1, 2];
    const previousRound = getSeededIndices(n / 2);
    const currentRound: number[] = [];
    for (const x of previousRound) {
        currentRound.push(x);
        currentRound.push(n + 1 - x);
    }
    return currentRound;
}

// Test with different team counts
function testOddTeams(teamCount: number) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing with ${teamCount} teams`);
    console.log('='.repeat(60));

    // Create mock teams
    const teams: IParticipant[] = [];
    for (let i = 1; i <= teamCount; i++) {
        teams.push({ _id: `team${i}`, teamName: `Team ${i}` });
    }

    // Calculate power of 2
    const n = teams.length;
    const totalSlots = Math.pow(2, Math.ceil(Math.log2(n)));
    console.log(`\n1. Teams: ${n}, Padded to: ${totalSlots} slots`);

    // Get seeded indices
    const seedIndices = getSeededIndices(totalSlots);
    console.log(`\n2. Seeded Indices (1-indexed): [${seedIndices.join(', ')}]`);

    // Map to teams or BYEs
    console.log(`\n3. Round 1 Matchups:`);
    const leaves: any[] = seedIndices.map(seedIndex => {
        if (seedIndex <= n) {
            return { type: "team", team: teams[seedIndex - 1].teamName, seed: seedIndex };
        } else {
            return { type: "bye", seed: seedIndex };
        }
    });

    // Show pairings
    for (let i = 0; i < leaves.length; i += 2) {
        const left = leaves[i];
        const right = leaves[i + 1];

        const leftStr = left.type === "team" ? `Seed ${left.seed}: ${left.team}` : `BYE (slot ${left.seed})`;
        const rightStr = right.type === "team" ? `Seed ${right.seed}: ${right.team}` : `BYE (slot ${right.seed})`;

        let matchType = "MATCH";
        if (left.type === "bye" && right.type === "bye") matchType = "❌ BYE vs BYE (SKIP)";
        else if (left.type === "bye" || right.type === "bye") matchType = "⚡ AUTO-ADVANCE";

        console.log(`  Match ${(i / 2) + 1}: ${leftStr} vs ${rightStr} → ${matchType}`);
    }

    // Count real matches
    let realMatches = 0;
    for (let i = 0; i < leaves.length; i += 2) {
        const left = leaves[i];
        const right = leaves[i + 1];
        if (left.type !== "bye" && right.type !== "bye") {
            realMatches++;
        }
    }

    console.log(`\n4. Real Matches in Round 1: ${realMatches}`);

    // Expected total matches for knockout
    const expectedTotal = totalSlots - 1;
    console.log(`5. Expected Total Matches: ${expectedTotal}`);
}

// Run tests
console.log('FIXTURE GENERATION TEST SUITE');
console.log('Testing BYE calculation and seeding logic\n');

// Test Case 1: 3 teams
testOddTeams(3);

// Test Case 2: 5 teams
testOddTeams(5);

// Test Case 3: 7 teams
testOddTeams(7);

// Test Case 4: Power of 2 (for comparison)
testOddTeams(8);

console.log(`\n${'='.repeat(60)}`);
console.log('ANALYSIS:');
console.log('='.repeat(60));
console.log('Expected Standard Seeding (1 vs lowest, 2 vs 2nd-lowest, etc.):');
console.log('- 8 teams: [1v8, 4v5, 2v7, 3v6]');
console.log('- 5 teams (→8 slots): [1vBYE, 4v5, 2vBYE, 3vBYE]');
console.log('  Should have: Seed 1, 2, 3 get byes. Seeds 4, 5 play each other.');
console.log('\nCheck if actual output matches expected!\n');
