"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/navbar"
import { verifyMatchCode, getVerificationAttempts } from "@/lib/match-code-verifier"

export default function UmpireDashboard() {
  const [matchCode, setMatchCode] = useState("")
  const [verified, setVerified] = useState(false)
  const [message, setMessage] = useState("")
  const [activeMatch, setActiveMatch] = useState<any>(null)

  const handleVerify = () => {
    const result = verifyMatchCode("mock-match-1", matchCode)

    if (result.verified) {
      setVerified(true)
      setMessage("Match verified! You can now enter scores.")
      setActiveMatch({
        id: "mock-match-1",
        team1: "Team Alpha",
        team2: "Team Beta",
      })
    } else {
      setMessage(result.error || "Verification failed")
      setVerified(false)
    }
  }

  if (verified && activeMatch) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <ScoringInterface match={activeMatch} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-3xl font-bold mb-2">Umpire Match Entry</h1>
          <p className="text-muted-foreground">Verify your match code to enter final scores</p>
        </div>

        <Card className="border border-border p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Match Code</label>
              <Input
                value={matchCode}
                onChange={(e) => setMatchCode(e.target.value.toUpperCase())}
                placeholder="e.g., ABC123"
                className="bg-card border-border text-lg tracking-widest"
                maxLength={6}
              />
              <p className="text-xs text-muted-foreground mt-2">
                You have {getVerificationAttempts("mock-match-1")} attempts remaining
              </p>
            </div>

            {message && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  verified ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                }`}
              >
                {message}
              </div>
            )}

            <Button onClick={handleVerify} className="w-full bg-accent hover:bg-accent/90 h-11">
              Verify Code
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

function ScoringInterface({ match }: any) {
  const [team1Score, setTeam1Score] = useState(0)
  const [team2Score, setTeam2Score] = useState(0)

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Enter Final Score</h2>
        <p className="text-muted-foreground">
          {match.team1} vs {match.team2}
        </p>
      </div>

      <Card className="border border-border p-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="text-center">
            <h3 className="font-bold text-lg mb-4">{match.team1}</h3>
            <Input
              type="number"
              value={team1Score}
              onChange={(e) => setTeam1Score(Number(e.target.value))}
              className="bg-card border-border text-center text-3xl font-bold h-16"
            />
          </div>

          <div className="text-center">
            <h3 className="font-bold text-lg mb-4">{match.team2}</h3>
            <Input
              type="number"
              value={team2Score}
              onChange={(e) => setTeam2Score(Number(e.target.value))}
              className="bg-card border-border text-center text-3xl font-bold h-16"
            />
          </div>
        </div>

        <Button className="w-full bg-accent hover:bg-accent/90 h-11 mt-8">Submit Score</Button>
      </Card>
    </div>
  )
}
