# Masquerade Economy: Mexico Edition

A polished, browser-based mini-game built with plain HTML, CSS, and vanilla JavaScript.

## Quick Start

1. Open `index.html` in any modern browser.
2. No installation, no build step, and no external assets required.

## Project Goals

This project is designed to feel like a real interactive game while staying simple to run:

- Fast to start (`index.html` only).
- Visually rich festival style.
- Mobile-first usability.
- Clear strategy gameplay with meaningful tradeoffs.
- Transparent scoring and end-of-game reporting.

## Tech Stack

- `HTML` for structure
- `CSS` for design, motion, and responsive layout
- `Vanilla JS` for game state, logic, and rendering

No frameworks, no external images, no bundler.

## Core Gameplay

- Start budget: `$1000`
- Total rounds: `3`
- Each round: choose exactly `1` action card, then confirm
- After each confirmation:
  - Action cost/deltas are applied
  - One random event card triggers
  - Attendance is computed
  - Revenue is computed
  - Log and stats update
- End of round 3:
  - Results screen appears
  - Badges are awarded
  - Personalized feedback is generated
  - Replay is available via `Play Again`

## Initial State

The game uses a single state object initialized with:

- `round: 1`
- `maxRounds: 3`
- `budget: 1000`
- `totalRevenue: 0`
- `totalSpent: 0`
- `appeal: 36`
- `reputation: 38`
- `lastAttendance: 300`
- `jobsCreated: 0`
- `attendanceHistory: []`
- `selectedActionId: null`
- `activeCategory: "All"`
- `usedEventIds: []`
- `roundLog: []`
- `gameOver: false`
- `categoryPicks: { Culture, Commerce, Logistics, Marketing }`
- `ownedUpgrades: { canopies, security, permit, cleanup }`

## Round Logic Pipeline

When player confirms a valid action:

1. Validate choice and budget.
2. Deduct action cost from budget.
3. Add action cost to total spent.
4. Apply action deltas:
   - appeal
   - reputation
   - jobs
5. Mark upgrade ownership if action is an upgrade card.
6. Draw one random event card (without repeats until pool resets).
7. Compute base attendance:
   - `attendance = 300 + (appeal * 8) + (reputation * 5) + random(-50..50)`
8. Apply event effects:
   - revenue multiplier changes
   - attendance changes
   - penalty cost
   - extra rep/appeal deltas
   - bonus revenue
9. Clamp social stats:
   - `appeal` in `0..100`
   - `reputation` in `0..100`
10. Compute revenue:
    - `revenueMultiplier = 1 + (attendance / 2000)`
    - `roundRevenue = baseRevenue * revenueMultiplier * eventMultiplier + bonusRevenue`
11. Apply financials:
    - budget += roundRevenue
    - totalRevenue += roundRevenue
    - penalty costs are also added to totalSpent
12. Save round log entry and update event panel.
13. If round 3 is complete: show results, else advance to next round.

## Core Formulas

- `baseAttendance = 300`
- `attendance = baseAttendance + (appeal * 8) + (reputation * 5) + random(-50..50)`
- `revenueMultiplier = 1 + (attendance / 2000)`
- `roundRevenue = baseRevenue * revenueMultiplier * eventMultiplier + bonusRevenue`
- `netImpact = totalRevenue - totalSpent`

## Action Cards

The game includes 14 cards across 4 categories.

| Category | Card | Cost | Base Revenue | Appeal | Reputation | Jobs | Upgrade Tracked |
|---|---:|---:|---:|---:|---:|---:|---|
| Culture | Hire Dancers | 300 | 500 | +18 | +2 | +4 | No |
| Culture | Mariachi Band | 250 | 420 | +14 | +2 | +3 | No |
| Culture | Parade Float | 220 | 380 | +16 | +1 | +3 | No |
| Culture | Ofrenda Workshop | 180 | 280 | +12 | +4 | +2 | No |
| Commerce | Sell Masks | 200 | 400 | +8 | +1 | +2 | No |
| Commerce | Food Stall | 150 | 300 | +6 | +1 | +3 | No |
| Commerce | Artisan Crafts | 170 | 320 | +7 | +2 | +2 | No |
| Commerce | Photo Booth | 120 | 220 | +5 | +1 | +1 | No |
| Logistics | Security Team | 160 | 0 | +2 | +8 | +3 | `security` |
| Logistics | Cleanup Crew | 110 | 0 | +2 | +7 | +2 | `cleanup` |
| Logistics | Health Permit | 90 | 0 | +0 | +6 | +0 | `permit` |
| Logistics | Canopies / Indoor Area | 130 | 0 | +3 | +3 | +1 | `canopies` |
| Marketing | Social Media Ads | 140 | 240 | +7 | +0 | +1 | No |
| Marketing | Tourist Partnership | 210 | 330 | +10 | +2 | +1 | No |

## Event Cards (Random, One per Round)

The game has 10 event cards. Each round triggers 1 random event.

| Event | Logic |
|---|---|
| Rainstorm | Revenue multiplier `-25%` unless `canopies` owned, then only `-10%` |
| Police Inspection | Reputation `-8` unless `permit` owned, then `+3` |
| Influencer Visit | If current action is Commerce, revenue multiplier `+25%` |
| Sponsor Donation | If reputation `>= 60`, add `+$150` bonus revenue |
| Heatwave | If action is `Food Stall`: `-15%` revenue, or `-5%` with `canopies` |
| Transportation Strike | Attendance `-120` and extra penalty cost `$70` |
| Crowd Surge | Revenue multiplier `+15%`; if no `security`, reputation `-5` |
| Artisan Trend | If current action is `Sell Masks` or `Artisan Crafts`, revenue `+20%` |
| Cleanup Complaint | Reputation `-10` unless `cleanup` owned |
| Cultural Feature | If current action is Culture, appeal `+8` |

## Owned Upgrade Tracking

These persist once purchased and are checked by later events:

- `Security Team` -> `security`
- `Health Permit` -> `permit`
- `Cleanup Crew` -> `cleanup`
- `Canopies / Indoor Area` -> `canopies`

## Budget and Validation Rules

- If selected card cost exceeds current budget:
  - Selection is blocked
  - Card shakes
  - Toast appears: `Not enough budget!`
- Disabled cards show missing amount inline (`Need $X more`).

## Stats and Reporting

Top stats:

- Budget
- Total Revenue
- Appeal
- Reputation
- Attendance
- Jobs Created
- Round (`1/3` style)

Game-end report includes:

- Total spent
- Total revenue
- Net impact
- Average attendance
- Jobs created
- Final appeal and reputation

## Badge Rules

- `Tourism Magnet` if average attendance `>= 780`
- `Community Builder` if reputation `>= 70` and culture/logistics picks `>= 2`
- `Profit Pro` if net impact `>= 500`
- `Needs Planning` if reputation `< 40` or net impact `< 0`
- `Steady Organizer` fallback if none above triggered

## Personalized Feedback Rules

The report generates 2–3 bullets from player behavior:

- Heavy Culture picks
- Heavy Commerce picks
- Upgrade ownership signals
- Low attendance warning
- Low reputation warning
- Positive net impact note

Only the top 3 relevant notes are shown.

## UI Features

- Festival gradient background with decorative papel picado strip
- Sticky glassmorphism stats bar
- Category tabs (`All`, `Culture`, `Commerce`, `Logistics`, `Marketing`)
- Action cards with:
  - icon
  - category chip
  - cost/base revenue blocks
  - delta blocks
  - selected state
  - disabled state
- Event reveal card flip animation
- Round timeline log
- Toast notifications
- Counter animations
- End-game confetti for profitable outcomes

## Mobile-First Responsive Design

### Mobile

- Compact sticky quick-stats strip (horizontal chips)
- Stats auto-collapse on scroll to reduce vertical occupation
- One-column cards on very small screens
- Bottom confirm button in thumb zone
- Fixed bottom nav:
  - `Actions`
  - `Details`
  - `Results` (disabled until game over)
- Slide-up Details sheet with:
  - current event
  - round log
  - owned upgrades

### Tablet/Desktop

- Multi-column stats layout
- Right-side sticky details sidebar
- Header-level confirm button near top action area
- Mobile bottom controls hidden

## Accessibility

- Base font size set to readable minimum (`16px`)
- Larger tap targets (`44px+`)
- `focus-visible` styles for keyboard navigation
- ARIA labels on key controls:
  - details open/close
  - confirm buttons
  - restart
  - mobile navigation
- Toast container uses polite live region

## Performance Considerations

- Uses lightweight DOM updates
- Counter and UI motion use transform/opacity where possible
- Scroll compaction uses `requestAnimationFrame`
- No heavy assets, no network fetches

## File Structure

- `index.html` -> Layout and semantic structure
- `styles.css` -> Theme, responsive behavior, motion
- `script.js` -> State, game loop, rendering, events, scoring

## Key JS Functions

- `createInitialState()` -> initialize all game state
- `renderTabs()` -> category filter controls
- `renderCards()` / `createCardHtml()` -> card UI
- `handleConfirmRound()` -> action validation
- `applyRound()` -> full round processing logic
- `drawEvent()` -> event selection
- `computeAttendance()` -> attendance formula
- `revealEvent()` -> event UI updates and animation
- `updateStats()` / `animateCounter()` -> animated counters
- `renderRoundLog()` -> timeline updates
- `renderUpgrades()` -> owned upgrade list
- `showResults()` -> final report and transition
- `renderBadges()` / `renderFeedback()` -> end report logic
- `resetGame()` -> replay behavior

## Tuning / Customization

Easy balancing points:

- Action card values in `ACTIONS`
- Event behavior in `EVENTS`
- Badge thresholds in `renderBadges()`
- Feedback criteria in `renderFeedback()`
- Starting stats in `createInitialState()`
- Animation timing values in CSS and counter durations

## Notes

- The game is intentionally short (3 rounds) for classroom/demo-friendly sessions.
- Because events and attendance include randomness, no two playthroughs are exactly identical.
