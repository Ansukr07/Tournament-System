import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { api } from "@/lib/api"

interface Team {
    _id: string
    name: string
}

interface MatchResultModalProps {
    isOpen: boolean
    onClose: () => void
    matchId: string
    team1: Team
    team2: Team
    onSuccess: () => void
}

export function MatchResultModal({
    isOpen,
    onClose,
    matchId,
    team1,
    team2,
    onSuccess
}: MatchResultModalProps) {
    const [matchCode, setMatchCode] = useState("")
    const [winnerId, setWinnerId] = useState<string>("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async () => {
        if (!matchCode) {
            setError("Please enter the match code")
            return
        }
        if (!winnerId) {
            setError("Please select a winner")
            return
        }

        setLoading(true)
        setError("")

        try {
            console.log("Submitting match result:", { matchId, winnerId, matchCode })
            const response = await api.matches.submitScore(matchId, winnerId, matchCode)
            console.log("Match result submitted successfully:", response)
            onSuccess()
            onClose()
        } catch (err: any) {
            console.error("Error submitting match result:", err)
            setError(err.message || "Failed to submit result")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Enter Match Result</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="matchCode">Match Code</Label>
                        <Input
                            id="matchCode"
                            placeholder="Enter 6-digit code from Umpire"
                            value={matchCode}
                            onChange={(e) => setMatchCode(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Select Winner</Label>
                        <RadioGroup value={winnerId} onValueChange={setWinnerId}>
                            <div className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer hover:bg-accent/50">
                                <RadioGroupItem value={team1._id} id="team1" />
                                <Label htmlFor="team1" className="cursor-pointer flex-1">{team1.name}</Label>
                            </div>
                            <div className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer hover:bg-accent/50">
                                <RadioGroupItem value={team2._id} id="team2" />
                                <Label htmlFor="team2" className="cursor-pointer flex-1">{team2.name}</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Submitting..." : "Submit Result"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
