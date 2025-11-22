"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { api } from "@/lib/api"
import type { Match } from "@/shared/types"

export default function FixturesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [selectedRound, setSelectedRound] = useState(1)
  const [loading, setLoading] = useState(true)
  const [eventId] = useState("sample-event-id")

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await api.matches.list(eventId)
        setMatches(data)
      } catch (error) {
        console.error("[v0] Error fetching matches:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [eventId])

  const rounds = Array.from(new Set(matches.map((m) => m.round))).sort((a, b) => a - b)
  const roundMatches = matches.filter((m) => m.round === selectedRound)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-500/10 text-blue-500"
      case "live":
        return "bg-green-500/10 text-green-500"
      case "completed":
        return "bg-gray-500/10 text-gray-500"
      default:
        return "bg-muted"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Tournament Fixtures</h1>
          <p className="text-muted-foreground">View and manage all match fixtures</p>
        </div>

        {/* Round Selector */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          {rounds.map((round) => (
            <button
              key={round}
              onClick={() => setSelectedRound(round)}
              className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                selectedRound === round
                  ? "bg-accent text-accent-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              Round {round}
            </button>
          ))}
        </div>

        {/* Fixtures Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roundMatches.map((match) => (
            <Card key={match._id} className="p-6 border border-border hover:border-accent transition">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Round {match.round}</p>
                    <p className="text-sm font-medium">Match {match._id.slice(-4)}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(match.status)}`}>
                    {match.status}
                  </span>
                </div>

                <div className="space-y-2">
                  {match.participants.map((participantId, idx) => (
                    <div key={participantId} className="flex items-center justify-between py-2">
                      <span className="text-sm">Player {idx + 1}</span>
                      {match.winnerId === participantId && <span className="text-xs text-green-500">✓ Winner</span>}
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-border text-xs text-muted-foreground">
                  {match.courtId && <p>Court: {match.courtId}</p>}
                  {match.startTime && <p>Start: {new Date(match.startTime).toLocaleString()}</p>}
                </div>

                <Button className="w-full bg-accent hover:bg-accent/90 text-sm h-8">View Details</Button>
              </div>
            </Card>
          ))}
        </div>

        {roundMatches.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No fixtures for this round</p>
          </div>
        )}
      </div>
    </div>
  )
}
