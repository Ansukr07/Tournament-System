"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { api } from "@/lib/api"

interface DashboardStats {
  totalEvents: number
  activeEvents: number
  totalPlayers: number
  upcomingMatches: number
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    activeEvents: 0,
    totalPlayers: 0,
    upcomingMatches: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [events, players] = await Promise.all([api.events.list(), api.players.list()])
        setStats({
          totalEvents: events.length,
          activeEvents: events.filter((e: any) => e.status === "active").length,
          totalPlayers: players.length,
          upcomingMatches: 0,
        })
      } catch (error) {
        console.error("[v0] Error fetching stats:", error)
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
                <p className="text-sm text-muted-foreground mb-1">Total Players</p>
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

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 border border-border">
            <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
            <div className="flex flex-col gap-3">
              <Button
                className="w-full bg-accent hover:bg-accent/90"
                onClick={() => router.push('/admin/create-event')}
              >
                Create New Event
              </Button>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => router.push('/players')}
              >
                Manage Players
              </Button>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => router.push('/fixtures')}
              >
                View All Fixtures
              </Button>
            </div>
          </Card>

          <Card className="p-6 border border-border">
            <h2 className="text-lg font-bold mb-4">Event Management</h2>
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => router.push('/admin/fixtures/generate')}
              >
                Generate Fixtures
              </Button>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => router.push('/admin/schedule/generate')}
              >
                Schedule Matches
              </Button>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => router.push('/admin/match-codes/generate')}
              >
                Generate Match Codes
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
