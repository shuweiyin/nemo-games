# Fishing Game Ocean Overhaul — Design Spec
**Date**: 2026-04-04
**Status**: Approved

---

## Overview

Four interconnected changes to the fishing game engine and renderer:

1. 10× ocean depth with capped descent speed
2. Probabilistic ambient fish population (visual layer)
3. Hook encounter system (catch layer, probability-driven, every 2–3s)
4. Rod-based time limit with per-catch timer reset

---

## 0. Clarification: `dt` units

`engine.update(dt)` receives `dt` in **real milliseconds** from the rAF loop (`performance.now()` diff, ~16.67ms at 60fps). The engine immediately clamps it to `Math.min(dt, 3)` for simulation stability (all existing coefficients are tuned for dt ≈ 3ms). `rawMs` in this spec refers to the unclamped ms value before that clamp. At 60fps: `rawMs ≈ 16.67`, clamped `dt ≈ 3`.

---

## 1. Ocean Scale & Descent Speed

### Constants
- `OCEAN_D`: `3000` → `30000`
- All fish `mn`/`mx` ratios and all camera/zone calculations already reference the constant — no hardcoded values to fix

### Descent Speed Cap
- Target: bottom reachable in ~40s → max speed **750 units/second**
- At the top of `update()`, before clamping:
  ```js
  const rawMs = dt;              // real elapsed ms (~16.67 at 60fps)
  dt = Math.min(dt, 3);         // existing clamp
  ```
- Inside the drifting line update, replace `l.depth += (td - l.depth) * 0.025 * dt` with:
  ```js
  const maxDelta = 750 * (rawMs / 1000);    // ~12.5 units/frame at 60fps
  const rawDelta = (td - l.depth) * 0.025 * dt;
  l.depth += Math.sign(rawDelta) * Math.min(Math.abs(rawDelta), maxDelta);
  ```
  At 60fps: `rawMs/1000 ≈ 0.01667` → `maxDelta ≈ 12.5` units/frame → 750 u/s. ✓
- Applies only during `drifting`; flying and reeling are unaffected

---

## 2. Ambient Visual Population

### spawnInitialFish() replacement
Delete: `this.state.swimmers = FISH.map((f) => mkSwimmer(f));`

Replace with:
```js
spawnInitialFish() {
  this.state.swimmers = [];
  for (const f of FISH) {
    for (let i = 0; i < f.maxAmbient; i++) {
      if (Math.random() < f.spawnRate) {
        this.state.swimmers.push(mkSwimmer(f));
      }
    }
  }
}
```

### Remove `state.pending` entirely
- In the **constructor** state object: remove `pending: 0`
- In **`startGame()`** state object: remove `pending: 0`
- In **`update()`**: delete the entire respawn block:
  ```js
  // DELETE THIS BLOCK:
  if (this.state.phase === "idle" && this.state.pending > 0) {
    const idx = this.state.swimmers.findIndex((s) => s === null);
    const slot = idx !== -1 ? idx : this.state.swimmers.length;
    this.state.swimmers[slot] = mkSwimmer(FISH[slot % FISH.length]);
    this.state.pending--;
  }
  ```
  Ambient swimmers are never consumed; no respawning is needed.

### Ultra-rare ambient re-roll
- Add to constructor and `startGame()`: `lastRareRoll: 0`
- In `update()`, unconditionally (any phase):
  ```js
  if (performance.now() - this.state.lastRareRoll > 60000) {
    // Re-roll ambient slots for species with spawnRate < 0.01
    for (const f of FISH.filter(f => f.spawnRate < 0.01)) {
      this.state.swimmers = this.state.swimmers.filter(s => s.fish.id !== f.id);
      for (let i = 0; i < f.maxAmbient; i++) {
        if (Math.random() < f.spawnRate) {
          this.state.swimmers.push(mkSwimmer(f));
        }
      }
    }
    this.state.lastRareRoll = performance.now();
  }
  ```
  Purely visual — no effect on encounter eligibility.

### Remove ambient swimmer collision
In `update()`, inside the `if (l.state === "drifting")` block, **delete** the entire `hitIdx` block:
```js
// DELETE THIS BLOCK:
const hitIdx = this.state.swimmers.findIndex((s) => { ... });
if (hitIdx !== -1) { ... }
```
Encounter collision (Section 3) replaces it.

Because ambient swimmers are never hooked after this change, they are never set to `null`. `state.swimmers` will never contain `null` slots — the old `swimmers[hitIdx] = null` assignment is removed with the collision block. No null-checking is needed in the swimmer render loop.

### Fish Data — add `spawnRate` and `maxAmbient` to every FISH entry

| id | spawnRate | maxAmbient |
|---|---|---|
| minnow | 0.90 | 30 |
| herring | 0.75 | 20 |
| perch | 0.70 | 18 |
| mackerel | 0.60 | 15 |
| trout | 0.55 | 12 |
| flounder | 0.45 | 10 |
| salmon | 0.40 | 8 |
| cod | 0.38 | 8 |
| bass | 0.35 | 7 |
| pike | 0.28 | 6 |
| jellyfish | 0.30 | 8 |
| eel | 0.22 | 5 |
| barracuda | 0.18 | 4 |
| nautilus | 0.18 | 4 |
| grouper | 0.15 | 3 |
| tuna | 0.12 | 3 |
| manta | 0.10 | 2 |
| swordfish | 0.08 | 2 |
| oarfish | 0.06 | 2 |
| sunfish | 0.06 | 2 |
| shark | 0.05 | 1 |
| colossal | 0.04 | 1 |
| gulper | 0.035 | 1 |
| anglerfish | 0.03 | 1 |
| viperfish | 0.025 | 1 |
| whale | 0.015 | 1 |
| kraken | 0.001 | 1 |

---

## 3. Encounter System

### New State Fields (add to constructor and `startGame()`)
```js
encounters: [],        // catchable fish near the hook
nextEncounterRoll: 0,  // performance.now() ms for next roll
```

### Encounter Fish Object Shape
```js
{
  fish: <FISH entry>,   // reference to entry in FISH array
  x: number,
  depth: number,        // virtual depth (same coord space as l.depth)
  dir: 1 | -1,
  wobble: number,
  vx: number,           // horizontal swim speed, assigned at spawn
  spawnedAt: number,    // performance.now()
}
```
Each frame in `update()`, after the existing swimmer loop, update all encounters:
```js
this.state.encounters.forEach(e => {
  e.wobble += 0.06 * dt;
  e.x += e.vx * dt;
  if (e.x < -e.fish.L) e.x = CW + e.fish.L;
  if (e.x > CW + e.fish.L) e.x = -e.fish.L;
});
```

### Lure Data — replace `boost` with `spawnMult` and `legendMode`

| id | name | cost | spawnMult | legendMode |
|---|---|---|---|---|
| l1 | Basic Lure | 0 | 1.0 | **false** |
| l2 | Silver Spoon | 150 | 1.10 | **false** |
| l3 | Magic Fly | 450 | 1.15 | **false** |
| l4 | Legend Lure | 1200 | 1.30 | **true** |

`lureMultiplier` in roll formula = `equippedLure.spawnMult` (e.g., 1.0, 1.10, 1.15, or 1.30 directly).

### Encounter Roll Trigger
In `update()`, add after the encounter swim loop:
```js
if (this.state.phase === 'drifting' &&
    performance.now() >= this.state.nextEncounterRoll) {
  this._runEncounterRoll();
}
// Do NOT advance nextEncounterRoll when phase === 'reeling'
```

### Roll Logic — Standard Lures (`legendMode === false`)
```js
_runEncounterRoll() {
  const driftingLine = this.state.lines.find(l => l.state === 'drifting');
  if (!driftingLine) return;

  const hookDepth = driftingLine.depth;
  const hookSX = driftingLine.sx;
  const lure = LURES.find(l => l.id === this.state.lure);
  const mult = lure.spawnMult;

  for (const f of FISH) {
    if (this.state.encounters.length >= 10) break;
    if (hookDepth < f.mn * OCEAN_D || hookDepth > f.mx * OCEAN_D) continue;
    if (Math.random() < f.spawnRate * mult) {
      this.state.encounters.push({
        fish: f,
        x: hookSX + (Math.random() - 0.5) * 120,
        depth: hookDepth + (Math.random() - 0.5) * 80,
        dir: Math.random() < 0.5 ? 1 : -1,
        wobble: 0,
        vx: (Math.random() - 0.5) * 0.4,
        spawnedAt: performance.now(),
      });
    }
  }
  // Standard interval: 2000–3000ms
  this.state.nextEncounterRoll = performance.now() + 2000 + Math.random() * 1000;
}
```

### Roll Logic — Legend Lure (`legendMode === true`)
Replace the FISH loop with:
```js
if (this.state.encounters.length < 10) {
  const f = Math.random() < 0.05
    ? FISH.find(f => f.id === 'kraken')
    : FISH.find(f => f.id === 'minnow');
  this.state.encounters.push({
    fish: f,
    x: hookSX + (Math.random() - 0.5) * 120,
    depth: hookDepth + (Math.random() - 0.5) * 80,  // always at hook depth — no depth filter applied
    dir: Math.random() < 0.5 ? 1 : -1,
    wobble: 0,
    vx: (Math.random() - 0.5) * 0.4,
    spawnedAt: performance.now(),
  });
}
// Legend Lure interval: 1400–2100ms
this.state.nextEncounterRoll = performance.now() + 1400 + Math.random() * 700;
```
**Depth filter is explicitly bypassed** in Legend Lure mode — minnow and kraken can appear at any hook depth regardless of their normal `mn`/`mx` range. `spawnMult: 1.30` is expressed only through the shorter interval, not as a probability multiplier.

### Encounter Collision — replace ambient swimmer collision in `update()`
Inside `if (l.state === "drifting")`, after removing the old `hitIdx` block, add:
```js
const hitIdx = this.state.encounters.findIndex(e =>
  Math.hypot(e.x - l.sx, e.depth - l.depth) < 22 + e.fish.L * 0.28
);
if (hitIdx !== -1) {
  const hit = this.state.encounters[hitIdx];
  this.state.encounters.splice(hitIdx, 1);
  l.hooked = { ...hit.fish, sx: l.sx, sd: l.depth };
  l.state = 'reeling';
  l.prog = 0;
  this.state.phase = 'reeling';
}
```

### On Catch (inside `l.prog >= 100` block)
Add `this.state.lastCatchTime = performance.now();` alongside the existing inv/log/popup logic. Multiple hooks completing in the same tick each overwrite `lastCatchTime` with a fresh `performance.now()` — effectively identical since they execute within the same ms.

### Encounter Rendering (GameCanvas.jsx)
Add a pass **after** the swimmers render loop, **before** the boat drawing:
```js
r.encounters.forEach(e => {
  if (!e) return;
  const sy = toScreen(e.depth);
  if (sy < -e.fish.H || sy > VH + e.fish.H) return;
  // Pulsing glow ring
  ctx.strokeStyle = e.fish.c + '88';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(e.x, sy, 16 + Math.sin(performance.now() * 0.005) * 4, 0, Math.PI * 2);
  ctx.stroke();
  // Fish body
  drawFish(ctx, e.fish, e.x, sy, e.dir, 1, 1, t);
});
```

---

## 4. Time Limit System

### Rod Data — add `timeLimit` (ms) to every RODS entry

| id | name | cost | spd | timeLimit |
|---|---|---|---|---|
| r1 | Beginner Rod | 0 | 1 | 5000 |
| r2 | Carbon Rod | 200 | 1.5 | 15000 |
| r3 | Pro Spinner | 600 | 2.2 | 35000 |
| r4 | Master's Rod | 1500 | 3.2 | 50000 |

### New State Fields (add to constructor and `startGame()`)
```js
driftStartTime: 0,    // performance.now() ms
lastCatchTime: 0,     // performance.now() ms
reelingEntryTime: 0,  // performance.now() when reeling began (for timer pause)
totalPausedMs: 0,     // cumulative ms spent reeling (subtracted from elapsed)
```

### Timer Calculation
```js
const rodTimeLimit = RODS.find(r => r.id === this.state.rod).timeLimit;
const effectiveStart = Math.max(this.state.driftStartTime, this.state.lastCatchTime);
const timeRemaining = rodTimeLimit - (performance.now() - effectiveStart - this.state.totalPausedMs);
```

### Timer Freeze Implementation
When a line transitions from `drifting` → `reeling` (in the encounter collision block), record entry time **only if not already reeling** (guard for multi-hook nets where a second hook may enter reeling while the first is already reeling):
```js
if (this.state.reelingEntryTime === 0) {
  this.state.reelingEntryTime = performance.now();
}
```
This means `reelingEntryTime` captures the start of the *first* hook entering reeling. Subsequent hooks entering reeling during the same stretch do not overwrite it. The pause is measured as one contiguous block — from when the first hook started reeling to when all hooks finish.

When all lines exit `reeling` and phase returns to `idle` (in the "check if all lines done" block at the bottom of `update()`), accumulate paused time:
```js
// existing: this.state.phase = "idle"; this.state.lines = [];
// ADD before this:
if (this.state.reelingEntryTime > 0) {
  this.state.totalPausedMs += performance.now() - this.state.reelingEntryTime;
  this.state.reelingEntryTime = 0;
}
```
The timer formula subtracts `totalPausedMs`, so time spent reeling never counts against the limit.

### Timer Lifecycle
- **`driftStartTime`**: set once per cast when any line first transitions `flying` → `drifting`:
  ```js
  if (this.state.driftStartTime === 0) {
    this.state.driftStartTime = performance.now();
  }
  ```
- **`castLine()`**: add at the top of the method:
  ```js
  this.state.driftStartTime = 0;
  this.state.lastCatchTime = 0;
  this.state.totalPausedMs = 0;
  this.state.reelingEntryTime = 0;
  ```
- **`lastCatchTime`**: set in `l.prog >= 100` block, once per fish landed
- **Timer expiry check**: only when `this.state.phase === 'drifting'` AND `timeRemaining <= 0`:
  ```js
  this.state.lines = [];
  this.state.encounters = [];
  this.state.phase = 'idle';
  this.state.hookDepth = 0;
  this.state.driftStartTime = 0;
  this.state.lastCatchTime = 0;
  this.state.totalPausedMs = 0;
  this.state.reelingEntryTime = 0;
  this.state.nextEncounterRoll = 0;  // reset so next cast doesn't immediately roll
  this.state.reelingEntryTime = 0;   // clear stale reel-pause timestamp
  ```
  Mid-reel fish are lost with no credit.

### HUD Time Bar (GameCanvas.jsx)
Visible only during `drifting` phase. Placed in the top-right area, below the depth readout.

```js
if (r.phase === 'drifting') {
  const rod = RODS.find(rd => rd.id === r.rod);  // import RODS
  const effectiveStart = Math.max(r.driftStartTime, r.lastCatchTime);
  const timeRemaining = rod.timeLimit - (performance.now() - effectiveStart - r.totalPausedMs);
  const pct = Math.max(0, timeRemaining / rod.timeLimit);
  const barW = 120, barH = 10;
  const bx = CW - barW - 14, by = 46;

  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath(); ctx.roundRect(bx, by, barW, barH, 4); ctx.fill();

  const color = pct >= 0.40 ? '#44ee66' : pct >= 0.15 ? '#ffaa22' : '#ff3322';
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.roundRect(bx, by, barW * pct, barH, 4); ctx.fill();

  const secs = Math.ceil(Math.max(0, timeRemaining / 1000));
  ctx.fillStyle = color;
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`${secs}s`, CW - 14, by + barH - 1);
}
```
`RODS` must be imported in `GameCanvas.jsx`.

---

## Files Changed

| File | Changes |
|---|---|
| `src/engine/FishingGameEngine.js` | `OCEAN_D`; `FISH` entries (add `spawnRate`, `maxAmbient`); `RODS` entries (add `timeLimit`); `LURES` entries (replace `boost` → `spawnMult`, add `legendMode`); `spawnInitialFish()`; remove `pending` from constructor + `startGame()` + `update()` respawn block; `update()` — `rawMs`, descent cap, encounter swim loop, encounter roll trigger, `_runEncounterRoll()` method, encounter collision block, timer check + expiry, `lastRareRoll` re-roll, reeling pause tracking; `castLine()` resets timer state; add new state fields to constructor + `startGame()` |
| `src/components/GameCanvas.jsx` | Import `RODS`; encounter render pass (glow + `drawFish`); time bar HUD in `drawScene()` |

---

## Out of Scope
- Sound effects
- New fish species
- Shop price rebalancing
- Save/load persistence
