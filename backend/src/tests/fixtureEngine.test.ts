import { FixtureEngine } from "../services/fixtureEngine"
import type { IPlayer } from "../models/Player"

describe("FixtureEngine", () => {
  const mockPlayers: IPlayer[] = [
    { _id: "1", name: "Player 1", uniqueId: "P1", clubId: "C1" } as any,
    { _id: "2", name: "Player 2", uniqueId: "P2", clubId: "C1" } as any,
    { _id: "3", name: "Player 3", uniqueId: "P3", clubId: "C2" } as any,
    { _id: "4", name: "Player 4", uniqueId: "P4", clubId: "C2" } as any,
  ]

  test("Generate round-robin fixtures", () => {
    const matches = FixtureEngine.generateRoundRobin(mockPlayers, "event1")
    expect(matches.length).toBe(6) // (n-1)*n/2 = 3*4/2 = 6
    expect(matches.every((m) => m.participants?.length === 2)).toBe(true)
  })

  test("Generate knockout fixtures", () => {
    const bracket = FixtureEngine.generateKnockout(mockPlayers, "event1")
    expect(bracket.match).toBeDefined()
    expect(bracket.children.length).toBeGreaterThan(0)
  })

  test("Generate fixtures with odd number of participants", () => {
    const oddPlayers = mockPlayers.slice(0, 3)
    const matches = FixtureEngine.generateRoundRobin(oddPlayers, "event1")
    expect(matches.length).toBeGreaterThan(0)
  })
})
