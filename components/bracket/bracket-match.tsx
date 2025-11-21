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
}: BracketMatchProps) {
    const isFinal = roundIndex === totalRounds - 1

    return (
        <div className={cn("relative flex flex-col justify-center w-64", className)}>
            {/* Match Code Label */}
            {matchCode && (
                <div className="absolute -top-6 left-0 w-full text-center">
                    <span className="text-[10px] font-mono text-muted-foreground bg-background/80 px-2 py-0.5 rounded border border-border">
                        {matchCode}
                    </span>
                </div>
            )}

            {/* Match Box */}
            <div className="flex flex-col bg-card border border-border rounded-md overflow-hidden shadow-sm transition-all hover:shadow-md hover:border-accent/50 group">
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
                            !team1.name && "text-muted-foreground italic"
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
                            !team2.name && "text-muted-foreground italic"
                        )}>
                            {team2.name || team2.placeholder || "TBD"}
                        </span>
                    </div>
                    {team2.score !== undefined && (
                        <span className="text-sm font-mono font-bold ml-2">{team2.score}</span>
                    )}
                </div>
            </div>

            {/* Connectors (Lines) */}
            {!isFinal && (
                <>
                    {/* Horizontal Line to Right */}
                    <div className="absolute right-[-20px] top-1/2 w-[20px] h-[2px] bg-border" />

                    {/* Vertical Connector Logic */}
                    {/* 
                        Calculate vertical line height based on round:
                        - Round 0: connects to match ~60px + 32px (baseGap) away = ~92px
                        - Round 1: connects to match ~60px + 64px away = ~124px
                        - Round 2: connects to match ~60px + 128px away = ~188px
                        Formula: 60px (half match height) + (32 * 2^roundIndex)
                    */}
                    {matchIndex % 2 === 0 ? (
                        // Even match - connect down to next match
                        <div
                            className="absolute right-[-22px] top-1/2 w-[2px] bg-border"
                            style={{
                                height: `${60 + (32 * Math.pow(2, roundIndex))}px`
                            }}
                        />
                    ) : (
                        // Odd match - connect up to previous match  
                        <div
                            className="absolute right-[-22px] bottom-1/2 w-[2px] bg-border"
                            style={{
                                height: `${60 + (32 * Math.pow(2, roundIndex))}px`
                            }}
                        />
                    )}
                </>
            )}

            {/* Incoming Connector (Left side) - except for Round 1 */}
            {roundIndex > 0 && (
                <div className="absolute left-[-20px] top-1/2 w-[20px] h-[2px] bg-border" />
            )}
        </div>
    )
}
