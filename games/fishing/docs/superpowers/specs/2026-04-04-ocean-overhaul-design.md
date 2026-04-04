# Fishing Game Ocean Overhaul — Design Spec
**Date**: 2026-04-04
**Status**: Approved

---

## Overview

This spec covers four interconnected changes to the fishing game engine and renderer:

1. 10× ocean depth with capped descent speed
2. Probabilistic ambient fish population (visual layer)
3. Hook encounter system (catch layer, probability-driven, every 2–3s)
4. Rod-based time limit with per-catch timer reset

---

## 1. Ocean Scale & Descent Speed

### Constants
- `OCEAN_D`: `3000` → `30000`
- All fish use `mn`/`mx` ratios (0–1), so they scale automatically — no per-fish depth changes required
- Camera clamp already references `OCEAN_D` — no change needed

### Descent Speed Cap
- Target: player reaches the bottom in **~40 seconds** of continuous descent
- Max descent speed: `30000 / 40 = 750 units/second`
- Implementation: in `update()`, after computing the target depth delta for the active line, clamp the delta to `maxDelta = 750 * (elapsedMs / 1000)` where `elapsedMs` is real wall-clock ms since last frame (tracked separately from the engine's existing `dt` parameter)
- This applies only during `drifting` phase; flying and reeling phases are unaffected

---

## 2. Ambient Visual Population

### Approach
- Replace `spawnInitialFish()` current logic (`FISH.map(f => mkSwimmer(f))`) with a probabilistic pool
- Each fish species has a new `maxAmbient` field (integer ceiling) and an existing `spawnRate` field (0–1)
- At spawn time: for each species, attempt `maxAmbient` slots; each slot rolls `Math.random() < spawnRate` — if success, create a swimmer
- Expected ambient count ≈ `maxAmbient × spawnRate`

### Ambient Counts Table (`maxAmbient`)

| Species | maxAmbient | spawnRate | ~Expected |
|---|---|---|---|
| Minnow | 30 | 0.90 | ~27 |
| Herring | 20 | 0.75 | ~15 |
| Perch | 18 | 0.70 | ~13 |
| Mackerel | 15 | 0.60 | ~9 |
| Trout | 12 | 0.55 | ~7 |
| Flounder | 10 | 0.45 | ~5 |
| Salmon | 8 | 0.40 | ~3 |
| Cod | 8 | 0.38 | ~3 |
| Bass | 7 | 0.35 | ~2 |
| Pike | 6 | 0.28 | ~2 |
| Jellyfish | 8 | 0.30 | ~2 |
| Eel | 5 | 0.22 | ~1 |
| Barracuda | 4 | 0.18 | ~1 |
| Nautilus | 4 | 0.18 | ~1 |
| Grouper | 3 | 0.15 | ~0–1 |
| Tuna | 3 | 0.12 | ~0–1 |
| Manta Ray | 2 | 0.10 | ~0–1 |
| Swordfish | 2 | 0.08 | ~0–1 |
| Oarfish | 2 | 0.06 | ~0–1 |
| Ocean Sunfish | 2 | 0.06 | ~0–1 |
| Great White | 1 | 0.05 | rare |
| Colossal Squid | 1 | 0.04 | rare |
| Gulper Eel | 1 | 0.035 | rare |
| Anglerfish | 1 | 0.03 | rare |
| Viperfish | 1 | 0.025 | rare |
| Blue Whale | 1 | 0.015 | very rare |
| Kraken | 1 | 0.001 | almost never |

### Dynamic Re-evaluation (Ultra-rare species)
- Species with `spawnRate < 0.01` (currently only Kraken) are **periodically re-rolled** every 60 seconds of game time
- On re-roll: if no ambient swimmer exists for the species, roll once. If one exists, it remains until it swims off-screen and wraps, at which point the re-roll decides whether it respawns
- This keeps ultra-rare ambient sightings possible but transient

### Ambient vs Hookable
- Ambient swimmers are **visual only** — hook collision detection no longer applies to them
- Respawn-on-catch logic (`pending` counter) is removed; ambient swimmers are never consumed by fishing

---

## 3. Encounter System

### Overview
While the hook is in `drifting` phase, the engine runs a **periodic encounter roll** every 2–3 seconds (random interval). Successful rolls spawn catchable encounter fish near the hook. These are the only fish that can be caught.

### New State Fields
```js
encounters: [],         // array of encounter fish objects
nextEncounterRoll: 0,   // Date.now() timestamp for next roll
```

### Encounter Fish Object
```js
{
  fish: <FISH entry>,
  x: number,        // horizontal position near hook
  depth: number,    // vertical depth near hook
  dir: 1 | -1,
  wobble: number,
  spawnedAt: number // Date.now()
}
```

### Roll Logic (standard lures)
1. Determine current hook depth (`activeLine.depth`)
2. Filter eligible species: `fish.mn * OCEAN_D <= hookDepth <= fish.mx * OCEAN_D`
3. For each eligible species, roll independently: `Math.random() < fish.spawnRate * lureMultiplier`
4. On success: create encounter fish at `{ x: hookSX + (Math.random()-0.5)*120, depth: hookDepth + (Math.random()-0.5)*80 }`
5. Cap total `encounters.length` at **10** — skip new spawns if cap reached
6. Schedule `nextEncounterRoll = Date.now() + 2000 + Math.random() * 1000`

### Legend Lure Special Case
When `lure === 'l4'` (Legend Lure), skip the species loop entirely:
- Roll one encounter: `Math.random() < 0.05` → spawn Kraken; else → spawn Minnow
- The +30% spawnMult is expressed as a shorter roll interval: 1400–2100ms instead of 2000–3000ms
- Depth filter is ignored — Kraken/Minnow can appear at any depth

### Encounter Rendering
- Drawn on a **separate canvas pass** after ambient swimmers, before the boat layer
- Encounter fish have a **subtle pulsing glow** (semi-transparent ring, same colour as fish body) to distinguish them as catchable
- Hook collision detection runs against `encounters[]` only (same radius formula as current: `Math.hypot(s.x - l.sx, s.depth - l.depth) < 22 + fish.L * 0.28`)

### On Catch
1. Remove encounter from `encounters[]`
2. Set `state.lastCatchTime = Date.now()` (resets drift timer)
3. Add fish to `inv` and `log` as normal
4. Show popup as normal

### Lure Data Updates

| id | name | spawnMult | Notes |
|---|---|---|---|
| l1 | Basic Lure | 1.0 | baseline |
| l2 | Silver Spoon | 1.10 | +10% |
| l3 | Magic Fly | 1.15 | +15% |
| l4 | Legend Lure | 1.30 | bimodal mode, shorter interval |

### Fish Data Updates
Add `spawnRate` field to each entry in `FISH`:

| id | spawnRate |
|---|---|
| minnow | 0.90 |
| herring | 0.75 |
| perch | 0.70 |
| mackerel | 0.60 |
| trout | 0.55 |
| flounder | 0.45 |
| salmon | 0.40 |
| cod | 0.38 |
| bass | 0.35 |
| pike | 0.28 |
| jellyfish | 0.30 |
| eel | 0.22 |
| barracuda | 0.18 |
| grouper | 0.15 |
| nautilus | 0.18 |
| tuna | 0.12 |
| manta | 0.10 |
| swordfish | 0.08 |
| oarfish | 0.06 |
| sunfish | 0.06 |
| shark | 0.05 |
| colossal | 0.04 |
| gulper | 0.035 |
| anglerfish | 0.03 |
| viperfish | 0.025 |
| whale | 0.015 |
| kraken | 0.001 |

---

## 4. Time Limit System

### Rod Data Updates
Add `timeLimit` (ms) to each entry in `RODS`:

| id | name | timeLimit |
|---|---|---|
| r1 | Beginner Rod | 5,000 |
| r2 | Carbon Rod | 15,000 |
| r3 | Pro Spinner | 35,000 |
| r4 | Master's Rod | 50,000 |

### New State Fields
```js
driftStartTime: 0,   // Date.now() when line entered drifting phase
lastCatchTime: 0,    // Date.now() of most recent fish catch
```

### Timer Calculation
```js
const effectiveStart = Math.max(state.driftStartTime, state.lastCatchTime);
const timeRemaining = rodTimeLimit - (Date.now() - effectiveStart);
```

### Timer Lifecycle
- **Set `driftStartTime`**: when first line transitions from `flying` → `drifting`
- **Set `lastCatchTime`**: each time a hook completes reeling a fish (one update per hook; 6-hook net can reset timer up to 6 times per session)
- **Timer ticks only during `drifting` phase** — frozen while any line is in `reeling`
- **On expiry** (`timeRemaining <= 0`): clear all lines, clear `encounters[]`, return phase to `idle`. No fish are caught from this — line simply snaps back

### HUD
- Horizontal bar below depth readout, visible only during `drifting` phase
- Width proportional to `timeRemaining / rodTimeLimit`
- Color: green → amber (below 40%) → red (below 15%)
- Text label: `Xs remaining` (integer seconds)

---

## Files Changed

| File | Changes |
|---|---|
| `src/engine/FishingGameEngine.js` | `OCEAN_D`, `FISH` (add `spawnRate`, `maxAmbient`), `RODS` (add `timeLimit`), `LURES` (add `spawnMult`), `spawnInitialFish()`, `update()` (encounter rolls, timer, descent cap), new state fields, remove ambient collision detection |
| `src/components/GameCanvas.jsx` | Encounter render pass (glow), time bar HUD, remove ambient swimmer collision rendering artefacts |

---

## Out of Scope
- Sound effects
- New fish species
- Shop price rebalancing
- Save/load persistence
