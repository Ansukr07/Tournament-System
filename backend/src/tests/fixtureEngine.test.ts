import { FixtureEngine } from "../services/fixtureEngine";
import type { IParticipant } from "../services/fixtureEngine";

describe("FixtureEngine - New Knockout Algorithm", () => {
  // Helper to create mock teams
  const createMockTeams = (count: number): IParticipant[] => {
    return Array.from({ length: count }, (_, i) => ({
      _id: `team${i + 1}`,
      teamName: `Team ${i + 1}`
    } as any));
  };

  describe("Knockout Fixture Generation", () => {

    test("3 teams should generate 2 matches total", () => {
      const teams = createMockTeams(3);
      const { matches } = FixtureEngine.generateKnockout(teams, "event1");

      // Total matches = n - 1 = 3 - 1 = 2
      expect(matches.length).toBe(2);

      // Match numbers should be sequential: 1, 2
      const matchNumbers = matches.map(m => m.matchNumber).sort((a, b) => (a || 0) - (b || 0));
      expect(matchNumbers).toEqual([1, 2]);

      // Round 1 should have 1 match (Team 2 vs Team 3)
      const round1Matches = matches.filter(m => m.round === 1);
      expect(round1Matches.length).toBe(1);

      // Round 2 should have 1 match (Finals)
      const round2Matches = matches.filter(m => m.round === 2);
      expect(round2Matches.length).toBe(1);
    });

    test("5 teams should generate 4 matches total with correct seeding", () => {
      const teams = createMockTeams(5);
      const { matches } = FixtureEngine.generateKnockout(teams, "event1");

      // Total matches = n - 1 = 5 - 1 = 4
      expect(matches.length).toBe(4);

      // Match numbers should be sequential: 1, 2, 3, 4
      const matchNumbers = matches.map(m => m.matchNumber).sort((a, b) => (a || 0) - (b || 0));
      expect(matchNumbers).toEqual([1, 2, 3, 4]);

      // Round 1 should have 1 real match (Seeds 4 vs 5)
      const round1Matches = matches.filter(m => m.round === 1);
      expect(round1Matches.length).toBe(1);

      // Round 2 should have 2 matches
      const round2Matches = matches.filter(m => m.round === 2);
      expect(round2Matches.length).toBe(2);

      // Round 3 should have 1 match (Finals)
      const round3Matches = matches.filter(m => m.round === 3);
      expect(round3Matches.length).toBe(1);
    });

    test("7 teams should generate 6 matches total", () => {
      const teams = createMockTeams(7);
      const { matches } = FixtureEngine.generateKnockout(teams, "event1");

      // Total matches = n - 1 = 7 - 1 = 6
      expect(matches.length).toBe(6);

      // Sequential match numbers
      const matchNumbers = matches.map(m => m.matchNumber).sort((a, b) => (a || 0) - (b || 0));
      expect(matchNumbers).toEqual([1, 2, 3, 4, 5, 6]);

      // Round 1 should have 3 real matches (1 bye)
      const round1Matches = matches.filter(m => m.round === 1);
      expect(round1Matches.length).toBe(3);
    });

    test("8 teams (power of 2) should generate 7 matches total", () => {
      const teams = createMockTeams(8);
      const { matches } = FixtureEngine.generateKnockout(teams, "event1");

      // Total matches = n - 1 = 8 - 1 = 7
      expect(matches.length).toBe(7);

      // Sequential match numbers
      const matchNumbers = matches.map(m => m.matchNumber).sort((a, b) => (a || 0) - (b || 0));
      expect(matchNumbers).toEqual([1, 2, 3, 4, 5, 6, 7]);

      // Round 1 should have 4 matches (no byes)
      const round1Matches = matches.filter(m => m.round === 1);
      expect(round1Matches.length).toBe(4);

      // Round 2 should have 2 matches
      const round2Matches = matches.filter(m => m.round === 2);
      expect(round2Matches.length).toBe(2);

      // Round 3 should have 1 match (Finals)
      const round3Matches = matches.filter(m => m.round === 3);
      expect(round3Matches.length).toBe(1);
    });

    test("9 teams should generate 8 matches total", () => {
      const teams = createMockTeams(9);
      const { matches } = FixtureEngine.generateKnockout(teams, "event1");

      // Total matches = n - 1 = 9 - 1 = 8
      expect(matches.length).toBe(8);

      // Sequential match numbers
      const matchNumbers = matches.map(m => m.matchNumber).sort((a, b) => (a || 0) - (b || 0));
      expect(matchNumbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });

    test("No BYE vs BYE matches should exist", () => {
      const testCases = [3, 5, 7, 9, 13, 27];

      testCases.forEach(teamCount => {
        const teams = createMockTeams(teamCount);
        const { matches } = FixtureEngine.generateKnockout(teams, `event-${teamCount}`);

        // Check that no match has both participants as BYE
        const byeVsByeMatches = matches.filter(m =>
          m.participants?.length === 2 &&
          m.participants[0].placeholder === "BYE" &&
          m.participants[1].placeholder === "BYE"
        );

        expect(byeVsByeMatches.length).toBe(0);
      });
    });

    test("All matches should have exactly 2 participants", () => {
      const teams = createMockTeams(5);
      const { matches } = FixtureEngine.generateKnockout(teams, "event1");

      matches.forEach(match => {
        expect(match.participants).toBeDefined();
        expect(match.participants?.length).toBe(2);
      });
    });

    test("Placeholder format should be correct for match winners", () => {
      const teams = createMockTeams(5);
      const { matches } = FixtureEngine.generateKnockout(teams, "event1");

      // Filter matches that have placeholder participants
      const matchesWithPlaceholders = matches.filter(m =>
        m.participants?.some(p => p.placeholder && p.placeholder !== "BYE")
      );

      // Check that placeholder format is "Winner of Match X"
      matchesWithPlaceholders.forEach(match => {
        match.participants?.forEach(p => {
          if (p.placeholder && p.placeholder !== "BYE") {
            expect(p.placeholder).toMatch(/^Winner of Match \d+$/);
          }
        });
      });
    });

    test("Match codes should be sequential (M1, M2, M3...)", () => {
      const teams = createMockTeams(7);
      const { matches } = FixtureEngine.generateKnockout(teams, "event1");

      const matchCodes = matches.map(m => m.matchCode).sort();
      const expectedCodes = matches.map((_, i) => `M${i + 1}`).sort();

      expect(matchCodes).toEqual(expectedCodes);
    });

    test("Large bracket (27 teams) should work correctly", () => {
      const teams = createMockTeams(27);
      const { matches } = FixtureEngine.generateKnockout(teams, "event1");

      // Total matches = n - 1 = 27 - 1 = 26
      expect(matches.length).toBe(26);

      // Sequential numbering
      const matchNumbers = matches.map(m => m.matchNumber).sort((a, b) => (a || 0) - (b || 0));
      expect(matchNumbers).toEqual(Array.from({ length: 26 }, (_, i) => i + 1));

      // No BYE vs BYE
      const byeVsByeMatches = matches.filter(m =>
        m.participants?.length === 2 &&
        m.participants[0].placeholder === "BYE" &&
        m.participants[1].placeholder === "BYE"
      );
      expect(byeVsByeMatches.length).toBe(0);
    });
  });

  describe("Round Robin Fixture Generation", () => {
    const mockTeams: IParticipant[] = [
      { _id: "1", name: "Team 1" } as any,
      { _id: "2", name: "Team 2" } as any,
      { _id: "3", name: "Team 3" } as any,
      { _id: "4", name: "Team 4" } as any,
    ];

    test("Generate round-robin fixtures", () => {
      const matches = FixtureEngine.generateRoundRobin(mockTeams, "event1");

      // For 4 teams: (n-1) rounds * n/2 matches per round = 3 * 2 = 6 matches
      expect(matches.length).toBe(6);
      expect(matches.every((m) => m.participants?.length === 2)).toBe(true);
    });

    test("Generate fixtures with odd number of participants", () => {
      const oddTeams = mockTeams.slice(0, 3);
      const matches = FixtureEngine.generateRoundRobin(oddTeams, "event1");
      expect(matches.length).toBeGreaterThan(0);
    });
  });
});
