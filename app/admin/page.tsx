"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { initSocket, onEvent, offEvent } from "@/lib/socket"

interface DashboardData {
  totalEvents: number
  activeEvents: number
  totalPlayers: number
  upcomingMatches: number
  totalMatches: number
  completedMatches: number
}

export default function AdminPage() {
  const [data, setData] = useState<DashboardData>({
    totalEvents: 0,
    activeEvents: 0,
    totalPlayers: 0,
    upcomingMatches: 0,
    totalMatches: 0,
    completedMatches: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize socket for real-time updates
    const socket = initSocket()

    // Mock initial data
    const mockData: DashboardData = {
      totalEvents: 8,
      activeEvents: 3,
      totalPlayers: 256,
      upcomingMatches: 24,
      totalMatches: 128,
      completedMatches: 45,
    }
    setData(mockData)
    setLoading(false)

    // Listen for dashboard updates
    onEvent("leaderboardUpdated", (updatedData) => {
      console.log("[v0] Dashboard updated:", updatedData)
      setData((prev) => ({ ...prev, ...updatedData }))
    })

    return () => {
      offEvent("leaderboardUpdated")
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage all tournaments, players, and matches in real-time</p>
        </div>

        {/* Key Metrics Grid - 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 border border-border hover:border-accent transition cursor-pointer">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Events</p>
                <p className="text-4xl font-bold">{data.totalEvents}</p>
                <p className="text-xs text-green-500 mt-2">{data.activeEvents} active</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-border hover:border-accent transition cursor-pointer">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Players</p>
                <p className="text-4xl font-bold">{data.totalPlayers}</p>
                <p className="text-xs text-muted-foreground mt-2">Registered</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-border hover:border-accent transition cursor-pointer">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Matches Status</p>
                <p className="text-4xl font-bold">{data.completedMatches}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {data.completedMatches} of {data.totalMatches} completed
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Admin Actions Grid - 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 border border-border hover:border-accent transition">
            <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
            <div className="flex flex-col gap-3">
              <Button className="w-full bg-accent hover:bg-accent/90 text-sm h-9">Create New Event</Button>
              <Button variant="outline" className="w-full text-sm h-9 bg-transparent">
                Manage Players
              </Button>
              <Button variant="outline" className="w-full text-sm h-9 bg-transparent">
                Generate Fixtures
              </Button>
            </div>
          </Card>

          <Card className="p-6 border border-border hover:border-accent transition">
            <h3 className="text-lg font-bold mb-4">Event Management</h3>
            <div className="flex flex-col gap-3">
              <Button variant="outline" className="w-full text-sm h-9 bg-transparent">
                View All Events
              </Button>
              <Button variant="outline" className="w-full text-sm h-9 bg-transparent">
                Generate Schedules
              </Button>
              <Button variant="outline" className="w-full text-sm h-9 bg-transparent">
                Generate Match Codes
              </Button>
            </div>
          </Card>

          <Card className="p-6 border border-border hover:border-accent transition">
            <h3 className="text-lg font-bold mb-4">Reports & Analytics</h3>
            <div className="flex flex-col gap-3">
              <Button variant="outline" className="w-full text-sm h-9 bg-transparent">
                View Leaderboard
              </Button>
              <Button variant="outline" className="w-full text-sm h-9 bg-transparent">
                Match Results
              </Button>
              <Button variant="outline" className="w-full text-sm h-9 bg-transparent">
                Player Statistics
              </Button>
            </div>
          </Card>
        </div>

        {/* Active Events List Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 border border-border">
            <h3 className="text-lg font-bold mb-4">Active Events</h3>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex justify-between items-start pb-3 border-b border-border/50 last:border-0">
                  <div>
                    <p className="font-medium text-sm">Spring Championship</p>
                    <p className="text-xs text-muted-foreground">32 players • 4 courts</p>
                  </div>
                  <span className="px-2 py-1 rounded text-xs bg-green-500/10 text-green-500 font-semibold">Live</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 border border-border">
            <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {[
                "Match result submitted - Alex vs Sarah",
                "32 players registered - Spring Championship",
                "Fixtures generated - Summer League",
              ].map((activity, i) => (
                <div key={i} className="flex items-start gap-3 pb-3 border-b border-border/50 last:border-0">
                  <span className="text-xs text-muted-foreground pt-1">•</span>
                  <div>
                    <p className="text-sm">{activity}</p>
                    <p className="text-xs text-muted-foreground">{2 + i}h ago</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Detailed Statistics Grid */}
        <Card className="p-6 border border-border">
          <h3 className="text-lg font-bold mb-6">Event Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Matches", value: data.totalMatches, color: "bg-blue-500/10" },
              { label: "Completed", value: data.completedMatches, color: "bg-green-500/10" },
              { label: "Upcoming", value: data.upcomingMatches, color: "bg-yellow-500/10" },
              {
                label: "In Progress",
                value: data.totalMatches - data.completedMatches - data.upcomingMatches,
                color: "bg-purple-500/10",
              },
            ].map((stat, i) => (
              <div key={i} className={`p-4 rounded-lg ${stat.color}`}>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
