"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { initSocket, onEvent, offEvent } from "@/lib/socket"

interface UmpireMatch {
  id: string
  round: number
  court: string
  participant1: string
  participant2: string
  scheduledTime: string
  status: "scheduled" | "live" | "completed"
  matchCode?: string
}

export default function UmpireMatchesPage() {
  const [matches, setMatches] = useState<UmpireMatch[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize socket for real-time updates
    const socket = initSocket()

    // Mock matches data
    const mockMatches: UmpireMatch[] = [
      {
        id: "match-1",
        round: 1,
        court: "Court 1",
        participant1: "Player A",
        participant2: "Player B",
        scheduledTime: "10:00 AM",
        status: "scheduled",
      },
      {
        id: "match-2",
        round: 1,
        court: "Court 2",
        participant1: "Player C",
        participant2: "Player D",
        scheduledTime: "10:30 AM",
        status: "scheduled",
      },
    ]
    setMatches(mockMatches)
    setLoading(false)

    // Listen for match updates
    onEvent("matchUpdated", (data) => {
      console.log("[v0] Match updated:", data)
      setMatches((prev) => prev.map((m) => (m.id === data.matchId ? { ...m, ...data } : m)))
    })

    return () => {
      offEvent("matchUpdated")
    }
  }, [])

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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Matches</h1>
          <p className="text-muted-foreground">Assigned matches requiring verification and scoring</p>
        </div>

        {/* Matches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <Card key={match.id} className="p-6 border border-border hover:border-accent transition">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Round {match.round}</p>
                    <p className="font-semibold">{match.court}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold capitalize ${getStatusColor(match.status)}`}
                  >
                    {match.status}
                  </span>
                </div>

                <div className="space-y-2 py-3 border-y border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{match.participant1}</span>
                    <span className="text-xs text-muted-foreground">vs</span>
                    <span className="text-sm font-medium">{match.participant2}</span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  <p>Scheduled: {match.scheduledTime}</p>
                </div>

                <Button className="w-full bg-accent hover:bg-accent/90 text-sm h-9">
                  {match.status === "completed" ? "View Result" : "Verify & Score"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
