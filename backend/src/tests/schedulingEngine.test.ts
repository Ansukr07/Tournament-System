import { SchedulingEngine } from "../services/schedulingEngine"
import type { IMatch } from "../models/Match"
import type { ICourt } from "../models/Court"

describe("SchedulingEngine", () => {
  const mockCourts: ICourt[] = [
    { _id: "court1", eventId: "event1", name: "Court 1", capacity: 2 } as any,
    { _id: "court2", eventId: "event1", name: "Court 2", capacity: 2 } as any,
  ]

  const mockMatches: IMatch[] = [
    { _id: "match1", eventId: "event1", round: 1, participants: ["p1", "p2"], status: "scheduled" } as any,
    { _id: "match2", eventId: "event1", round: 1, participants: ["p3", "p4"], status: "scheduled" } as any,
  ]

  test("Schedule matches with proper timing", () => {
    const eventStart = new Date()
    const scheduled = SchedulingEngine.scheduleMatches(mockMatches, mockCourts, eventStart, 30, 10)

    expect(scheduled.length).toBe(2)
    expect(scheduled[0].startTime).toEqual(eventStart)
    expect(scheduled[1].startTime?.getTime()).toBeGreaterThan(eventStart.getTime())
  })

  test("Avoid overlapping matches on same court", () => {
    const eventStart = new Date()
    const scheduled = SchedulingEngine.scheduleMatches(mockMatches, mockCourts, eventStart, 30, 10)

    const courtUsage = new Map()
    scheduled.forEach((m) => {
      if (!courtUsage.has(m.courtId)) courtUsage.set(m.courtId, [])
      courtUsage.get(m.courtId).push({ start: m.startTime, end: m.endTime })
    })

    courtUsage.forEach((times) => {
      for (let i = 0; i < times.length - 1; i++) {
        expect(times[i].end.getTime()).toBeLessThanOrEqual(times[i + 1].start.getTime())
      }
    })
  })
})
