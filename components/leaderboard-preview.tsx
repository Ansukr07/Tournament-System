"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const leaderboardData = [
  { rank: 1, athlete: "Alex Johnson", wins: 12, losses: 2, points: 3400 },
  { rank: 2, athlete: "Sarah Chen", wins: 11, losses: 3, points: 3250 },
  { rank: 3, athlete: "Marcus Williams", wins: 10, losses: 4, points: 3100 },
  { rank: 4, athlete: "Emma Davis", wins: 9, losses: 5, points: 2950 },
  { rank: 5, athlete: "James Rodriguez", wins: 8, losses: 6, points: 2800 },
]

export function LeaderboardPreview() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-2">Global Rankings</h2>
          <p className="text-muted-foreground">See where the top athletes stand</p>
        </div>

        <Card className="border border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-4 font-semibold text-sm">Rank</th>
                  <th className="text-left px-6 py-4 font-semibold text-sm">Athlete</th>
                  <th className="text-left px-6 py-4 font-semibold text-sm">Wins</th>
                  <th className="text-left px-6 py-4 font-semibold text-sm">Losses</th>
                  <th className="text-left px-6 py-4 font-semibold text-sm">Points</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((row) => (
                  <tr key={row.rank} className="border-b border-border/50 hover:bg-card/50 transition">
                    <td className="px-6 py-4">
                      <span className="font-bold text-accent">{row.rank}</span>
                    </td>
                    <td className="px-6 py-4 font-medium">{row.athlete}</td>
                    <td className="px-6 py-4 text-muted-foreground">{row.wins}</td>
                    <td className="px-6 py-4 text-muted-foreground">{row.losses}</td>
                    <td className="px-6 py-4 font-bold">{row.points}</td>
                  </tr>
                ))}
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
