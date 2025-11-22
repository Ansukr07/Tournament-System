"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import Link from "next/link"

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
    goalDifference: number
}

interface EventLeaderboardPreviewProps {
    eventId: string
    eventName: string
}

export function EventLeaderboardPreview({ eventId, eventName }: EventLeaderboardPreviewProps) {
    const [stats, setStats] = useState<TeamStats[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const data = await api.events.getLeaderboard(eventId)
                // Show only top 5
                setStats(data.slice(0, 5))
            } catch (error) {
                console.error("Failed to fetch leaderboard:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchLeaderboard()
    }, [eventId])

    if (loading) {
        return (
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold mb-2">Event Rankings</h2>
                    <p className="text-muted-foreground mb-12">Loading rankings...</p>
                </div>
            </section>
        )
    }

    return (
        <section className="py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-12">
                    <h2 className="text-3xl font-bold mb-2">{eventName} - Top Teams</h2>
                    <p className="text-muted-foreground">Current standings</p>
                </div>

                <Card className="border border-border">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                    <th className="text-left px-6 py-4 font-semibold text-sm">Rank</th>
                                    <th className="text-left px-6 py-4 font-semibold text-sm">Team</th>
                                    <th className="text-center px-6 py-4 font-semibold text-sm">P</th>
                                    <th className="text-center px-6 py-4 font-semibold text-sm">W</th>
                                    <th className="text-center px-6 py-4 font-semibold text-sm">D</th>
                                    <th className="text-center px-6 py-4 font-semibold text-sm">L</th>
                                    <th className="text-center px-6 py-4 font-semibold text-sm">GD</th>
                                    <th className="text-center px-6 py-4 font-semibold text-sm">Pts</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                                            No rankings yet. Complete some matches to see the leaderboard!
                                        </td>
                                    </tr>
                                ) : (
                                    stats.map((team, index) => (
                                        <tr key={team._id} className="border-b border-border/50 hover:bg-card/50 transition">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {index === 0 && <span>🥇</span>}
                                                    {index === 1 && <span>🥈</span>}
                                                    {index === 2 && <span>🥉</span>}
                                                    <span className="font-bold text-accent">{index + 1}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium">{team.teamId?.teamName || "Unknown"}</div>
                                                <div className="text-xs text-muted-foreground">{team.teamId?.clubName}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">{team.played}</td>
                                            <td className="px-6 py-4 text-center text-green-500 font-semibold">{team.won}</td>
                                            <td className="px-6 py-4 text-center text-yellow-500">{team.draw}</td>
                                            <td className="px-6 py-4 text-center text-red-500">{team.lost}</td>
                                            <td className="px-6 py-4 text-center font-mono">
                                                {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                                            </td>
                                            <td className="px-6 py-4 text-center font-bold text-lg text-accent">{team.points}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {stats.length > 0 && (
                        <div className="border-t border-border p-6 flex justify-center">
                            <Link href={`/events/${eventId}`}>
                                <Button variant="outline">View Full Leaderboard</Button>
                            </Link>
                        </div>
                    )}
                </Card>
            </div>
        </section>
    )
}
