"use client"

import { useEffect, useState, use } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { api } from "@/lib/api"
import { initSocket, onEvent, offEvent } from "@/lib/socket"

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const eventId = resolvedParams.id
  const [selectedTab, setSelectedTab] = useState<"overview" | "participants" | "fixtures" | "schedule">("overview")
  const [event, setEvent] = useState<any>(null)
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventData = await api.events.get(eventId)
        setEvent(eventData)
        const matchesData = await api.events.getMatches(eventId)
        setMatches(matchesData)
      } catch (error) {
        console.error("Error fetching event data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()

    // Real-time updates
    initSocket()
    onEvent("matchUpdated", () => {
      api.events.getMatches(eventId).then(setMatches)
    })

    return () => {
      offEvent("matchUpdated")
    }
  }, [eventId])

  const handleGenerateFixtures = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return alert("Please login first")
      await api.events.generateFixtures(eventId, token)
      const matchesData = await api.events.getMatches(eventId)
      setMatches(matchesData)
      alert("Fixtures generated!")
    } catch (e) {
      console.error(e)
      alert("Error generating fixtures")
    }
  }

  const handleSchedule = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return alert("Please login first")
      await api.events.schedule(eventId, token)
      const matchesData = await api.events.getMatches(eventId)
      setMatches(matchesData)
      alert("Schedule generated!")
    } catch (e) {
      console.error(e)
      alert("Error generating schedule")
    }
  }

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>
  if (!event) return <div className="min-h-screen bg-background flex items-center justify-center">Event not found</div>

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{event.name}</h1>
          <p className="text-muted-foreground">
            {event.category} • {event.type === "knockout" ? "Single Elimination" : "Round Robin"}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-4 border border-border">
            <p className="text-muted-foreground text-sm mb-1">Participants</p>
            <p className="text-2xl font-bold">{event.participants?.length || 0}</p>
          </Card>
          <Card className="p-4 border border-border">
            <p className="text-muted-foreground text-sm mb-1">Courts</p>
            <p className="text-2xl font-bold">{event.courts?.length || 0}</p>
          </Card>
          <Card className="p-4 border border-border">
            <p className="text-muted-foreground text-sm mb-1">Match Duration</p>
            <p className="text-2xl font-bold">{event.matchDuration}m</p>
          </Card>
          <Card className="p-4 border border-border">
            <p className="text-muted-foreground text-sm mb-1">Status</p>
            <p className="text-2xl font-bold capitalize text-accent">Active</p>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border">
          {["overview", "participants", "fixtures", "schedule"].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab as typeof selectedTab)}
              className={`px-4 py-2 font-medium border-b-2 -mb-[2px] transition capitalize ${selectedTab === tab
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {selectedTab === "overview" && (
            <Card className="p-6 border border-border">
              <h2 className="text-xl font-bold mb-4">Event Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Buffer Time</p>
                  <p className="font-semibold">{event.bufferMinutes} minutes</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Format</p>
                  <p className="font-semibold">{event.type === "knockout" ? "Single Elimination" : "Round Robin"}</p>
                </div>
              </div>
            </Card>
          )}

          {selectedTab === "participants" && (
            <Card className="p-6 border border-border">
              <h2 className="text-xl font-bold mb-4">Registered Participants</h2>
              <p className="text-muted-foreground text-center py-8">{event.participants?.length || 0} players registered</p>
              <Button className="w-full bg-accent hover:bg-accent/90">Register as Participant</Button>
            </Card>
          )}

          {selectedTab === "fixtures" && (
            <Card className="p-6 border border-border">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Fixtures</h2>
                <Button onClick={handleGenerateFixtures} className="bg-accent hover:bg-accent/90">Generate Fixtures</Button>
              </div>
              {matches.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No fixtures generated yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {matches.map((match: any) => (
                    <div key={match._id} className="p-4 border rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-semibold">Round {match.round}</p>
                        <p className="text-sm text-muted-foreground">
                          {match.participants[0]?.placeholder || match.participants[0]?.playerId?.name || "TBD"} vs{" "}
                          {match.participants[1]?.placeholder || match.participants[1]?.playerId?.name || "TBD"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium capitalize">{match.status}</p>
                        {match.winnerId && <p className="text-xs text-green-500">Winner: {match.winnerId.name}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {selectedTab === "schedule" && (
            <Card className="p-6 border border-border">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Schedule</h2>
                <Button onClick={handleSchedule} className="bg-accent hover:bg-accent/90">Generate Schedule</Button>
              </div>
              {matches.filter((m: any) => m.startTime).length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No schedule generated yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {matches.filter((m: any) => m.startTime).map((match: any) => (
                    <div key={match._id} className="p-4 border rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-semibold">Court: {match.courtId}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(match.startTime).toLocaleTimeString()} - {new Date(match.endTime).toLocaleTimeString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm">
                          {match.participants[0]?.playerId?.name || "TBD"} vs {match.participants[1]?.playerId?.name || "TBD"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
