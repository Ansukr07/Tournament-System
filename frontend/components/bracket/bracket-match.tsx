import { cn } from "@/lib/utils"

interface Team {
    name?: string
    seed?: number
    score?: number
    isWinner?: boolean
    placeholder?: string
}

interface BracketMatchProps {
    team1: Team
    team2: Team
    matchId: string
    roundIndex: number
    matchIndex: number
    totalRounds: number
    className?: string
    matchCode?: string
    matchNumber?: number
    status?: string
    yCenter: number
    roundStride: number
    connectorLength: number
    onMatchClick?: (matchId: string) => void
}

export function BracketMatch({
    team1,
    team2,
    matchId,
    roundIndex,
    matchIndex,
    totalRounds,
    className,
    matchCode,
    matchNumber,
    status,
    yCenter,
    roundStride,
    connectorLength,
    onMatchClick,
}: BracketMatchProps) {
    const isFinal = roundIndex === totalRounds - 1
    const isAutoAdvance = status === "auto_advance"

    // Calculate connector to parent match
    const parentMatchIndex = Math.floor(matchIndex / 2)
    const parentRoundStride = roundStride * 2
    const parentYCenter = (parentMatchIndex * parentRoundStride) + (parentRoundStride / 2) + 40
    const verticalOffset = parentYCenter - yCenter

    return (
        <div className={cn("relative flex flex-col justify-center w-64", className)}>
            {/* Match Number Label */}
            {matchNumber && (
                <div className="absolute -top-6 left-0 w-full text-center">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded border text-muted-foreground bg-background/80 border-border">
                        Match {matchNumber}
                    </span>
                </div>
            )}

            {/* Match Box */}
            <div
                onClick={() => onMatchClick?.(matchId)}
                className={cn(
                    "flex flex-col rounded-md overflow-hidden shadow-sm transition-all cursor-pointer",
                    isAutoAdvance
                        ? "bg-muted/20 border-2 border-dashed border-border/40"
                        : "bg-card border border-border hover:shadow-md hover:border-accent/50 group"
                )}>
                {/* Team 1 */}
                <div className={cn(
                    "flex items-center justify-between px-3 py-2 border-b border-border/50 transition-colors",
                    team1.isWinner && "bg-accent/10"
                )}>
                    <div className="flex items-center gap-3 overflow-hidden">
                        <span className="text-xs font-mono text-muted-foreground w-4 text-center shrink-0">
                            {team1.seed || "-"}
                        </span>
                        <span className={cn(
                            "text-sm truncate font-medium",
                            team1.isWinner ? "text-accent" : "text-foreground",
                            !team1.name && "text-muted-foreground italic",
                            team1.placeholder === "BYE" && "text-muted-foreground/50 font-normal"
                        )}>
                            {team1.name || team1.placeholder || "TBD"}
                        </span>
                    </div>
                    {team1.score !== undefined && (
                        <span className="text-sm font-mono font-bold ml-2">{team1.score}</span>
                    )}
                </div>

                {/* Team 2 */}
                <div className={cn(
                    "flex items-center justify-between px-3 py-2 transition-colors",
                    team2.isWinner && "bg-accent/10"
                )}>
                    <div className="flex items-center gap-3 overflow-hidden">
                        <span className="text-xs font-mono text-muted-foreground w-4 text-center shrink-0">
                            {team2.seed || "-"}
                        </span>
                        <span className={cn(
                            "text-sm truncate font-medium",
                            team2.isWinner ? "text-accent" : "text-foreground",
                            !team2.name && "text-muted-foreground italic",
                            team2.placeholder === "BYE" && "text-muted-foreground/50 font-normal"
                        )}>
                            {team2.name || team2.placeholder || "TBD"}
                        </span>
                    </div>
                    {team2.score !== undefined && (
                        <span className="text-sm font-mono font-bold ml-2">{team2.score}</span>
                    )}
                </div>
            </div>

            {/* Connectors - L-shaped path from this match to parent match */}
            {!isFinal && (
                <>
                    {/* Horizontal line extending right from match center */}
                    <div
                        className="absolute bg-border"
                        style={{
                            left: '264px',
                            top: '50px',
                            width: `${connectorLength}px`,
                            height: '2px',
                        }}
                    />

                    {/* Vertical line from current level to parent level */}
                    <div
                        className="absolute bg-border"
                        style={{
                            left: `${264 + connectorLength - 1}px`,
                            top: verticalOffset >= 0 ? '50px' : `${50 + verticalOffset}px`,
                            width: '2px',
                            height: `${Math.abs(verticalOffset)}px`,
                        }}
                    />
                </>
            )}
        </div>
    )
}
