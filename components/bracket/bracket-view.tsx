"use client"

import React from "react"
import { BracketMatch } from "./bracket-match"

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

    // Calculate spacing for each round
    // Each match needs vertical spacing that doubles per round
    const baseMatchHeight = 120; // Match card height in pixels
    const baseGap = 32; // Base gap between matches

    return (
        <div className="w-full rounded-lg border bg-background/50 p-4">
            <div className="flex gap-16 p-8">
                {fixtures.map((round, roundIdx) => {
                    // Calculate the multiplier for spacing in this round
                    // Round 0: multiplier = 1, Round 1: multiplier = 2, Round 2: multiplier = 4, etc.
                    const spacingMultiplier = Math.pow(2, roundIdx);
                    const matchGap = baseGap * spacingMultiplier;

                    return (
                        <div key={round.round} className="flex flex-col">
                            {/* Round Header */}
                            <h3 className="text-sm font-semibold text-muted-foreground mb-6 text-center uppercase tracking-wider">
                                {getRoundName(round.round, fixtures.length)}
                            </h3>

                            {/* Matches Column */}
                            <div className="flex flex-col">
                                {round.matches.map((match, matchIdx) => {
                                    // Calculate top margin for proper alignment
                                    // First match in round gets half the gap, others get full gap
                                    const topMargin = matchIdx === 0
                                        ? (matchGap / 2) - (baseGap / 2)
                                        : matchGap - baseGap;

                                    return (
                                        <div
                                            key={match.id}
                                            style={{
                                                marginTop: matchIdx === 0 ? 0 : `${topMargin}px`,
                                                marginBottom: matchIdx === round.matches.length - 1 ? 0 : `${baseGap}px`
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
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

function getRoundName(round: number, totalRounds: number): string {
    const diff = totalRounds - round
    if (diff === 0) return "Finals"
    if (diff === 1) return "Semi-Finals"
    if (diff === 2) return "Quarter-Finals"
    return `Round ${round}`
}
