import type { IMatch } from "../models/Match"
import type { IPlayer } from "../models/Player"

interface BracketNode {
  match: Partial<IMatch> | null
  round: number
  position: number
  children: BracketNode[]
}

export class FixtureEngine {
  // Generate round-robin fixtures
  static generateRoundRobin(participants: IPlayer[], eventId: string): Partial<IMatch>[] {
    const matches: Partial<IMatch>[] = []
    const n = participants.length

    if (n < 2) return matches

    const players = [...participants]
    let round = 1
    const maxRounds = n - 1

    for (let r = 0; r < maxRounds; r++) {
      for (let i = 0; i < Math.floor(n / 2); i++) {
        const p1 = players[i]
        const p2 = players[n - 1 - i]

        if (p1._id !== p2._id) {
          matches.push({
            eventId,
            round,
            participants: [p1._id, p2._id],
            status: "scheduled",
          } as unknown as Partial<IMatch>)
        }
      }
      round++
      // Rotate players (keep first fixed)
      const last = players.pop()
      if (last) players.splice(1, 0, last)
    }

    return matches
  }

  // Generate knockout fixtures with bye allocation
  static generateKnockout(participants: IPlayer[], eventId: string): BracketNode {
    const n = participants.length
    const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(n)))
    const byeCount = nextPowerOf2 - n

    // Shuffle participants deterministically
    const shuffled = this.shuffleWithSeed(participants, Date.now())

    let matchId = 0
    const matches: Map<number, Partial<IMatch>> = new Map()

    // First round with byes
    const position = 0
    const firstRoundMatches = []

    for (let i = 0; i < n; i += 2) {
      if (i + 1 < n) {
        const match: Partial<IMatch> = {
          eventId: eventId as any,
          round: 1,
          participants: [shuffled[i]._id, shuffled[i + 1]._id] as any,
          status: "scheduled",
        }
        firstRoundMatches.push(match)
        matches.set(matchId++, match)
      } else if (byeCount === 0) {
        // Single player, bye to next round
        const match: Partial<IMatch> = {
          eventId: eventId as any,
          round: 1,
          participants: [shuffled[i]._id] as any,
          status: "scheduled",
        }
        firstRoundMatches.push(match)
        matches.set(matchId++, match)
      }
    }

    // Build bracket tree
    const bracket = this.buildBracketTree(firstRoundMatches, 1)
    return bracket
  }

  private static shuffleWithSeed(array: IPlayer[], seed: number): IPlayer[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor((seed * (i + 1)) % (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  private static buildBracketTree(matches: Partial<IMatch>[], round: number): BracketNode {
    if (matches.length === 0) {
      return { match: null, round, position: 0, children: [] }
    }

    if (matches.length === 1) {
      return { match: matches[0], round, position: 0, children: [] }
    }

    const children: BracketNode[] = []
    for (let i = 0; i < matches.length; i += 2) {
      const child1 = { match: matches[i], round, position: i, children: [] }
      const child2 = matches[i + 1]
        ? { match: matches[i + 1], round, position: i + 1, children: [] }
        : { match: null, round, position: i + 1, children: [] }
      children.push(child1, child2)
    }

    const parentMatch: Partial<IMatch> = {
      round: round + 1,
      status: "scheduled",
    }

    return { match: parentMatch, round: round + 1, position: 0, children }
  }
}
