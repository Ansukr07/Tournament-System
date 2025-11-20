"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { api } from "@/lib/api"

export default function RegisterPlayerPage() {
  const [formData, setFormData] = useState({ name: "", clubName: "" })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [createdPlayer, setCreatedPlayer] = useState<any>(null)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const player = await api.players.create(formData.name, formData.clubName)
      setCreatedPlayer(player)
      setSuccess(true)
      setFormData({ name: "", clubName: "" })
    } catch (err) {
      setError("Failed to register player. Please try again.")
      console.error("[v0] Registration error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Register Player</h1>
          <p className="text-muted-foreground">Add a new player to the tournament system</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-8 border border-border">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Player Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Club Name</label>
                <input
                  type="text"
                  name="clubName"
                  value={formData.clubName}
                  onChange={handleChange}
                  placeholder="Sports Club A"
                  className="w-full px-4 py-2 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>

              {error && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={loading}>
                {loading ? "Registering..." : "Register Player"}
              </Button>
            </form>
          </Card>

          {success && createdPlayer && (
            <Card className="p-8 border border-green-500/50 bg-green-500/5">
              <div className="space-y-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 mx-auto">
                  <span className="text-green-500 text-xl">✓</span>
                </div>
                <h3 className="text-lg font-bold text-center">Registration Successful</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Player Name:</span>
                    <span className="font-semibold">{createdPlayer.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Unique ID:</span>
                    <span className="font-mono text-xs text-accent">{createdPlayer.uniqueId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Club:</span>
                    <span className="font-semibold">{formData.clubName}</span>
                  </div>
                </div>
                <Button onClick={() => setSuccess(false)} variant="outline" className="w-full text-sm h-8">
                  Register Another
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
