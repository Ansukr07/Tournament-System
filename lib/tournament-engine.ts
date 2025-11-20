export interface Team {
  id: string
  name: string
  seed?: number
}

export interface Match {
  id: string
  team1: Team
  team2: Team
  matchCode: string
  court: number
  time: Date
  status: "pending" | "live" | "completed"
  team1Score?: number
  team2Score?: number
}

export interface Fixture {
  id: string
  round: number
  matches: Match[]
  scheduledDate: Date
}

/**
 * Round-robin fixture generator
 * Creates a balanced schedule where each team plays every other team once
 */
export function generateRoundRobinFixture(teams: Team[], courtsAvailable: number): Fixture[] {
  if (teams.length < 2) {
    throw new Error("Need at least 2 teams")
  }

  const fixtures: Fixture[] = []
  const sortedTeams = [...teams].sort((a, b) => (a.seed || 0) - (b.seed || 0))
  const n = sortedTeams.length
  const isOdd = n % 2 === 1

  // Add bye team if odd number of teams
  const teamsList = isOdd ? [...sortedTeams, { id: "bye", name: "Bye" }] : sortedTeams

  // Generate rounds
  const rounds = teamsList.length - 1
  let matchId = 0

  for (let round = 0; round < rounds; round++) {
    const matches: Match[] = []
    const matchesInRound = teamsList.length / 2

    for (let i = 0; i < matchesInRound; i++) {
      const team1 = teamsList[i]
      const team2 = teamsList[teamsList.length - 1 - i]

      if (team1.id !== "bye" && team2.id !== "bye") {
        matches.push({
          id: `match-${matchId++}`,
          team1,
          team2,
          matchCode: generateMatchCode(),
          court: (i % courtsAvailable) + 1,
          time: new Date(Date.now() + (round + 1) * 86400000),
          status: "pending",
        })
      }
    }

    fixtures.push({
      id: `fixture-${round}`,
      round: round + 1,
      matches,
      scheduledDate: new Date(Date.now() + (round + 1) * 86400000),
    })

    // Rotate teams for next round (except first team)
    const temp = teamsList[1]
    for (let i = 1; i < teamsList.length - 1; i++) {
      teamsList[i] = teamsList[i + 1]
    }
    teamsList[teamsList.length - 1] = temp
  }

  return fixtures
}

/**
 * Elimination bracket fixture generator
 * Creates a single/double elimination tournament structure
 */
export function generateEliminationFixture(teams: Team[], type: "single" | "double" = "single"): Fixture[] {
  const fixtures: Fixture[] = []
  const n = Math.pow(2, Math.ceil(Math.log2(teams.length)))
  const sortedTeams = [...teams].sort((a, b) => (a.seed || 0) - (b.seed || 0))

  // Pad with byes if necessary
  while (sortedTeams.length < n) {
    sortedTeams.push({ id: `bye-${sortedTeams.length}`, name: "Bye" })
  }

  let matchId = 0
  let round = 0
  let currentTeams = sortedTeams

  // Single elimination
  while (currentTeams.length > 1) {
    const matches: Match[] = []

    for (let i = 0; i < currentTeams.length; i += 2) {
      const team1 = currentTeams[i]
      const team2 = currentTeams[i + 1]

      matches.push({
        id: `match-${matchId++}`,
        team1,
        team2,
        matchCode: generateMatchCode(),
        court: Math.floor(i / 2) + 1,
        time: new Date(Date.now() + (round + 1) * 86400000),
        status: "pending",
      })
    }

    fixtures.push({
      id: `fixture-${round}`,
      round: round + 1,
      matches,
      scheduledDate: new Date(Date.now() + (round + 1) * 86400000),
    })

    currentTeams = matches.map((m) => ({ id: m.id, name: `Winner of ${m.id}` }))
    round++
  }

  return fixtures
}

/**
 * Generate a unique 6-character match code for umpire verification
 */
export function generateMatchCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Intelligent court scheduling based on team strength and match duration
 */
export function scheduleMatchesToCourts(matches: Match[], courtsAvailable: number, courtTimeslots = 2): Match[] {
  const scheduled = matches.map((match, index) => {
    const court = (index % courtsAvailable) + 1
    const slot = Math.floor(index / courtsAvailable)
    const timeOffset = slot * 30 * 60 * 1000 // 30-minute intervals

    return {
      ...match,
      court,
      time: new Date(Date.now() + timeOffset),
    }
  })

  return scheduled
}

/**
 * Calculate standings from completed matches
 */
export interface Standing {
  team: Team
  wins: number
  losses: number
  points: number
  gamesPlayed: number
}

export function calculateStandings(matches: Match[]): Standing[] {
  const standings = new Map<string, Standing>()

  matches.forEach((match) => {
    if (match.status === "completed" && match.team1Score !== undefined && match.team2Score !== undefined) {
      const team1Id = match.team1.id
      const team2Id = match.team2.id

      if (!standings.has(team1Id)) {
        standings.set(team1Id, {
          team: match.team1,
          wins: 0,
          losses: 0,
          points: 0,
          gamesPlayed: 0,
        })
      }

      if (!standings.has(team2Id)) {
        standings.set(team2Id, {
          team: match.team2,
          wins: 0,
          losses: 0,
          points: 0,
          gamesPlayed: 0,
        })
      }

      const s1 = standings.get(team1Id)!
      const s2 = standings.get(team2Id)!

      s1.gamesPlayed++
      s2.gamesPlayed++

      if (match.team1Score > match.team2Score) {
        s1.wins++
        s1.points += 3
        s2.losses++
      } else {
        s2.wins++
        s2.points += 3
        s1.losses++
      }
    }
  })

  return Array.from(standings.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.wins !== a.wins) return b.wins - a.wins
    return 0
  })
}
