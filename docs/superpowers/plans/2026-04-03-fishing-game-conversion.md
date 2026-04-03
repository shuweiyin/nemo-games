# Fishing Game Conversion Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert `fishing/fishing.txt` into a well-structured Vite + React app at `games/fishing/` with clean separation of game logic (FishingGameEngine) and UI components.

**Architecture:** Pure JavaScript game engine (FishingGameEngine) handles all logic. React components are thin UI layers that query engine state and call engine methods. useGameState hook bridges them.

**Tech Stack:** Vite, React 18, Canvas API, Node 18

---

## File Structure

**Files to create:**
```
games/fishing/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
│   ├── engine/
│   │   └── FishingGameEngine.js
│   ├── components/
│   │   ├── GameCanvas.jsx
│   │   ├── Inventory.jsx
│   │   ├── Shop.jsx
│   │   ├── Stats.jsx
│   │   └── index.js
│   ├── hooks/
│   │   └── useGameState.js
│   └── styles/
│       ├── GameCanvas.module.css
│       ├── Inventory.module.css
│       ├── Shop.module.css
│       └── Stats.module.css
├── public/
├── index.html
├── vite.config.js
├── package.json
├── Dockerfile
├── .dockerignore
└── README.md
```

---

## Phase 1: Setup (Directory & Config)

### Task 1: Create games/fishing directory structure

**Files:**
- Create: `games/fishing/` directory
- Create: `games/fishing/src/`
- Create: `games/fishing/public/`
- Create: `games/fishing/styles/`
- Create: `games/fishing/src/engine/`
- Create: `games/fishing/src/components/`
- Create: `games/fishing/src/hooks/`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p games/fishing/src/{engine,components,hooks,styles}
mkdir -p games/fishing/public
```

- [ ] **Step 2: Verify structure**

```bash
ls -la games/fishing/
# Expected: src, public directories exist
```

---

### Task 2: Create package.json

**Files:**
- Create: `games/fishing/package.json`

- [ ] **Step 1: Write package.json**

```json
{
  "name": "fishing-game",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.4.0"
  }
}
```

- [ ] **Step 2: Verify**

```bash
cat games/fishing/package.json | head -20
# Expected: name is "fishing-game", scripts section present
```

---

### Task 3: Create vite.config.js

**Files:**
- Create: `games/fishing/vite.config.js`

- [ ] **Step 1: Write vite.config.js**

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: false
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
```

- [ ] **Step 2: Verify**

```bash
cat games/fishing/vite.config.js
# Expected: React plugin configured, server host 0.0.0.0
```

---

### Task 4: Create index.html

**Files:**
- Create: `games/fishing/index.html`

- [ ] **Step 1: Write index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Fishing Game</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

- [ ] **Step 2: Verify**

```bash
cat games/fishing/index.html
# Expected: root div, src/main.jsx script tag
```

---

### Task 5: Create Dockerfile and .dockerignore

**Files:**
- Create: `games/fishing/Dockerfile`
- Create: `games/fishing/.dockerignore`

- [ ] **Step 1: Write Dockerfile**

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

- [ ] **Step 2: Write .dockerignore**

```
node_modules
npm-debug.log
.git
.gitignore
README.md
dist
.DS_Store
```

- [ ] **Step 3: Verify**

```bash
cat games/fishing/Dockerfile | head -5
# Expected: FROM node:18-alpine
```

---

### Task 6: Create README.md

**Files:**
- Create: `games/fishing/README.md`

- [ ] **Step 1: Write README.md**

```markdown
# Fishing Game

A Vite + React fishing game with clean separation of game logic and UI.

## Development

```bash
npm install
npm run dev
```

Game runs at http://localhost:3000

## Build

```bash
npm run build
npm run preview
```

## Architecture

- `src/engine/FishingGameEngine.js` - Pure game logic (no React)
- `src/components/` - React UI components
- `src/hooks/useGameState.js` - Integration hook

## Docker

```bash
docker build -t fishing-game .
docker run -p 3000:3000 fishing-game
```
```

- [ ] **Step 2: Verify**

```bash
cat games/fishing/README.md
# Expected: Development, Build, Architecture sections
```

---

## Phase 2: Game Engine

### Task 7: Create FishingGameEngine skeleton

**Files:**
- Create: `src/engine/FishingGameEngine.js`

- [ ] **Step 1: Extract constants and fish data from fishing.txt**

Read `fishing/fishing.txt` lines 1-50 (imports, constants, FISH array):

```javascript
// src/engine/FishingGameEngine.js

import { useState, useEffect, useRef, useCallback } from "react";

// ─── constants ───────────────────────────────────────────────────────────────
const CW = 1100, VH = 780;
const WATER_SY  = 260;
const OCEAN_D   = VH - WATER_SY;
const BOAT_SX   = CW / 2;
const BOAT_SY   = WATER_SY;
const BOAT_W    = 420, BOAT_H = 160;
const ROD_SX    = BOAT_SX + 162;
const ROD_SY    = BOAT_SY - 105;

function d2s(depth) { return WATER_SY + depth; }
function s2d(sy)    { return sy - WATER_SY; }

// ─── fish data ───────────────────────────────────────────────────────────────
const FISH = [
  {id:"minnow",   name:"Minnow",       w:0.1, v:4,   L:28,  H:10,  c:"#a8d8f0",fc:"#5a9ec0",res:2,  mn:0.00,mx:0.06},
  {id:"herring",  name:"Herring",      w:0.3, v:8,   L:38,  H:12,  c:"#c8e0f0",fc:"#88b0d0",res:4,  mn:0.01,mx:0.08},
  {id:"perch",    name:"Perch",        w:0.3, v:10,  L:44,  H:20,  c:"#f0c030",fc:"#b07800",res:5,  mn:0.01,mx:0.09},
  {id:"mackerel", name:"Mackerel",     w:0.5, v:14,  L:58,  H:16,  c:"#50a8d8",fc:"#1868a0",res:7,  mn:0.02,mx:0.11},
  {id:"trout",    name:"Trout",        w:0.8, v:20,  L:70,  H:24,  c:"#88cc68",fc:"#408030",res:10, mn:0.03,mx:0.14},
  {id:"flounder", name:"Flounder",     w:1.5, v:28,  L:72,  H:52,  c:"#d4b870",fc:"#a08030",res:11, mn:0.05,mx:0.17},
  {id:"salmon",   name:"Salmon",       w:2.5, v:38,  L:90,  H:30,  c:"#e87858",fc:"#a03818",res:12, mn:0.05,mx:0.16},
  {id:"cod",      name:"Cod",          w:3,   v:45,  L:96,  H:40,  c:"#c0a870",fc:"#786028",res:14, mn:0.07,mx:0.19},
  {id:"bass",     name:"Bass",         w:4,   v:55,  L:100, H:38,  c:"#70b858",fc:"#387018",res:15, mn:0.06,mx:0.17},
  {id:"pike",     name:"Pike",         w:6,   v:80,  L:130, H:28,  c:"#68a850",fc:"#305820",res:18, mn:0.10,mx:0.24},
  {id:"jellyfish",name:"Jellyfish",    w:0.8, v:22,  L:48,  H:60,  c:"#e8a8f8",fc:"#b060d0",res:6,  mn:0.10,mx:0.32},
  {id:"eel",      name:"Moray Eel",    w:5,   v:70,  L:220, H:22,  c:"#60885a",fc:"#385028",res:18, mn:0.10,mx:0.24},
  {id:"barracuda",name:"Barracuda",    w:8,   v:95,  L:150, H:24,  c:"#6888a0",fc:"#384860",res:20, mn:0.14,mx:0.30},
  {id:"grouper",  name:"Grouper",      w:12,  v:110, L:110, H:70,  c:"#c06830",fc:"#783010",res:22, mn:0.18,mx:0.36},
  {id:"nautilus", name:"Nautilus",     w:3,   v:85,  L:70,  H:70,  c:"#f0c890",fc:"#c07830",res:16, mn:0.22,mx:0.44},
  {id:"tuna",     name:"Tuna",         w:15,  v:140, L:150, H:52,  c:"#1858a8",fc:"#082868",res:25, mn:0.20,mx:0.38},
  {id:"manta",    name:"Manta Ray",    w:20,  v:165, L:180, H:110, c:"#203848",fc:"#101828",res:28, mn:0.24,mx:0.44},
  {id:"swordfish",name:"Swordfish",    w:25,  v:220, L:170, H:32,  c:"#184088",fc:"#081848",res:30, mn:0.28,mx:0.48},
  {id:"oarfish",  name:"Oarfish",      w:35,  v:300, L:340, H:22,  c:"#b890c0",fc:"#705880",res:35, mn:0.36,mx:0.56},
  {id:"sunfish",  name:"Ocean Sunfish",w:50,  v:380, L:140, H:170, c:"#888898",fc:"#505060",res:38, mn:0.32,mx:0.54},
  {id:"shark",    name:"Great White",  w:80,  v:450, L:220, H:64,  c:"#607080",fc:"#303840",res:42, mn:0.44,mx:0.64},
  {id:"colossal", name:"Colossal Squid",w:45, v:420, L:200, H:80,  c:"#c03828",fc:"#801818",res:40, mn:0.48,mx:0.68},
  {id:"gulper",   name:"Gulper Eel",   w:8,   v:160, L:260, H:28,  c:"#181828",fc:"#080818",res:26, mn:0.55,mx:0.74},
  {id:"anglerfish",name:"Anglerfish",  w:10,  v:200, L:100, H:88,  c:"#281430",fc:"#180828",res:28, mn:0.60,mx:0.80},
  {id:"viperfish",name:"Viperfish",    w:6,   v:180, L:140, H:30,  c:"#102830",fc:"#081820",res:24, mn:0.62,mx:0.82},
  {id:"whale",    name:"Blue Whale",   w:200, v:850, L:580, H:170, c:"#284868",fc:"#101e30",res:55, mn:0.65,mx:0.84},
  {id:"kraken",   name:"Kraken",       w:999, v:2000,L:340, H:340, c:"#380050",fc:"#180020",res:80, mn:0.84,mx:0.98},
];

const RODS  = [{id:"r1",name:"Beginner Rod",cost:0,spd:1},{id:"r2",name:"Carbon Rod",cost:200,spd:1.5},{id:"r3",name:"Pro Spinner",cost:600,spd:2.2},{id:"r4",name:"Master's Rod",cost:1500,spd:3.2}];
const LURES = [{id:"l1",name:"Basic Lure",cost:0,boost:0},{id:"l2",name:"Silver Spoon",cost:150,boost:15},{id:"l3",name:"Magic Fly",cost:450,boost:35},{id:"l4",name:"Legend Lure",cost:1200,boost:60}];
const NETS  = [{id:"n1",name:"Single Hook",cost:0,max:1},{id:"n2",name:"Double Hook",cost:300,max:2},{id:"n3",name:"Triple Rig",cost:800,max:3},{id:"n4",name:"Net Cast",cost:2000,max:6}];

function mkSwimmer(f) {
  return {
    fish: f,
    x:    20 + Math.random() * (CW - 40),
    depth:(f.mn + Math.random() * (f.mx - f.mn)) * OCEAN_D,
    vx:   (Math.random() - 0.5) * 0.7,
    dir:  Math.random() < 0.5 ? 1 : -1,
    wobble: Math.random() * Math.PI * 2,
  };
}

export { CW, VH, WATER_SY, OCEAN_D, BOAT_SX, BOAT_SY, BOAT_W, BOAT_H, ROD_SX, ROD_SY, d2s, s2d, FISH, RODS, LURES, NETS, mkSwimmer };
```

Note: Remove React imports - game engine should be pure JS. We'll remove `useState`, `useEffect`, etc.

- [ ] **Step 2: Create FishingGameEngine class skeleton**

Append to `src/engine/FishingGameEngine.js`:

```javascript
class FishingGameEngine {
  constructor() {
    this.state = {
      fish: [],
      inventory: { caughtFish: [], money: 0 },
      rodIndex: 0,
      lureIndex: 0,
      netIndex: 0,
      isPaused: false,
    };
    this.spawnFish();
  }

  spawnFish() {
    // TODO: Implement fish spawning
  }

  getState() {
    return { ...this.state };
  }

  startGame() {
    this.state.isPaused = false;
  }

  pauseGame() {
    this.state.isPaused = true;
  }

  resumeGame() {
    this.state.isPaused = false;
  }

  update(deltaTime) {
    if (this.state.isPaused) return;
    // TODO: Implement game loop
  }

  castLine() {
    // TODO: Implement casting
  }

  reel() {
    // TODO: Implement reeling
  }

  catchFish(fishId) {
    // TODO: Implement catching
  }

  buyRod(rodId) {
    // TODO: Implement rod purchase
    return false;
  }

  buyLure(lureId) {
    // TODO: Implement lure purchase
    return false;
  }

  buyNet(netId) {
    // TODO: Implement net purchase
    return false;
  }

  getFishToDraw() {
    return this.state.fish;
  }

  getBoatPosition() {
    return { x: BOAT_SX, y: BOAT_SY };
  }

  getLineState() {
    return { hooked: false, depth: 0, angle: 0 };
  }

  getCanvasSize() {
    return { width: CW, height: VH };
  }
}

export default FishingGameEngine;
```

- [ ] **Step 3: Verify**

```bash
cat games/fishing/src/engine/FishingGameEngine.js | grep "class FishingGameEngine"
# Expected: Class definition present
```

---

### Task 8: Extract full game logic into FishingGameEngine

**Files:**
- Modify: `games/fishing/src/engine/FishingGameEngine.js`

This is a large task - extract the entire `fishing/fishing.txt` file (all the game mechanics, fish drawing, update loop, etc.) into the FishingGameEngine class methods.

- [ ] **Step 1: Read fishing.txt completely**

```bash
wc -l fishing/fishing.txt
# Expected: ~18,000+ characters
```

- [ ] **Step 2: Extract game logic into FishingGameEngine**

Copy the entire content of `fishing/fishing.txt` but:
1. Remove all React `import` statements at the top
2. Remove the final `export default FishingGame;`
3. Convert the function into a class with methods
4. Move all helper functions and rendering code into appropriate methods
5. Keep all constants, fish data, drawing functions

The key methods to implement:
- `spawnFish()` - spawns initial fish
- `update(deltaTime)` - game loop (updates fish, line state, etc.)
- `castLine()` - initiates fishing
- `reel()` - reels in line
- `catchFish(fishId)` - catches a fish and adds to inventory
- `buyRod/Lure/Net()` - purchases upgrades
- `getFishToDraw()` - returns fish for rendering
- Various helper methods for physics, collision, etc.

**Reference structure:**

```javascript
class FishingGameEngine {
  constructor() {
    this.state = { /* initial state */ };
    this.line = { /* line state */ };
    this.hooked = null;
    this.spawnFish();
  }

  spawnFish() {
    // Creates initial swimmers
    for (let i = 0; i < 10; i++) {
      this.state.fish.push(mkSwimmer(FISH[Math.floor(Math.random() * FISH.length)]));
    }
  }

  update(deltaTime) {
    // Updates fish positions, physics, etc.
    // Updates line state
    // Checks for catches
  }

  castLine() {
    // Initiates line casting
  }

  reel() {
    // Reels in the line
  }

  catchFish(fish) {
    // Adds fish to inventory
    // Adds money reward
  }

  // ... all other methods
}
```

This is a significant copy-paste and refactoring task. The engine should be fully functional after this step.

- [ ] **Step 3: Verify engine loads without React**

```bash
cd games/fishing
node -e "import('./src/engine/FishingGameEngine.js').then(m => console.log('Loaded:', m.default))"
# Expected: No errors, class loads
```

- [ ] **Step 4: Commit**

```bash
git add games/fishing/src/engine/FishingGameEngine.js
git commit -m "feat: extract game logic into FishingGameEngine class"
```

---

## Phase 3: React Components

### Task 9: Create useGameState hook

**Files:**
- Create: `games/fishing/src/hooks/useGameState.js`

- [ ] **Step 1: Write useGameState hook**

```javascript
// src/hooks/useGameState.js
import { useState, useEffect } from 'react';
import FishingGameEngine from '../engine/FishingGameEngine.js';

export function useGameState() {
  const [engine] = useState(() => new FishingGameEngine());
  const [state, setState] = useState(engine.getState());

  useEffect(() => {
    let lastTime = performance.now();
    let animId;

    const gameLoop = (time) => {
      const deltaTime = time - lastTime;
      lastTime = time;

      engine.update(deltaTime);
      setState(engine.getState());

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [engine]);

  return { engine, state };
}

export default useGameState;
```

- [ ] **Step 2: Verify syntax**

```bash
cat games/fishing/src/hooks/useGameState.js | head -10
# Expected: import statements present
```

- [ ] **Step 3: Commit**

```bash
git add games/fishing/src/hooks/useGameState.js
git commit -m "feat: create useGameState hook"
```

---

### Task 10: Create GameCanvas component

**Files:**
- Create: `games/fishing/src/components/GameCanvas.jsx`
- Create: `games/fishing/src/styles/GameCanvas.module.css`

- [ ] **Step 1: Write GameCanvas.jsx**

```javascript
// src/components/GameCanvas.jsx
import { useRef, useEffect } from 'react';
import styles from '../styles/GameCanvas.module.css';
import { CW, VH, WATER_SY, drawFish } from '../engine/FishingGameEngine.js';

export function GameCanvas({ engine, state }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(0, 0, CW, VH);

    // Draw water
    ctx.fillStyle = '#1e90ff';
    ctx.fillRect(0, WATER_SY, CW, VH - WATER_SY);

    // Draw fish
    state.fish.forEach(f => {
      drawFish(ctx, f.fish, f.x, f.y, f.dir, 1, 1, performance.now());
    });

    // Draw boat
    ctx.fillStyle = '#8b4513';
    const boatPos = engine.getBoatPosition();
    ctx.fillRect(boatPos.x - 100, boatPos.y, 200, 50);

    // Draw line
    const lineState = engine.getLineState();
    if (lineState.hooked) {
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(boatPos.x, boatPos.y);
      ctx.lineTo(boatPos.x, WATER_SY + lineState.depth);
      ctx.stroke();
    }
  }, [state, engine]);

  const handleClick = () => {
    engine.castLine();
  };

  return (
    <div className={styles.canvasContainer}>
      <canvas
        ref={canvasRef}
        width={CW}
        height={VH}
        onClick={handleClick}
        className={styles.canvas}
      />
    </div>
  );
}

export default GameCanvas;
```

- [ ] **Step 2: Write GameCanvas.module.css**

```css
/* src/styles/GameCanvas.module.css */
.canvasContainer {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.canvas {
  border: 2px solid #333;
  cursor: crosshair;
  background-color: #87ceeb;
}
```

- [ ] **Step 3: Verify**

```bash
cat games/fishing/src/components/GameCanvas.jsx | grep "function GameCanvas"
# Expected: Function declaration present
```

- [ ] **Step 4: Commit**

```bash
git add games/fishing/src/components/GameCanvas.jsx games/fishing/src/styles/GameCanvas.module.css
git commit -m "feat: create GameCanvas component"
```

---

### Task 11: Create Stats component

**Files:**
- Create: `games/fishing/src/components/Stats.jsx`
- Create: `games/fishing/src/styles/Stats.module.css`

- [ ] **Step 1: Write Stats.jsx**

```javascript
// src/components/Stats.jsx
import styles from '../styles/Stats.module.css';

export function Stats({ state }) {
  return (
    <div className={styles.stats}>
      <h2>Game Stats</h2>
      <div className={styles.stat}>
        <span>Money:</span>
        <strong>${state.inventory?.money || 0}</strong>
      </div>
      <div className={styles.stat}>
        <span>Fish Caught:</span>
        <strong>{state.inventory?.caughtFish?.length || 0}</strong>
      </div>
      <div className={styles.stat}>
        <span>Current Rod:</span>
        <strong>{state.currentRod || 'None'}</strong>
      </div>
    </div>
  );
}

export default Stats;
```

- [ ] **Step 2: Write Stats.module.css**

```css
/* src/styles/Stats.module.css */
.stats {
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #f9f9f9;
}

.stats h2 {
  margin-top: 0;
  font-size: 18px;
}

.stat {
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
}

.stat span {
  font-weight: bold;
}

.stat strong {
  color: #1e90ff;
}
```

- [ ] **Step 3: Commit**

```bash
git add games/fishing/src/components/Stats.jsx games/fishing/src/styles/Stats.module.css
git commit -m "feat: create Stats component"
```

---

### Task 12: Create Inventory component

**Files:**
- Create: `games/fishing/src/components/Inventory.jsx`
- Create: `games/fishing/src/styles/Inventory.module.css`

- [ ] **Step 1: Write Inventory.jsx**

```javascript
// src/components/Inventory.jsx
import styles from '../styles/Inventory.module.css';

export function Inventory({ state }) {
  const caughtFish = state.inventory?.caughtFish || [];

  return (
    <div className={styles.inventory}>
      <h2>Inventory ({caughtFish.length})</h2>
      <div className={styles.fishList}>
        {caughtFish.length === 0 ? (
          <p>No fish caught yet</p>
        ) : (
          caughtFish.map((f, i) => (
            <div key={i} className={styles.fishItem}>
              <strong>{f.name}</strong>
              <span>{f.weight.toFixed(1)}kg</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Inventory;
```

- [ ] **Step 2: Write Inventory.module.css**

```css
/* src/styles/Inventory.module.css */
.inventory {
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #f9f9f9;
  max-height: 300px;
  overflow-y: auto;
}

.inventory h2 {
  margin-top: 0;
  font-size: 18px;
}

.fishList {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fishItem {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 3px;
}

.fishItem strong {
  color: #333;
}

.fishItem span {
  color: #666;
  font-size: 12px;
}
```

- [ ] **Step 3: Commit**

```bash
git add games/fishing/src/components/Inventory.jsx games/fishing/src/styles/Inventory.module.css
git commit -m "feat: create Inventory component"
```

---

### Task 13: Create Shop component

**Files:**
- Create: `games/fishing/src/components/Shop.jsx`
- Create: `games/fishing/src/styles/Shop.module.css`

- [ ] **Step 1: Write Shop.jsx**

```javascript
// src/components/Shop.jsx
import styles from '../styles/Shop.module.css';
import { RODS, LURES, NETS } from '../engine/FishingGameEngine.js';

export function Shop({ engine, state }) {
  const money = state.inventory?.money || 0;

  const handleBuyRod = (rodId) => {
    engine.buyRod(rodId);
  };

  const handleBuyLure = (lureId) => {
    engine.buyLure(lureId);
  };

  const handleBuyNet = (netId) => {
    engine.buyNet(netId);
  };

  return (
    <div className={styles.shop}>
      <h2>Shop</h2>

      <div className={styles.category}>
        <h3>Rods</h3>
        {RODS.map(rod => (
          <div key={rod.id} className={styles.item}>
            <div>
              <strong>{rod.name}</strong>
              <span>${rod.cost}</span>
            </div>
            <button
              onClick={() => handleBuyRod(rod.id)}
              disabled={money < rod.cost}
            >
              Buy
            </button>
          </div>
        ))}
      </div>

      <div className={styles.category}>
        <h3>Lures</h3>
        {LURES.map(lure => (
          <div key={lure.id} className={styles.item}>
            <div>
              <strong>{lure.name}</strong>
              <span>${lure.cost}</span>
            </div>
            <button
              onClick={() => handleBuyLure(lure.id)}
              disabled={money < lure.cost}
            >
              Buy
            </button>
          </div>
        ))}
      </div>

      <div className={styles.category}>
        <h3>Nets</h3>
        {NETS.map(net => (
          <div key={net.id} className={styles.item}>
            <div>
              <strong>{net.name}</strong>
              <span>${net.cost}</span>
            </div>
            <button
              onClick={() => handleBuyNet(net.id)}
              disabled={money < net.cost}
            >
              Buy
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Shop;
```

- [ ] **Step 2: Write Shop.module.css**

```css
/* src/styles/Shop.module.css */
.shop {
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #f9f9f9;
  max-height: 400px;
  overflow-y: auto;
}

.shop h2 {
  margin-top: 0;
  font-size: 18px;
}

.category {
  margin: 15px 0;
}

.category h3 {
  margin: 10px 0 5px 0;
  font-size: 14px;
  color: #666;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 3px;
  margin-bottom: 5px;
}

.item div {
  display: flex;
  flex-direction: column;
}

.item strong {
  color: #333;
  font-size: 13px;
}

.item span {
  color: #666;
  font-size: 11px;
}

.item button {
  padding: 4px 12px;
  background: #1e90ff;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
}

.item button:hover:not(:disabled) {
  background: #1873cc;
}

.item button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
```

- [ ] **Step 3: Commit**

```bash
git add games/fishing/src/components/Shop.jsx games/fishing/src/styles/Shop.module.css
git commit -m "feat: create Shop component"
```

---

### Task 14: Create components/index.js

**Files:**
- Create: `games/fishing/src/components/index.js`

- [ ] **Step 1: Write index.js**

```javascript
// src/components/index.js
export { GameCanvas } from './GameCanvas.jsx';
export { Stats } from './Stats.jsx';
export { Inventory } from './Inventory.jsx';
export { Shop } from './Shop.jsx';
```

- [ ] **Step 2: Verify**

```bash
cat games/fishing/src/components/index.js
# Expected: All exports present
```

- [ ] **Step 3: Commit**

```bash
git add games/fishing/src/components/index.js
git commit -m "feat: create components index"
```

---

## Phase 4: React Integration

### Task 15: Create App.jsx

**Files:**
- Create: `games/fishing/src/App.jsx`

- [ ] **Step 1: Write App.jsx**

```javascript
// src/App.jsx
import { useGameState } from './hooks/useGameState.js';
import { GameCanvas, Stats, Inventory, Shop } from './components/index.js';
import './index.css';

function App() {
  const { engine, state } = useGameState();

  return (
    <div className="app">
      <h1>Fishing Game</h1>
      <div className="game-layout">
        <div className="canvas-section">
          <GameCanvas engine={engine} state={state} />
        </div>
        <div className="sidebar">
          <Stats state={state} />
          <Inventory state={state} />
          <Shop engine={engine} state={state} />
        </div>
      </div>
    </div>
  );
}

export default App;
```

- [ ] **Step 2: Write index.css**

```css
/* src/index.css */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  background: #f0f0f0;
}

.app {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.app h1 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.game-layout {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.canvas-section {
  flex: 1;
  min-width: 600px;
  background: white;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.sidebar {
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.sidebar > div {
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@media (max-width: 900px) {
  .game-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add games/fishing/src/App.jsx games/fishing/src/index.css
git commit -m "feat: create App orchestrator and global styles"
```

---

### Task 16: Create main.jsx (React entry point)

**Files:**
- Create: `games/fishing/src/main.jsx`

- [ ] **Step 1: Write main.jsx**

```javascript
// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Step 2: Verify**

```bash
cat games/fishing/src/main.jsx
# Expected: React and ReactDOM imports
```

- [ ] **Step 3: Commit**

```bash
git add games/fishing/src/main.jsx
git commit -m "feat: create React entry point"
```

---

## Phase 5: Testing & Validation

### Task 17: Install dependencies and test locally

**Files:**
- None (development test)

- [ ] **Step 1: Install npm dependencies**

```bash
cd games/fishing
npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 2: Start dev server**

```bash
npm run dev
```

Expected: Vite dev server starts at http://localhost:3000 or similar port.

- [ ] **Step 3: Open in browser**

Navigate to http://localhost:3000 and verify:
- Game canvas appears with fishing scene
- Stats display money and fish count
- Inventory section visible (initially empty)
- Shop shows upgrades with prices
- Canvas responds to clicks

- [ ] **Step 4: Test game interaction**

Click on the canvas and verify:
- Line casts
- Fish appear and move
- Can reel in
- Can catch fish (check inventory updates)

- [ ] **Step 5: Stop dev server**

```bash
# Press Ctrl+C in terminal
```

- [ ] **Step 6: Build for production**

```bash
npm run build
```

Expected: `dist/` folder created with compiled files.

- [ ] **Step 7: Preview production build**

```bash
npm run preview
```

Navigate to given URL and verify game works identically.

- [ ] **Step 8: Commit success**

```bash
git add -A
git commit -m "feat: fishing game conversion complete - working locally"
```

---

### Task 18: Test with Docker

**Files:**
- None (deployment test)

- [ ] **Step 1: Build Docker image**

```bash
cd games/fishing
docker build -t fishing-game:latest .
```

Expected: Build succeeds, image created.

- [ ] **Step 2: Run container**

```bash
docker run -p 3000:3000 fishing-game:latest
```

Expected: Container starts, serves on http://localhost:3000

- [ ] **Step 3: Test in browser**

Navigate to http://localhost:3000 and verify game works.

- [ ] **Step 4: Stop container**

```bash
# Press Ctrl+C in terminal
```

- [ ] **Step 5: Test with docker-compose**

Create `docker-compose.yml` at project root with fishing service (if not already done):

```yaml
version: '3.8'

services:
  fishing:
    build:
      context: ./games/fishing
      dockerfile: Dockerfile
    container_name: fishing-game
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
```

Run:

```bash
docker-compose up --build
```

Expected: Fishing game accessible at http://localhost:3000

- [ ] **Step 6: Stop services**

```bash
docker-compose down
```

- [ ] **Step 7: Final commit**

```bash
git add docker-compose.yml
git commit -m "feat: add fishing game to docker-compose"
```

---

## Success Criteria

✅ Game runs at `http://localhost:3000` (locally and in Docker)
✅ FishingGameEngine is pure JS with no React imports
✅ Components render correctly and update with state
✅ Game logic and UI are cleanly separated
✅ Docker build succeeds and runs the game
✅ All code is committed to git
✅ Code is ready for future bug fixes and feature additions

---

## Post-Conversion Work

After completing this plan:
1. **Fix bugs** identified in the original game
2. **Add new features** as requested
3. **Improve performance** where needed
4. **Add tests** for game logic

These tasks are outside the scope of this conversion and will be done in follow-up work.
