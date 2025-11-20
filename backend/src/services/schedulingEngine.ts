import type { IMatch } from "../models/Match"
import type { ICourt } from "../models/Court"

interface ScheduledMatch extends IMatch {
  startTime: Date
  endTime: Date
}

export class SchedulingEngine {
  static scheduleMatches(
    matches: IMatch[],
    courts: ICourt[],
    eventStartTime: Date,
    matchDuration: number,
    bufferMinutes: number,
  ): ScheduledMatch[] {
    const scheduled: ScheduledMatch[] = []
    const courtSchedules = new Map<string, Date>()

    // Initialize court schedules
    courts.forEach((court) => {
      courtSchedules.set(court._id.toString(), new Date(eventStartTime))
    })

    // Sort matches by round
    const sortedMatches = [...matches].sort((a, b) => a.round - b.round)

    for (const match of sortedMatches) {
      // Find court with earliest available time
      let earliestCourt: string | null = null
      let earliestTime: Date | null = null

      courtSchedules.forEach((time, courtId) => {
        if (!earliestTime || time < earliestTime) {
          earliestTime = time
          earliestCourt = courtId
        }
      })

      if (!earliestCourt || !earliestTime) continue

      const startTime = new Date(earliestTime)
      const endTime = new Date(startTime.getTime() + matchDuration * 60 * 1000)
      const nextAvailable = new Date(endTime.getTime() + bufferMinutes * 60 * 1000)
      ;(match as ScheduledMatch).courtId = earliestCourt as any
      ;(match as ScheduledMatch).startTime = startTime
      ;(match as ScheduledMatch).endTime = endTime

      courtSchedules.set(earliestCourt, nextAvailable)
      scheduled.push(match as ScheduledMatch)
    }

    return scheduled
  }
}
