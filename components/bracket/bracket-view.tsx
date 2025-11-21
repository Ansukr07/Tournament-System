"use client"

import React from "react"
import { BracketMatch } from "./bracket-match"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

interface Match {
    id: string
    team1: { name?: string; seed?: number; score?: number; placeholder?: string; isWinner?: boolean }
    team2: { name?: string; seed?: number; score?: number; placeholder?: string; isWinner?: boolean }
    winnerId?: string
    status?: string
    matchCode?: string
}

interface Round {
    round: number
    matches: Match[]
}

interface BracketViewProps {
    fixtures: Round[]
}

export function BracketView({ fixtures }: BracketViewProps) {
    if (!fixtures || fixtures.length === 0) {
        return <div className="text-center text-muted-foreground p-8">No fixtures available</div>
    }

    return (
        <ScrollArea className="w-full rounded-lg border bg-background/50 p-4">
            <div className="flex gap-16 min-w-max p-8">
                {fixtures.map((round, roundIdx) => (
                    <div key={round.round} className="flex flex-col">
                        {/* Round Header */}
                        <h3 className="text-sm font-semibold text-muted-foreground mb-6 text-center uppercase tracking-wider">
                            {getRoundName(round.round, fixtures.length)}
                        </h3>

                        {/* Matches Column */}
                        <div className="flex flex-col justify-around h-full">
                            {round.matches.map((match, matchIdx) => {
                                // Calculate dynamic spacing based on round index
                                // Round 0: gap-4
                                // Round 1: gap-12 (roughly)
                                // We use flex justify-around to distribute them evenly, which naturally handles the bracket expansion
                                // provided the container height is sufficient.

                                // Actually, to get perfect alignment, we need to force the height of the column 
                                // to match the expansion.
                                // A better trick: 
                                // Each match in Round N corresponds to 2 matches in Round N-1.
                                // We can use a recursive structure or just rely on consistent margins.

                                // Let's try a margin approach:
                                // Margin top/bottom = (2^roundIdx - 1) * (matchHeight / 2 + gap / 2)
                                // This is hard to calculate exactly with Tailwind classes.

                                // Alternative: Grid.
                                // But Flex with `justify-around` works surprisingly well if all columns have same height.

                                return (
                                    <div
                                        key={match.id}
                                        className="flex flex-col justify-center"
                                        style={{
                                            // This ensures the column stretches and matches are centered relative to their children
                                            flexGrow: 1
                                        }}
                                    >
                                        <BracketMatch
                                            team1={match.team1}
                                            team2={match.team2}
                                            matchId={match.id}
                                            roundIndex={roundIdx}
                                            matchIndex={matchIdx}
                                            totalRounds={fixtures.length}
                                            matchCode={match.matchCode}
                                        />
                                        <br />
                                        <br />
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    )
}

function getRoundName(round: number, totalRounds: number): string {
    const diff = totalRounds - round
    if (diff === 0) return "Finals"
    if (diff === 1) return "Semi-Finals"
    if (diff === 2) return "Quarter-Finals"
    return `Round ${round}`
}
