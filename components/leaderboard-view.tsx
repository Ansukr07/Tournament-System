import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { initSocket, onEvent, offEvent } from "@/lib/socket"

interface TeamStats {
    _id: string
    teamId: {
        _id: string
        teamName: string
        clubName: string
    }
    played: number
    won: number
    lost: number
    draw: number
    points: number
    goalsFor: number
    goalsAgainst: number
    goalDifference: number
}

interface LeaderboardViewProps {
    eventId: string
}

export function LeaderboardView({ eventId }: LeaderboardViewProps) {
    const [stats, setStats] = useState<TeamStats[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const data = await api.events.getLeaderboard(eventId)
                setStats(data)
            } catch (error) {
                console.error("Error fetching leaderboard:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchLeaderboard()

        // Socket integration
        console.log(`[Leaderboard] Setting up socket listeners for eventId: ${eventId}`)
        initSocket()

        const handleLeaderboardUpdate = (data: any) => {
            console.log(`[Leaderboard] Received leaderboardUpdate event:`, data)
            console.log(`[Leaderboard] Comparing eventIds - received: ${data.eventId}, current: ${eventId}`)
            if (data.eventId === eventId) {
                console.log(`[Leaderboard] EventId matches! Updating leaderboard with ${data.standings.length} teams`)
                setStats(data.standings)
            } else {
                console.log(`[Leaderboard] EventId mismatch, ignoring update`)
            }
        }

        // Also listen for match updates as they might trigger leaderboard changes
        const handleMatchUpdate = () => {
            console.log(`[Leaderboard] Received matchUpdated event, refetching leaderboard`)
            fetchLeaderboard()
        }

        onEvent("leaderboardUpdate", handleLeaderboardUpdate)
        onEvent("matchUpdated", handleMatchUpdate)

        return () => {
            console.log(`[Leaderboard] Cleaning up socket listeners for eventId: ${eventId}`)
            offEvent("leaderboardUpdate")
            offEvent("matchUpdated")
        }
    }, [eventId])

    if (loading) {
        return <div className="text-center py-8">Loading leaderboard...</div>
    }

    if (stats.length === 0) {
        return (
            <Card className="p-8 text-center text-muted-foreground">
                No matches played yet. Leaderboard will update as matches complete.
            </Card>
        )
    }

    return (
        <Card className="overflow-hidden border border-border">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                        <tr>
                            <th className="px-6 py-3 font-medium">Rank</th>
                            <th className="px-6 py-3 font-medium">Team</th>
                            <th className="px-6 py-3 font-medium text-center">P</th>
                            <th className="px-6 py-3 font-medium text-center">W</th>
                            <th className="px-6 py-3 font-medium text-center">D</th>
                            <th className="px-6 py-3 font-medium text-center">L</th>
                            <th className="px-6 py-3 font-medium text-center">GD</th>
                            <th className="px-6 py-3 font-medium text-center">Pts</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {stats.map((team, index) => (
                            <tr key={team._id} className="bg-card hover:bg-muted/50 transition-colors">
                                <td className="px-6 py-4 font-medium">
                                    {index + 1}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium">{team.teamId?.teamName || "Unknown Team"}</div>
                                    <div className="text-xs text-muted-foreground">{team.teamId?.clubName}</div>
                                </td>
                                <td className="px-6 py-4 text-center">{team.played}</td>
                                <td className="px-6 py-4 text-center text-green-500">{team.won}</td>
                                <td className="px-6 py-4 text-center text-yellow-500">{team.draw}</td>
                                <td className="px-6 py-4 text-center text-red-500">{team.lost}</td>
                                <td className="px-6 py-4 text-center font-mono">{team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}</td>
                                <td className="px-6 py-4 text-center font-bold text-lg">{team.points}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    )
}
