"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { api } from "@/lib/api"

export default function UmpireVerifyPage() {
  const [matchId, setMatchId] = useState("")
  const [code, setCode] = useState("")
  const [verified, setVerified] = useState(false)
  const [token, setToken] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await api.matches.verifyCode(matchId, code)
      if (result.valid) {
        setToken(result.token)
        setVerified(true)
      } else {
        setError("Invalid code")
      }
    } catch (err) {
      setError("Verification failed")
      console.error("[v0] Error verifying code:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Umpire Match Verification</h1>
          <p className="text-muted-foreground">Enter your match code to begin scoring</p>
        </div>

        <Card className="p-8 border border-border">
          {!verified ? (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Match ID</label>
                <input
                  type="text"
                  value={matchId}
                  onChange={(e) => setMatchId(e.target.value)}
                  placeholder="Enter match ID"
                  className="w-full px-4 py-2 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">8-Digit Match Code</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="XXXX-XXXX"
                  maxLength={8}
                  className="w-full px-6 py-3 rounded-lg border border-input bg-card text-foreground text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-accent font-mono"
                  required
                />
              </div>

              {error && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 h-12 text-base" disabled={loading}>
                {loading ? "Verifying..." : "Verify Code"}
              </Button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="p-6 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-green-500 font-semibold text-center mb-2">✓ Verification Successful</p>
                <p className="text-sm text-green-500/80 text-center">You can now submit match scores</p>
              </div>

              <div className="p-4 bg-card rounded-lg border border-border">
                <p className="text-xs text-muted-foreground mb-1">Authorization Token</p>
                <p className="text-xs font-mono break-all">{token}</p>
              </div>

              <Button className="w-full bg-accent hover:bg-accent/90 h-10">Proceed to Scoring</Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
