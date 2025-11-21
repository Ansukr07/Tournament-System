"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { api } from "@/lib/api"
import type { Event } from "@/shared/types"

// Extend Event type locally to include participantCount if not already present
interface EventWithCount extends Event {
  participantCount?: number;
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventWithCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await api.events.list()
        setEvents(data)
      } catch (error) {
        console.error("[v0] Error fetching events:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const getTypeColor = (type: string) => {
    return type === "knockout" ? "bg-purple-500/10 text-purple-500" : "bg-blue-500/10 text-blue-500"
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2">Events</h1>
            <p className="text-muted-foreground">Browse and register for tournaments</p>
          </div>
          <Button onClick={() => window.location.href = '/admin/dashboard'} className="bg-accent hover:bg-accent/90">Create Event</Button>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event._id} className="p-6 border border-border hover:border-accent transition cursor-pointer" onClick={() => window.location.href = `/events/${event._id}`}>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold">{event.name}</h3>
                    <p className="text-sm text-muted-foreground">{event.category}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(event.type)}`}>
                    {event.type === "knockout" ? "Knockout" : "Round Robin"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Participants</p>
                    {/* Use participantCount if available, otherwise fallback to array length or 0 */}
                    <p className="text-lg font-semibold">{event.participantCount ?? event.participants?.length ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Courts</p>
                    <p className="text-lg font-semibold">{event.courts?.length || 0}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>Match Duration: {event.matchDuration} min</p>
                  <p>Buffer: {event.bufferMinutes} min</p>
                </div>

                <Button className="w-full bg-accent hover:bg-accent/90 text-sm h-9">View Event</Button>
              </div>
            </Card>
          ))}
        </div>

        {events.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No events available</p>
            <Button onClick={() => window.location.href = '/admin/dashboard'} className="bg-accent hover:bg-accent/90">Create First Event</Button>
          </div>
        )}
      </div>
    </div>
  )
}
