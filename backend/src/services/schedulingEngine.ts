import type { IMatch } from "../models/Match";

/**
 * Smart Scheduling Engine
 * 
 * Features:
 * - Earliest-fit court allocation
 * - Sequential round scheduling (R1 → R2 → R3)
 * - Team availability tracking (no overlaps)
 * - Rest buffer enforcement
 * - Multi-court optimization
 * 
 * Algorithm:
 * 1. Process matches round-by-round in order
 * 2. For each match, find earliest time when:
 *    - At least one court is free
 *    - All teams are available (rested)
 * 3. Assign to that court at that time
 * 4. Update team and court schedules
 */

interface TeamSchedule {
  teamId: string;
  nextAvailableTime: Date;
}

interface CourtSchedule {
  courtId: string;
  nextAvailableTime: Date;
}

interface ScheduledMatch extends IMatch {
  courtId: string;
  startTime: Date;
  endTime: Date;
}

export class SchedulingEngine {
  /**
   * Schedule matches with earliest-fit algorithm
   * 
   * @param matches - Matches to schedule (should include teamId in participants)
   * @param courts - Array of court names/IDs
   * @param eventStartTime - When the event starts
   * @param matchDuration - Duration of each match in minutes
   * @param bufferMinutes - Rest buffer between matches for teams in minutes
   * @returns Scheduled matches with court, startTime, and endTime assigned
   */
  static scheduleMatches(
    matches: IMatch[],
    courts: string[],
    eventStartTime: Date,
    matchDuration: number,
    bufferMinutes: number
  ): ScheduledMatch[] {
    if (!matches || matches.length === 0) {
      console.log('[Scheduler] No matches to schedule');
      return [];
    }

    if (!courts || courts.length === 0) {
      throw new Error('At least one court is required for scheduling');
    }

    console.log(`[Scheduler] Scheduling ${matches.length} matches across ${courts.length} courts`);
    console.log(`[Scheduler] Match duration: ${matchDuration}min, Buffer: ${bufferMinutes}min`);

    // Initialize schedules
    const teamSchedules = new Map<string, Date>();
    const courtSchedules = new Map<string, Date>();

    courts.forEach(court => {
      courtSchedules.set(court, new Date(eventStartTime));
    });

    // Group matches by round
    const matchesByRound = this.groupByRound(matches);
    const rounds = Object.keys(matchesByRound)
      .map(Number)
      .sort((a, b) => a - b);

    console.log(`[Scheduler] Processing ${rounds.length} rounds: ${rounds.join(', ')}`);

    const scheduledMatches: ScheduledMatch[] = [];

    // Process each round sequentially
    for (const round of rounds) {
      const roundMatches = matchesByRound[round];
      console.log(`\n[Scheduler] === Round ${round} (${roundMatches.length} matches) ===`);

      for (const match of roundMatches) {
        // Extract team IDs from participants
        const teamIds = this.extractTeamIds(match);

        // Skip matches without 2 real teams (e.g., BYE matches)
        if (teamIds.length < 2) {
          console.log(`[Scheduler] Skip match ${match.matchCode || match.matchNumber} - insufficient teams (BYE or placeholder)`);
          continue;
        }

        // Find earliest available slot
        const slot = this.findEarliestSlot(
          teamIds,
          courtSchedules,
          teamSchedules,
          eventStartTime,
          matchDuration
        );

        // Calculate times
        const startTime = new Date(slot.startTime);
        const endTime = new Date(startTime.getTime() + matchDuration * 60 * 1000);
        const teamNextFree = new Date(endTime.getTime() + bufferMinutes * 60 * 1000);

        // Assign to match
        const scheduledMatch = match as ScheduledMatch;
        scheduledMatch.courtId = slot.court;
        scheduledMatch.startTime = startTime;
        scheduledMatch.endTime = endTime;

        // Update schedules
        courtSchedules.set(slot.court, endTime); // Court free immediately after match
        teamIds.forEach(id => teamSchedules.set(id, teamNextFree)); // Teams need rest

        scheduledMatches.push(scheduledMatch);

        console.log(
          `[Scheduler] M${match.matchNumber} (${match.matchCode}): ` +
          `Court ${slot.court} at ${startTime.toLocaleTimeString()} - ${endTime.toLocaleTimeString()}`
        );
      }
    }

    console.log(`\n[Scheduler] Successfully scheduled ${scheduledMatches.length} matches`);
    return scheduledMatches;
  }

  /**
   * Group matches by round number
   */
  private static groupByRound(matches: IMatch[]): Record<number, IMatch[]> {
    const grouped: Record<number, IMatch[]> = {};

    matches.forEach(match => {
      const round = match.round || 1;
      if (!grouped[round]) {
        grouped[round] = [];
      }
      grouped[round].push(match);
    });

    // Sort matches within each round by matchNumber
    Object.keys(grouped).forEach(round => {
      grouped[Number(round)].sort((a, b) => (a.matchNumber || 0) - (b.matchNumber || 0));
    });

    return grouped;
  }

  /**
   * Extract team IDs from match participants
   */
  private static extractTeamIds(match: IMatch): string[] {
    if (!match.participants || match.participants.length === 0) {
      return [];
    }

    return match.participants
      .filter(p => p.teamId && !p.placeholder)
      .map(p => p.teamId!.toString());
  }

  /**
   * Find the earliest available slot for a match
   * 
   * Finds the earliest time when:
   * 1. At least one court is available
   * 2. All teams are available (including rest buffer)
   * 
   * Uses earliest-fit: assigns to the court that becomes free earliest
   */
  private static findEarliestSlot(
    teamIds: string[],
    courtSchedules: Map<string, Date>,
    teamSchedules: Map<string, Date>,
    eventStartTime: Date,
    matchDuration: number
  ): { court: string; startTime: Date } {
    // Get when all teams are available
    const teamAvailableTimes = teamIds.map(id =>
      teamSchedules.get(id) || eventStartTime
    );
    const teamsAvailableAt = new Date(Math.max(...teamAvailableTimes.map(d => d.getTime())));

    // Find court that becomes free earliest at or after teams are available
    let earliestCourt: string | null = null;
    let earliestTime: Date | null = null;

    courtSchedules.forEach((courtFreeTime, court) => {
      // Schedule time is the later of: teams available OR court free
      const scheduleTime = new Date(
        Math.max(teamsAvailableAt.getTime(), courtFreeTime.getTime())
      );

      if (!earliestTime || scheduleTime < earliestTime) {
        earliestTime = scheduleTime;
        earliestCourt = court;
      }
    });

    if (!earliestCourt || !earliestTime) {
      // Fallback: use first court at team available time
      earliestCourt = Array.from(courtSchedules.keys())[0];
      earliestTime = teamsAvailableAt;
    }

    return {
      court: earliestCourt,
      startTime: earliestTime
    };
  }
}
