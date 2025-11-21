"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import type { Event } from "@/shared/types"

// Extend Event type locally to include participantCount if not already present
interface EventWithCount extends Event {
  participantCount?: number;
}

export function EventsGrid() {
  const [events, setEvents] = useState<EventWithCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEvents() {
      try {
        const data = await api.events.list()

        // Take only the top 3 events
        const topThree = data.slice(0, 3)

        setEvents(topThree)
      } catch (error) {
        console.error("[v0] Error fetching top events:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  if (loading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-2">Upcoming Tournaments</h2>
          <p className="text-muted-foreground mb-6">Loading events...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card/50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-2">Upcoming Tournaments</h2>
          <p className="text-muted-foreground">Join tournaments and compete with athletes worldwide</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card
              key={event._id}
              className="border border-border bg-background hover:border-accent/50 transition cursor-pointer group"
              onClick={() => (window.location.href = `/events/${event._id}`)}
            >
              <div className="p-6">
                <div className="mb-4">
                  <span className="inline-block px-2 py-1 bg-accent/20 text-accent text-xs font-semibold rounded">
                    {(event.status || "upcoming").toUpperCase()}
                  </span>
                </div>

                <h3 className="text-lg font-bold mb-2 group-hover:text-accent transition">
                  {event.name}
                </h3>

                <p className="text-sm text-muted-foreground mb-4">
                  {event.type || "Not Specified"}
                </p>

                <div className="space-y-2 mb-6 text-sm">
                  <p>
                    <span className="text-muted-foreground">Category:</span>{" "}
                    {event.category || 0}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Participants:</span>{" "}
                    {event.participantCount ??
                      event.participants?.length ??
                      0}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Courts:</span>{" "}
                    {event.courts?.length || 0}
                  </p>
                </div>

                <Button className="w-full bg-accent hover:bg-accent/90" size="sm">
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
