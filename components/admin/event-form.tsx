"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { api } from "@/lib/api"

export function EventForm() {
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
    if (formData.courts.length > 1) {
      setFormData((prev) => ({
        ...prev,
        courts: prev.courts.filter((_, i) => i !== index),
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.events.create(formData)
      setSuccess(true)
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
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error("[v0] Error creating event:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border border-border p-8">
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
            <label className="block text-sm font-medium mb-2">Match Duration (min)</label>
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
            <label className="block text-sm font-medium mb-2">Buffer Between Matches (min)</label>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        {success && (
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm">
            Event created successfully!
          </div>
        )}

        <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={loading}>
          {loading ? "Creating..." : "Create Event"}
        </Button>
      </form>
    </Card>
  )
}
