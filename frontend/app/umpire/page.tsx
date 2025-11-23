"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/navbar"
import { api } from "@/lib/api"

export default function UmpireDashboard() {
  const router = useRouter()
  const [events, setEvents] = useState<any[]>([])
  const [selectedEvent, setSelectedEvent] = useState<string>("")
  const [matches, setMatches] = useState<any[]>([])
  const [selectedMatch, setSelectedMatch] = useState<any>(null)
  const [matchCode, setMatchCode] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    if (selectedEvent) {
      fetchMatches(selectedEvent)
    }
  }, [selectedEvent])

  const fetchEvents = async () => {
    try {
      const data = await api.events.list()
      setEvents(data || [])
    } catch (err) {
      console.error("Error fetching events:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMatches = async (eventId: string) => {
    try {
      const data = await api.events.getMatches(eventId)
      // Filter to show only scheduled matches (not completed)
      const scheduledMatches = data.filter((m: any) =>
        m.status === "scheduled" && !m.winnerId
      )
      setMatches(scheduledMatches || [])
    } catch (err) {
      console.error("Error fetching matches:", err)
    }
  }

  const handleVerifyCode = async () => {
    if (!selectedMatch || !matchCode) {
      setError("Please enter a match code")
      return
    }

    setVerifying(true)
    setError("")

    try {
      const response = await api.matches.verifyCode(selectedMatch._id, matchCode)

      if (response.valid) {
        // Code is valid, navigate to scoring interface
        router.push(`/umpire/scoring?matchId=${selectedMatch._id}&code=${matchCode}`)
      } else {
        setError(response.message || "Invalid match code")
      }
    } catch (err: any) {
      setError(err.message || "Verification failed")
    } finally {
      setVerifying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Umpire Dashboard</h1>
          <p className="text-muted-foreground">Verify match codes and submit results</p>
        </div>

        {/* Event Selection */}
        <Card className="p-6 border border-border mb-6">
          <h2 className="text-lg font-bold mb-4">Select Event</h2>
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">-- Choose an event --</option>
            {events.map((event) => (
              <option key={event._id} value={event._id}>
                {event.name} ({event.type})
              </option>
            ))}
          </select>
        </Card>

        {/* Matches List */}
        {selectedEvent && (
          <Card className="p-6 border border-border mb-6">
            <h2 className="text-lg font-bold mb-4">Scheduled Matches</h2>
            {matches.length === 0 ? (
              <p className="text-muted-foreground text-sm">No scheduled matches available</p>
            ) : (
              <div className="space-y-3">
                {matches.map((match) => (
                  <div
                    key={match._id}
                    onClick={() => {
                      setSelectedMatch(match)
                      setError("")
                      setMatchCode("")
                    }}
                    className={`p-4 border rounded-lg cursor-pointer transition ${selectedMatch?._id === match._id
                        ? "border-accent bg-accent/5"
                        : "border-border hover:bg-accent/5"
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">
                          Match #{match.matchNumber} - Round {match.round}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {match.participants[0]?.teamId?.teamName || "TBD"} vs{" "}
                          {match.participants[1]?.teamId?.teamName || "TBD"}
                        </p>
                        {match.courtId && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Court: {match.courtId} | {match.startTime ? new Date(match.startTime).toLocaleTimeString() : "Time TBD"}
                          </p>
                        )}
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500">
                        {match.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Match Code Verification */}
        {selectedMatch && (
          <Card className="p-6 border border-accent">
            <h2 className="text-lg font-bold mb-4">Verify Match Code</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Selected: Match #{selectedMatch.matchNumber} - {selectedMatch.participants[0]?.teamId?.teamName} vs {selectedMatch.participants[1]?.teamId?.teamName}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Enter Match Code</label>
                <Input
                  value={matchCode}
                  onChange={(e) => setMatchCode(e.target.value.toUpperCase())}
                  placeholder="e.g., 123456"
                  className="bg-card border-border text-lg tracking-wider font-mono"
                  maxLength={8}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Get the match code from the admin before proceeding
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <Button
                onClick={handleVerifyCode}
                disabled={!matchCode || verifying}
                className="w-full bg-accent hover:bg-accent/90 h-11"
              >
                {verifying ? "Verifying..." : "Verify Code & Enter Result"}
              </Button>
            </div>
          </Card>
        )}

        {/* Help Section */}
        <Card className="mt-6 p-4 border border-border bg-blue-500/5">
          <h3 className="text-sm font-semibold text-blue-500 mb-2">How It Works</h3>
          <ol className="list-decimal list-inside space-y-1 text-xs text-blue-500/80">
            <li>Select an event from the dropdown</li>
            <li>Choose the match you're umpiring</li>
            <li>Get the match code from the admin</li>
            <li>Enter the code and click "Verify"</li>
            <li>Declare the winner on the next screen</li>
          </ol>
        </Card>
      </div>
    </div>
  )
}
