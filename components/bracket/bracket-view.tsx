"use client"

import React, { useState } from "react"
import { BracketMatch } from "./bracket-match"
import { MatchResultModal } from "../match-result-modal"

interface Match {
    id: string
    team1: { _id?: string; name?: string; seed?: number; score?: number; placeholder?: string; isWinner?: boolean }
    team2: { _id?: string; name?: string; seed?: number; score?: number; placeholder?: string; isWinner?: boolean }
    winnerId?: string
    status?: string
    matchCode?: string
    matchNumber?: number
}

interface Round {
    round: number
    matches: Match[]
}

interface BracketViewProps {
    fixtures: Round[]
    onRefresh?: () => void
}

export function BracketView({ fixtures, onRefresh }: BracketViewProps) {
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)

    if (!fixtures || fixtures.length === 0) {
        return <div className="text-center text-muted-foreground p-8">No fixtures available</div>
    }

    const handleMatchClick = (matchId: string) => {
        // Find match in fixtures
        for (const round of fixtures) {
            const match = round.matches.find(m => m.id === matchId)
            if (match) {
                // Only allow clicking if match is not completed (or maybe allow editing?)
                // And only if both teams are present (not TBD)
                if (match.team1._id && match.team2._id) {
                    setSelectedMatch(match)
                }
                break
            }
        }
    }

    // Slot-based bracket math constants
    const MATCH_HEIGHT = 100  // Height of match card
    const VERTICAL_GAP = 120   // Base gap between matches (increased for better spacing)
    const SLOT_HEIGHT = MATCH_HEIGHT + VERTICAL_GAP  // Total slot height
    const HORIZONTAL_GAP = 200 // Space between rounds (increased)
    const CONNECTOR_LENGTH = 60 // Length of horizontal connector lines

    // Calculate total height needed for the bracket
    // First round has the most matches, use that to determine container height
    const firstRoundMatchCount = fixtures[0]?.matches.length || 1
    const roundStride0 = SLOT_HEIGHT // Round 0 stride
    const totalHeight = (firstRoundMatchCount * roundStride0) + 100 // Extra padding

    return (
        <div className="w-full rounded-lg border bg-background/50 p-4 overflow-x-auto">
            <div
                className="relative min-w-max p-8"
                style={{ height: `${totalHeight}px` }}
            >
                {fixtures.map((round, roundIdx) => {
                    // Calculate positioning for this round
                    const roundStride = SLOT_HEIGHT * Math.pow(2, roundIdx)
                    const xPosition = roundIdx * HORIZONTAL_GAP

                    return (
                        <div
                            key={round.round}
                            className="absolute"
                            style={{ left: `${xPosition}px`, top: 0 }}
                        >
                            {/* Round Header */}
                            <div className="mb-6 w-64">
                                <h3 className="text-sm font-semibold text-muted-foreground text-center uppercase tracking-wider">
                                    {getRoundName(round.round, fixtures.length)}
                                </h3>
                            </div>

                            {/* Matches positioned absolutely within the round */}
                            {round.matches.map((match, matchIdx) => {
                                // Calculate Y position using slot-based math
                                // y = (matchIndex * roundStride) + (roundStride / 2) - (MATCH_HEIGHT / 2)
                                const yCenter = (matchIdx * roundStride) + (roundStride / 2)
                                const yPosition = yCenter - (MATCH_HEIGHT / 2) + 40 // +40 for header offset

                                return (
                                    <div
                                        key={match.id}
                                        className="absolute"
                                        style={{
                                            top: `${yPosition}px`,
                                            left: 0
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
                                            matchNumber={match.matchNumber}
                                            status={match.status}
                                            yCenter={yCenter}
                                            roundStride={roundStride}
                                            connectorLength={CONNECTOR_LENGTH}
                                            onMatchClick={handleMatchClick}
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    )
                })}
            </div>

            {selectedMatch && selectedMatch.team1._id && selectedMatch.team2._id && (
                <MatchResultModal
                    isOpen={!!selectedMatch}
                    onClose={() => setSelectedMatch(null)}
                    matchId={selectedMatch.id}
                    team1={{ _id: selectedMatch.team1._id, name: selectedMatch.team1.name || "Team 1" }}
                    team2={{ _id: selectedMatch.team2._id, name: selectedMatch.team2.name || "Team 2" }}
                    onSuccess={() => {
                        onRefresh?.()
                    }}
                />
            )}
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
