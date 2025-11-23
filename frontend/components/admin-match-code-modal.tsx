"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"

interface AdminMatchCodeModalProps {
    isOpen: boolean
    onClose: () => void
    matchId: string
    matchNumber?: number
    team1: { _id: string; name: string }
    team2: { _id: string; name: string }
}

export function AdminMatchCodeModal({
    isOpen,
    onClose,
    matchId,
    matchNumber,
    team1,
    team2,
}: AdminMatchCodeModalProps) {
    const [matchCode, setMatchCode] = useState<string | null>(null)
    const [expiresAt, setExpiresAt] = useState<string | null>(null)
    const [generating, setGenerating] = useState(false)
    const [copied, setCopied] = useState(false)
    const [error, setError] = useState("")

    const handleGenerateCode = async () => {
        setGenerating(true)
        setError("")

        try {
            const token = localStorage.getItem("token")
            if (!token) {
                setError("Please login as admin")
                return
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/matches/${matchId}/generate-code`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    credentials: "include",
                    mode: "cors",
                }
            )

            if (!response.ok) {
                throw new Error("Failed to generate code")
            }

            const data = await response.json()
            setMatchCode(data.code)
            setExpiresAt(data.expiresAt)
        } catch (err: any) {
            setError(err.message || "Failed to generate match code")
        } finally {
            setGenerating(false)
        }
    }

    const handleCopyCode = () => {
        if (matchCode) {
            navigator.clipboard.writeText(matchCode)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        Match Code {matchNumber ? `#${matchNumber}` : ""}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Match Info */}
                    <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">Match Details</p>
                        <p className="font-semibold">
                            {team1.name} <span className="text-muted-foreground">vs</span> {team2.name}
                        </p>
                    </div>

                    {/* Match Code Display or Generate Button */}
                    {!matchCode ? (
                        <div>
                            <Button
                                onClick={handleGenerateCode}
                                disabled={generating}
                                className="w-full bg-accent hover:bg-accent/90 h-11"
                            >
                                {generating ? "Generating..." : "Generate Match Code"}
                            </Button>
                            {error && (
                                <p className="text-sm text-red-500 mt-2">{error}</p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Code Display */}
                            <div className="p-6 bg-green-500/10 border-2 border-green-500 rounded-lg text-center">
                                <p className="text-xs text-green-600 mb-2 font-semibold uppercase">Match Code</p>
                                <p className="text-4xl font-mono font-bold text-green-600 tracking-wider">
                                    {matchCode}
                                </p>
                                {expiresAt && (
                                    <p className="text-xs text-green-600/70 mt-3">
                                        Expires: {new Date(expiresAt).toLocaleString()}
                                    </p>
                                )}
                            </div>

                            {/* Copy Button */}
                            <Button
                                onClick={handleCopyCode}
                                variant="outline"
                                className="w-full"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-4 h-4 mr-2" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4 mr-2" />
                                        Copy Code
                                    </>
                                )}
                            </Button>

                            {/* Instructions */}
                            <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                                <p className="text-xs text-blue-600">
                                    <strong>Next Steps:</strong>
                                    <br />
                                    1. Share this code with the umpire
                                    <br />
                                    2. Umpire logs in and enters code
                                    <br />
                                    3. Umpire declares winner
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Close Button */}
                    <Button
                        onClick={onClose}
                        variant="outline"
                        className="w-full"
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
