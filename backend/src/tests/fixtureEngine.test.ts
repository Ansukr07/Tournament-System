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

  describe("Round Robin Fixture Generation - Circle Method", () => {
    test("2 teams: 1 round, 1 match", () => {
      const teams: IParticipant[] = [
        { _id: "1", name: "Team 1" } as any,
        { _id: "2", name: "Team 2" } as any
      ];

      const matches = FixtureEngine.generateRoundRobin(teams, "event1");

      expect(matches.length).toBe(1); // n*(n-1)/2 = 2*1/2 = 1
      expect(matches[0].round).toBe(1);
      expect(matches[0].matchNumber).toBe(1);
      expect(matches[0].matchCode).toBe("M1");
    });

    test("3 teams: 3 rounds, 3 matches total", () => {
      const teams: IParticipant[] = [
        { _id: "1", name: "Team 1" } as any,
        { _id: "2", name: "Team 2" } as any,
        { _id: "3", name: "Team 3" } as any
      ];

      const matches = FixtureEngine.generateRoundRobin(teams, "event1");

      // Expected: 3*(3-1)/2 = 3 matches
      expect(matches.length).toBe(3);

      // Verify rounds
      const rounds = new Set(matches.map(m => m.round));
      expect(rounds.size).toBe(3); // Should span 3 rounds

      // Verify no duplicates
      const pairings = matches.map(m => {
        const ids = m.participants!.map(p => p.teamId).sort();
        return ids.join("-");
      });
      expect(new Set(pairings).size).toBe(3); // All unique

      // Verify each team plays 2 matches
      const teamMatchCount = new Map<string, number>();
      matches.forEach(m => {
        m.participants!.forEach(p => {
          const id = String(p.teamId);
          teamMatchCount.set(id, (teamMatchCount.get(id) || 0) + 1);
        });
      });
      teamMatchCount.forEach(count => expect(count).toBe(2));
    });

    test("5 teams: 5 rounds, 10 matches total", () => {
      const teams: IParticipant[] = [
        { _id: "1", name: "Team 1" } as any,
        { _id: "2", name: "Team 2" } as any,
        { _id: "3", name: "Team 3" } as any,
        { _id: "4", name: "Team 4" } as any,
        { _id: "5", name: "Team 5" } as any
      ];

      const matches = FixtureEngine.generateRoundRobin(teams, "event1");

      // Expected: 5*(5-1)/2 = 10 matches
      expect(matches.length).toBe(10);

      // Verify rounds (odd teams need N rounds, not N-1)
      const rounds = new Set(matches.map(m => m.round));
      expect(rounds.size).toBe(5);

      // Verify no duplicates
      const pairings = new Set(matches.map(m => {
        const ids = m.participants!.map(p => p.teamId).sort();
        return ids.join("-");
      }));
      expect(pairings.size).toBe(10);

      // Verify each team plays 4 matches (N-1)
      const teamMatchCount = new Map<string, number>();
      matches.forEach(m => {
        m.participants!.forEach(p => {
          const id = String(p.teamId);
          teamMatchCount.set(id, (teamMatchCount.get(id) || 0) + 1);
        });
      });
      teamMatchCount.forEach(count => expect(count).toBe(4));

      // Verify no BYE in any match
      matches.forEach(m => {
        m.participants!.forEach(p => {
          expect(p.teamId).not.toBe("BYE");
        });
      });
    });

    test("8 teams: 7 rounds, 28 matches total", () => {
      const teams: IParticipant[] = Array.from({ length: 8 }, (_, i) => ({
        _id: String(i + 1),
        name: `Team ${i + 1}`
      } as any));

      const matches = FixtureEngine.generateRoundRobin(teams, "event1");

      // Expected: 8*(8-1)/2 = 28 matches
      expect(matches.length).toBe(28);

      // Verify rounds
      const rounds = new Set(matches.map(m => m.round));
      expect(rounds.size).toBe(7);

      // Verify each round has 4 matches (N/2)
      for (let r = 1; r <= 7; r++) {
        const roundMatches = matches.filter(m => m.round === r);
        expect(roundMatches.length).toBe(4);
      }

      // Verify all pairings are unique
      const pairings = new Set(matches.map(m => {
        const ids = m.participants!.map(p => p.teamId).sort();
        return ids.join("-");
      }));
      expect(pairings.size).toBe(28);

      // Verify each team plays 7 matches
      const teamMatchCount = new Map<string, number>();
      matches.forEach(m => {
        m.participants!.forEach(p => {
          const id = String(p.teamId);
          teamMatchCount.set(id, (teamMatchCount.get(id) || 0) + 1);
        });
      });
      teams.forEach(t => {
        expect(teamMatchCount.get(String(t._id))).toBe(7);
      });
    });

    test("7 teams: proper BYE handling", () => {
      const teams: IParticipant[] = Array.from({ length: 7 }, (_, i) => ({
        _id: String(i + 1),
        name: `Team ${i + 1}`
      } as any));

      const matches = FixtureEngine.generateRoundRobin(teams, "event1");

      // Expected: 7*(7-1)/2 = 21 matches
      expect(matches.length).toBe(21);

      // Verify no BYE in participants
      matches.forEach(m => {
        m.participants!.forEach(p => {
          expect(p.teamId).not.toBe("BYE");
        });
      });

      // Verify 7 rounds (odd teams)
      const rounds = new Set(matches.map(m => m.round));
      expect(rounds.size).toBe(7);
    });

    test("All matches have 2 participants", () => {
      const teams: IParticipant[] = [
        { _id: "1", name: "Team 1" } as any,
        { _id: "2", name: "Team 2" } as any,
        { _id: "3", name: "Team 3" } as any,
        { _id: "4", name: "Team 4" } as any
      ];

      const matches = FixtureEngine.generateRoundRobin(teams, "event1");

      expect(matches.every(m => m.participants?.length === 2)).toBe(true);
      expect(matches.every(m => m.status === "scheduled")).toBe(true);
    });

    test("Sequential match numbering", () => {
      const teams: IParticipant[] = [
        { _id: "1", name: "Team 1" } as any,
        { _id: "2", name: "Team 2" } as any,
        { _id: "3", name: "Team 3" } as any,
        { _id: "4", name: "Team 4" } as any
      ];

      const matches = FixtureEngine.generateRoundRobin(teams, "event1");

      // Match numbers should be 1, 2, 3, 4, 5, 6
      const matchNumbers = matches.map(m => m.matchNumber).sort((a, b) => a! - b!);
      expect(matchNumbers).toEqual([1, 2, 3, 4, 5, 6]);

      // Match codes should match
      matches.forEach(m => {
        expect(m.matchCode).toBe(`M${m.matchNumber}`);
      });
    });
  });
});
