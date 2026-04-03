# Deep Ocean, Camera Pan & Fish Visibility Design

**Date:** 2026-04-03
**Status:** Approved

## Overview

Three related changes that transform the fishing game from a shallow, static ocean into a massive scrolling world:

1. **Virtual ocean 6× deeper** — spread all 27 fish across a much larger depth range
2. **Full camera pan** — the entire canvas follows the hook as it descends; sky and boat scroll out of view in deep water
3. **Bug fix: ocean color lag** — ocean gradient responds to mouse position immediately instead of lagging behind the hook

---

## 1. Virtual Ocean Scale

**Change:** `OCEAN_D` constant in `FishingGameEngine.js` increases from `520` to `3000`.

All 27 fish use proportional depth ranges (`mn`/`mx` as 0.0–1.0 fractions of `OCEAN_D`). No fish data changes — they auto-spread when `OCEAN_D` grows:

| Zone | Depth range | Example fish |
|------|-------------|--------------|
| Sunlight | 0–600px | Minnow, Herring, Perch |
| Twilight | 600–1200px | Mackerel, Trout, Bass, Pike |
| Midnight | 1200–1950px | Tuna, Manta Ray, Swordfish, Shark |
| Abyssal | 1950–2700px | Anglerfish, Viperfish, Whale |
| Hadal | 2700–3000px | Kraken |

The visible canvas ocean window is still 520px tall (`VH - WATER_SY`). The camera shows a 520px slice of the 3000px virtual ocean.

---

## 2. Camera System

### State

Add `cameraY` to engine state (default `0`). This is how far down (in virtual ocean pixels) the camera has scrolled.

```js
cameraY: 0   // 0 = top of ocean, 3000-520 = bottom of ocean
```

### Camera Target

Camera follows `hookDepth` during active fishing, returns to `0` during idle:

```js
const VIEW_H = VH - WATER_SY;  // 520
const targetCameraY = phase === 'idle'
  ? 0
  : Math.max(0, Math.min(OCEAN_D - VIEW_H, hookDepth - VIEW_H * 0.4));
```

The hook sits ~40% down the visible ocean window — enough to see what's below it.

### Smooth Movement

In `update()`, camera smoothly interpolates toward target:

```js
const camSpeed = phase === 'idle' ? 0.08 : 0.04;
state.cameraY += (targetCameraY - state.cameraY) * camSpeed * dt;
```

### Mouse Position Fix

`setMousePosition(x, y)` must add `cameraY` when converting screen Y to depth:

```js
setMousePosition(x, y) {
  this.state.mouseSX = x;
  this.state.mouseDepth = s2d(y) + this.state.cameraY;
}
```

---

## 3. Rendering Changes (GameCanvas.jsx)

### Coordinate Transform

Replace direct `d2s(depth)` calls with a camera-offset version:

```js
// Old:  screenY = WATER_SY + depth
// New:  screenY = WATER_SY + depth - cameraY
const toScreen = (depth) => WATER_SY + depth - r.cameraY;
```

### Sky & Boat (Full Camera Pan)

Sky and boat use world Y coordinates offset by camera:

- Sky gradient drawn from `0 - cameraY` to `WATER_SY - cameraY` (scrolls off the top)
- Boat drawn at `BOAT_SY - cameraY`; clipped by canvas if camera has scrolled past it
- When `cameraY >= WATER_SY`, sky is fully off-screen; fill entire canvas with ocean

### Ocean Gradient

```js
// Bug fix: use mouseDepth for immediate color response
// mouseDepth already includes cameraY (set via setMousePosition fix)
const df = Math.min(1, r.mouseDepth / OCEAN_D);
```

The gradient still spans `WATER_SY` to `VH` visually, but its color stops reflect true depth.

### Fish Visibility Culling

Fish drawn only when their screen Y is within the canvas:

```js
const sy = toScreen(s.depth);
if (sy < WATER_SY - s.fish.H || sy > VH + s.fish.H) return;
```

### Depth Zone Labels

Zone labels use `toScreen()` so they scroll with the camera. Label only shown when its screen Y is within the ocean section.

### Hook, Lines, Bubbles

All positions converted via `toScreen()`. No logic changes — just coordinate translation.

### Depth Indicator (HUD)

Add a small depth readout at top-right showing current hook depth in meters:

```
[  depth: 847m  ]
```

Visible only during drifting/reeling phases.

---

## Files Changed

| File | Changes |
|------|---------|
| `src/engine/FishingGameEngine.js` | `OCEAN_D` 520→3000; add `cameraY` to state; camera update in `update()`; fix `setMousePosition()` |
| `src/components/GameCanvas.jsx` | `toScreen()` helper; camera-offset sky/boat; ocean gradient `df` fix; depth HUD |

No changes to fish data, game phases, hook/reel logic, or other components.

---

## Hit Detection Note

The existing hit detection in `FishingGameEngine.js` uses `d2s(s.depth)` to check if a fish is on-screen before testing collision. With the camera, the correct check is whether the fish is within the visible camera window:

```js
// Fish visible check with camera
const inView = s.depth >= r.cameraY && s.depth <= r.cameraY + VIEW_H + s.fish.H;
```

This ensures only visible fish can be hooked.
