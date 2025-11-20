"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { api } from "@/lib/api"

export default function GenerateFixturesPage() {
  const [eventId, setEventId] = useState("")
  const [fixtureType, setFixtureType] = useState<"knockout" | "round_robin">("knockout")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [matchCount, setMatchCount] = useState(0)

  const handleGenerate = async () => {
    if (!eventId) return

    setLoading(true)
    try {
      const result = await api.events.generateFixtures(eventId)
      setMatchCount(result.matches?.length || 0)
      setSuccess(true)
    } catch (error) {
      console.error("[v0] Error generating fixtures:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Generate Fixtures</h1>
          <p className="text-muted-foreground">Create tournament bracket structure</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 border border-border">
            <h2 className="text-lg font-bold mb-6">Configuration</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Event ID</label>
                <input
                  type="text"
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  placeholder="Enter event ID"
                  className="w-full px-4 py-2 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Fixture Type</label>
                <select
                  value={fixtureType}
                  onChange={(e) => setFixtureType(e.target.value as any)}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="knockout">Knockout (Single Elimination)</option>
                  <option value="round_robin">Round Robin</option>
                </select>
              </div>

              <Button
                onClick={handleGenerate}
                className="w-full bg-accent hover:bg-accent/90"
                disabled={!eventId || loading}
              >
                {loading ? "Generating..." : "Generate Fixtures"}
              </Button>
            </div>
          </Card>

          {success && (
            <Card className="p-6 border border-green-500/50 bg-green-500/5">
              <div className="space-y-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 mx-auto">
                  <span className="text-green-500 text-xl">✓</span>
                </div>
                <h3 className="text-lg font-bold text-center">Fixtures Generated</h3>
                <div className="text-center">
                  <p className="text-3xl font-bold text-accent">{matchCount}</p>
                  <p className="text-sm text-muted-foreground">total matches created</p>
                </div>
                <div className="pt-4 space-y-2">
                  <div className="p-3 rounded-lg bg-card border border-border text-sm">
                    <p className="font-semibold mb-1">Next Steps:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-xs">
                      <li>Schedule matches across courts</li>
                      <li>Generate match codes for umpires</li>
                      <li>Send notifications to participants</li>
                    </ul>
                  </div>
                  <Button className="w-full bg-accent hover:bg-accent/90 text-sm h-9">Proceed to Scheduling</Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Info Section */}
        <Card className="mt-6 p-6 border border-border">
          <h3 className="font-bold mb-3">How Fixtures Are Generated</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Knockout:</strong> Single elimination bracket avoiding same-club
              matchups in early rounds with intelligent bye allocation based on power-of-2 requirements.
            </p>
            <p>
              <strong className="text-foreground">Round Robin:</strong> Each participant plays every other participant
              once, deterministically seeded for fairness and consistency.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
