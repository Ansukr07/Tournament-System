"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { api } from "@/lib/api"
import type { Match } from "@/shared/types"

export default function SchedulePage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [courts, setCourts] = useState(new Map<string, Match[]>())
  const [loading, setLoading] = useState(true)
  const [eventId] = useState("sample-event-id")

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const data = await api.matches.list(eventId)
        setMatches(data)

        // Group matches by court
        const courtMap = new Map<string, Match[]>()
        data.forEach((match: Match) => {
          const courtId = match.courtId || "unscheduled"
          if (!courtMap.has(courtId)) {
            courtMap.set(courtId, [])
          }
          courtMap.get(courtId)!.push(match)
        })

        // Sort matches by start time
        courtMap.forEach((matches) => {
          matches.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        })

        setCourts(courtMap)
      } catch (error) {
        console.error("[v0] Error fetching schedule:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSchedule()
  }, [eventId])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Court Schedule</h1>
          <p className="text-muted-foreground">Real-time match scheduling across all courts</p>
        </div>

        {/* Court Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from(courts.entries()).map(([courtId, courtMatches]) => (
            <Card key={courtId} className="p-6 border border-border">
              <h2 className="text-lg font-bold mb-4">
                {courtId === "unscheduled" ? "Unscheduled" : `Court ${courtId}`}
              </h2>

              <div className="space-y-3">
                {courtMatches.map((match) => (
                  <div
                    key={match._id}
                    className="p-3 rounded-lg bg-card border border-border/50 hover:border-accent transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-medium">Match {match._id.slice(-4)}</p>
                      <span className="text-xs px-2 py-1 rounded bg-accent/20 text-accent">Round {match.round}</span>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1">
                      {match.startTime && <p>Start: {new Date(match.startTime).toLocaleTimeString()}</p>}
                      {match.endTime && <p>End: {new Date(match.endTime).toLocaleTimeString()}</p>}
                      <p className="capitalize">Status: {match.status}</p>
                    </div>
                  </div>
                ))}

                {courtMatches.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No matches scheduled</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
