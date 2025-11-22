"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { api } from "@/lib/api"
import Link from "next/link"

interface DashboardStats {
  totalEvents: number
  activeEvents: number
  totalPlayers: number
  upcomingMatches: number
}

interface EventSummary {
  _id: string
  name: string
  status: string
  startDate?: string
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    activeEvents: 0,
    totalPlayers: 0,
    upcomingMatches: 0,
  })
  const [recentEvents, setRecentEvents] = useState<EventSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('[Dashboard] Fetching stats...')
        const [eventsRes, teamsRes] = await Promise.all([
          api.events.list(),
          api.teams.list()
        ])

        console.log('[Dashboard] Events received:', eventsRes)
        console.log('[Dashboard] Teams received:', teamsRes)

        // Fetch all matches to count upcoming ones
        let upcomingCount = 0
        if (eventsRes && Array.isArray(eventsRes)) {
          for (const event of eventsRes) {
            try {
              const matchesRes = await api.events.getMatches(event._id)
              if (matchesRes && Array.isArray(matchesRes)) {
                upcomingCount += matchesRes.filter((m: any) =>
                  m.status === "scheduled" || m.status === "pending"
                ).length
              }
            } catch (err) {
              console.error(`[Dashboard] Error fetching matches for event ${event._id}:`, err)
            }
          }
        }

        const events = Array.isArray(eventsRes) ? eventsRes : []
        const teams = Array.isArray(teamsRes) ? teamsRes : []

        setStats({
          totalEvents: events.length,
          activeEvents: events.filter((e: any) => e.status === "active").length,
          totalPlayers: teams.length, // Showing teams count in "Total Players" card
          upcomingMatches: upcomingCount,
        })

        // Sort by creation date and take top 5
        setRecentEvents(events.slice(0, 5))

        console.log('[Dashboard] Stats updated:', {
          totalEvents: events.length,
          activeEvents: events.filter((e: any) => e.status === "active").length,
          totalTeams: teams.length,
          upcomingMatches: upcomingCount
        })
      } catch (error) {
        console.error("[Dashboard] Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of all tournaments and operations</p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 border border-border hover:border-accent transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Events</p>
                <p className="text-3xl font-bold">{stats.totalEvents}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <span className="text-xl">🎯</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-border hover:border-accent transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Events</p>
                <p className="text-3xl font-bold">{stats.activeEvents}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <span className="text-xl">⚡</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-border hover:border-accent transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Teams</p>
                <p className="text-3xl font-bold">{stats.totalPlayers}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <span className="text-xl">👥</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-border hover:border-accent transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Upcoming Matches</p>
                <p className="text-3xl font-bold">{stats.upcomingMatches}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <span className="text-xl">🏆</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <Card className="p-6 border border-border h-full">
              <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
              <div className="space-y-4">
                <Button
                  className="w-full bg-accent hover:bg-accent/90 h-12 text-lg"
                  onClick={() => router.push('/admin/create-event')}
                >
                  + Create New Event
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-12 text-lg"
                  onClick={() => router.push('/events')}
                >
                  View All Events
                </Button>
              </div>
            </Card>
          </div>

          {/* Event Management */}
          <div className="lg:col-span-2">
            <Card className="p-6 border border-border">
              <h2 className="text-xl font-bold mb-6">Recent Events Management</h2>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-muted-foreground">Loading events...</p>
                ) : recentEvents.length === 0 ? (
                  <p className="text-muted-foreground">No events found. Create one to get started!</p>
                ) : (
                  recentEvents.map((event) => (
                    <div
                      key={event._id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/5 transition"
                    >
                      <div>
                        <h3 className="font-bold text-lg">{event.name}</h3>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 bg-accent/10 text-accent rounded-full uppercase font-semibold">
                            {event.status}
                          </span>
                          {event.startDate && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(event.startDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/teams/register?eventId=${event._id}`)}
                        >
                          Add Team
                        </Button>
                        <Button
                          size="sm"
                          className="bg-accent hover:bg-accent/90"
                          onClick={() => router.push(`/events/${event._id}`)}
                        >
                          Manage
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-6 text-center">
                <Link href="/events" className="text-sm text-muted-foreground hover:text-accent">
                  View all events →
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
