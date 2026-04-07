# Street Fighter Game Design Spec
**Date:** 2026-04-07
**Location:** `games/fighting/`
**Stack:** React + Vite + HTML5 Canvas

---

## Overview

A single-player Street Fighter 2-style fighting game. The player assembles a team of 3 characters and battles a CPU-controlled team of 3 characters. The match ends when all characters on one side are eliminated. The CPU has three difficulty levels.

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
│   └── sounds/               # SFX + music
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
              → Loser's character eliminated, next character enters at 100% HP
              → Winner carries remaining HP (min 30%)
          → Match ends when one team has no characters left
      → Victory / Game Over Screen
          → Rematch / Character Select / Main Menu
```

---

## Team Battle Rules

- Each side has a team of 3 characters, fighting one at a time.
- **Round loss:** that character is eliminated; the next character on the team enters at full health (100%).
- **Round win:** that character carries their remaining health into the next round. If their remaining health is below 30%, it is regenerated up to 30%.
- **Timer expires:** the character with more remaining health wins the round; the losing character is eliminated.
- **Match ends** when all 3 characters on one team are eliminated.
- **No duplicate characters per team** — once a character is selected for a team, they cannot be picked again for the same team. The CPU may pick the same character the player chose.

---

## Character Select Screen

- Player picks 3 characters in sequence (slot 1 fights first).
- Already-selected characters are greyed out for the player's remaining picks.
- Player selects difficulty: Easy, Medium, or Hard.
- CPU auto-selects 3 characters (randomly, or difficulty-weighted for Hard).
- Stage is auto-assigned to the CPU's first character's home stage.

---

## Roster & Character Stats

Stats are on a 1–10 scale with the following gameplay effects:

| Stat | Effect |
|------|--------|
| **Health** | 1–4 = 150 HP, 5–7 = 175 HP, 8–10 = 200 HP |
| **Power** | 1–4 = 5–8 dmg/hit, 5–7 = 9–12 dmg/hit, 8–10 = 13–16 dmg/hit |
| **Speed** | 1–4 = 2px/frame + slow attacks, 5–7 = 3.5px/frame, 8–10 = 5px/frame + fast attacks |
| **Defense** | 1–4 = 10% block reduction, 5–7 = 20%, 8–10 = 30% |
| **Special** | 1–4 = 0.8× dmg + short range, 5–7 = 1.0× + medium, 8–10 = 1.3× + long range |

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
Block:     Hold ← (away from opponent)
```

**Special move inputs** (classic SF2 motions, ~10-frame input buffer):

| Character | Motion | Move |
|-----------|--------|------|
| Ryu/Ken | ↓↘→ + punch | Hadouken |
| Ryu/Ken | ↓↙← + punch | Shoryuken |
| Ryu | ↓↘→ + kick | Tatsumaki |
| Ken | ↓↘→ + kick | Hurricane Kick |
| Guile | Charge ← then → + punch | Sonic Boom |
| Guile | Charge ↓ then ↑ + kick | Flash Kick |
| Chun-Li | Charge ← then → + kick | Kikoken |
| Chun-Li | Charge ↓ then ↑ + kick | Spinning Bird Kick |
| Blanka | Charge ← then → + punch | Rolling Attack |
| Blanka | ↓↘→ + punch | Electric Thunder |
| Zangief | 360° + punch | SPD |
| Dhalsim | ↓↘→ + punch | Yoga Fire |
| Dhalsim | ↓↘→ + kick | Yoga Flame |
| E. Honda | Charge ← then → + punch | Hundred Hand Slap |
| Balrog | Charge ← then → + punch | Dash Punch |
| Vega | Charge ← then → + kick | Rolling Crystal Flash |
| Sagat | ↓↘→ + punch | Tiger Shot |
| Sagat | ↓↙← + kick | Tiger Knee |
| M. Bison | Charge ← then → + punch | Psycho Crusher |
| M. Bison | Charge ↓ then ↑ + kick | Head Press |

Each character has 3 special moves.

---

## CPU AI

| Difficulty | Reaction Delay | Specials | Blocking | Behavior |
|------------|---------------|----------|----------|----------|
| Easy | 300ms | 20% | 15% | Occasional rushes, mostly random |
| Medium | 200ms | 50% | 35% | Reads distance, occasionally punishes whiffs |
| Hard | 100ms | Full set | 60%+ | Reads animations, consistently punishes whiffs, mixes offense/defense |

---

## Rendering & Animation

**Sprite sheet row layout per character:**

| Row | Animation | Frames |
|-----|-----------|--------|
| 0 | Idle | 4 |
| 1 | Walk forward | 6 |
| 2 | Walk backward | 6 |
| 3 | Jump | 5 |
| 4 | Crouch | 2 |
| 5 | LP / MP / HP | 3 each |
| 6 | LK / MK / HK | 3 each |
| 7 | Special 1 | 4–6 |
| 8 | Special 2 | 4–6 |
| 9 | Special 3 | 4–6 |
| 10 | Hit stun | 2 |
| 11 | Block | 2 |
| 12 | KO / fall | 6 |

**Canvas render order (per frame):**
1. Stage background (parallax sprite)
2. Stage foreground elements (crowd, props)
3. Projectiles (hadouken, sonic boom, etc.)
4. Characters (far character first, near on top)
5. Hit effects (flash, sparks)
6. HUD (DOM overlay — health bars, timer, round counter)

**Animation state machine:**
```
idle → walk → attack → hitstun → idle
idle → jump → (air attack?) → land → idle
any → block → idle
any → KO (terminal)
```

Frame rate: 60fps via `requestAnimationFrame` with fixed timestep.
Canvas size: 1200×600px. Camera pans horizontally to follow fighters.

---

## Stages

Stage is auto-assigned to the CPU first character's home stage.

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

Each stage background is a wide sprite (wider than canvas) for subtle parallax scrolling.

---

## HUD

DOM overlay (not canvas), positioned absolutely over the canvas:
- Player health bar (left, red fill)
- CPU health bar (right, red fill)
- Round timer (center top, counts down from 99)
- Round counter (KO icons showing wins per side)
- Character portraits (small, beside health bars)
- Team slots indicator (3 slots per side, greyed when character eliminated)
