"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const mockEvents = [
  {
    id: 1,
    name: "Spring Athletics Championship",
    location: "National Stadium",
    startDate: "Apr 4-6",
    participants: 32,
    status: "upcoming",
  },
  {
    id: 2,
    name: "Summer League Finals",
    location: "Ansin Sports Complex",
    startDate: "May 2-4",
    participants: 64,
    status: "upcoming",
  },
  {
    id: 3,
    name: "Regional Qualifiers",
    location: "Franklin Field",
    startDate: "May 31 - Jun 1",
    participants: 48,
    status: "registration",
  },
]

export function EventsGrid() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card/50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-2">Upcoming Tournaments</h2>
          <p className="text-muted-foreground">Join tournaments and compete with athletes worldwide</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {mockEvents.map((event) => (
            <Card
              key={event.id}
              className="border border-border bg-background hover:border-accent/50 transition cursor-pointer group"
            >
              <div className="p-6">
                <div className="mb-4">
                  <span className="inline-block px-2 py-1 bg-accent/20 text-accent text-xs font-semibold rounded">
                    {event.status.toUpperCase()}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-accent transition">{event.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{event.location}</p>

                <div className="space-y-2 mb-6">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Dates:</span> {event.startDate}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Participants:</span> {event.participants}
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
