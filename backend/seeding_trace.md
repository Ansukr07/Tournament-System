# Manual Trace: Seeding Logic for 5 Teams

## Input
- Teams: 5 (Team 1, Team 2, Team 3, Team 4, Team 5)
- Padded to: 8 slots (next power of 2)

## Step 1: getSeededIndices(8)
```
getSeededIndices(8):
  → calls getSeededIndices(4)
  
  getSeededIndices(4):
    → calls getSeededIndices(2)
    
    getSeededIndices(2):
      → returns [1, 2]  // base case
    
    Back in getSeededIndices(4):
      previousRound = [1, 2]
      currentRound = []
      
      for x in [1, 2]:
        x = 1: push 1, push (4+1-1=4) → [1, 4]
        x = 2: push 2, push (4+1-2=3) → [1, 4, 2, 3]
      
      return [1, 4, 2, 3]
  
  Back in getSeededIndices(8):
    previousRound = [1, 4, 2, 3]
    currentRound = []
    
    for x in [1, 4, 2, 3]:
      x = 1: push 1, push (8+1-1=8) → [1, 8]
      x = 4: push 4, push (8+1-4=5) → [1, 8, 4, 5]
      x = 2: push 2, push (8+1-2=7) → [1, 8, 4, 5, 2, 7]
      x = 3: push 3, push (8+1-3=6) → [1, 8, 4, 5, 2, 7, 3, 6]
    
    return [1, 8, 4, 5, 2, 7, 3, 6]
```

**Result**: Seeds = [1, 8, 4, 5, 2, 7, 3, 6]

## Step 2: Map to Teams or BYEs
n = 5 teams, so:
- seedIndex <= 5 → Team
- seedIndex > 5 → BYE

Mapping:
- seedIndex 1 → Team 1 (participants[0])
- seedIndex 8 → BYE (8 > 5)
- seedIndex 4 → Team 4 (participants[3])
- seedIndex 5 → Team 5 (participants[4])
- seedIndex 2 → Team 2 (participants[1])
- seedIndex 7 → BYE (7 > 5)
- seedIndex 3 → Team 3 (participants[2])
- seedIndex 6 → BYE (6 > 5)

## Step 3: Round 1 Pairings
```
Match 1: Team 1 (seed 1) vs BYE (seed 8)     → AUTO-ADVANCE Team 1
Match 2: Team 4 (seed 4) vs Team 5 (seed 5)  → REAL MATCH ✓
Match 3: Team 2 (seed 2) vs BYE (seed 7)     → AUTO-ADVANCE Team 2
Match 4: Team 3 (seed 3) vs BYE (seed 6)     → AUTO-ADVANCE Team 3
```

## Analysis: Is this CORRECT?

### Expected Standard Seeding for 5 Teams:
In a proper seeded bracket:
- **Top 3 seeds (1, 2, 3) should get byes**
- Seeds 4 and 5 should play each other

Let's check:
- ✅ Seed 1 gets BYE
- ✅ Seed 2 gets BYE  
- ✅ Seed 3 gets BYE
- ✅ Seeds 4 and 5 play each other

**VERDICT**: ✅ **SEEDING IS CORRECT!**

## Round 2 Should Be:
After Round 1:
- Winner of Match 2 (Team 4 or 5) advances
- Team 1, 2, 3 auto-advanced

Round 2 pairings (Semi-finals):
- Match 5: Team 1 vs Winner(Team 4/5)
- Match 6: Team 2 vs Team 3

## Why User Might See Bugs:

### Hypothesis 1: Frontend Display Bug
The frontend might be showing:
- All 4 "matches" including the auto-advances
- BYE placeholders instead of auto-advancing

### Hypothesis 2: Database Contains Wrong Data
If fixtures were generated multiple times or with wrong logic, old bad data might persist

### Hypothesis 3: matchNumber Gaps Confuse Display
matchNumber = [1, 2, 3, 4, ...]
But only Match 2 actually exists in DB
Frontend might not handle gaps correctly

## Action Plan:
1. Check actual DB data for a 5-team event
2. Check frontend bracket transformation logic
3. Verify no old/duplicate matches exist
