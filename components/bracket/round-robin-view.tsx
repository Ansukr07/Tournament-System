"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface Match {
    _id: string
    round: number
    matchNumber?: number
    matchCode?: string
    participants: Array<{
        teamId?: { teamName?: string; _id?: string; seed?: number }
        placeholder?: string
    }>
    status?: string
    startTime?: string
    court?: string
}

interface RoundRobinViewProps {
    matches: Match[]
}

export function RoundRobinView({ matches }: RoundRobinViewProps) {
    if (!matches || matches.length === 0) {
        return <div className="text-center text-muted-foreground p-8">No fixtures available</div>
    }

    // Group matches by round
    const matchesByRound = matches.reduce((acc, match) => {
        const round = match.round || 1
        if (!acc[round]) {
            acc[round] = []
        }
        acc[round].push(match)
        return acc
    }, {} as Record<number, Match[]>)

    const rounds = Object.keys(matchesByRound).map(Number).sort((a, b) => a - b)

    return (
        <div className="w-full rounded-lg border bg-background/50 p-4 overflow-x-auto">
            <div className="flex gap-16 p-8">
                {rounds.map(roundNum => (
                    <div key={roundNum} className="flex flex-col">
                        {/* Round Header */}
                        <h3 className="text-sm font-semibold text-muted-foreground mb-6 text-center uppercase tracking-wider">
                            Round {roundNum}
                        </h3>

                        {/* Matches Column */}
                        <div className="flex flex-col gap-8">
                            {matchesByRound[roundNum].map(match => (
                                <div key={match._id} className="relative flex flex-col justify-center w-64">
                                    {/* Match Code Label */}
                                    {match.matchCode && (
                                        <div className="absolute -top-6 left-0 w-full text-center">
                                            <span className="text-[10px] font-mono px-2 py-0.5 rounded border text-muted-foreground bg-background/80 border-border">
                                                {match.matchCode}
                                            </span>
                                        </div>
                                    )}

                                    {/* Match Box */}
                                    <div className="flex flex-col rounded-md overflow-hidden shadow-sm transition-all bg-card border border-border hover:shadow-md hover:border-accent/50 group">
                                        {/* Team 1 */}
                                        <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 transition-colors">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <span className="text-xs font-mono text-muted-foreground w-4 text-center shrink-0">
                                                    {match.participants[0]?.teamId?.seed || "-"}
                                                </span>
                                                <span className="text-sm truncate font-medium text-foreground">
                                                    {match.participants[0]?.teamId?.teamName ||
                                                        match.participants[0]?.placeholder ||
                                                        "TBD"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Team 2 */}
                                        <div className="flex items-center justify-between px-3 py-2 transition-colors">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <span className="text-xs font-mono text-muted-foreground w-4 text-center shrink-0">
                                                    {match.participants[1]?.teamId?.seed || "-"}
                                                </span>
                                                <span className="text-sm truncate font-medium text-foreground">
                                                    {match.participants[1]?.teamId?.teamName ||
                                                        match.participants[1]?.placeholder ||
                                                        "TBD"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Schedule Info Below Match */}
                                    {(match.startTime || match.court) && (
                                        <div className="mt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                            {match.startTime && (
                                                <span>
                                                    {new Date(match.startTime).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            )}
                                            {match.court && (
                                                <span className="px-2 py-0.5 rounded bg-accent/10 text-accent">
                                                    {match.court}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
