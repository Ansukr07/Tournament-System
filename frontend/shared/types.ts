export interface Player {
  _id: string
  name: string
  uniqueId: string
  clubId: string
  events: string[]
}

export interface Club {
  _id: string
  name: string
}

export interface Court {
  _id: string
  eventId: string
  name: string
  capacity: number
}

export interface Event {
  _id: string
  name: string
  category: string
  type: "knockout" | "round_robin"
  matchDuration: number
  bufferMinutes: number
  courts: string[]
  participants: string[]
  startDate: string
  endDate: string
}

export interface Match {
  _id: string
  eventId: string
  round: number
  participants: string[]
  courtId: string
  startTime: string
  endTime: string
  status: "scheduled" | "live" | "completed" | "cancelled"
  winnerId: string | null
  nextMatchId: string | null
  matchCodeId: string | null
}

export interface MatchCode {
  _id: string
  matchId: string
  codeHash: string
  expiresAt: string
  used: boolean
}

export interface User {
  _id: string
  email: string
  role: "admin" | "umpire"
}

export interface AuthResponse {
  token: string
  user: User
}

export interface FixtureResult {
  matches: Match[]
  bracket: BracketNode
}

export interface BracketNode {
  match: Match | null
  round: number
  position: number
  children: BracketNode[]
}

export interface ScheduleResult {
  matches: Match[]
  courtSchedules: CourtSchedule[]
}

export interface CourtSchedule {
  courtId: string
  matches: Match[]
}
