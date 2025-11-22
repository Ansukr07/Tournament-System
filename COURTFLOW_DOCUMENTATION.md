# CourtFlow - Tournament Management System
**Technical Documentation**

---

## System Overview

**CourtFlow** automates tournament management with smart fixture generation, multi-court scheduling, and real-time result tracking.

**Tech Stack:** Next.js + Node.js + Express + MongoDB + Socket.IO

**Key Features:**
- Knockout & Round Robin fixtures with BYE handling
- Same-club avoidance & seeding
- Multi-court scheduling (Earliest-Fit algorithm)
- Match-code authentication for results
- Real-time leaderboard updates

---

## Architecture

```mermaid
graph LR
    A[Next.js Frontend] -->|REST API| B[Express Backend]
    A -->|WebSocket| C[Socket.IO]
    B --> D[(MongoDB)]
    B --> C
    C -->|Events| A
```

**Request Flow:** User Action → API Call → Auth Middleware → Controller → Service → Database → Response → UI Update

---

## Core Modules

| Module | Purpose | Key Algorithm |
|--------|---------|---------------|
| **Fixture Engine** | Generate brackets | Knockout: 2^n sizing, BYE allocation<br>Round Robin: Circle method |
| **Scheduling** | Assign time/court | Earliest-Fit with rest buffer |
| **Match Code** | Secure scoring | SHA-256 hashed 6-digit code |
| **Leaderboard** | Live standings | Real-time aggregation via Socket.IO |

---

## Knockout Fixture Algorithm

```mermaid
flowchart TD
    A[Get Teams] --> B[Calc Bracket Size = 2^n]
    B --> C[Assign BYEs = 2^n - teamCount]
    C --> D[Sort by Seed]
    D --> E[Apply Club Avoidance]
    E --> F[Pair: High vs Low Seed]
    F --> G[Create Match Objects]
    G --> H[Link to Next Round]
```

**BYE Logic:** High seeds get BYEs. BYE teams auto-advance when fixtures are saved.

---

## Scheduling Engine

```mermaid
flowchart TD
    Start[Sort Matches by Round] --> Loop{For Each Match}
    Loop --> Find[Find Earliest Valid Slot T]
    Find --> Check{Court Free?<br>Teams Free + Buffer?}
    Check -- No --> Next[Try Next Slot]
    Check -- Yes --> Assign[Assign Court & Time]
    Assign --> Update[Update nextFreeTime]
    Update --> Loop
    Loop -- Done --> End[Save Schedule]
```

**Constraints:**
- `T >= Court.nextFreeTime`
- `T >= Team.nextFreeTime + bufferMinutes`
- No overlapping matches

---

## Database Models

| Model | Key Fields |
|-------|------------|
| **Event** | name, type (knockout/round_robin), courts[], matchDuration, bufferMinutes |
| **Team** | teamName, clubName, members[], events[] |
| **Match** | eventId, participants[], round, matchNumber, nextMatchId, status, winnerId, startTime, endTime, courtId |
| **TeamStats** | eventId, teamId, played, won, lost, draw, points, goalDifference |

**ERD:**
```mermaid
erDiagram
    Event ||--|{ Match : contains
    Event ||--|{ Team : registered
    Match }|--|| Team : participant1
    Match }|--|| Team : participant2
    Match ||--o| MatchCode : secured_by
    Team ||--|{ TeamStats : statistics
```

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/events` | GET | List events |
| `/api/events` | POST | Create event (Admin) |
| `/api/events/:id/generate-fixtures` | POST | Generate bracket (Admin) |
| `/api/events/:id/schedule` | POST | Auto-schedule (Admin) |
| `/api/teams/register` | POST | Register team |
| `/api/matches/:id/generate-code` | POST | Generate match code (Admin) |
| `/api/matches/:id/submit-score` | POST | Submit result (requires code) |
| `/api/events/:id/leaderboard` | GET | Get standings |

**Example Request/Response:**

```http
POST /api/matches/64match1.../submit-score
Content-Type: application/json

{
  "winnerId": "64team1...",
  "matchCode": "583921"
}
```

```json
{
  "match": {
    "status": "completed",
    "winnerId": "64team1..."
  },
  "message": "Result submitted successfully"
}
```

---

## System Workflows

### Complete Tournament Flow

```mermaid
stateDiagram-v2
    [*] --> Create: Admin creates event
    Create --> Register: Teams register
    Register --> Fixtures: Admin generates fixtures
    Fixtures --> Schedule: Admin schedules matches
    Schedule --> Active: Tournament starts
    
    state Active {
        [*] --> Pending
        Pending --> Live: Match starts
        Live --> Submit: Umpire submits result
        Submit --> Advance: Winner advances
        Advance --> Update: Leaderboard updates
        Update --> Pending: Next match
    }
    
    Active --> Complete: All matches done
    Complete --> [*]
```

### Umpire Workflow

```mermaid
flowchart LR
    A[Receive Code] --> B[Watch Match]
    B --> C[Open App]
    C --> D[Select Winner]
    D --> E[Enter Code]
    E --> F{Valid?}
    F -- Yes --> G[Success]
    F -- No --> E
    G --> H[Auto-advance Winner]
```

### Match Code Security

```mermaid
sequenceDiagram
    Backend->>Backend: Generate "583921"
    Backend->>DB: Save Hash(583921)
    Umpire->>Backend: Submit with "583921"
    Backend->>Backend: Verify Hash
    Backend->>DB: Update Match
    Backend->>Socket: Emit Update
    Socket->>All Clients: Real-time Refresh
```

---

## Key Features Explained

**Same-Club Avoidance:**
- During seeding, if adjacent seeds belong to same club, swap them
- Prevents early same-club matchups in knockout

**Auto-Scheduling:**
- When both participants of a match are determined (winner advances), system automatically:
  - Assigns next available court
  - Calculates time = `earliestFinish + buffer`
  - Generates match code
  - Emits socket update

**Real-time Updates:**
- Result submission triggers Socket.IO events
- Leaderboard and bracket views auto-refresh
- No page reload needed

---

## Conclusion

CourtFlow eliminates manual tournament management through intelligent automation, providing organizers with a streamlined workflow and participants with real-time visibility into tournament progress.
