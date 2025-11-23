"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { api } from "@/lib/api"

export default function UmpireScoringPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const matchId = searchParams.get("matchId")
  const matchCode = searchParams.get("code")

  const [match, setMatch] = useState<any>(null)
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (matchId) {
      fetchMatchDetails()
    } else {
      router.push("/umpire")
    }
  }, [matchId])

  const fetchMatchDetails = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/matches/${matchId}`, {
        credentials: "include",
        mode: "cors",
      })
      const data = await response.json()
      setMatch(data)
    } catch (err) {
      console.error("Error fetching match:", err)
      setError("Failed to load match details")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitResult = async () => {
    if (!selectedWinner || !matchCode) {
      setError("Please select a winner")
      return
    }

    setSubmitting(true)
    setError("")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/matches/${matchId}/submit-score`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        mode: "cors",
        body: JSON.stringify({
          winnerId: selectedWinner,
          matchCode: matchCode,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to submit result")
      }

      setSuccess(true)

      // Redirect back to umpire dashboard after 2 seconds
      setTimeout(() => {
        router.push("/umpire")
      }, 2000)

    } catch (err: any) {
      setError(err.message || "Failed to submit result")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-12">
          <p className="text-muted-foreground">Loading match details...</p>
        </div>
      </div>
    )
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-12">
          <p className="text-red-500">Match not found</p>
          <Button onClick={() => router.push("/umpire")} className="mt-4">Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  const team1 = match.participants[0]?.teamId
  const team2 = match.participants[1]?.teamId

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Button variant="outline" onClick={() => router.push("/umpire")} className="mb-4">
            ← Back to Dashboard
          </Button>
          <h1 className="text-4xl font-bold mb-2">Declare Match Winner</h1>
          <p className="text-muted-foreground">Select the winning team</p>
        </div>

        {/* Match Info */}
        <Card className="p-6 border border-border mb-8">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Match Details</p>
              <p className="text-lg font-semibold">Match #{match.matchNumber} - Round {match.round}</p>
            </div>
            {match.courtId && (
              <div className="flex gap-2 text-sm">
                <span className="px-3 py-1 rounded-full bg-accent/20 text-accent">
                  {match.courtId}
                </span>
                {match.startTime && (
                  <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-500">
                    {new Date(match.startTime).toLocaleString()}
                  </span>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Winner Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Team 1 */}
          <button
            onClick={() => setSelectedWinner(team1?._id)}
            disabled={!team1}
            className={`p-8 rounded-lg border-2 transition ${selectedWinner === team1?._id
                ? "border-accent bg-accent/10"
                : "border-border hover:border-accent/50"
              } ${!team1 ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="text-center">
              <p className="text-3xl mb-3">🏆</p>
              <p className="font-bold text-xl mb-1">{team1?.teamName || "TBD"}</p>
              <p className="text-sm text-muted-foreground">{team1?.clubName || ""}</p>
              {selectedWinner === team1?._id && (
                <p className="text-accent text-sm font-semibold mt-3">✓ Selected as Winner</p>
              )}
            </div>
          </button>

          {/* Team 2 */}
          <button
            onClick={() => setSelectedWinner(team2?._id)}
            disabled={!team2}
            className={`p-8 rounded-lg border-2 transition ${selectedWinner === team2?._id
                ? "border-accent bg-accent/10"
                : "border-border hover:border-accent/50"
              } ${!team2 ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="text-center">
              <p className="text-3xl mb-3">🏆</p>
              <p className="font-bold text-xl mb-1">{team2?.teamName || "TBD"}</p>
              <p className="text-sm text-muted-foreground">{team2?.clubName || ""}</p>
              {selectedWinner === team2?._id && (
                <p className="text-accent text-sm font-semibold mt-3">✓ Selected as Winner</p>
              )}
            </div>
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm mb-6">
            ✅ Match result submitted successfully! Redirecting...
          </div>
        )}

        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm mb-6">
            ❌ {error}
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmitResult}
          disabled={!selectedWinner || submitting || success}
          className="w-full bg-accent hover:bg-accent/90 h-12 text-base"
        >
          {submitting ? "Submitting..." : success ? "Submitted ✓" : "Submit Match Result"}
        </Button>

        {/* Info */}
        <div className="mt-6 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
          <p className="text-xs text-blue-500">
            <strong>Note:</strong> Once submitted, the result cannot be changed. The winning team will automatically advance to the next round, and the leaderboard will be updated in real-time.
          </p>
        </div>
      </div>
    </div>
  )
}
