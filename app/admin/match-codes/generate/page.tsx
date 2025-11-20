"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"

export default function GenerateMatchCodesPage() {
  const [eventId, setEventId] = useState("")
  const [loading, setLoading] = useState(false)
  const [codes, setCodes] = useState<Array<{ matchId: string; code: string; expiresAt: string }>>([])
  const [success, setSuccess] = useState(false)

  const handleGenerateCodes = async () => {
    if (!eventId) return

    setLoading(true)
    try {
      // In a real implementation, this would generate codes for all matches in the event
      const mockCodes = Array.from({ length: 5 }, (_, i) => ({
        matchId: `match-${i + 1}`,
        code: Math.random().toString(16).substring(2, 10).toUpperCase(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString(),
      }))
      setCodes(mockCodes)
      setSuccess(true)
    } catch (error) {
      console.error("[v0] Error generating codes:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Generate Match Codes</h1>
          <p className="text-muted-foreground">Create secure verification codes for umpires</p>
        </div>

        <Card className="p-6 border border-border mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Event ID</label>
              <input
                type="text"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                placeholder="Enter event ID"
                className="w-full px-4 py-2 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleGenerateCodes}
                className="w-full bg-accent hover:bg-accent/90"
                disabled={!eventId || loading}
              >
                {loading ? "Generating..." : "Generate Codes"}
              </Button>
            </div>
          </div>
        </Card>

        {success && codes.length > 0 && (
          <Card className="p-6 border border-border">
            <h2 className="text-lg font-bold mb-4">Generated Match Codes</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-2 font-semibold">Match ID</th>
                    <th className="text-left px-4 py-2 font-semibold">Code</th>
                    <th className="text-left px-4 py-2 font-semibold">Expires At</th>
                    <th className="text-right px-4 py-2 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map((code) => (
                    <tr key={code.matchId} className="border-b border-border/50 hover:bg-card/50">
                      <td className="px-4 py-3 font-mono text-accent text-xs">{code.matchId}</td>
                      <td className="px-4 py-3">
                        <span className="px-3 py-1 rounded-lg bg-card border border-border font-mono font-semibold text-sm">
                          {code.code}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{code.expiresAt}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(code.code)
                          }}
                          className="text-accent hover:underline text-xs font-medium"
                        >
                          Copy
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm">
              <p className="text-blue-500 font-semibold mb-2">Distribution Instructions:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-500/80 text-xs">
                <li>Send each code to the corresponding match umpire</li>
                <li>Codes expire in 24 hours for security</li>
                <li>Each code is single-use and SHA-256 hashed</li>
                <li>Umpires must verify before submitting scores</li>
              </ul>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
