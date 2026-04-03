# Deep Ocean Camera Pan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the virtual ocean to 3000px, add a full-canvas camera that follows the fishing hook, fix the ocean color lag bug, and spread all 27 fish across the new depth range.

**Architecture:** `OCEAN_D` grows from 520→3000 in the engine (fish auto-spread via their % ranges). A new `cameraY` engine state tracks how far the canvas has scrolled down. All rendering in `GameCanvas.jsx` applies a `toScreen(depth)` offset using `cameraY`, and `setMousePosition` compensates so mouse depth maps to the correct virtual position.

**Tech Stack:** React 18, Vite, HTML Canvas 2D API (no new dependencies)

---

## Task 1: Expand virtual ocean depth

**Files:**
- Modify: `src/engine/FishingGameEngine.js` (lines 1–11)

- [ ] **Step 1: Change OCEAN_D**

In `src/engine/FishingGameEngine.js`, replace lines 1–11:

```js
// ─── constants ───────────────────────────────────────────────────────────────
const CW = 1100;
const VH = 780;
const WATER_SY = 260;
const OCEAN_D = 3000;
const BOAT_SX = CW / 2;
const BOAT_SY = WATER_SY;
const BOAT_W = 420;
const BOAT_H = 160;
const ROD_SX = BOAT_SX + 162;
const ROD_SY = BOAT_SY - 105;
```

Note: `OCEAN_D` is now a fixed `3000` (not derived from `VH - WATER_SY`). The visible ocean window stays 520px (`VH - WATER_SY`). The camera shows a 520px slice of 3000px.

- [ ] **Step 2: Start dev server and confirm fish spread**

```bash
npm run dev
```

Open browser, click to cast. During drifting, move mouse to the bottom. You should still see the hook and fish — the fish positions update but the camera doesn't scroll yet. Confirm no console errors.

- [ ] **Step 3: Commit**

```bash
git add src/engine/FishingGameEngine.js
git commit -m "feat: expand virtual ocean depth to 3000px"
```

---

## Task 2: Add cameraY to engine state and update logic

**Files:**
- Modify: `src/engine/FishingGameEngine.js`

- [ ] **Step 1: Add cameraY to initial state in constructor**

In `src/engine/FishingGameEngine.js`, in the `constructor()`, the `this.state = { ... }` block — add `cameraY: 0` after `waveOff: 0`:

```js
      waveOff: 0,
      cameraY: 0,
      rod: "r1",
```

- [ ] **Step 2: Add cameraY to startGame() reset**

In `startGame()`, the `this.state = { ... }` block — add `cameraY: 0` after `waveOff: 0`:

```js
      waveOff: 0,
      cameraY: 0,
      rod: "r1",
```

- [ ] **Step 3: Add camera update in update()**

In `update(dt)`, after the wave animation line (`this.state.waveOff += 0.018 * dt;`), add the camera update block:

```js
    // Update wave animation
    this.state.waveOff += 0.018 * dt;

    // Update camera to follow hook depth
    const VIEW_H = VH - WATER_SY;
    const targetCameraY = this.state.phase === 'idle'
      ? 0
      : Math.max(0, Math.min(OCEAN_D - VIEW_H, this.state.hookDepth - VIEW_H * 0.4));
    const camSpeed = this.state.phase === 'idle' ? 0.08 : 0.04;
    this.state.cameraY += (targetCameraY - this.state.cameraY) * camSpeed * dt;
```

- [ ] **Step 4: Fix setMousePosition to account for cameraY**

Replace the existing `setMousePosition` method:

```js
  setMousePosition(x, y) {
    this.state.mouseSX = x;
    this.state.mouseDepth = s2d(y) + this.state.cameraY;
  }
```

`s2d(y)` = `y - WATER_SY`. Adding `cameraY` converts screen Y to virtual ocean depth.

- [ ] **Step 5: Verify in browser**

```bash
npm run dev
```

Cast, move mouse down. The game still runs without errors. Camera scrolling not yet visible (rendering not updated). Confirm `engine.getState().cameraY` is non-zero by opening devtools console after casting and moving mouse down. You can temporarily add `console.log(engine.getState().cameraY)` in `useGameState.js` inside the game loop to verify — remove it after.

- [ ] **Step 6: Commit**

```bash
git add src/engine/FishingGameEngine.js
git commit -m "feat: add cameraY state and camera tracking to engine"
```

---

## Task 3: Fix hit detection for camera

**Files:**
- Modify: `src/engine/FishingGameEngine.js` (the drifting hit detection block)

- [ ] **Step 1: Replace screen-Y hit detection with depth-based detection**

In `update()`, find the drifting block. The current hit detection (around line 297):

```js
        const hookSY = d2s(l.depth);

        // Hit detection against visible swimmers
        const hitIdx = this.state.swimmers.findIndex((s) => {
          if (!s) return false;
          const fsy = d2s(s.depth);

          // Check if fish is visible on screen
          if (fsy < WATER_SY - s.fish.H || fsy > VH + s.fish.H) return false;

          // Check collision with hook
          return (
            Math.hypot(s.x - l.sx, fsy - hookSY) <
            22 + s.fish.L * 0.28
          );
        });
```

Replace it with:

```js
        // Hit detection against swimmers visible in camera window
        const VIEW_H = VH - WATER_SY;
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
```

Note: `hookSY` variable is no longer needed — collision is now in virtual depth space, not screen Y space. Delete the `const hookSY = d2s(l.depth);` line too.

- [ ] **Step 2: Verify no console errors and fishing still works**

```bash
npm run dev
```

Cast, move mouse, catch a fish. Confirm fish are hookable and catch notifications appear.

- [ ] **Step 3: Commit**

```bash
git add src/engine/FishingGameEngine.js
git commit -m "fix: update hit detection to use virtual depth with camera offset"
```

---

## Task 4: Update GameCanvas rendering for camera

**Files:**
- Modify: `src/components/GameCanvas.jsx`

This task updates all rendering in `drawScene()` to apply `cameraY` offset.

- [ ] **Step 1: Add toScreen helper at the top of drawScene**

In `GameCanvas.jsx`, find the `drawScene` function definition:

```js
  function drawScene(ctx, r, engine) {
    ctx.clearRect(0, 0, CW, VH);
```

Replace with:

```js
  function drawScene(ctx, r, engine) {
    ctx.clearRect(0, 0, CW, VH);

    // Camera offset: converts virtual depth to canvas Y within the ocean section
    const cameraY = r.cameraY ?? 0;
    const toScreen = (depth) => WATER_SY + depth - cameraY;
```

- [ ] **Step 2: Update sky, sun, and clouds to scroll with camera**

Find the sky section (fills from `0` to `WATER_SY`) through clouds:

```js
    // SKY — fixed 0..WATER_SY
    const sky = ctx.createLinearGradient(0, 0, 0, WATER_SY);
    sky.addColorStop(0, '#4a96d0');
    sky.addColorStop(1, '#a0d4f0');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, CW, WATER_SY);

    // sun
    ctx.fillStyle = '#fff8c0';
    ctx.beginPath();
    ctx.arc(CW - 120, 50, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,240,100,0.12)';
    ctx.beginPath();
    ctx.arc(CW - 120, 50, 52, 0, Math.PI * 2);
    ctx.fill();

    // clouds
    [
      [200, 80, 60, 20],
      [550, 60, 80, 24],
      [850, 75, 55, 18],
    ].forEach(([cx, cy, cw2, ch2]) => {
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.beginPath();
      ctx.ellipse(cx, cy, cw2, ch2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx - cw2 * 0.4, cy + ch2 * 0.3, cw2 * 0.55, ch2 * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + cw2 * 0.4, cy + ch2 * 0.3, cw2 * 0.55, ch2 * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
    });
```

Replace with:

```js
    // SKY — scrolls up with camera
    const skyTop = -cameraY;
    const skyBottom = WATER_SY - cameraY;
    if (skyBottom > 0) {
      const sky = ctx.createLinearGradient(0, skyTop, 0, skyBottom);
      sky.addColorStop(0, '#4a96d0');
      sky.addColorStop(1, '#a0d4f0');
      ctx.fillStyle = sky;
      ctx.fillRect(0, Math.max(0, skyTop), CW, Math.min(skyBottom, VH) - Math.max(0, skyTop));
    }

    // sun — scrolls with sky
    const sunY = 50 - cameraY;
    if (sunY > -52 && sunY < VH) {
      ctx.fillStyle = '#fff8c0';
      ctx.beginPath();
      ctx.arc(CW - 120, sunY, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,240,100,0.12)';
      ctx.beginPath();
      ctx.arc(CW - 120, sunY, 52, 0, Math.PI * 2);
      ctx.fill();
    }

    // clouds — scroll with sky
    if (skyBottom > 0) {
      [
        [200, 80, 60, 20],
        [550, 60, 80, 24],
        [850, 75, 55, 18],
      ].forEach(([cx, cy, cw2, ch2]) => {
        const cloudY = cy - cameraY;
        if (cloudY < -ch2 || cloudY > VH) return;
        ctx.fillStyle = 'rgba(255,255,255,0.92)';
        ctx.beginPath();
        ctx.ellipse(cx, cloudY, cw2, ch2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx - cw2 * 0.4, cloudY + ch2 * 0.3, cw2 * 0.55, ch2 * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + cw2 * 0.4, cloudY + ch2 * 0.3, cw2 * 0.55, ch2 * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
      });
    }
```

- [ ] **Step 3: Update ocean gradient (includes bug fix)**

Find the ocean gradient section:

```js
    // OCEAN — WATER_SY to VH
    const df = Math.min(1, r.hookDepth / OCEAN_D);
    const oc = ctx.createLinearGradient(0, WATER_SY, 0, VH);
    oc.addColorStop(0, '#1a90d4');
    oc.addColorStop(0.3, df < 0.4 ? '#0d60a0' : '#063060');
    oc.addColorStop(0.7, df < 0.6 ? '#063368' : '#021428');
    oc.addColorStop(1, df < 0.8 ? '#042050' : '#010510');
    ctx.fillStyle = oc;
    ctx.fillRect(0, WATER_SY, CW, VH - WATER_SY);
```

Replace with:

```js
    // OCEAN — spans from water surface (or canvas top if camera scrolled) to VH
    // Bug fix: use mouseDepth for immediate color response (already includes cameraY)
    const df = Math.min(1, r.mouseDepth / OCEAN_D);
    const oceanTop = Math.max(0, WATER_SY - cameraY);
    const oc = ctx.createLinearGradient(0, oceanTop, 0, VH);
    oc.addColorStop(0, cameraY > 100 ? '#0d60a0' : '#1a90d4');
    oc.addColorStop(0.3, df < 0.4 ? '#0d60a0' : '#063060');
    oc.addColorStop(0.7, df < 0.6 ? '#063368' : '#021428');
    oc.addColorStop(1, df < 0.8 ? '#042050' : '#010510');
    ctx.fillStyle = oc;
    ctx.fillRect(0, oceanTop, CW, VH - oceanTop);
```

- [ ] **Step 4: Update surface shimmer and waves**

Find the shimmer + waves section:

```js
    // surface shimmer + waves
    ctx.fillStyle = 'rgba(100,200,255,0.05)';
    const t = Date.now();
    for (let i = 0; i < 20; i++) {
      const sx = (i * 117 + t * 0.025) % CW;
      ctx.fillRect(sx, WATER_SY, 28 + Math.sin(t * 0.003 + i) * 12, 3);
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.28)';
    ctx.lineWidth = 1.8;
    for (let w = 0; w < 3; w++) {
      ctx.beginPath();
      for (let i = 0; i <= CW; i += 6) {
        const sy = WATER_SY + Math.sin(i * 0.015 + r.waveOff + w * 1.1) * 5;
        i === 0 ? ctx.moveTo(i, sy) : ctx.lineTo(i, sy);
      }
      ctx.stroke();
    }
```

Replace with:

```js
    // surface shimmer + waves (only visible when water surface is on screen)
    const surfaceY = WATER_SY - cameraY;
    const t = Date.now();
    if (surfaceY > 0 && surfaceY < VH) {
      ctx.fillStyle = 'rgba(100,200,255,0.05)';
      for (let i = 0; i < 20; i++) {
        const sx = (i * 117 + t * 0.025) % CW;
        ctx.fillRect(sx, surfaceY, 28 + Math.sin(t * 0.003 + i) * 12, 3);
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.28)';
      ctx.lineWidth = 1.8;
      for (let w = 0; w < 3; w++) {
        ctx.beginPath();
        for (let i = 0; i <= CW; i += 6) {
          const sy = surfaceY + Math.sin(i * 0.015 + r.waveOff + w * 1.1) * 5;
          i === 0 ? ctx.moveTo(i, sy) : ctx.lineTo(i, sy);
        }
        ctx.stroke();
      }
    }
```

- [ ] **Step 5: Update depth zone labels**

Find the depth zones section:

```js
    // depth zones
    [
      { d: OCEAN_D * 0.08, l: 'Sunlight' },
      { d: OCEAN_D * 0.28, l: 'Twilight' },
      { d: OCEAN_D * 0.52, l: 'Midnight' },
      { d: OCEAN_D * 0.74, l: 'Abyssal' },
      { d: OCEAN_D * 0.9, l: 'Hadal' },
    ].forEach((z) => {
      const sy = d2s(z.d);
      if (sy < WATER_SY || sy > VH) return;
      ctx.fillStyle = 'rgba(160,210,255,0.25)';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(z.l + ' Zone', 12, sy - 3);
      ctx.strokeStyle = 'rgba(160,210,255,0.1)';
      ctx.lineWidth = 0.5;
      ctx.setLineDash([5, 6]);
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(CW, sy);
      ctx.stroke();
      ctx.setLineDash([]);
    });
```

Replace with:

```js
    // depth zones
    [
      { d: OCEAN_D * 0.08, l: 'Sunlight' },
      { d: OCEAN_D * 0.28, l: 'Twilight' },
      { d: OCEAN_D * 0.52, l: 'Midnight' },
      { d: OCEAN_D * 0.74, l: 'Abyssal' },
      { d: OCEAN_D * 0.9, l: 'Hadal' },
    ].forEach((z) => {
      const sy = toScreen(z.d);
      if (sy < 0 || sy > VH) return;
      ctx.fillStyle = 'rgba(160,210,255,0.25)';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(z.l + ' Zone', 12, sy - 3);
      ctx.strokeStyle = 'rgba(160,210,255,0.1)';
      ctx.lineWidth = 0.5;
      ctx.setLineDash([5, 6]);
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(CW, sy);
      ctx.stroke();
      ctx.setLineDash([]);
    });
```

- [ ] **Step 6: Update bubbles**

Find the bubbles section:

```js
    // bubbles
    r.bubbles.forEach((b) => {
      const sy = d2s(b.depth);
      if (sy < WATER_SY || sy > VH) return;
      ctx.strokeStyle = 'rgba(160,220,255,0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(b.x, sy, b.r, 0, Math.PI * 2);
      ctx.stroke();
    });
```

Replace with:

```js
    // bubbles
    r.bubbles.forEach((b) => {
      const sy = toScreen(b.depth);
      if (sy < 0 || sy > VH) return;
      ctx.strokeStyle = 'rgba(160,220,255,0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(b.x, sy, b.r, 0, Math.PI * 2);
      ctx.stroke();
    });
```

- [ ] **Step 7: Update fish (swimmers)**

Find the swimmers section:

```js
    // swimmers (fish)
    r.swimmers.forEach((s) => {
      if (!s) return;
      const sy = d2s(s.depth);
      if (sy < WATER_SY - s.fish.H || sy > VH + s.fish.H * 2) return;
      drawFish(ctx, s.fish, s.x, sy, s.dir, 1, 1, t);
    });
```

Replace with:

```js
    // swimmers (fish)
    r.swimmers.forEach((s) => {
      if (!s) return;
      const sy = toScreen(s.depth);
      if (sy < -s.fish.H || sy > VH + s.fish.H) return;
      drawFish(ctx, s.fish, s.x, sy, s.dir, 1, 1, t);
    });
```

- [ ] **Step 8: Update boat and rod to scroll with camera**

Find the boat section that starts:

```js
    // BOAT
    const bx = BOAT_SX;
    const by = BOAT_SY;
```

Replace with:

```js
    // BOAT — scrolls with camera
    const bx = BOAT_SX;
    const by = BOAT_SY - cameraY;
```

Then find the rod line (uses `ROD_SY` directly):

```js
    ctx.beginPath();
    ctx.moveTo(bx - BOAT_W * 0.07, by - ch2);
    ctx.lineTo(bx - BOAT_W * 0.07, by - ch2 - BOAT_H * 0.76);
    ctx.stroke();
```

This rod mast already uses `by` (which now includes camera offset). But the rod tip `ROD_SY` is a constant used in the fishing line drawing. We need a local `rodSY`:

After the `const by = BOAT_SY - cameraY;` line, add:

```js
    const rodSY = ROD_SY - cameraY;
```

Then find the two places `ROD_SY` is used in the boat/rod drawing section (not in fishing lines — just in the boat drawing):

```js
    ctx.lineTo(ROD_SX, ROD_SY);
```
and
```js
    ctx.lineTo(ROD_SX + 12, ROD_SY - 4);
```

Replace both with `rodSY`:

```js
    ctx.lineTo(ROD_SX, rodSY);
```
```js
    ctx.lineTo(ROD_SX + 12, rodSY - 4);
```

- [ ] **Step 9: Update fishing lines**

Find the fishing lines section:

```js
    // fishing lines
    if (r.phase !== 'idle') {
      r.lines.forEach((l) => {
        if (l.state === 'done') return;
        const hsy = l.state === 'flying' ? ROD_SY + l.arcY * 12 : d2s(l.depth);
        const hsx = l.sx;
        const stress = l.state === 'reeling' ? l.hooked.res / 80 : 0;
        ctx.strokeStyle = stress > 0.5 ? `rgba(255,${Math.floor(160 - stress * 160)},50,0.95)` : 'rgba(220,240,255,0.9)';
        ctx.lineWidth = 2;
        const mx = (ROD_SX + hsx) / 2;
        const my = (ROD_SY + hsy) / 2 + (l.state === 'flying' ? -30 : 35 + stress * 20);
        ctx.beginPath();
        ctx.moveTo(ROD_SX, ROD_SY);
        ctx.quadraticCurveTo(mx, my, hsx, hsy);
        ctx.stroke();
```

Replace with:

```js
    // fishing lines
    if (r.phase !== 'idle') {
      r.lines.forEach((l) => {
        if (l.state === 'done') return;
        const hsy = l.state === 'flying' ? rodSY + l.arcY * 12 : toScreen(l.depth);
        const hsx = l.sx;
        const stress = l.state === 'reeling' ? l.hooked.res / 80 : 0;
        ctx.strokeStyle = stress > 0.5 ? `rgba(255,${Math.floor(160 - stress * 160)},50,0.95)` : 'rgba(220,240,255,0.9)';
        ctx.lineWidth = 2;
        const mx = (ROD_SX + hsx) / 2;
        const my = (rodSY + hsy) / 2 + (l.state === 'flying' ? -30 : 35 + stress * 20);
        ctx.beginPath();
        ctx.moveTo(ROD_SX, rodSY);
        ctx.quadraticCurveTo(mx, my, hsx, hsy);
        ctx.stroke();
```

- [ ] **Step 10: Update aim guide**

Find the aim guide section:

```js
    // aim guide
    if (r.phase === 'idle') {
      const a = r.castAngle;
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,155,0.78)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 7]);
      ctx.lineDashOffset = -t * 0.04;
      ctx.beginPath();
      ctx.moveTo(ROD_SX, ROD_SY);
      ctx.lineTo(ROD_SX + Math.cos(a) * 220, ROD_SY + Math.sin(a) * 220);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255,255,120,0.85)';
      const ax = ROD_SX + Math.cos(a) * 220;
      const ay = ROD_SY + Math.sin(a) * 220;
```

Replace with:

```js
    // aim guide
    if (r.phase === 'idle') {
      const a = r.castAngle;
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,155,0.78)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 7]);
      ctx.lineDashOffset = -t * 0.04;
      ctx.beginPath();
      ctx.moveTo(ROD_SX, rodSY);
      ctx.lineTo(ROD_SX + Math.cos(a) * 220, rodSY + Math.sin(a) * 220);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255,255,120,0.85)';
      const ax = ROD_SX + Math.cos(a) * 220;
      const ay = rodSY + Math.sin(a) * 220;
```

- [ ] **Step 11: Update popups**

Find the popups section:

```js
    // popups
    r.popups.forEach((p) => {
      ctx.globalAlpha = Math.min(1, p.life / 15);
      ctx.fillStyle = p.color || '#ffe066';
      ctx.font = `bold ${p.size || 13}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(p.text, p.x, p.sy - (80 - p.life) * 0.5);
      ctx.globalAlpha = 1;
    });
```

Replace with:

```js
    // popups
    r.popups.forEach((p) => {
      ctx.globalAlpha = Math.min(1, p.life / 15);
      ctx.fillStyle = p.color || '#ffe066';
      ctx.font = `bold ${p.size || 13}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(p.text, p.x, p.sy - cameraY - (80 - p.life) * 0.5);
      ctx.globalAlpha = 1;
    });
```

- [ ] **Step 12: Add depth HUD**

After the popups section, add the depth HUD. Find the end of `drawScene` (just before the closing `}`):

```js
    // popups
    r.popups.forEach((p) => {
      ...
    });

  }
```

Insert the HUD before the final `}`:

```js
    // depth HUD — shown during active fishing
    if (r.phase === 'drifting' || r.phase === 'reeling') {
      const depthM = Math.round(r.hookDepth / 3);
      const label = `depth: ${depthM}m`;
      ctx.font = 'bold 13px monospace';
      const lw = ctx.measureText(label).width;
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.beginPath();
      ctx.roundRect(CW - lw - 28, 14, lw + 20, 24, 5);
      ctx.fill();
      ctx.fillStyle = 'rgba(160,230,255,0.9)';
      ctx.textAlign = 'right';
      ctx.fillText(label, CW - 14, 31);
    }
```

(Scale factor `/3` maps 3000 virtual units → 1000m depth.)

- [ ] **Step 13: Verify full camera pan in browser**

```bash
npm run dev
```

Expected behavior:
- On load: sky, boat, ocean surface visible as before
- Cast line, move mouse down slowly: sky and boat scroll up and off canvas, ocean darkens
- Fish appear at various depths as camera pans through their zones
- Move mouse back up: camera smoothly returns to surface
- Catch a fish: popup appears near rod tip

- [ ] **Step 14: Commit**

```bash
git add src/components/GameCanvas.jsx
git commit -m "feat: camera pan rendering — toScreen, scrolling sky/boat, depth HUD, ocean color fix"
```
