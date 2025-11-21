"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { initSocket, onEvent, offEvent } from "@/lib/socket"

interface Standing {
  playerId: string
  playerName: string
  wins: number
  losses: number
  points: number
  matchesPlayed: number
}

export default function LeaderboardPage() {
  const [standings, setStandings] = useState<Standing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize socket
    const socket = initSocket()

    // Mock initial standings - replace with API call
    const mockStandings: Standing[] = [
      { playerId: "1", playerName: "Alex Johnson", wins: 5, losses: 1, points: 150, matchesPlayed: 6 },
      { playerId: "2", playerName: "Sarah Chen", wins: 4, losses: 2, points: 130, matchesPlayed: 6 },
      { playerId: "3", playerName: "Marcus Williams", wins: 3, losses: 3, points: 110, matchesPlayed: 6 },
      { playerId: "4", playerName: "Emily Rodriguez", wins: 2, losses: 4, points: 80, matchesPlayed: 6 },
    ]
    setStandings(mockStandings)
    setLoading(false)

    // Listen for leaderboard updates
    onEvent("leaderboardUpdated", (data) => {
      console.log("[v0] Leaderboard updated:", data)
      setStandings((prev) =>
        prev.map((s) => (s.playerId === data.playerId ? { ...s, ...data } : s)).sort((a, b) => b.points - a.points),
      )
    })

    return () => {
      offEvent("leaderboardUpdated")
    }
  }, [])

  const sortedStandings = [...standings].sort((a, b) => b.points - a.points)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Global Leaderboard (Demo)</h1>
          <p className="text-muted-foreground">Real-time tournament standings updated live</p>
        </div>

        {/* Leaderboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top 3 Podium */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {sortedStandings.slice(0, 3).map((standing, idx) => {
                const medals = ["🥇", "🥈", "🥉"]
                return (
                  <Card
                    key={standing.playerId}
                    className={`p-6 border text-center ${idx === 0
                        ? "border-yellow-500/50 bg-yellow-500/5 md:row-span-2 md:flex md:flex-col md:justify-center"
                        : "border-border"
                      }`}
                  >
                    <p className="text-3xl mb-2">{medals[idx]}</p>
                    <p className="text-2xl font-bold mb-1">#{idx + 1}</p>
                    <p className="font-semibold text-lg mb-3">{standing.playerName}</p>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>
                        <span className="text-foreground font-bold">{standing.wins}W</span> -{" "}
                        <span className="text-foreground font-bold">{standing.losses}L</span>
                      </p>
                      <p className="text-xl font-bold text-accent">{standing.points} pts</p>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Full Standings Table */}
          <div className="lg:col-span-3">
            <Card className="border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-card">
                      <th className="text-left px-6 py-4 font-semibold">Rank</th>
                      <th className="text-left px-6 py-4 font-semibold">Player</th>
                      <th className="text-center px-6 py-4 font-semibold">Wins</th>
                      <th className="text-center px-6 py-4 font-semibold">Losses</th>
                      <th className="text-center px-6 py-4 font-semibold">Played</th>
                      <th className="text-right px-6 py-4 font-semibold">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedStandings.map((standing, idx) => (
                      <tr key={standing.playerId} className="border-b border-border/50 hover:bg-card/50 transition">
                        <td className="px-6 py-4">
                          <span className="font-bold text-accent text-lg">#{idx + 1}</span>
                        </td>
                        <td className="px-6 py-4 font-medium">{standing.playerName}</td>
                        <td className="px-6 py-4 text-center text-green-500 font-semibold">{standing.wins}</td>
                        <td className="px-6 py-4 text-center text-red-500 font-semibold">{standing.losses}</td>
                        <td className="px-6 py-4 text-center text-muted-foreground">{standing.matchesPlayed}</td>
                        <td className="px-6 py-4 text-right font-bold text-accent">{standing.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
