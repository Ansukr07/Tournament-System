/**
 * Manual test script to validate the new knockout fixture generation algorithm
 * Run: npx ts-node test_new_algorithm.ts
 */

import { FixtureEngine } from "./src/services/fixtureEngine";

interface TestCase {
    teams: number;
    expectedMatches: number;
    expectedR1Matches?: number;
}

const testCases: TestCase[] = [
    { teams: 3, expectedMatches: 2, expectedR1Matches: 1 },
    { teams: 5, expectedMatches: 4, expectedR1Matches: 1 },
    { teams: 7, expectedMatches: 6, expectedR1Matches: 3 },
    { teams: 8, expectedMatches: 7, expectedR1Matches: 4 },
    { teams: 9, expectedMatches: 8, expectedR1Matches: 1 },
    { teams: 13, expectedMatches: 12, expectedR1Matches: 3 },
    { teams: 27, expectedMatches: 26, expectedR1Matches: 5 },
];

console.log("🧪 KNOCKOUT FIXTURE GENERATION TEST SUITE\n");
console.log("=".repeat(70));

let passed = 0;
let failed = 0;

testCases.forEach(({ teams, expectedMatches, expectedR1Matches }) => {
    console.log(`\n📋 Testing ${teams} teams...`);
    console.log("-".repeat(70));

    try {
        // Create mock teams
        const mockTeams = Array.from({ length: teams }, (_, i) => ({
            _id: `team${i + 1}`,
            teamName: `Team ${i + 1}`,
        }));

        // Generate fixtures
        const { matches } = FixtureEngine.generateKnockout(mockTeams as any, "test-event");

        // Test 1: Total match count
        const test1 = matches.length === expectedMatches;
        console.log(`  ✓ Total matches: ${matches.length} (expected ${expectedMatches}) ${test1 ? "✅" : "❌"}`);
        if (!test1) failed++; else passed++;

        // Test 2: Sequential match numbers
        const matchNumbers = matches.map(m => m.matchNumber).sort((a, b) => (a || 0) - (b || 0));
        const expectedNumbers = Array.from({ length: expectedMatches }, (_, i) => i + 1);
        const test2 = JSON.stringify(matchNumbers) === JSON.stringify(expectedNumbers);
        console.log(`  ✓ Sequential numbering: ${matchNumbers.join(", ")} ${test2 ? "✅" : "❌"}`);
        if (!test2) failed++; else passed++;

        // Test 3: No BYE vs BYE
        const byeVsByeMatches = matches.filter(m =>
            m.participants?.length === 2 &&
            m.participants[0].placeholder === "BYE" &&
            m.participants[1].placeholder === "BYE"
        );
        const test3 = byeVsByeMatches.length === 0;
        console.log(`  ✓ No BYE vs BYE: ${test3 ? "✅" : `❌ Found ${byeVsByeMatches.length}`}`);
        if (!test3) failed++; else passed++;

        // Test 4: Round 1 match count
        if (expectedR1Matches !== undefined) {
            const r1Matches = matches.filter(m => m.round === 1);
            const test4 = r1Matches.length === expectedR1Matches;
            console.log(`  ✓ Round 1 matches: ${r1Matches.length} (expected ${expectedR1Matches}) ${test4 ? "✅" : "❌"}`);
            if (!test4) failed++; else passed++;
        }

        // Test 5: All matches have 2 participants
        const test5 = matches.every(m => m.participants?.length === 2);
        console.log(`  ✓ All matches have 2 participants: ${test5 ? "✅" : "❌"}`);
        if (!test5) failed++; else passed++;

        // Test 6: Match codes are sequential
        const matchCodes = matches.map(m => m.matchCode).sort();
        const expectedCodes = Array.from({ length: expectedMatches }, (_, i) => `M${i + 1}`).sort();
        const test6 = JSON.stringify(matchCodes) === JSON.stringify(expectedCodes);
        console.log(`  ✓ Sequential match codes: ${test6 ? "✅" : "❌"}`);
        if (!test6) failed++; else passed++;

        // Test 7: Placeholder format
        const placeholderMatches = matches.filter(m =>
            m.participants?.some(p => p.placeholder && p.placeholder !== "BYE")
        );
        const test7 = placeholderMatches.every(m =>
            m.participants?.every(p =>
                !p.placeholder ||
                p.placeholder === "BYE" ||
                /^Winner of Match \d+$/.test(p.placeholder)
            )
        );
        console.log(`  ✓ Placeholder format correct: ${test7 ? "✅" : "❌"}`);
        if (!test7) failed++; else passed++;

    } catch (error: any) {
        console.log(`  ❌ ERROR: ${error.message}`);
        failed += 10; // Count as multiple failures
    }
});

console.log("\n" + "=".repeat(70));
console.log(`\n📊 RESULTS: ${passed} passed, ${failed} failed`);

if (failed === 0) {
    console.log("\n✅ ALL TESTS PASSED! The new algorithm is working correctly.\n");
    process.exit(0);
} else {
    console.log(`\n❌ ${failed} test(s) failed. Please review the algorithm.\n`);
    process.exit(1);
}
