import { SchedulingEngine } from "../services/schedulingEngine"
import type { IMatch } from "../models/Match"

describe("SchedulingEngine", () => {
  const mockEventStart = new Date("2024-01-01T09:00:00Z");
  const duration = 60; // 60 minutes
  const buffer = 15;   // 15 minutes

  // Helper to create mock matches
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

  test("Case 1: 1 Court, 4 Teams (Knockout) - Sequential Queue", () => {
    // R1: T1vT2, T3vT4 -> R2: W1vW2
    const matches = [
      createMatch("1", 1, "T1", "T2"),
      createMatch("2", 1, "T3", "T4"),
      createMatch("3", 2, "T1", "T3") // Winner of 1 vs Winner of 2 (simulated)
    ];
    const courts = ["Court 1"];

    const scheduled = SchedulingEngine.scheduleMatches(matches, courts, mockEventStart, duration, buffer);

    expect(scheduled).toHaveLength(3);

    // M1: 09:00 - 10:00
    expect(scheduled[0].startTime.toISOString()).toBe(mockEventStart.toISOString());
    expect(scheduled[0].courtId).toBe("Court 1");

    // M2: 10:00 - 11:00 (Immediately after M1)
    const m2Start = new Date(mockEventStart.getTime() + 60 * 60000);
    expect(scheduled[1].startTime.toISOString()).toBe(m2Start.toISOString());

    // M3: 11:00 - 12:00 (Round 2, after M2)
    const m3Start = new Date(m2Start.getTime() + 60 * 60000);
    expect(scheduled[2].startTime.toISOString()).toBe(m3Start.toISOString());
  });

  test("Case 2: 2 Courts, 4 Teams - Parallel Execution", () => {
    // R1: T1vT2, T3vT4 (Can play parallel)
    const matches = [
      createMatch("1", 1, "T1", "T2"),
      createMatch("2", 1, "T3", "T4")
    ];
    const courts = ["Court 1", "Court 2"];

    const scheduled = SchedulingEngine.scheduleMatches(matches, courts, mockEventStart, duration, buffer);

    // Both should start at 09:00
    expect(scheduled[0].startTime.toISOString()).toBe(mockEventStart.toISOString());
    expect(scheduled[1].startTime.toISOString()).toBe(mockEventStart.toISOString());

    // Should use different courts
    expect(scheduled[0].courtId).not.toBe(scheduled[1].courtId);
  });

  test("Case 3: Rest Buffer Enforcement", () => {
    // T1 plays in M1, then immediately in M2
    const matches = [
      createMatch("1", 1, "T1", "T2"),
      createMatch("2", 2, "T1", "T3")
    ];
    const courts = ["Court 1", "Court 2"]; // Plenty of courts

    const scheduled = SchedulingEngine.scheduleMatches(matches, courts, mockEventStart, duration, buffer);

    // M1: 09:00 - 10:00
    // T1 free at 10:00 + 15min buffer = 10:15

    const m1End = new Date(mockEventStart.getTime() + 60 * 60000);
    const t1Ready = new Date(m1End.getTime() + 15 * 60000);

    expect(scheduled[1].startTime.toISOString()).toBe(t1Ready.toISOString());
  });

  test("Case 4: Round Robin (Odd Teams) - Sequential Rounds", () => {
    // 3 Teams RR: 3 Rounds, 1 match per round
    // R1: T1vT2 (T3 Bye)
    // R2: T3vT1 (T2 Bye)
    // R3: T2vT3 (T1 Bye)
    const matches = [
      createMatch("1", 1, "T1", "T2"),
      createMatch("2", 2, "T3", "T1"),
      createMatch("3", 3, "T2", "T3")
    ];
    const courts = ["Court 1"];

    const scheduled = SchedulingEngine.scheduleMatches(matches, courts, mockEventStart, duration, buffer);

    // Should be sequential due to team overlaps and round ordering
    // M1: 09:00 - 10:00 (T1, T2 busy until 10:15)
    // M2: Starts at 10:15 (T1 ready) -> Ends 11:15
    // M3: Starts at 11:30 (T3 ready from M2? No, T3 played M2. T2 ready from M1 (10:15). T3 ready from M2 (11:30))

    // M1 Start
    expect(scheduled[0].startTime.toISOString()).toBe(mockEventStart.toISOString());

    // M2 Start >= M1 End + Buffer (because T1 plays)
    const m1End = new Date(mockEventStart.getTime() + 60 * 60000);
    const m2MinStart = new Date(m1End.getTime() + 15 * 60000);
    expect(scheduled[1].startTime.getTime()).toBeGreaterThanOrEqual(m2MinStart.getTime());

    // M3 Start >= M2 End + Buffer (because T3 plays)
    const m2End = new Date(scheduled[1].startTime.getTime() + 60 * 60000);
    const m3MinStart = new Date(m2End.getTime() + 15 * 60000);
    expect(scheduled[2].startTime.getTime()).toBeGreaterThanOrEqual(m3MinStart.getTime());
  });

  test("Case 5: Multi-court Efficiency", () => {
    // 4 matches in R1, 2 courts
    // Should finish in 2 batches
    const matches = [
      createMatch("1", 1, "T1", "T2"),
      createMatch("2", 1, "T3", "T4"),
      createMatch("3", 1, "T5", "T6"),
      createMatch("4", 1, "T7", "T8")
    ];
    const courts = ["C1", "C2"];

    const scheduled = SchedulingEngine.scheduleMatches(matches, courts, mockEventStart, duration, buffer);

    // Batch 1: M1, M2 at 09:00
    expect(scheduled[0].startTime.getTime()).toBe(mockEventStart.getTime());
    expect(scheduled[1].startTime.getTime()).toBe(mockEventStart.getTime());

    // Batch 2: M3, M4 at 10:00 (no buffer needed for courts, only teams)
    // Since new teams, they are ready. Courts ready at 10:00.
    const batch2Start = new Date(mockEventStart.getTime() + 60 * 60000);
    expect(scheduled[2].startTime.getTime()).toBe(batch2Start.getTime());
    expect(scheduled[3].startTime.getTime()).toBe(batch2Start.getTime());
  });
});
