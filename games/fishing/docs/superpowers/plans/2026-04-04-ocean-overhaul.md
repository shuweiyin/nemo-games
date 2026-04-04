# Ocean Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 10× deeper ocean with probabilistic ambient fish, encounter-based catch system, and rod-based time limits.

**Architecture:** All game logic changes are confined to `FishingGameEngine.js` (data arrays, state fields, update loop, new `_runEncounterRoll()` method). Rendering changes are confined to `GameCanvas.jsx` (encounter glow pass, time bar HUD). No new files.

**Tech Stack:** Vite + React 18 + HTML Canvas. No test framework — verification is visual via `npm run dev`.

**Spec:** `docs/superpowers/specs/2026-04-04-ocean-overhaul-design.md`

---

## File Map

| File | What changes |
|---|---|
| `src/engine/FishingGameEngine.js` | `OCEAN_D`; `FISH` entries (+`spawnRate`, +`maxAmbient`); `RODS` entries (+`timeLimit`); `LURES` entries (`boost`→`spawnMult`, +`legendMode`); `spawnInitialFish()`; constructor + `startGame()` state; `update()` — rawMs, descent cap, encounter swim, rare re-roll, encounter roll trigger, encounter collision, reeling pause, timer expiry; new `_runEncounterRoll()`; `castLine()` resets |
| `src/components/GameCanvas.jsx` | Import `RODS`; encounter render pass; time bar HUD |

---

## Task 1: Expand OCEAN_D and add fish data fields

**Files:**
- Modify: `src/engine/FishingGameEngine.js`

- [ ] **Step 1: Change OCEAN_D from 3000 to 30000**

In `FishingGameEngine.js`, line 5, change:
```js
const OCEAN_D = 3000;
```
to:
```js
const OCEAN_D = 30000;
```

- [ ] **Step 2: Add `spawnRate` and `maxAmbient` to every FISH entry**

Replace the entire `FISH` array (lines 22–50) with:
```js
const FISH = [
  { id: "minnow",    name: "Minnow",         w: 0.1,  v: 4,    L: 28,  H: 10,  c: "#a8d8f0", fc: "#5a9ec0", res: 2,  mn: 0.00, mx: 0.06, spawnRate: 0.90, maxAmbient: 30 },
  { id: "herring",   name: "Herring",         w: 0.3,  v: 8,    L: 38,  H: 12,  c: "#c8e0f0", fc: "#88b0d0", res: 4,  mn: 0.01, mx: 0.08, spawnRate: 0.75, maxAmbient: 20 },
  { id: "perch",     name: "Perch",           w: 0.3,  v: 10,   L: 44,  H: 20,  c: "#f0c030", fc: "#b07800", res: 5,  mn: 0.01, mx: 0.09, spawnRate: 0.70, maxAmbient: 18 },
  { id: "mackerel",  name: "Mackerel",        w: 0.5,  v: 14,   L: 58,  H: 16,  c: "#50a8d8", fc: "#1868a0", res: 7,  mn: 0.02, mx: 0.11, spawnRate: 0.60, maxAmbient: 15 },
  { id: "trout",     name: "Trout",           w: 0.8,  v: 20,   L: 70,  H: 24,  c: "#88cc68", fc: "#408030", res: 10, mn: 0.03, mx: 0.14, spawnRate: 0.55, maxAmbient: 12 },
  { id: "flounder",  name: "Flounder",        w: 1.5,  v: 28,   L: 72,  H: 52,  c: "#d4b870", fc: "#a08030", res: 11, mn: 0.05, mx: 0.17, spawnRate: 0.45, maxAmbient: 10 },
  { id: "salmon",    name: "Salmon",          w: 2.5,  v: 38,   L: 90,  H: 30,  c: "#e87858", fc: "#a03818", res: 12, mn: 0.05, mx: 0.16, spawnRate: 0.40, maxAmbient: 8  },
  { id: "cod",       name: "Cod",             w: 3,    v: 45,   L: 96,  H: 40,  c: "#c0a870", fc: "#786028", res: 14, mn: 0.07, mx: 0.19, spawnRate: 0.38, maxAmbient: 8  },
  { id: "bass",      name: "Bass",            w: 4,    v: 55,   L: 100, H: 38,  c: "#70b858", fc: "#387018", res: 15, mn: 0.06, mx: 0.17, spawnRate: 0.35, maxAmbient: 7  },
  { id: "pike",      name: "Pike",            w: 6,    v: 80,   L: 130, H: 28,  c: "#68a850", fc: "#305820", res: 18, mn: 0.10, mx: 0.24, spawnRate: 0.28, maxAmbient: 6  },
  { id: "jellyfish", name: "Jellyfish",       w: 0.8,  v: 22,   L: 48,  H: 60,  c: "#e8a8f8", fc: "#b060d0", res: 6,  mn: 0.10, mx: 0.32, spawnRate: 0.30, maxAmbient: 8  },
  { id: "eel",       name: "Moray Eel",       w: 5,    v: 70,   L: 220, H: 22,  c: "#60885a", fc: "#385028", res: 18, mn: 0.10, mx: 0.24, spawnRate: 0.22, maxAmbient: 5  },
  { id: "barracuda", name: "Barracuda",       w: 8,    v: 95,   L: 150, H: 24,  c: "#6888a0", fc: "#384860", res: 20, mn: 0.14, mx: 0.30, spawnRate: 0.18, maxAmbient: 4  },
  { id: "grouper",   name: "Grouper",         w: 12,   v: 110,  L: 110, H: 70,  c: "#c06830", fc: "#783010", res: 22, mn: 0.18, mx: 0.36, spawnRate: 0.15, maxAmbient: 3  },
  { id: "nautilus",  name: "Nautilus",        w: 3,    v: 85,   L: 70,  H: 70,  c: "#f0c890", fc: "#c07830", res: 16, mn: 0.22, mx: 0.44, spawnRate: 0.18, maxAmbient: 4  },
  { id: "tuna",      name: "Tuna",            w: 15,   v: 140,  L: 150, H: 52,  c: "#1858a8", fc: "#082868", res: 25, mn: 0.20, mx: 0.38, spawnRate: 0.12, maxAmbient: 3  },
  { id: "manta",     name: "Manta Ray",       w: 20,   v: 165,  L: 180, H: 110, c: "#203848", fc: "#101828", res: 28, mn: 0.24, mx: 0.44, spawnRate: 0.10, maxAmbient: 2  },
  { id: "swordfish", name: "Swordfish",       w: 25,   v: 220,  L: 170, H: 32,  c: "#184088", fc: "#081848", res: 30, mn: 0.28, mx: 0.48, spawnRate: 0.08, maxAmbient: 2  },
  { id: "oarfish",   name: "Oarfish",         w: 35,   v: 300,  L: 340, H: 22,  c: "#b890c0", fc: "#705880", res: 35, mn: 0.36, mx: 0.56, spawnRate: 0.06, maxAmbient: 2  },
  { id: "sunfish",   name: "Ocean Sunfish",   w: 50,   v: 380,  L: 140, H: 170, c: "#888898", fc: "#505060", res: 38, mn: 0.32, mx: 0.54, spawnRate: 0.06, maxAmbient: 2  },
  { id: "shark",     name: "Great White",     w: 80,   v: 450,  L: 220, H: 64,  c: "#607080", fc: "#303840", res: 42, mn: 0.44, mx: 0.64, spawnRate: 0.05, maxAmbient: 1  },
  { id: "colossal",  name: "Colossal Squid",  w: 45,   v: 420,  L: 200, H: 80,  c: "#c03828", fc: "#801818", res: 40, mn: 0.48, mx: 0.68, spawnRate: 0.04, maxAmbient: 1  },
  { id: "gulper",    name: "Gulper Eel",      w: 8,    v: 160,  L: 260, H: 28,  c: "#181828", fc: "#080818", res: 26, mn: 0.55, mx: 0.74, spawnRate: 0.035,maxAmbient: 1  },
  { id: "anglerfish",name: "Anglerfish",      w: 10,   v: 200,  L: 100, H: 88,  c: "#281430", fc: "#180828", res: 28, mn: 0.60, mx: 0.80, spawnRate: 0.03, maxAmbient: 1  },
  { id: "viperfish", name: "Viperfish",       w: 6,    v: 180,  L: 140, H: 30,  c: "#102830", fc: "#081820", res: 24, mn: 0.62, mx: 0.82, spawnRate: 0.025,maxAmbient: 1  },
  { id: "whale",     name: "Blue Whale",      w: 200,  v: 850,  L: 580, H: 170, c: "#284868", fc: "#101e30", res: 55, mn: 0.65, mx: 0.84, spawnRate: 0.015,maxAmbient: 1  },
  { id: "kraken",    name: "Kraken",          w: 999,  v: 2000, L: 340, H: 340, c: "#380050", fc: "#180020", res: 80, mn: 0.84, mx: 0.98, spawnRate: 0.001,maxAmbient: 1  },
];
```

- [ ] **Step 3: Update RODS with timeLimit**

Replace the RODS array:
```js
const RODS = [
  { id: "r1", name: "Beginner Rod", cost: 0,    spd: 1,   timeLimit: 5000  },
  { id: "r2", name: "Carbon Rod",   cost: 200,  spd: 1.5, timeLimit: 15000 },
  { id: "r3", name: "Pro Spinner",  cost: 600,  spd: 2.2, timeLimit: 35000 },
  { id: "r4", name: "Master's Rod", cost: 1500, spd: 3.2, timeLimit: 50000 },
];
```

- [ ] **Step 4: Update LURES — replace `boost` with `spawnMult` + `legendMode`**

Replace the LURES array:
```js
const LURES = [
  { id: "l1", name: "Basic Lure",   cost: 0,    spawnMult: 1.0,  legendMode: false },
  { id: "l2", name: "Silver Spoon", cost: 150,  spawnMult: 1.10, legendMode: false },
  { id: "l3", name: "Magic Fly",    cost: 450,  spawnMult: 1.15, legendMode: false },
  { id: "l4", name: "Legend Lure",  cost: 1200, spawnMult: 1.30, legendMode: true  },
];
```

- [ ] **Step 5: Start dev server and confirm no console errors**

```bash
cd /Users/shuweiyin/Documents/work/nemo-game/games/fishing
npm run dev
```
Open browser. Expected: game loads, fish still visible (may look different density-wise — that's fine, spawnInitialFish still uses old logic). No JS errors in console.

- [ ] **Step 6: Commit**

```bash
git add src/engine/FishingGameEngine.js
git commit -m "feat: expand ocean depth and update fish/rod/lure data arrays"
```

---

## Task 2: Rewrite spawnInitialFish and remove pending

**Files:**
- Modify: `src/engine/FishingGameEngine.js`

- [ ] **Step 1: Rewrite spawnInitialFish()**

Replace the method body (currently `this.state.swimmers = FISH.map((f) => mkSwimmer(f));`):
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

- [ ] **Step 2: Remove `pending` from the constructor state object**

In `constructor()`, find the state object literal and remove the line:
```js
pending: 0, // pending fish to respawn   ← DELETE THIS LINE
```

- [ ] **Step 3: Remove `pending` from `startGame()` state object**

In `startGame()`, find the state object literal and remove:
```js
pending: 0,   ← DELETE THIS LINE
```

- [ ] **Step 4: Delete the pending respawn block from `update()`**

Find and delete this entire block (currently around line 256):
```js
// Respawn one pending swimmer per frame when idle
if (this.state.phase === "idle" && this.state.pending > 0) {
  const idx = this.state.swimmers.findIndex((s) => s === null);
  const slot = idx !== -1 ? idx : this.state.swimmers.length;
  this.state.swimmers[slot] = mkSwimmer(FISH[slot % FISH.length]);
  this.state.pending--;
}
```

- [ ] **Step 5: Verify in browser**

Refresh dev server. Expected: ~177 ambient fish visible (many minnows/herring near surface, sparse/none in deep). No console errors.

- [ ] **Step 6: Commit**

```bash
git add src/engine/FishingGameEngine.js
git commit -m "feat: probabilistic ambient fish population, remove pending respawn system"
```

---

## Task 3: Add new state fields and castLine resets

**Files:**
- Modify: `src/engine/FishingGameEngine.js`

- [ ] **Step 1: Add new fields to the constructor state object**

In `constructor()`, add these fields to the `this.state = { ... }` object (after the existing `lastR: 0,` line):
```js
encounters: [],
nextEncounterRoll: 0,
driftStartTime: 0,
lastCatchTime: 0,
reelingEntryTime: 0,
totalPausedMs: 0,
lastRareRoll: 0,
```

- [ ] **Step 2: Add the same fields to `startGame()`**

In `startGame()`, add the same lines to its state object (after `lastR: 0,`):
```js
encounters: [],
nextEncounterRoll: 0,
driftStartTime: 0,
lastCatchTime: 0,
reelingEntryTime: 0,
totalPausedMs: 0,
lastRareRoll: 0,
```

- [ ] **Step 3: Reset timer/encounter fields at the top of `castLine()`**

In `castLine()`, add these lines at the very top of the method (before the phase check):
```js
castLine() {
  this.state.driftStartTime = 0;
  this.state.lastCatchTime = 0;
  this.state.totalPausedMs = 0;
  this.state.reelingEntryTime = 0;
  this.state.nextEncounterRoll = 0;
  this.state.encounters = [];

  if (this.state.phase !== "idle") return;
  // ... rest of existing code unchanged
```

- [ ] **Step 4: Verify no console errors**

Refresh dev server. Cast a line (Space key). Expected: game works as before. No errors.

- [ ] **Step 5: Commit**

```bash
git add src/engine/FishingGameEngine.js
git commit -m "feat: add encounter and timer state fields, reset on castLine"
```

---

## Task 4: Add descent speed cap

**Files:**
- Modify: `src/engine/FishingGameEngine.js`

- [ ] **Step 1: Save rawMs before the dt clamp**

At the top of `update(dt)`, change:
```js
update(dt) {
  // Clamp deltaTime to prevent huge jumps
  dt = Math.min(dt, 3);
```
to:
```js
update(dt) {
  // Save raw ms before clamping (used for descent speed cap only)
  const rawMs = dt;
  // Clamp deltaTime to prevent huge jumps
  dt = Math.min(dt, 3);
```

- [ ] **Step 2: Apply descent cap in the drifting line update**

In `update()`, inside `if (l.state === "drifting")`, find:
```js
l.depth += (td - l.depth) * 0.025 * dt;
```
Replace with:
```js
const maxDelta = 750 * (rawMs / 1000);
const rawDelta = (td - l.depth) * 0.025 * dt;
l.depth += Math.sign(rawDelta) * Math.min(Math.abs(rawDelta), maxDelta);
```

- [ ] **Step 3: Verify descent speed in browser**

Open dev server. Cast and move mouse to bottom of screen. Time how long it takes for the depth HUD to reach ~30000. Expected: roughly 40 seconds of continuous downward mouse pressure. Shallower mouse movements will be slower.

- [ ] **Step 4: Commit**

```bash
git add src/engine/FishingGameEngine.js
git commit -m "feat: cap hook descent speed at 750 units/sec (40s to ocean floor)"
```

---

## Task 5: Add ultra-rare ambient re-roll

**Files:**
- Modify: `src/engine/FishingGameEngine.js`

- [ ] **Step 1: Add re-roll block to `update()`**

After the existing wave animation update (`this.state.waveOff += 0.018 * dt;`) and before the bubbles update, add:
```js
// Re-roll ambient slots for ultra-rare species every 60 seconds
if (performance.now() - this.state.lastRareRoll > 60000) {
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

- [ ] **Step 2: Verify no console errors**

Refresh dev server. Expected: game works normally. (The re-roll only fires after 60s so you won't see it immediately — verifying no crash is sufficient.)

- [ ] **Step 3: Commit**

```bash
git add src/engine/FishingGameEngine.js
git commit -m "feat: periodic re-roll for ultra-rare ambient fish (kraken)"
```

---

## Task 6: Add encounter swim update

**Files:**
- Modify: `src/engine/FishingGameEngine.js`

- [ ] **Step 1: Add encounter swim loop to `update()`**

After the existing swimmer forEach loop (the one that updates wobble, x, depth, direction), add:
```js
// Update encounter fish positions
this.state.encounters.forEach((e) => {
  e.wobble += 0.06 * dt;
  e.x += e.vx * dt;
  if (e.x < -e.fish.L) e.x = CW + e.fish.L;
  if (e.x > CW + e.fish.L) e.x = -e.fish.L;
});
```

- [ ] **Step 2: Verify no console errors**

Refresh dev server. Expected: no errors. (Encounters array is empty until Task 7, so this loop does nothing yet.)

- [ ] **Step 3: Commit**

```bash
git add src/engine/FishingGameEngine.js
git commit -m "feat: encounter fish swim each frame"
```

---

## Task 7: Add _runEncounterRoll() method and roll trigger

**Files:**
- Modify: `src/engine/FishingGameEngine.js`

- [ ] **Step 1: Add `_runEncounterRoll()` as a new method on the class**

Add this method after the `reel()` method and before `catchFish()`:
```js
_runEncounterRoll() {
  const driftingLine = this.state.lines.find(l => l.state === 'drifting');
  if (!driftingLine) return;

  const hookDepth = driftingLine.depth;
  const hookSX = driftingLine.sx;
  const lure = LURES.find(l => l.id === this.state.lure);

  if (lure.legendMode) {
    // Legend Lure: bimodal — 5% kraken, 95% minnow, depth ignored
    if (this.state.encounters.length < 10) {
      const f = Math.random() < 0.05
        ? FISH.find(f => f.id === 'kraken')
        : FISH.find(f => f.id === 'minnow');
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
    this.state.nextEncounterRoll = performance.now() + 1400 + Math.random() * 700;
  } else {
    // Standard lures: per-species depth-filtered roll
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
    this.state.nextEncounterRoll = performance.now() + 2000 + Math.random() * 1000;
  }
}
```

- [ ] **Step 2: Add the roll trigger to `update()`**

After the encounter swim loop (added in Task 6), add:
```js
// Trigger encounter roll when drifting and timer is due
if (this.state.phase === 'drifting' &&
    this.state.nextEncounterRoll > 0 &&
    performance.now() >= this.state.nextEncounterRoll) {
  this._runEncounterRoll();
}
```

- [ ] **Step 3: Initialize nextEncounterRoll when line enters water**

In `update()`, inside `if (l.state === "flying")`, find where `l.state = "drifting"` is set (after `l.arcY > 0` check). After that assignment, add:
```js
// Start encounter roll timer when hook first hits water
if (this.state.nextEncounterRoll === 0) {
  this.state.nextEncounterRoll = performance.now() + 2000 + Math.random() * 1000;
}
```

- [ ] **Step 4: Verify encounters spawn in browser**

Cast a line, guide hook underwater. After 2–3 seconds, glowing fish should appear near the hook (they won't be catchable yet — that's Task 8). Open console and type `window._dbg = true` — or simply observe the ocean: encounter fish will just look like regular fish for now (glow added in Task 9). No errors.

- [ ] **Step 5: Commit**

```bash
git add src/engine/FishingGameEngine.js
git commit -m "feat: encounter roll system — fish spawn near hook every 2-3s"
```

---

## Task 8: Replace swimmer collision with encounter collision

**Files:**
- Modify: `src/engine/FishingGameEngine.js`

- [ ] **Step 1: Delete the existing swimmer hitIdx collision block**

In `update()`, inside `if (l.state === "drifting")`, find and **delete** this entire block:
```js
// Check collision using virtual depth (same coord space as l.depth)
const hitIdx = this.state.swimmers.findIndex((s) => {
  if (!s) return false;

  // Check if fish is within camera view (virtual depth coords)
  if (s.depth < this.state.cameraY - s.fish.H ||
      s.depth > this.state.cameraY + VIEW_H + s.fish.H) return false;

  // Check collision using virtual depth (same coord space as l.depth)
  return (
    Math.hypot(s.x - l.sx, s.depth - l.depth) <
    22 + s.fish.L * 0.28
  );
});

if (hitIdx !== -1) {
  // Fish hooked!
  const hit = this.state.swimmers[hitIdx];
  l.hooked = { ...hit.fish, sx: l.sx, sd: l.depth };
  l.state = "reeling";
  l.prog = 0;
  this.state.phase = "reeling";

  // Mark fish for respawn
  this.state.swimmers[hitIdx] = null;
  this.state.pending++;
}
```

- [ ] **Step 2: Add encounter collision block in its place**

In the same location (inside `if (l.state === "drifting")`), after the depth/x smoothing lines, add:
```js
// Check collision against encounter fish
const hitIdx = this.state.encounters.findIndex(e =>
  Math.hypot(e.x - l.sx, e.depth - l.depth) < 22 + e.fish.L * 0.28
);

if (hitIdx !== -1) {
  const hit = this.state.encounters[hitIdx];
  this.state.encounters.splice(hitIdx, 1);
  l.hooked = { ...hit.fish, sx: l.sx, sd: l.depth };
  l.state = "reeling";
  l.prog = 0;
  this.state.phase = "reeling";
  // Record when reeling started (for timer pause) — only on first hook
  if (this.state.reelingEntryTime === 0) {
    this.state.reelingEntryTime = performance.now();
  }
}
```

- [ ] **Step 3: Set lastCatchTime when a fish is landed**

In `update()`, inside `if (l.state === "reeling")`, find the `if (l.prog >= 100)` block. Inside it, after `l.state = "done";`, add:
```js
this.state.lastCatchTime = performance.now();
```

- [ ] **Step 4: Accumulate paused time when all lines finish reeling**

In `update()`, find the existing "check if all lines are done" block at the bottom:
```js
if (
  this.state.lines.length > 0 &&
  this.state.lines.every((l) => l.state === "done")
) {
  this.state.phase = "idle";
  this.state.lines = [];
  this.state.hookDepth = 0;
}
```
Replace with:
```js
if (
  this.state.lines.length > 0 &&
  this.state.lines.every((l) => l.state === "done")
) {
  // Accumulate time spent reeling so timer doesn't count it
  if (this.state.reelingEntryTime > 0) {
    this.state.totalPausedMs += performance.now() - this.state.reelingEntryTime;
    this.state.reelingEntryTime = 0;
  }
  this.state.phase = "idle";
  this.state.lines = [];
  this.state.hookDepth = 0;
}
```

- [ ] **Step 5: Verify fish can be caught again**

Cast a line, wait for encounter fish to appear (2–3s), guide hook to one. Expected: fish hooks, reel in with R key, fish lands in inventory. Console popup shows fish name. Ambient swimmers continue to swim freely (no longer catchable).

- [ ] **Step 6: Commit**

```bash
git add src/engine/FishingGameEngine.js
git commit -m "feat: encounter-based catch system, timer pause during reel"
```

---

## Task 9: Add time limit with expiry

**Files:**
- Modify: `src/engine/FishingGameEngine.js`

- [ ] **Step 1: Set driftStartTime when first line hits water**

In `update()`, inside `if (l.state === "flying")`, find where `l.state = "drifting"` is set. After the `nextEncounterRoll` initialization added in Task 7, add:
```js
if (this.state.driftStartTime === 0) {
  this.state.driftStartTime = performance.now();
}
```

- [ ] **Step 2: Add timer expiry check to `update()`**

After the encounter roll trigger block (added in Task 7), add:
```js
// Check time limit expiry (only during drifting, not reeling)
if (this.state.phase === 'drifting') {
  const rod = RODS.find(r => r.id === this.state.rod);
  const effectiveStart = Math.max(this.state.driftStartTime, this.state.lastCatchTime);
  const timeRemaining = rod.timeLimit - (performance.now() - effectiveStart - this.state.totalPausedMs);

  if (timeRemaining <= 0) {
    this.state.lines = [];
    this.state.encounters = [];
    this.state.phase = 'idle';
    this.state.hookDepth = 0;
    this.state.driftStartTime = 0;
    this.state.lastCatchTime = 0;
    this.state.totalPausedMs = 0;
    this.state.reelingEntryTime = 0;
    this.state.nextEncounterRoll = 0;
  }
}
```

- [ ] **Step 3: Verify time limit with Beginner Rod (5 seconds)**

In the browser, ensure Beginner Rod is equipped (default). Cast a line. Expected: after 5 seconds underwater with no catch, the line snaps back and phase returns to idle. If you catch a fish, the 5-second timer resets. Upgrade to Master's Rod in shop — timer should now be 50 seconds.

- [ ] **Step 4: Commit**

```bash
git add src/engine/FishingGameEngine.js
git commit -m "feat: rod-based time limit with per-catch timer reset"
```

---

## Task 10: Render encounter fish with glow

**Files:**
- Modify: `src/components/GameCanvas.jsx`

- [ ] **Step 1: Add `encounters` to the state snapshot used by the renderer**

The renderer already receives the full `state` snapshot via `getState()` — `encounters` is now in that snapshot. No change needed to the data flow.

- [ ] **Step 2: Add the encounter render pass in `drawScene()`**

In `drawScene()`, find the swimmers render loop:
```js
// swimmers (fish)
r.swimmers.forEach((s) => {
  if (!s) return;
  ...
});
```

Immediately **after** this block and **before** the `// BOAT —` comment, add:
```js
// encounter fish (catchable) — rendered with pulsing glow
const encT = performance.now();
r.encounters.forEach((e) => {
  if (!e) return;
  const sy = toScreen(e.depth);
  if (sy < -e.fish.H || sy > VH + e.fish.H) return;
  // Pulsing glow ring
  ctx.save();
  ctx.strokeStyle = e.fish.c + '88';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(e.x, sy, 16 + Math.sin(encT * 0.005) * 4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  // Fish body
  drawFish(ctx, e.fish, e.x, sy, e.dir, 1, 1, encT);
});
```

- [ ] **Step 3: Verify encounter fish render**

Cast a line in the browser. After 2–3 seconds, encounter fish should appear near the hook with a coloured pulsing ring around them. Guide the hook into one — it should hook. No errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/GameCanvas.jsx
git commit -m "feat: render encounter fish with pulsing glow indicator"
```

---

## Task 11: Add time bar HUD

**Files:**
- Modify: `src/components/GameCanvas.jsx`

- [ ] **Step 1: Import RODS in GameCanvas.jsx**

At the top of the file, find the existing import from `FishingGameEngine`:
```js
import {
  CW,
  VH,
  WATER_SY,
  OCEAN_D,
  BOAT_SX,
  BOAT_SY,
  BOAT_W,
  BOAT_H,
  ROD_SX,
  ROD_SY,
  FISH,
} from '../engine/FishingGameEngine';
```
Add `RODS` to the list:
```js
import {
  CW,
  VH,
  WATER_SY,
  OCEAN_D,
  BOAT_SX,
  BOAT_SY,
  BOAT_W,
  BOAT_H,
  ROD_SX,
  ROD_SY,
  FISH,
  RODS,
} from '../engine/FishingGameEngine';
```

- [ ] **Step 2: Add the time bar to `drawScene()`**

In `drawScene()`, find the depth HUD block:
```js
// depth HUD — shown during active fishing
if (r.phase === 'drifting' || r.phase === 'reeling') {
```

Immediately **after** this entire depth HUD block (after its closing `}`), add:
```js
// time bar — shown during drifting
if (r.phase === 'drifting' && r.driftStartTime > 0) {
  const rod = RODS.find(rd => rd.id === r.rod);
  const effectiveStart = Math.max(r.driftStartTime, r.lastCatchTime);
  const timeRemaining = rod.timeLimit - (performance.now() - effectiveStart - r.totalPausedMs);
  const pct = Math.max(0, timeRemaining / rod.timeLimit);
  const barW = 120;
  const barH = 10;
  const bx = CW - barW - 14;
  const by = 46;

  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath();
  ctx.roundRect(bx, by, barW, barH, 4);
  ctx.fill();

  const barColor = pct >= 0.40 ? '#44ee66' : pct >= 0.15 ? '#ffaa22' : '#ff3322';
  ctx.fillStyle = barColor;
  ctx.beginPath();
  ctx.roundRect(bx, by, barW * pct, barH, 4);
  ctx.fill();

  const secs = Math.ceil(Math.max(0, timeRemaining / 1000));
  ctx.fillStyle = barColor;
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`${secs}s`, CW - 14, by + barH - 1);
}
```

- [ ] **Step 3: Verify time bar in browser**

Cast a line. Expected: a green bar appears in the top-right corner counting down. Bar turns amber at 40%, red at 15%. Label shows seconds remaining. Bar disappears when idle.

- [ ] **Step 4: Commit**

```bash
git add src/components/GameCanvas.jsx
git commit -m "feat: time bar HUD showing rod time limit countdown"
```

---

## Post-Implementation Checklist

Verify all major features work end-to-end:

- [ ] Ocean is visually much larger — camera scrolls far before hitting the bottom
- [ ] Many minnows/herring visible near the surface; sparse/no fish deep
- [ ] Occasionally a Kraken appears as ambient swimmer in the deep (rare — may need to wait)
- [ ] After casting, encounter fish (with glow rings) spawn near hook every 2–3 seconds
- [ ] Multiple species can appear simultaneously near the hook
- [ ] Guide hook into encounter fish — fish hooks, reel in with R, fish lands in inventory
- [ ] Ambient swimmers cannot be caught (hook passes through them)
- [ ] Beginner Rod: line snaps after 5 seconds with no catch; timer resets on catch
- [ ] Carbon Rod: 15 seconds; Pro Spinner: 35 seconds; Master's Rod: 50 seconds
- [ ] Time bar shows in top-right during drifting, correct colours, disappears on idle
- [ ] Legend Lure: after equipping, encounters are only minnows or krakens
- [ ] Silver Spoon / Magic Fly: more frequent encounter fish vs Basic Lure
- [ ] Selling fish in shop still works; buying rods/lures/nets still works
