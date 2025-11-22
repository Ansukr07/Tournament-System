"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { api } from "@/lib/api"

export default function CreateEventPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    type: "knockout" as const,
    matchDuration: 30,
    bufferMinutes: 10,
    courts: ["Court 1", "Court 2", "Court 3"],
    startDate: "",
    endDate: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  // Check for authentication
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth/login")
    }
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "matchDuration" || name === "bufferMinutes" ? Number.parseInt(value) : value,
    }))
  }

  const handleCourtChange = (index: number, value: string) => {
    const newCourts = [...formData.courts]
    newCourts[index] = value
    setFormData((prev) => ({ ...prev, courts: newCourts }))
  }

  const addCourt = () => {
    setFormData((prev) => ({
      ...prev,
      courts: [...prev.courts, `Court ${prev.courts.length + 1}`],
    }))
  }

  const removeCourt = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      courts: prev.courts.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const token = localStorage.getItem("token")
      const result = await api.events.create(formData, token || undefined)
      console.log("Event created:", result)
      setSuccess(true)

      // Reset form
      setFormData({
        name: "",
        category: "",
        type: "knockout",
        matchDuration: 30,
        bufferMinutes: 10,
        courts: ["Court 1", "Court 2", "Court 3"],
        startDate: "",
        endDate: "",
      })

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/admin/dashboard")
      }, 2000)
    } catch (error: any) {
      console.error("[v0] Error creating event:", error)
      setError(error.message || "Failed to create event. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Create New Event</h1>
          <p className="text-muted-foreground">Set up a new tournament with courts and match configuration</p>
        </div>

        <Card className="p-8 border border-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Event Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Spring Championship"
                  className="w-full px-4 py-2 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="e.g., Badminton, Tennis"
                  className="w-full px-4 py-2 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tournament Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="knockout">Knockout</option>
                  <option value="round_robin">Round Robin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Match Duration (minutes)</label>
                <input
                  type="number"
                  name="matchDuration"
                  value={formData.matchDuration}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Buffer Between Matches (minutes)</label>
                <input
                  type="number"
                  name="bufferMinutes"
                  value={formData.bufferMinutes}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <input
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium">Courts</label>
                <Button type="button" onClick={addCourt} variant="outline" size="sm">
                  + Add Court
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {formData.courts.map((court, index) => (
                  <div key={index} className="relative">
                    <input
                      type="text"
                      value={court}
                      onChange={(e) => handleCourtChange(index, e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    {formData.courts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCourt(index)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-destructive hover:text-destructive/80"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm">
                Event created successfully! Redirecting to dashboard...
              </div>
            )}

            <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={loading}>
              {loading ? "Creating..." : "Create Event"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
