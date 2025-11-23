"use client"

import { useEffect, useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navbar } from "@/components/navbar"
import { api } from "@/lib/api"
import type { Event } from "@/shared/types"
import { Search, X, Filter } from "lucide-react"

// Extend Event type locally to include participantCount if not already present
interface EventWithCount extends Event {
  participantCount?: number;
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventWithCount[]>([])
  const [loading, setLoading] = useState(true)

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "knockout" | "round_robin">("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

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

  // Get unique categories from events
  const uniqueCategories = useMemo(() => {
    const categories = events.map(event => event.category).filter(Boolean)
    return Array.from(new Set(categories))
  }, [events])

  // Filter events based on search term, type, and category
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Search filter (name or category)
      const matchesSearch = searchTerm === "" ||
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.category?.toLowerCase().includes(searchTerm.toLowerCase())

      // Type filter
      const matchesType = typeFilter === "all" || event.type === typeFilter

      // Category filter
      const matchesCategory = categoryFilter === "all" || event.category === categoryFilter

      return matchesSearch && matchesType && matchesCategory
    })
  }, [events, searchTerm, typeFilter, categoryFilter])

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("")
    setTypeFilter("all")
    setCategoryFilter("all")
  }

  const hasActiveFilters = searchTerm !== "" || typeFilter !== "all" || categoryFilter !== "all"

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

        {/* Filter Section */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="w-4 h-4" />
            <span>Filter Events</span>
            {hasActiveFilters && (
              <span className="ml-2 text-accent">({filteredEvents.length} of {events.length} events)</span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Tournament Type Filter */}
            <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Tournament Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="knockout">Knockout</SelectItem>
                <SelectItem value="round_robin">Round Robin</SelectItem>
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full sm:w-auto"
              >
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Results Count */}
        {!loading && (
          <div className="mb-4 text-sm text-muted-foreground">
            {hasActiveFilters ? (
              <span>Showing {filteredEvents.length} of {events.length} events</span>
            ) : (
              <span>{events.length} total events</span>
            )}
          </div>
        )}

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
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
                    <p className="text-muted-foreground text-xs mb-1">Participating Teams</p>
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

        {/* No Results */}
        {filteredEvents.length === 0 && !loading && (
          <div className="text-center py-12">
            {hasActiveFilters ? (
              <>
                <p className="text-muted-foreground mb-4">No events match your filters</p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </>
            ) : (
              <>
                <p className="text-muted-foreground mb-4">No events available</p>
                <Button onClick={() => window.location.href = '/admin/dashboard'} className="bg-accent hover:bg-accent/90">Create First Event</Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
