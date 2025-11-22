"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { api } from "@/lib/api"

export default function GenerateSchedulePage() {
  const [eventId, setEventId] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [scheduleStats, setScheduleStats] = useState({
    totalMatches: 0,
    courtsUsed: 0,
    totalDuration: 0,
  })

  const handleSchedule = async () => {
    if (!eventId) return

    setLoading(true)
    try {
      const result = await api.events.schedule(eventId)
      setScheduleStats({
        totalMatches: result.scheduled?.length || 0,
        courtsUsed: new Set(result.scheduled?.map((m: any) => m.courtId)).size || 0,
        totalDuration: result.scheduled?.[result.scheduled.length - 1]?.endTime
          ? new Date(result.scheduled[result.scheduled.length - 1].endTime).getTime() -
            new Date(result.scheduled[0].startTime).getTime()
          : 0,
      })
      setSuccess(true)
    } catch (error) {
      console.error("[v0] Error scheduling matches:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Generate Schedule</h1>
          <p className="text-muted-foreground">Allocate matches to courts with optimal timing</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 border border-border">
            <h2 className="text-lg font-bold mb-6">Scheduling Configuration</h2>
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

              <div className="p-3 rounded-lg bg-card border border-border text-sm space-y-2">
                <p className="font-semibold">Scheduling Rules:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-xs">
                  <li>No player overlap between courts</li>
                  <li>Minimum rest interval enforced</li>
                  <li>Courts distributed evenly</li>
                  <li>Auto-adjust for late endings</li>
                </ul>
              </div>

              <Button
                onClick={handleSchedule}
                className="w-full bg-accent hover:bg-accent/90"
                disabled={!eventId || loading}
              >
                {loading ? "Generating Schedule..." : "Generate Schedule"}
              </Button>
            </div>
          </Card>

          {success && (
            <Card className="p-6 border border-green-500/50 bg-green-500/5">
              <div className="space-y-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 mx-auto">
                  <span className="text-green-500 text-xl">✓</span>
                </div>
                <h3 className="text-lg font-bold text-center">Schedule Generated</h3>

                <div className="grid grid-cols-1 gap-3">
                  <div className="p-3 rounded-lg bg-card border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Total Matches</p>
                    <p className="text-2xl font-bold text-accent">{scheduleStats.totalMatches}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-card border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Courts Used</p>
                    <p className="text-2xl font-bold text-accent">{scheduleStats.courtsUsed}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-card border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Duration</p>
                    <p className="text-2xl font-bold text-accent">{Math.round(scheduleStats.totalDuration / 60000)}h</p>
                  </div>
                </div>

                <Button className="w-full bg-accent hover:bg-accent/90 text-sm h-9">View Full Schedule</Button>
              </div>
            </Card>
          )}
        </div>

        {/* Algorithm Info */}
        <Card className="mt-6 p-6 border border-border">
          <h3 className="font-bold mb-3">Smart Scheduling Algorithm</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Our scheduling engine allocates matches to courts intelligently, minimizing wait times while respecting
              all constraints:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong className="text-foreground">Court Optimization:</strong> Distributes load across all courts to
                minimize idle time
              </li>
              <li>
                <strong className="text-foreground">Player Scheduling:</strong> Ensures no player has overlapping
                matches
              </li>
              <li>
                <strong className="text-foreground">Rest Periods:</strong> Enforces minimum buffer time between player
                matches
              </li>
              <li>
                <strong className="text-foreground">Dynamic Adjustment:</strong> Auto-adjusts subsequent matches if
                previous ones end late
              </li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  )
}
