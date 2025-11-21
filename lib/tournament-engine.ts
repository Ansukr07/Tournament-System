// lib/tournament-engine.ts
import crypto from "crypto"

/* ---------- Types ---------- */
export interface Team {
  id: string
  name: string
  seed?: number
  clubId?: string  // add club id for same-club avoidance
  players?: string[] // optional list of player ids (for player-level scheduling)
}

export interface Match {
  id: string
  team1: Team | { id: string; name: string }  // can be placeholders like "bye" or "Winner of X"
  team2: Team | { id: string; name: string }
  matchCode?: string
  court?: number
  time?: Date
  durationMinutes?: number
  status?: "pending" | "live" | "completed"
  team1Score?: number
  team2Score?: number
  round?: number
}

export interface Fixture {
  id: string
  round: number
  matches: Match[]
  scheduledDate?: Date
}

/* ---------- Utilities ---------- */
function generateMatchCode(): string {
  // 6 alphanumeric code, cryptographically random
  const bytes = crypto.randomBytes(4).toString("base64").replace(/[^A-Z0-9]/gi, "")
  // Ensure length 6
  return (bytes + "ABCDEFGH").slice(0, 6).toUpperCase()
}

function nextPowerOfTwo(n: number): number {
  if (n <= 1) return 1
  let p = 1
  while (p < n) p <<= 1
  return p
}

/* ---------- Seeding and Bye Allocation (Knockout) ---------- */
/**
 * createSeededBracket:
 * - pads teams to next power of two with byes
 * - returns array of rounds, each round is array of match slots {team1, team2}
 * - seeding: 1 vs N, 2 vs N-1, etc.
 * - simple same-club avoidance: when initial pair is same-club and a swap candidate exists, swap with next seed
 */
export function generateEliminationFixture(
  teams: Team[],
  courtsAvailable = 1,
  matchDurationMinutes = 20
): Fixture[] {
  if (!teams || teams.length === 0) return []

  // sort by seed (lower seed => stronger)
  const sorted = [...teams].sort((a, b) => (a.seed ?? Number.MAX_SAFE_INTEGER) - (b.seed ?? Number.MAX_SAFE_INTEGER))

  const target = nextPowerOfTwo(sorted.length)
  const seeds: (Team | null)[] = new Array(target).fill(null)

  // Place seeds in standard bracket seeding order via recursive pairing list
  // We'll generate an ordering of positions such that seed 1 goes to pos 0, seed 2 to last, seed3 to middle, etc.
  function buildSeedOrder(size: number): number[] {
    if (size === 1) return [0]
    const prev = buildSeedOrder(size / 2)
    const result: number[] = []
    prev.forEach((p) => {
      result.push(p)
      result.push(size - 1 - p)
    })
    return result
  }

  const order = buildSeedOrder(target) // length = target, positions 0..target-1
  for (let i = 0; i < sorted.length; i++) {
    seeds[order[i]] = sorted[i]
  }
  // Remaining positions are byes (null)

  // Try simple same-club avoidance in round 1: if a direct pairing is same-club, try swapping with nearest seed that breaks it
  const tries = (pos: number, maxOffset = 4) => {
    const t = seeds[pos]
    if (!t) return
    for (let off = 1; off <= maxOffset; off++) {
      const otherPos = (pos + off) % target
      if (!seeds[otherPos]) continue
      // candidate swap
      const a = seeds[pos]!
      const b = seeds[otherPos]!
      // check if swapping reduces immediate same-club pairings
      const partnerPos = target - 1 - pos
      const partnerPosOther = target - 1 - otherPos
      const partner = seeds[partnerPos]
      const partnerOther = seeds[partnerPosOther]
      const sameBefore = partner && partner.clubId && a.clubId && partner.clubId === a.clubId
      const sameBeforeOther = partnerOther && partnerOther.clubId && b.clubId && partnerOther.clubId === b.clubId
      const sameAfter = partner && partner.clubId && b.clubId && partner.clubId === b.clubId
      const sameAfterOther = partnerOther && partnerOther.clubId && a.clubId && partnerOther.clubId === a.clubId
      const scoreBefore = (sameBefore ? 1 : 0) + (sameBeforeOther ? 1 : 0)
      const scoreAfter = (sameAfter ? 1 : 0) + (sameAfterOther ? 1 : 0)
      if (scoreAfter < scoreBefore) {
        // swap
        const tmp = seeds[pos]
        seeds[pos] = seeds[otherPos]
        seeds[otherPos] = tmp
        return
      }
    }
  }

  // apply small local swaps to reduce same-club in round 1
  for (let pos = 0; pos < target / 2; pos++) {
    const partnerPos = target - 1 - pos
    const t1 = seeds[pos]
    const t2 = seeds[partnerPos]
    if (t1 && t2 && t1.clubId && t2.clubId && t1.clubId === t2.clubId) {
      tries(pos, 6)
    }
  }

  // Build rounds
  const fixtures: Fixture[] = []
  let roundIndex = 0

  // Round 1 matches
  let currentRoundTeams: (Team | null)[] = [...seeds]
  while (currentRoundTeams.length > 1) {
    const matches: Match[] = []
    const nextRoundSlots: (Team | null)[] = []

    for (let i = 0; i < currentRoundTeams.length; i += 2) {
      const a = currentRoundTeams[i]
      const b = currentRoundTeams[i + 1]

      const team1 = a ?? { id: `bye-${i}`, name: "Bye" }
      const team2 = b ?? { id: `bye-${i + 1}`, name: "Bye" }

      const isBye1 = typeof team1.id === "string" && team1.id.startsWith("bye")
      const isBye2 = typeof team2.id === "string" && team2.id.startsWith("bye")

      // Case: BYE vs BYE -> skip entirely (no match, no placeholder)
      if (isBye1 && isBye2) {
        continue
      }

      // Case: team vs BYE -> auto-advance the real team, no match created
      if (isBye1 && !isBye2) {
        nextRoundSlots.push(team2 as Team)
        continue
      }
      if (!isBye1 && isBye2) {
        nextRoundSlots.push(team1 as Team)
        continue
      }

      // Normal match: both sides are real/placeholder teams
      const matchIdStr = `m-r${roundIndex}-${i / 2}`

      matches.push({
        id: matchIdStr,
        team1,
        team2,
        matchCode: generateMatchCode(),
        durationMinutes: matchDurationMinutes,
        status: "pending",
        round: roundIndex + 1,
      })

      // push placeholder for winner into the next round slots
      nextRoundSlots.push({ id: `winner-${matchIdStr}`, name: `Winner of ${matchIdStr}` })
    }

    // If there are matches in this round, add fixture entry
    if (matches.length > 0) {
      fixtures.push({
        id: `fixture-r${roundIndex}`,
        round: roundIndex + 1,
        matches,
      })
    }

    // Prepare next round teams
    currentRoundTeams = nextRoundSlots
    roundIndex++
  }

  return fixtures
}

/* ---------- Round-Robin (circle method) - fixed ---------- */
export function generateRoundRobinFixture(teams: Team[], courtsAvailable = 1, matchDurationMinutes = 20): Fixture[] {
  if (!teams || teams.length < 2) throw new Error("Need at least 2 teams")
  const sorted = [...teams].sort((a, b) => (a.seed ?? 0) - (b.seed ?? 0))
  const list = sorted.slice()
  const isOdd = list.length % 2 === 1
  if (isOdd) list.push({ id: "bye", name: "Bye" })
  const n = list.length
  const rounds = n - 1
  const fixtures: Fixture[] = []
  let matchId = 0

  // Use circle method: fix index 0, rotate rest to the right by 1 each round
  for (let r = 0; r < rounds; r++) {
    const matches: Match[] = []
    for (let i = 0; i < n / 2; i++) {
      const a = list[i]
      const b = list[n - 1 - i]
      if (a.id !== "bye" && b.id !== "bye") {
        matches.push({
          id: `rr-${r}-${matchId++}`,
          team1: a,
          team2: b,
          matchCode: generateMatchCode(),
          durationMinutes: matchDurationMinutes,
          status: "pending",
          round: r + 1,
          court: (i % courtsAvailable) + 1,
        })
      }
    }
    fixtures.push({ id: `rr-f-${r}`, round: r + 1, matches })
    // rotate (keep index 0 fixed)
    const pivot = list.splice(1, 1)[0]
    list.push(pivot)
  }
  return fixtures
}

/* ---------- Scheduling Engine (courts, rest buffers, no overlap) ---------- */
/**
 * scheduleMatches:
 * - schedules a list of matches greedily across available courts and time slots
 * - ensures teams/players have rest buffer in minutes between matches
 * - tries to keep courts busy: earliest-fit scheduling
 *
 * Input:
 * - matches: matches without time/court (rounds should be ordered)
 * - courtsAvailable: number
 * - startAt: Date (first possible match start)
 * - matchDurationMinutes: number (default)
 * - restBufferMinutes: minimum minutes required between end of one match and start of next for same team
 *
 * Output:
 * - matches with assigned court and time
 */
export function scheduleMatches(
  fixtures: Fixture[],
  courtsAvailable: number,
  startAt: Date,
  matchDurationMinutes = 20,
  restBufferMinutes = 10
): Fixture[] {
  // Maintain per-court next-free-time
  const courtNextFree: Date[] = Array.from({ length: courtsAvailable }, () => new Date(startAt.getTime()))
  // Maintain last match end time per team id
  const teamNextFree = new Map<string, Date>()

  const scheduledFixtures: Fixture[] = []

  for (const fixture of fixtures) {
    const scheduledMatches: Match[] = []

    for (const match of fixture.matches) {
      // candidate earliest start is the earliest court free time
      // but must also satisfy both teams' next free time + rest buffer
      const teamIds = [match.team1.id, match.team2.id].filter(Boolean) as string[]

      // compute earliest time allowed from team constraints
      let earliestFromTeams = new Date(startAt.getTime())
      for (const tId of teamIds) {
        const tNext = teamNextFree.get(tId)
        if (tNext && tNext.getTime() > earliestFromTeams.getTime()) earliestFromTeams = new Date(tNext)
      }

      // Greedy: find court and earliest slot
      let chosenCourt = 0
      let chosenStart: Date | null = null

      // search for earliest slot across courts
      // We will try a reasonable horizon by checking up to, say, 500 slots (safeguard).
      // Usually tournament sizes are small so greedy will succeed quickly.
      const maxAttempts = 500
      let attempts = 0
      let candidateStart = new Date(Math.max(...courtNextFree.map((d) => d.getTime()), earliestFromTeams.getTime()))

      while (attempts < maxAttempts) {
        // find any court free at candidateStart
        let freeCourtIndex = -1
        for (let ci = 0; ci < courtsAvailable; ci++) {
          if (courtNextFree[ci].getTime() <= candidateStart.getTime()) {
            freeCourtIndex = ci
            break
          }
        }
        if (freeCourtIndex >= 0) {
          // double-check teams are free at candidateStart (they might be busy until slightly later)
          let conflict = false
          for (const tId of teamIds) {
            const tNext = teamNextFree.get(tId)
            if (tNext && tNext.getTime() > candidateStart.getTime()) {
              conflict = true
              // move candidateStart forward to that team's free time
              candidateStart = new Date(tNext.getTime())
              break
            }
          }
          if (!conflict) {
            chosenCourt = freeCourtIndex
            chosenStart = new Date(candidateStart)
            break
          }
        }
        // If no court free or conflict, advance candidateStart by small step (e.g., 1 minute)
        candidateStart = new Date(candidateStart.getTime() + 60 * 1000) // +1 minute
        attempts++
      }

      if (!chosenStart) {
        // fallback: put on next free court at courtNextFree min time (shouldn't happen commonly)
        const minCourtIdx = courtNextFree
          .map((d, idx) => ({ d, idx }))
          .sort((a, b) => a.d.getTime() - b.d.getTime())[0].idx
        chosenCourt = minCourtIdx
        chosenStart = new Date(courtNextFree[minCourtIdx])
      }

      const chosenEnd = new Date(chosenStart.getTime() + matchDurationMinutes * 60 * 1000)
      // Apply rest buffer: team cannot have next match start before chosenEnd + restBuffer
      const bufferEnd = new Date(chosenEnd.getTime() + restBufferMinutes * 60 * 1000)

      // assign
      const scheduled: Match = {
        ...match,
        court: chosenCourt + 1, // human-friendly court numbering
        time: chosenStart,
        durationMinutes: matchDurationMinutes,
      }

      // update court next free
      courtNextFree[chosenCourt] = new Date(chosenEnd.getTime())

      // update team next free times
      for (const tId of teamIds) {
        teamNextFree.set(tId, new Date(bufferEnd.getTime()))
      }

      scheduledMatches.push(scheduled)
    }

    // sort scheduledMatches by start time in case we scheduled out of order
    scheduledMatches.sort((a, b) => (a.time!.getTime() - b.time!.getTime()))
    scheduledFixtures.push({ ...fixture, matches: scheduledMatches, scheduledDate: scheduledMatches[0]?.time })
  }

  return scheduledFixtures
}

/* ---------- Advance winner helper (for elimination flow) ---------- */
/**
 * applyResultsAndAdvance:
 * - given fixtures array and a map of completed results, update winners into later fixtures.
 * - results: Record<matchId, { team1Score, team2Score }>
 */
export function applyResultsAndAdvance(fixtures: Fixture[], results: Record<string, { team1Score: number; team2Score: number }>): Fixture[] {
  const matchWinner = new Map<string, Team | { id: string; name: string }>()
  // set winners for completed matches
  for (const f of fixtures) {
    for (const m of f.matches) {
      const res = results[m.id]
      if (res) {
        m.team1Score = res.team1Score
        m.team2Score = res.team2Score
        m.status = "completed"
        const winner = res.team1Score > res.team2Score ? (m.team1 as Team) : (m.team2 as Team)
        matchWinner.set(m.id, winner)
      }
    }
  }

  // propagate winners: replace placeholders like {id: 'winner-m-r0-0', name: 'Winner of ...'} in later fixtures
  for (const f of fixtures) {
    for (const m of f.matches) {
      function resolveSide(side: Team | { id: string; name: string }) {
        if (side && typeof side.id === "string" && side.id.startsWith("winner-")) {
          const winner = matchWinner.get(side.id)
          if (winner) return winner
        }
        return side
      }
      m.team1 = resolveSide(m.team1)
      m.team2 = resolveSide(m.team2)
    }
  }

  return fixtures
}
