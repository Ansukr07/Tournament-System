import mongoose from "mongoose";
import type { IMatch } from "../models/Match";

// Generic participant interface
export interface IParticipant {
  _id: mongoose.Types.ObjectId | string;
  [key: string]: any;
}

// Helper types for our internal bracket construction
type BracketSource =
  | { type: "team"; teamId: mongoose.Types.ObjectId | string }
  | { type: "match"; matchNumber: number; matchId?: mongoose.Types.ObjectId }
  | { type: "bye" };

interface BracketNode {
  matchNumber: number;
  round: number;
  matchDoc?: Partial<IMatch> & { _nextMatchNumber?: number }; // Only present if it's a real match
  source: BracketSource; // The result of this node (Team or Match Winner)
  children: BracketNode[];
}

export class FixtureEngine {
  /**
   * Generates a knockout bracket for the given participants.
   * NEW ALGORITHM (v2 - Full Bracket Visibility):
   * - Pads to power of 2 with BYEs
   * - Uses standard seeding (1 vs N, 2 vs N-1, etc.)
   * - Creates match documents for ALL bracket slots (including BYE scenarios)
   * - Uses SEQUENTIAL match numbering for all slots (1, 2, 3...)
   * - Marks BYE auto-advances with status "auto_advance"
   * - Real matches marked with status "scheduled"
   * - Guarantees NO BYE vs BYE matches
   */
  static generateKnockout(participants: IParticipant[], eventId: string): { bracket: BracketNode; matches: (Partial<IMatch> & { _nextMatchNumber?: number })[] } {
    if (participants.length === 0) {
      throw new Error("No participants provided for knockout generation.");
    }

    console.log(`\n===== KNOCKOUT GENERATION (Full Bracket View) =====`);
    console.log(`Teams: ${participants.length}`);

    // 1. Calculate bracket size (next power of 2)
    const n = participants.length;
    const totalSlots = Math.pow(2, Math.ceil(Math.log2(n)));
    const byesNeeded = totalSlots - n;
    console.log(`Bracket size: ${totalSlots} slots (${byesNeeded} byes needed)`);

    // 2. Generate Standard Seeding
    const seedOrder = this.getSeededIndices(totalSlots);
    console.log(`Seed order: [${seedOrder.join(', ')}]`);

    // 3. Map seeds to participants or BYEs
    const initialSlots: BracketSource[] = seedOrder.map(seed => {
      if (seed <= n) {
        return { type: "team", teamId: participants[seed - 1]._id as mongoose.Types.ObjectId };
      } else {
        return { type: "bye" };
      }
    });

    // 4. Build the bracket round by round - CREATE ALL MATCHES
    let currentRound = 1;
    let matchCounter = 1; // Sequential counter for ALL matches
    const allMatches: (Partial<IMatch> & { _nextMatchNumber?: number })[] = [];

    // Track bracket structure
    let currentRoundSlots = initialSlots;
    let previousRoundNodes: BracketNode[] = [];

    console.log(`\n=== Building Complete Bracket ===`);

    while (currentRoundSlots.length > 1) {
      const nextRoundSlots: BracketSource[] = [];
      const currentLevelNodes: BracketNode[] = [];

      console.log(`\n--- Round ${currentRound} ---`);
      console.log(`Processing ${currentRoundSlots.length / 2} pairings...`);

      for (let i = 0; i < currentRoundSlots.length; i += 2) {
        const left = currentRoundSlots[i];
        const right = currentRoundSlots[i + 1];
        const currentMatchNumber = matchCounter++;

        // Determine match type
        const leftIsBye = left.type === "bye";
        const rightIsBye = right.type === "bye";

        let node: BracketNode;
        let matchStatus: "scheduled" | "auto_advance" | "pending" = "scheduled";
        let advancingSource: BracketSource;

        if (leftIsBye && rightIsBye) {
          // Case 1: BYE vs BYE (should never happen with proper seeding)
          console.log(`  Match ${currentMatchNumber}: BYE vs BYE → SKIP (ERROR)`);
          console.warn(`⚠️  WARNING: BYE vs BYE detected! This should not happen with correct seeding.`);

          // Don't create a match for this
          node = {
            matchNumber: currentMatchNumber,
            round: currentRound,
            source: { type: "bye" },
            children: []
          };
          nextRoundSlots.push({ type: "bye" });
          matchCounter--; // Don't count this slot

        } else if (rightIsBye) {
          // Case 2: Team/Winner vs BYE → Auto-advance left (CREATE AUTO-ADVANCE MATCH)
          const leftTeamId = left.type === "team" ? left.teamId : null;
          const leftMatchNum = left.type === "match" ? left.matchNumber : null;
          const leftDesc = leftTeamId ? `Team(${leftTeamId.toString().slice(-4)})` : `Winner(M${leftMatchNum})`;

          console.log(`  Match ${currentMatchNumber}: ${leftDesc} vs BYE → AUTO-ADVANCE MATCH`);

          matchStatus = "auto_advance";
          advancingSource = left;

          // Create auto-advance match document
          const matchDoc: Partial<IMatch> & { _nextMatchNumber?: number } = {
            eventId: eventId as any,
            round: currentRound,
            matchNumber: currentMatchNumber,
            matchCode: `M${currentMatchNumber}`,
            status: "auto_advance",
            participants: [
              this.createParticipantEntry(left),
              { placeholder: "BYE" }
            ]
          };

          allMatches.push(matchDoc);

          // Link child matches
          if (left.type === "match") {
            const childMatch = allMatches.find(m => m.matchNumber === left.matchNumber);
            if (childMatch) childMatch._nextMatchNumber = currentMatchNumber;
          }

          node = {
            matchNumber: currentMatchNumber,
            round: currentRound,
            matchDoc,
            source: { type: "match", matchNumber: currentMatchNumber },
            children: []
          };
          nextRoundSlots.push({ type: "match", matchNumber: currentMatchNumber });

        } else if (leftIsBye) {
          // Case 3: BYE vs Team/Winner → Auto-advance right (CREATE AUTO-ADVANCE MATCH)
          const rightTeamId = right.type === "team" ? right.teamId : null;
          const rightMatchNum = right.type === "match" ? right.matchNumber : null;
          const rightDesc = rightTeamId ? `Team(${rightTeamId.toString().slice(-4)})` : `Winner(M${rightMatchNum})`;

          console.log(`  Match ${currentMatchNumber}: BYE vs ${rightDesc} → AUTO-ADVANCE MATCH`);

          matchStatus = "auto_advance";
          advancingSource = right;

          // Create auto-advance match document
          const matchDoc: Partial<IMatch> & { _nextMatchNumber?: number } = {
            eventId: eventId as any,
            round: currentRound,
            matchNumber: currentMatchNumber,
            matchCode: `M${currentMatchNumber}`,
            status: "auto_advance",
            participants: [
              { placeholder: "BYE" },
              this.createParticipantEntry(right)
            ]
          };

          allMatches.push(matchDoc);

          // Link child matches
          if (right.type === "match") {
            const childMatch = allMatches.find(m => m.matchNumber === right.matchNumber);
            if (childMatch) childMatch._nextMatchNumber = currentMatchNumber;
          }

          node = {
            matchNumber: currentMatchNumber,
            round: currentRound,
            matchDoc,
            source: { type: "match", matchNumber: currentMatchNumber },
            children: []
          };
          nextRoundSlots.push({ type: "match", matchNumber: currentMatchNumber });

        } else {
          // Case 4: Real Match (Team/Winner vs Team/Winner)
          const leftTeamId = left.type === "team" ? left.teamId : null;
          const leftMatchNum = left.type === "match" ? left.matchNumber : null;
          const leftDesc = leftTeamId ? `Team(${leftTeamId.toString().slice(-4)})` : `Winner(M${leftMatchNum})`;

          const rightTeamId = right.type === "team" ? right.teamId : null;
          const rightMatchNum = right.type === "match" ? right.matchNumber : null;
          const rightDesc = rightTeamId ? `Team(${rightTeamId.toString().slice(-4)})` : `Winner(M${rightMatchNum})`;

          console.log(`  Match ${currentMatchNumber}: ${leftDesc} vs ${rightDesc} → REAL MATCH`);

          // Create Match Document
          const matchDoc: Partial<IMatch> & { _nextMatchNumber?: number } = {
            eventId: eventId as any,
            round: currentRound,
            matchNumber: currentMatchNumber,
            matchCode: `M${currentMatchNumber}`,
            status: "scheduled",
            participants: [
              this.createParticipantEntry(left),
              this.createParticipantEntry(right)
            ]
          };

          allMatches.push(matchDoc);

          // Link child matches to this match
          if (left.type === "match") {
            const childMatch = allMatches.find(m => m.matchNumber === left.matchNumber);
            if (childMatch) childMatch._nextMatchNumber = currentMatchNumber;
          }
          if (right.type === "match") {
            const childMatch = allMatches.find(m => m.matchNumber === right.matchNumber);
            if (childMatch) childMatch._nextMatchNumber = currentMatchNumber;
          }

          node = {
            matchNumber: currentMatchNumber,
            round: currentRound,
            matchDoc,
            source: { type: "match", matchNumber: currentMatchNumber },
            children: []
          };

          nextRoundSlots.push({ type: "match", matchNumber: currentMatchNumber });
        }

        currentLevelNodes.push(node);
      }

      previousRoundNodes = currentLevelNodes;
      currentRoundSlots = nextRoundSlots;
      currentRound++;
    }

    console.log(`\n===== GENERATION COMPLETE =====`);
    console.log(`Total rounds: ${currentRound - 1}`);
    console.log(`Total real matches: ${allMatches.length}`);
    console.log(`Match numbers: ${allMatches.map(m => m.matchNumber).join(', ')}`);
    console.log(`Expected matches: ${n - 1}`);

    // Validation
    if (allMatches.length !== n - 1) {
      console.warn(`⚠️  WARNING: Expected ${n - 1} matches but generated ${allMatches.length}`);
    }

    // Check for BYE vs BYE in participants
    const byeVsByeMatches = allMatches.filter(m =>
      m.participants?.length === 2 &&
      m.participants[0].placeholder === "BYE" &&
      m.participants[1].placeholder === "BYE"
    );
    if (byeVsByeMatches.length > 0) {
      console.error(`❌ ERROR: Found ${byeVsByeMatches.length} BYE vs BYE matches!`);
    } else {
      console.log(`✅ No BYE vs BYE matches detected`);
    }

    console.log(`=====================================\n`);

    const root = previousRoundNodes[0];
    return { bracket: root, matches: allMatches };
  }

  // Helper to generate standard seeded indices for size N (power of 2)
  private static getSeededIndices(n: number): number[] {
    if (n === 2) return [1, 2];
    const previousRound = this.getSeededIndices(n / 2);
    const currentRound: number[] = [];
    for (const x of previousRound) {
      currentRound.push(x);
      currentRound.push(n + 1 - x);
    }
    return currentRound;
  }

  // Helper to get children for the tree structure
  private static getChildren(prevNodes: BracketNode[], index: number): BracketNode[] {
    if (prevNodes.length === 0) return [];
    const left = prevNodes[index];
    const right = prevNodes[index + 1];
    return [left, right].filter(Boolean);
  }

  private static createParticipantEntry(source: BracketSource): { teamId?: mongoose.Types.ObjectId; placeholder?: string } {
    if (source.type === "team") {
      return { teamId: source.teamId as mongoose.Types.ObjectId };
    } else if (source.type === "match") {
      return { placeholder: `Winner of Match ${source.matchNumber}` };
    } else {
      return { placeholder: "BYE" };
    }
  }

  // Keep the Round Robin generator as is
  static generateRoundRobin(participants: IParticipant[], eventId: string): Partial<IMatch>[] {
    const matches: Partial<IMatch>[] = [];
    const n = participants.length;
    if (n < 2) return matches;

    const players = [...participants];
    const maxRounds = n - 1;

    for (let r = 0; r < maxRounds; r++) {
      for (let i = 0; i < Math.floor(n / 2); i++) {
        const p1 = players[i];
        const p2 = players[n - 1 - i];
        if (p1._id !== p2._id) {
          matches.push({
            eventId: eventId as any,
            round: r + 1,
            participants: [
              { teamId: p1._id as any },
              { teamId: p2._id as any },
            ],
            status: "scheduled",
          });
        }
      }
      // Rotate
      const last = players.pop();
      if (last) players.splice(1, 0, last);
    }
    return matches;
  }
}
