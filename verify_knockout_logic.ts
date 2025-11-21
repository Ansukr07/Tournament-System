import { FixtureEngine } from "./backend/src/services/fixtureEngine";
import mongoose from "mongoose";

// Mock participants
const teams = [
    { _id: new mongoose.Types.ObjectId(), name: "Seed 1" },
    { _id: new mongoose.Types.ObjectId(), name: "Seed 2" },
    { _id: new mongoose.Types.ObjectId(), name: "Seed 3" },
    { _id: new mongoose.Types.ObjectId(), name: "Seed 4" },
    { _id: new mongoose.Types.ObjectId(), name: "Seed 5" },
];

console.log("Generating fixtures for 5 teams...");
const { matches } = FixtureEngine.generateKnockout(teams, "event123");

console.log(`Total Matches Generated: ${matches.length}`);

// Group by round
const round1 = matches.filter(m => m.round === 1);
const round2 = matches.filter(m => m.round === 2);
const round3 = matches.filter(m => m.round === 3);

console.log(`Round 1 Matches: ${round1.length}`);
console.log(`Round 2 Matches: ${round2.length}`);
console.log(`Round 3 Matches: ${round3.length}`);

// Check Round 1 (Should be Seed 4 vs Seed 5)
// 5 teams -> 8 slots.
// Seeds: 1, 8(bye), 4, 5, 2, 7(bye), 3, 6(bye)
// Pairs: (1,bye), (4,5), (2,bye), (3,bye)
// Matches: Only (4,5) should be generated.
if (round1.length === 1) {
    const m = round1[0];
    console.log(`R1 Match: ${m.participants![0].teamId ? "Team" : "Place"} vs ${m.participants![1].teamId ? "Team" : "Place"}`);
    // Verify it is Seed 4 vs Seed 5 (indices 3 and 4 in original array)
    const t1 = m.participants![0].teamId;
    const t2 = m.participants![1].teamId;
    if (t1?.toString() === teams[3]._id.toString() && t2?.toString() === teams[4]._id.toString()) {
        console.log("✅ Round 1 is correctly Seed 4 vs Seed 5");
    } else {
        console.log("❌ Round 1 pairing incorrect");
    }
} else {
    console.log("❌ Round 1 match count incorrect");
}

// Check Round 2 (Should be Seed 1 vs Winner R1, Seed 2 vs Seed 3)
if (round2.length === 2) {
    console.log("✅ Round 2 match count correct");
    // Check Seed 1 vs Winner
    const m1 = round2.find(m =>
        (m.participants![0].teamId?.toString() === teams[0]._id.toString() && m.participants![1].placeholder?.includes("Winner")) ||
        (m.participants![1].teamId?.toString() === teams[0]._id.toString() && m.participants![0].placeholder?.includes("Winner"))
    );
    if (m1) console.log("✅ Found Seed 1 vs Winner match");
    else console.log("❌ Missing Seed 1 vs Winner match");

    // Check Seed 2 vs Seed 3
    const m2 = round2.find(m =>
        (m.participants![0].teamId?.toString() === teams[1]._id.toString() && m.participants![1].teamId?.toString() === teams[2]._id.toString()) ||
        (m.participants![1].teamId?.toString() === teams[1]._id.toString() && m.participants![0].teamId?.toString() === teams[2]._id.toString())
    );
    if (m2) console.log("✅ Found Seed 2 vs Seed 3 match");
    else console.log("❌ Missing Seed 2 vs Seed 3 match");

} else {
    console.log("❌ Round 2 match count incorrect");
}

// Check Round 3 (Final)
if (round3.length === 1) {
    console.log("✅ Round 3 match count correct");
} else {
    console.log("❌ Round 3 match count incorrect");
}
