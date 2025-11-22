"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"

interface LeaderboardEntry {
  _id: string
  teamName: string
  clubName: string
  wins: number
}

export function LeaderboardPreview() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await api.teams.leaderboard()
        setLeaderboard(data)
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  if (loading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-2">Global Rankings</h2>
          <p className="text-muted-foreground mb-12">Loading rankings...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-2">Global Rankings</h2>
          <p className="text-muted-foreground">See where the top teams stand</p>
        </div>

        <Card className="border border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-4 font-semibold text-sm">Rank</th>
                  <th className="text-left px-6 py-4 font-semibold text-sm">Team</th>
                  <th className="text-left px-6 py-4 font-semibold text-sm">Club</th>
                  <th className="text-left px-6 py-4 font-semibold text-sm">Wins</th>
                  <th className="text-left px-6 py-4 font-semibold text-sm">Points</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      No rankings available yet. Complete some matches to see the leaderboard!
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((row, index) => (
                    <tr key={row._id} className="border-b border-border/50 hover:bg-card/50 transition">
                      <td className="px-6 py-4">
                        <span className="font-bold text-accent">{index + 1}</span>
                      </td>
                      <td className="px-6 py-4 font-medium">{row.teamName}</td>
                      <td className="px-6 py-4 text-muted-foreground">{row.clubName}</td>
                      <td className="px-6 py-4 font-bold">{row.wins}</td>
                      <td className="px-6 py-4 font-bold text-accent">{row.wins * 10}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-border p-6 flex justify-center">
            <Button variant="outline">View Full Leaderboard</Button>
          </div>
        </Card>
      </div>
    </section>
  )
}
