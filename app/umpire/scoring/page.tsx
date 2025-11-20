"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { api } from "@/lib/api"

export default function UmpireScoringPage() {
  const [matchId] = useState("match-123")
  const [token] = useState("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const match = {
    id: matchId,
    participants: [
      { id: "p1", name: "Player One" },
      { id: "p2", name: "Player Two" },
    ],
    round: 1,
    court: "Court 1",
    scheduledTime: new Date(Date.now() + 3600000).toLocaleTimeString(),
  }

  const handleSubmitScore = async () => {
    if (!selectedWinner) return

    setSubmitting(true)
    try {
      await api.matches.submitScore(matchId, selectedWinner, token)
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setSelectedWinner(null)
      }, 3000)
    } catch (error) {
      console.error("[v0] Error submitting score:", error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Submit Match Result</h1>
          <p className="text-muted-foreground">Select the winner to finalize the match</p>
        </div>

        {/* Match Info */}
        <Card className="p-6 border border-border mb-8">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Round {match.round}</p>
              <p className="text-lg font-semibold">{match.court}</p>
            </div>
            <div className="flex gap-2 text-sm">
              <span className="px-3 py-1 rounded-full bg-accent/20 text-accent">Scheduled: {match.scheduledTime}</span>
            </div>
          </div>
        </Card>

        {/* Winner Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {match.participants.map((participant) => (
            <button
              key={participant.id}
              onClick={() => setSelectedWinner(participant.id)}
              className={`p-8 rounded-lg border-2 transition ${
                selectedWinner === participant.id
                  ? "border-accent bg-accent/10"
                  : "border-border hover:border-accent/50"
              }`}
            >
              <div className="text-center">
                <p className="text-2xl mb-2">👤</p>
                <p className="font-semibold text-lg">{participant.name}</p>
                {selectedWinner === participant.id && (
                  <p className="text-accent text-sm font-semibold mt-2">✓ Selected as Winner</p>
                )}
              </div>
            </button>
          ))}
        </div>

        {success && (
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm mb-6">
            Match result submitted successfully!
          </div>
        )}

        <Button
          onClick={handleSubmitScore}
          disabled={!selectedWinner || submitting}
          className="w-full bg-accent hover:bg-accent/90 h-12 text-base"
        >
          {submitting ? "Submitting..." : "Submit Match Result"}
        </Button>
      </div>
    </div>
  )
}
