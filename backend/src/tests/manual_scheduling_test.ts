import { SchedulingEngine } from "../services/schedulingEngine";
import { IMatch } from "../models/Match";

// Mock Match Interface
const createMatch = (id: string, round: number, team1: string, team2: string): IMatch => ({
    _id: id,
    round,
    matchNumber: parseInt(id),
    matchCode: `M${id}`,
    participants: [
        { teamId: team1 },
        { teamId: team2 }
    ]
} as any);

const mockEventStart = new Date("2024-01-01T09:00:00Z");
const duration = 60;
const buffer = 15;

console.log("=== RUNNING MANUAL SCHEDULING TESTS ===\n");

function assert(condition: boolean, message: string) {
    if (condition) {
        console.log(`✅ PASS: ${message}`);
    } else {
        console.error(`❌ FAIL: ${message}`);
        process.exit(1);
    }
}

// Test 1
console.log("Test 1: 1 Court, 4 Teams (Sequential)");
const matches1 = [
    createMatch("1", 1, "T1", "T2"),
    createMatch("2", 1, "T3", "T4"),
    createMatch("3", 2, "T1", "T3")
];
const courts1 = ["Court 1"];
const scheduled1 = SchedulingEngine.scheduleMatches(matches1, courts1, mockEventStart, duration, buffer);

assert(scheduled1.length === 3, "Scheduled 3 matches");
assert(scheduled1[0].startTime.toISOString() === mockEventStart.toISOString(), "M1 starts at event start");
assert(scheduled1[1].startTime.getTime() === mockEventStart.getTime() + 60 * 60000, "M2 starts after M1");
// M3 involves T3 who finishes M2 at 11:00. Buffer 15m -> Ready 11:15.
assert(scheduled1[2].startTime.getTime() === mockEventStart.getTime() + 135 * 60000, "M3 starts after M2 + buffer");

// Test 2
console.log("\nTest 2: 2 Courts, 4 Teams (Parallel)");
const matches2 = [
    createMatch("1", 1, "T1", "T2"),
    createMatch("2", 1, "T3", "T4")
];
const courts2 = ["Court 1", "Court 2"];
const scheduled2 = SchedulingEngine.scheduleMatches(matches2, courts2, mockEventStart, duration, buffer);

assert(scheduled2[0].startTime.toISOString() === mockEventStart.toISOString(), "M1 starts at event start");
assert(scheduled2[1].startTime.toISOString() === mockEventStart.toISOString(), "M2 starts at event start");
assert(scheduled2[0].courtId !== scheduled2[1].courtId, "Different courts used");

// Test 3
console.log("\nTest 3: Rest Buffer");
const matches3 = [
    createMatch("1", 1, "T1", "T2"),
    createMatch("2", 2, "T1", "T3")
];
const courts3 = ["Court 1", "Court 2"];
const scheduled3 = SchedulingEngine.scheduleMatches(matches3, courts3, mockEventStart, duration, buffer);

const m1End = mockEventStart.getTime() + 60 * 60000;
const t1Ready = m1End + 15 * 60000;
assert(scheduled3[1].startTime.getTime() === t1Ready, "M2 respects rest buffer");

console.log("\n=== ALL TESTS PASSED ===");
