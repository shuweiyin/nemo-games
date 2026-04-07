# Street Fighter Game Design Spec
**Date:** 2026-04-07
**Location:** `games/fighting/`
**Stack:** React + Vite + HTML5 Canvas

---

## Overview

A single-player Street Fighter 2-style fighting game. The player assembles a team of 3 characters and battles a CPU-controlled team of 3 characters. The match ends when all characters on one side are eliminated. The CPU has three difficulty levels.

**Out of scope for MVP:** pause menu, audio/SFX system.

---

## Project Structure

```
games/fighting/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   ├── sprites/
│   │   ├── characters/       # SF2 sprite sheets (ryu.png, ken.png, etc.)
│   │   └── stages/           # Stage backgrounds (japan.png, china.png, etc.)
│   └── sounds/               # Reserved for future audio (not implemented in MVP)
└── src/
    ├── main.jsx
    ├── App.jsx                # Screen router: menu → select → fight → result
    ├── screens/
    │   ├── MainMenu.jsx
    │   ├── CharacterSelect.jsx
    │   └── VictoryScreen.jsx
    ├── game/                  # Pure JS, no React
    │   ├── engine.js          # requestAnimationFrame loop, update + render
    │   ├── fighter.js         # Fighter class: position, state, health, animation
    │   ├── input.js           # Keyboard input handler + move buffer
    │   ├── physics.js         # Collision, gravity, floor clamping
    │   ├── moves.js           # Move definitions per character (specials, normals)
    │   ├── stages.js          # Stage data (background image, floor y)
    │   └── ai/
    │       └── cpu.js         # CPU decision-making: easy/medium/hard
    └── components/
        ├── GameCanvas.jsx     # Mounts canvas, starts/stops engine
        └── HUD.jsx            # Health bars, timer, round counter (DOM overlay)
```

---

## Game Flow

```
Main Menu
  → Character Select
      Player picks 3 characters (in order) + difficulty
      CPU auto-selects 3 characters
      → Fight Screen (team battle)
          → Round ends (KO or timer)
              → Brief pause + "KO" or "Time Out" banner (1.5s)
              → Loser's character eliminated, next character enters at 100% HP
              → Winner carries remaining HP (min 30% of their max HP)
              → Camera resets to center, brief "Ready?" title card (1s)
          → Match ends when one team has no characters left
      → Victory / Game Over Screen
          → Rematch / Character Select / Main Menu
```

---

## Team Battle Rules

- Each side has a team of 3 characters, fighting one at a time.
- **Round loss:** that character is eliminated; the next character on the team enters at full health (100% of their max HP).
- **Round win:** that character carries their remaining health into the next round. If remaining health is below 30% of their max HP, it is regenerated up to exactly 30% of max HP.
- **Timer expires:** first check for an exact HP tie. If tied, both characters are eliminated simultaneously (no HP floor applied) and both teams advance to their next character. If not tied, the character with more HP wins; then apply the 30% HP floor to the winner before advancing to the next sub-round.
- **Match ends** when all 3 characters on one team are eliminated.
- **No duplicate characters per team** — once a character is selected for a team, they cannot be picked again for the same team. The CPU may pick the same character the player chose.

---

## Character Select Screen

- Player picks 3 characters in sequence (slot 1 fights first).
- Already-selected characters are greyed out for the player's remaining picks.
- Player selects difficulty: Easy, Medium, or Hard.
- CPU character selection:
  - Easy/Medium: randomly selected, no duplicates within the CPU team.
  - Hard: selects the 3 characters with the highest combined stat totals (excluding any character already picked by the player for their team).
- Stage is auto-assigned to the CPU's first character's home stage.

---

## Roster & Character Stats

Stats are on a 1–10 scale with the following gameplay effects:

| Stat | Effect |
|------|--------|
| **Health** | 1–4 = 150 HP max, 5–7 = 175 HP max, 8–10 = 200 HP max |
| **Power** | LP/LK = tier min, MP/MK = tier mid, HP/HK = tier max. Tiers: 1–4 → 5/6/8 dmg, 5–7 → 9/10/12 dmg, 8–10 → 13/14/16 dmg |
| **Speed** | Movement px/frame + attack frame counts (see Attack Frames table) |
| **Defense** | 1–4 = 10% block damage reduction, 5–7 = 20%, 8–10 = 30% |
| **Special** | Damage multiplier and melee hitbox width: 1–4 = 0.8× dmg, hitbox w=60px; 5–7 = 1.0× dmg, hitbox w=90px; 8–10 = 1.3× dmg, hitbox w=130px |

**Attack Frames by Speed tier:**

| Speed | Movement | Startup frames | Active frames | Recovery frames |
|-------|----------|---------------|--------------|----------------|
| 1–4 (slow) | 2 px/frame | 8 | 4 | 10 |
| 5–7 (medium) | 3.5 px/frame | 5 | 3 | 7 |
| 8–10 (fast) | 5 px/frame | 3 | 2 | 4 |

**Roster:**

| Character | Health | Power | Speed | Defense | Special | Archetype |
|-----------|--------|-------|-------|---------|---------|-----------|
| Ryu | 7 | 7 | 6 | 6 | 9 | All-rounder, strong specials |
| Ken | 7 | 8 | 7 | 5 | 7 | Aggressive all-rounder |
| Chun-Li | 6 | 6 | 10 | 6 | 7 | Rushdown, fast but fragile |
| Guile | 8 | 7 | 5 | 8 | 8 | Defensive zoner |
| Blanka | 8 | 8 | 6 | 5 | 6 | Wild card brawler |
| Zangief | 10 | 10 | 3 | 7 | 4 | Slow tank grappler |
| Dhalsim | 6 | 6 | 4 | 5 | 10 | Long-range zoner |
| E. Honda | 9 | 8 | 4 | 7 | 6 | Heavy pressure tank |
| Balrog | 8 | 9 | 6 | 6 | 5 | Power brawler |
| Vega | 6 | 7 | 10 | 4 | 6 | Fragile speedster |
| Sagat | 9 | 9 | 5 | 7 | 9 | Well-rounded boss |
| M. Bison | 8 | 8 | 7 | 7 | 8 | Balanced boss |

---

## Input System

**Keyboard layout:**
```
Movement:  Arrow keys (← → = walk, ↑ = jump, ↓ = crouch)
Attacks:   A=LP  S=MP  D=HP
           Z=LK  X=MK  C=HK
Block:     Hold ← (away from opponent) while standing → high block
           Hold ↓ + ← → low/crouch block
```

**Blocking rules:**
- High block (standing, hold away): blocks high and mid attacks, vulnerable to low attacks.
- Low block (crouching, hold away): blocks low and mid attacks, vulnerable to overhead attacks.
- Jump-in attacks can be blocked by either block type.
- All normal attacks are blockable. Special moves are blockable unless stated otherwise in the move definition.

**Input buffer:** 10-frame window (~167ms at 60fps). Inputs are stored as a timestamped direction sequence. A special move fires when the required sequence is completed within the window.

**Motion types:**

| Type | Detection rule |
|------|---------------|
| QCF (↓↘→) | Detect ↓, then ↓→ (or →), within buffer window |
| QCB (↓↙←) | Detect ↓, then ↓← (or ←), within buffer window |
| DP (→↓↘) | Detect →, then ↓, then ↓→ within buffer window (order matters, diagonal optional between steps) |
| QCF + up (↓↘→↗) | Detect QCF sequence, then ↑ or ↑→ within the same buffer window |
| Charge → (← charge →) | Hold ← for ≥30 frames, then press → within 8 frames |
| Charge ↑ (↓ charge ↑) | Hold ↓ for ≥30 frames, then press ↑ within 8 frames |
| Hold button | Hold a single attack button for ≥20 frames, then release |
| Hold buttons (multi) | Hold all 3 punch buttons simultaneously for ≥60 frames, then release all |
| Rapid tap | Press the same button (punch or kick) ≥5 times within 20 frames |
| QCF + 3 buttons | Detect QCF sequence, then detect 3 punch buttons (A+S+D) or 3 kick buttons (Z+X+C) pressed simultaneously within 4 frames |
| 360° (SPD) | Detect all 4 cardinal directions (↑ ↓ ← →) in any order within 20 frames, then press punch. Must be within grab range of opponent (≤80px). |

**Special moves per character (3 each):**

| Character | Move | Input | Type |
|-----------|------|-------|------|
| Ryu | Hadouken | ↓↘→ + punch | QCF |
| Ryu | Shoryuken | →↓↘ + punch | DP motion |
| Ryu | Tatsumaki | ↓↙← + kick | QCB |
| Ken | Hadouken | ↓↘→ + punch | QCF |
| Ken | Shoryuken | →↓↘ + punch | DP motion |
| Ken | Tatsumaki | ↓↙← + kick | QCB |
| Chun-Li | Kikoken | ↓↘→ + punch | QCF |
| Chun-Li | Spinning Bird Kick | Charge ↓ then ↑ + kick | Charge ↑ |
| Chun-Li | Hyakuretsukyaku | Rapidly tap kick | Rapid tap (≥5 kicks in 20 frames) |
| Guile | Sonic Boom | Charge ← then → + punch | Charge → |
| Guile | Flash Kick | Charge ↓ then ↑ + kick | Charge ↑ |
| Guile | Reverse Spin Kick | Charge ← then → + kick | Charge → |
| Blanka | Rolling Attack | Charge ← then → + punch | Charge → |
| Blanka | Electric Thunder | Hold punch button ≥20 frames, release | Hold button |
| Blanka | Vertical Rolling | Charge ↓ then ↑ + punch | Charge ↑ |
| Zangief | SPD | 360° + punch | 360° |
| Zangief | Double Lariat | Rapidly tap punch | Rapid tap (≥5 punches in 20 frames) |
| Zangief | Banishing Flat | ↓↘→ + punch | QCF |
| Dhalsim | Yoga Fire | ↓↘→ + punch | QCF |
| Dhalsim | Yoga Flame | ↓↙← + punch | QCB |
| Dhalsim | Yoga Teleport | ↓↘→ + all 3 punches or kicks | QCF + 3 buttons |
| E. Honda | Hundred Hand Slap | Rapidly tap punch | Rapid tap (≥5 punches in 20 frames) |
| E. Honda | Headbutt | Charge ← then → + punch | Charge → |
| E. Honda | Sumo Smash | Charge ↓ then ↑ + kick | Charge ↑ |
| Balrog | Dash Punch | Charge ← then → + punch | Charge → |
| Balrog | Dash Upper | Charge ← then → + kick | Charge → |
| Balrog | Turn Punch | Hold all 3 punches ≥60 frames, release | Hold buttons |
| Vega | Rolling Crystal Flash | Charge ← then → + punch | Charge → |
| Vega | Sky High Claw | Charge ↓ then ↑ + punch | Charge ↑ |
| Vega | Scarlet Terror | Charge ↓ then ↑ + kick | Charge ↑ |
| Sagat | Tiger Shot (high) | ↓↘→ + punch | QCF |
| Sagat | Tiger Shot (low) | ↓↘→ + kick | QCF |
| Sagat | Tiger Knee | ↓↘→↗ + kick | QCF + up |
| M. Bison | Psycho Crusher | Charge ← then → + punch | Charge → |
| M. Bison | Head Press | Charge ↓ then ↑ + kick | Charge ↑ |
| M. Bison | Scissor Kick | Charge ← then → + kick | Charge → |

---

## Hitbox System

Simplified two-box model per fighter per state:

- **Hurtbox:** the rectangle the fighter occupies (can be hit). Defined per animation state (standing, crouching, jumping).
- **Hitbox:** the rectangle an attack projects (deals damage). Defined per attack state (LP, MP, HP, LK, MK, HK, special).

Hitbox definitions are stored in `moves.js` as offsets from the character's origin (bottom-center). Example:
```js
{
  state: 'LP',
  hitbox: { x: 20, y: 60, w: 50, h: 30 },   // offset from origin
  hurtbox: { x: -20, y: 0, w: 60, h: 120 },
  active_frames: [5, 6, 7]  // frame indices within the animation where hitbox is live
}
```

Collision detection: on each frame, check if any active hitbox overlaps any opponent hurtbox. Use AABB intersection. A hit registers once per attack (flag `hitConfirmed` to prevent multi-hit on normal attacks).

**Chip damage on blocked normals:** blocked normal attacks deal 0 damage (full block). Only projectiles deal chip damage (25%). This simplifies the block system for MVP.

**Multi-hit specials:** The following specials hit multiple times per use. For these, `hitConfirmed` resets after each individual hit, allowing repeated hits within a single move activation. Max hits defined per move:
- Chun-Li Hyakuretsukyaku: up to 5 hits
- Zangief Double Lariat: up to 3 hits
- E. Honda Hundred Hand Slap: up to 5 hits
- Balrog Turn Punch: 1 hit (powerful single blow)
All other specials: 1 hit per activation.

Projectiles have their own hitbox that moves independently (see Projectile System).

Default hurtboxes by stance:
- Standing: 60×140px centered on origin
- Crouching: 60×90px
- Jumping: 50×120px

---

## Physics

Fixed timestep at 60fps. All values in pixels per frame.

| Parameter | Value |
|-----------|-------|
| Gravity | 0.6 px/frame² |
| Jump velocity | −16 px/frame (upward) |
| Terminal fall velocity | 18 px/frame |
| Floor Y | defined per stage in `stages.js` |
| Stage left/right bounds | x=0 to x=1200 (characters clamp to bounds) |

**Initial fighter positions (world coordinates, per round start):**
- Player 1 (left side): x = 300, facing right
- CPU (right side): x = 900, facing left
- Both start at floorY (defined per stage). Camera resets to center (cameraX = 0).

**Facing direction and sprite flipping:**
- Each fighter has a `facingRight` boolean. Player 1 starts `facingRight = true`, CPU starts `facingRight = false`.
- On each frame, if the fighter's x is less than the opponent's x, `facingRight = true`; otherwise `facingRight = false`. (Auto-face logic — fighters always face each other.)
- When rendering a fighter with `facingRight = false`, apply a horizontal canvas flip: `ctx.save(); ctx.scale(-1, 1); ctx.drawImage(..., -destX - 128, destY, 128, 128); ctx.restore();`
- Hitbox x-offsets are also mirrored when `facingRight = false` (negate x offset from origin).

**Jump arc:** on ↑ press, set `vy = -16`.
- Neutral jump (↑ only): `vx = 0`
- Forward jump (↑ + forward direction): `vx = movementSpeed × 0.6` (toward opponent)
- Backward jump (↑ + away): `vx = -movementSpeed × 0.4`
- Each frame: `vy += gravity`, `y += vy`, `x += vx`. When `y >= floorY`, clamp to floor, set `vy = 0`, `vx = 0`, state = idle.

Air attacks: player can press an attack button during a jump. The attack uses the character's LP hitbox definition. The hitbox becomes active on frame 3 of the jump animation and remains active for the attack's defined `active_frames` duration (per the speed tier table). No change to jump arc. Only one air attack allowed per jump.

---

## Projectile System

Projectiles are independent objects tracked in `engine.js` alongside fighters.

```js
{
  owner: 'player' | 'cpu',
  x, y,           // current position
  vx,             // velocity (speed depends on character's Special stat)
  hitbox: { w, h },
  damage,         // base damage × special multiplier
  sprite,         // reference to sprite sheet row in character's sheet
  frameIndex,     // current animation frame
  active: true
}
```

**Rules:**
- Projectiles travel horizontally at `3 + (specialStat / 10) * 4` px/frame.
- When two projectiles collide (AABB), both are destroyed.
- When a projectile hits an opponent (and opponent is not blocking), it deals damage and is destroyed.
- A blocking opponent takes 25% of projectile damage (chip damage) and the projectile is destroyed.
- Projectiles are destroyed when they exit stage bounds (x < 0 or x > 1200).
- Max 1 projectile per fighter on screen at a time (firing a second one while one is active has no effect).
- Dhalsim's Yoga Teleport is not a projectile — it is a repositioning move. "Behind" means the far side of the opponent relative to Dhalsim's current position:
  - Punch version: `newX = opponent.x + (dhalsim.x < opponent.x ? +150 : -150)` (lands behind opponent)
  - Kick version: `newX = opponent.x + (dhalsim.x < opponent.x ? -150 : +150)` (lands in front of opponent)
  - Clamp result to stage bounds. Teleport plays a 4-frame disappear animation, then snaps, then a 4-frame appear animation.

---

## CPU AI

**AI decision loop runs every N ms (reaction delay), not every frame.**

| Difficulty | Reaction Delay | Specials | Blocking | Behavior |
|------------|---------------|----------|----------|----------|
| Easy | 300ms | 20% of attacks | 15% when hit incoming | Mostly random move selection, occasional forward walk |
| Medium | 200ms | 50% of attacks | 35% when hit incoming | Reads player x-position: walks in if far, attacks if close; occasionally punishes player recovery frames |
| Hard | 100ms | Full move set | 60%+ when hit incoming | Monitors player animation state; if player is in recovery frames (state = `recovering`), CPU fires an attack; mixes jump-ins, specials, and pressure |

**Whiff punishing (Medium + Hard):** if player's `state === 'recovering'` and CPU is within 200px, CPU queues an attack immediately regardless of reaction delay.

**CPU character selection (Hard):** sort all 12 characters by combined stat total (sum of all 5 stats), pick top 3 not already in player's team. Ties broken by Power stat descending.

---

## Rendering & Animation

**Sprite sheet specification:**
- Each character sprite sheet: frames are 128×128px each.
- Sheet layout: frames arranged left-to-right within each row.
- Each row = one animation state.
- Total sheet width = max_frames_in_any_row × 128px.

**Row layout per character:**

| Row | Animation | Frames |
|-----|-----------|--------|
| 0 | Idle | 4 |
| 1 | Walk forward | 6 |
| 2 | Walk backward | 6 |
| 3 | Jump | 5 |
| 4 | Crouch | 2 |
| 5 | LP attack | 3 |
| 6 | MP attack | 3 |
| 7 | HP attack | 3 |
| 8 | LK attack | 3 |
| 9 | MK attack | 3 |
| 10 | HK attack | 3 |
| 11 | Special 1 | 4–6 |
| 12 | Special 2 | 4–6 |
| 13 | Special 3 | 4–6 |
| 14 | Hit stun | 2 |
| 15 | Block (standing) | 2 |
| 16 | Block (crouching) | 2 |
| 17 | KO / fall | 6 |

Each row is independent (no combined rows). `drawImage(sheet, frameIndex * 128, rowIndex * 128, 128, 128, destX, destY, 128, 128)`.

**Sprite frame to gameplay frame mapping:**
Sprite animations have 2–6 art frames but attacks last 9–22 gameplay frames. Map by dividing the attack into equal segments:
```js
spriteFrame = Math.floor((currentAttackFrame / totalAttackFrames) * totalSpriteFrames)
```
For example, LP with 3 art frames over 9 gameplay frames: frames 0–2 → sprite 0, frames 3–5 → sprite 1, frames 6–8 → sprite 2. Hold the last sprite frame during recovery. This applies to all attack rows.

**Knockback on hit:**
- When a hit lands, push the defender horizontally away from attacker by 20px (applied instantly, clamped to stage bounds).
- Blocked hits push the defender 8px. No knockback on attacker when blocked.
- Special moves that are primarily travel moves (Rolling Attack, Psycho Crusher) push 35px on hit.

**Canvas render order (per frame):**
1. Stage background (parallax sprite — see Camera section)
2. Stage foreground elements (crowd, props)
3. Projectiles
4. Characters (far character first, near character on top)
5. Hit effects (flash, sparks — simple white rectangle flash for 3 frames)
6. HUD (DOM overlay — see HUD section)

**Animation state machine:**
```
idle → walk → attack → recovering → idle
idle → jump → (air attack?) → land → idle
any → hitstun → idle
any → block → idle
any → KO (terminal, plays fall animation then freezes on last frame)
```

Frame rate: 60fps via `requestAnimationFrame` with fixed timestep.

---

## Camera

Canvas: 1200×600px. Stage backgrounds are 2400px wide.

Camera tracks the midpoint between both fighters:
```
cameraX = clamp(midpoint.x - 600, 0, stageWidth - 1200)
```
- `midpoint.x` = average of player x and CPU x.
- Camera clamps at stage left (cameraX ≥ 0) and stage right (cameraX ≤ stageWidth - 1200).
- Background is drawn offset by `cameraX` to create parallax.
- Characters are drawn at their world x − cameraX.

---

## HUD

DOM overlay (`position: absolute` over canvas), not drawn on canvas.

**Layout:**
```
[P1 portrait] [===P1 health bar===]   99   [===CPU health bar===] [CPU portrait]
              [slot1 slot2 slot3]             [slot1 slot2 slot3]
```

- Health bars: red fill, drain left-to-right for P1, right-to-left for CPU. Width = (currentHP / maxHP) × 350px.
- Timer: centered top, counts down from 99. Updates every second (60 frames).
- Team slots: 3 small character portrait icons per side. Eliminated characters shown greyed out.
- All values are passed from the engine to the HUD via a shared `gameState` ref object (plain JS object, not React state). `GameCanvas.jsx` passes a `gameStateRef` to the engine on init. `HUD.jsx` reads from the same ref and re-renders via a `requestAnimationFrame`-driven React state update (single boolean toggle every frame to force re-render).
- **HUD rAF cleanup:** `HUD.jsx` runs its own `requestAnimationFrame` loop to poll `gameStateRef` and trigger re-renders. It must cancel this loop in its `useEffect` cleanup function to prevent state updates on an unmounted component: `return () => cancelAnimationFrame(hudRafHandle)`.
- **Round counter** in team battle context: shows how many of each side's characters have been eliminated (0–3 icons per side), not a traditional round win counter. Each eliminated character icon turns grey.
- **Engine lifecycle:** `GameCanvas.jsx` calls `engine.start(canvas, gameStateRef)` on mount and `engine.stop()` on unmount (React `useEffect` cleanup). `engine.stop()` cancels the active `requestAnimationFrame` handle to prevent loop continuation after navigation.

---

## Victory Screen

Shown after the match ends (one team fully eliminated).

**Displays:**
- "PLAYER WINS" or "CPU WINS" title.
- Remaining team: portraits of surviving characters with their current HP bars.
- Eliminated characters shown as greyed portraits with an X.
- Three buttons: Rematch (same teams, same difficulty), Character Select (back to pick screen), Main Menu.

---

## Stages

Stage is auto-assigned to the CPU's first character's home stage.

| Stage | Character | Visual Details |
|-------|-----------|----------------|
| Suzaku Castle | Ryu | Cherry blossoms falling, Japan dojo |
| Ken's Arena | Ken | USA beachfront, cheering crowd |
| Chun-Li's Market | Chun-Li | China street, barrels, birds |
| Guile's Airbase | Guile | Military base, jets in background |
| Brazil Jungle | Blanka | Amazon river, animals watching |
| Russia Factory | Zangief | Soviet factory, workers cheering |
| India Temple | Dhalsim | Elephants, fire pits, temple ruins |
| Japan Bathhouse | E. Honda | Sumo arena, waterfall |
| Las Vegas Ring | Balrog | Boxing arena, neon lights |
| Spain Cage | Vega | Bullfighting ring, roses thrown |
| Thailand Temple | Sagat | Giant Buddha, torches |
| Psycho Drive Base | M. Bison | Shadaloo base, red/purple lighting |

Each stage background sprite is 2400×600px. Floor Y is defined per stage in `stages.js`.

**Stage foreground:** foreground layers are out of scope for MVP. The render step for foreground (step 2 in render order) is a no-op initially — stages.js may include an optional `foreground` property (null by default) to enable foreground sprites in a future update.
