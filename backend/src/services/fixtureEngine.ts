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
   * - Pads to power of 2 with BYEs.
   * - Uses standard seeding (1 vs N, 2 vs N-1, etc.).
   * - Generates matches round by round.
   * - Handles BYE vs Team auto-advancement (no match doc created).
   * - Returns the bracket tree and the flat list of matches to save.
   */
  static generateKnockout(participants: IParticipant[], eventId: string): { bracket: BracketNode; matches: (Partial<IMatch> & { _nextMatchNumber?: number })[] } {
    if (participants.length === 0) {
      throw new Error("No participants provided for knockout generation.");
    }

    // 1. Pad to power of 2
    const n = participants.length;
    const totalSlots = Math.pow(2, Math.ceil(Math.log2(n)));

    // 2. Generate Seeded Order
    const seedIndices = this.getSeededIndices(totalSlots);

    const leaves: BracketSource[] = seedIndices.map(seedIndex => {
      if (seedIndex <= n) {
        return { type: "team", teamId: participants[seedIndex - 1]._id as mongoose.Types.ObjectId };
      } else {
        return { type: "bye" };
      }
    });

    // 3. Build the bracket bottom-up
    let currentRoundSources = leaves;
    let round = 1;
    let matchCounter = 1; // Global match counter for the bracket slots

    const allMatches: (Partial<IMatch> & { _nextMatchNumber?: number })[] = [];
    // We need to track the nodes of the *current* round to set them as children of the *next* round.
    let previousRoundNodes: BracketNode[] = [];

    // Loop until we have 1 source left (the winner of the tournament)
    while (currentRoundSources.length > 1) {
      const nextRoundSources: BracketSource[] = [];
      const currentLevelNodes: BracketNode[] = [];

      for (let i = 0; i < currentRoundSources.length; i += 2) {
        const left = currentRoundSources[i];
        const right = currentRoundSources[i + 1];
        const currentMatchNumber = matchCounter++;

        // Logic to determine match type
        let node: BracketNode;

        // Case 1: BYE vs BYE
        if (left.type === "bye" && right.type === "bye") {
          node = {
            matchNumber: currentMatchNumber,
            round,
            source: { type: "bye" },
            children: this.getChildren(previousRoundNodes, i)
          };
        }
        // Case 2: Team/Match vs BYE -> Auto Advance Left
        else if (right.type === "bye") {
          node = {
            matchNumber: currentMatchNumber,
            round,
            source: left, // Pass the left source directly to the next round
            children: this.getChildren(previousRoundNodes, i)
          };
        }
        // Case 3: BYE vs Team/Match -> Auto Advance Right
        else if (left.type === "bye") {
          node = {
            matchNumber: currentMatchNumber,
            round,
            source: right, // Pass the right source directly to the next round
            children: this.getChildren(previousRoundNodes, i)
          };
        }
        // Case 4: Real Match
        else {
          // Create Match Document
          const matchDoc: Partial<IMatch> & { _nextMatchNumber?: number } = {
            eventId: eventId as any,
            round,
            matchNumber: currentMatchNumber,
            matchCode: `M${currentMatchNumber}`,
            status: "scheduled",
            participants: [
              this.createParticipantEntry(left),
              this.createParticipantEntry(right)
            ]
          };

          allMatches.push(matchDoc);

          // LINKING LOGIC:
          // If left source is a match, set its _nextMatchNumber to currentMatchNumber
          if (left.type === "match") {
            const childMatch = allMatches.find(m => m.matchNumber === left.matchNumber);
            if (childMatch) childMatch._nextMatchNumber = currentMatchNumber;
          }
          // If right source is a match, set its _nextMatchNumber to currentMatchNumber
          if (right.type === "match") {
            const childMatch = allMatches.find(m => m.matchNumber === right.matchNumber);
            if (childMatch) childMatch._nextMatchNumber = currentMatchNumber;
          }

          node = {
            matchNumber: currentMatchNumber,
            round,
            matchDoc,
            source: { type: "match", matchNumber: currentMatchNumber },
            children: this.getChildren(previousRoundNodes, i)
          };
        }

        currentLevelNodes.push(node);
        nextRoundSources.push(node.source);
      }

      previousRoundNodes = currentLevelNodes;
      currentRoundSources = nextRoundSources;
      round++;
    }

    // The root of the bracket is the single node left in previousRoundNodes
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
