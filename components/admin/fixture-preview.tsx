"use client"

import { Card } from "@/components/ui/card"
import { generateRoundRobinFixture, type Team } from "@/lib/tournament-engine"
import { useState } from "react"

const mockTeams: Team[] = [
  { id: "1", name: "Team Alpha", seed: 1 },
  { id: "2", name: "Team Beta", seed: 2 },
  { id: "3", name: "Team Gamma", seed: 3 },
  { id: "4", name: "Team Delta", seed: 4 },
]

export function FixturePreview() {
  const [fixtures] = useState(() => generateRoundRobinFixture(mockTeams, 2))

  return (
    <div className="space-y-6">
      {fixtures.map((fixture) => (
        <Card key={fixture.id} className="border border-border p-6">
          <h3 className="font-bold text-lg mb-4">Round {fixture.round}</h3>

          <div className="space-y-3">
            {fixture.matches.map((match) => (
              <div
                key={match.id}
                className="flex items-center justify-between p-4 bg-card/50 rounded-lg border border-border/50"
              >
                <div className="flex-1">
                  <p className="font-medium">{match.team1.name}</p>
                </div>
                <div className="px-4 text-center">
                  <p className="text-sm font-semibold text-accent">vs</p>
                  <p className="text-xs text-muted-foreground">Court {match.court}</p>
                </div>
                <div className="flex-1 text-right">
                  <p className="font-medium">{match.team2.name}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-sm text-muted-foreground">Scheduled: {fixture.scheduledDate.toLocaleDateString()}</p>
          </div>
        </Card>
      ))}
    </div>
  )
}
