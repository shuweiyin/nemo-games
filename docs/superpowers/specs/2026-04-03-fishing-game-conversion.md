# Fishing Game Conversion to Dockerized Monorepo

**Date:** 2026-04-03
**Status:** Design Approved
**Scope:** Convert `fishing.txt` to Vite + React with clean architecture in `games/fishing/` directory

---

## Overview

Convert the existing fishing game from a monolithic React component into a well-structured, maintainable Vite + React application following **Approach B: Clean Separation** architecture. This establishes a reusable pattern for all 10+ games in the monorepo.

**Goals:**
- ✅ Separate game logic from UI/rendering
- ✅ Improve code structure for maintainability
- ✅ Fix bugs and add features after conversion (not during)
- ✅ Establish a pattern for other games to follow

---

## Architecture: Approach B - Clean Separation

### Core Principle
**Game Engine (pure JS) + React Components (dumb UI)**

The `FishingGameEngine` is a JavaScript class with **zero React dependencies**. It owns all game logic, state, and mechanics. React components are thin UI layers that:
1. Fetch state from the engine
2. Render it to the screen
3. Call engine methods in response to user actions

---

## File Structure

```
games/fishing/
├── src/
│   ├── App.jsx                    # Main orchestrator component
│   ├── main.jsx                   # React entry point
│   ├── index.css                  # Global styles
│   │
│   ├── engine/
│   │   └── FishingGameEngine.js   # Game logic (state, fish, mechanics)
│   │
│   ├── components/
│   │   ├── GameCanvas.jsx         # Canvas rendering (fishing scene)
│   │   ├── Inventory.jsx          # Display caught fish
│   │   ├── Shop.jsx               # Buy upgrades (rods, lures, nets)
│   │   ├── Stats.jsx              # Money, current rod, game info
│   │   └── index.js               # Export all components
│   │
│   ├── hooks/
│   │   └── useGameState.js        # Custom hook wrapping FishingGameEngine
│   │
│   └── styles/
│       ├── GameCanvas.module.css
│       ├── Inventory.module.css
│       ├── Shop.module.css
│       └── Stats.module.css
│
├── public/
├── index.html
├── vite.config.js
├── package.json
├── Dockerfile
├── .dockerignore
└── README.md
```

---

## Component Details

### 1. FishingGameEngine (Pure Game Logic)

**File:** `src/engine/FishingGameEngine.js`

A JavaScript class that encapsulates all game mechanics. **No React imports, no side effects.**

**State managed:**
- Fish spawning, movement, behavior
- Fishing mechanics (casting, reeling, catching)
- Player inventory (caught fish)
- Money and upgrades (rods, lures, nets)
- Game timers and counters

**Public interface:**

```javascript
class FishingGameEngine {
  // Game lifecycle
  startGame()
  pauseGame()
  resumeGame()

  // Update loop (called each animation frame)
  update(deltaTime)

  // State access (returns immutable snapshots)
  getState() → GameState {
    fish: FishObject[],
    inventory: InventoryObject,
    money: number,
    rodIndex: number,
    lureIndex: number,
    netIndex: number,
    isPaused: boolean,
    ...
  }

  // Fishing actions
  castLine()
  reel()
  catchFish(fishId)

  // Shop/upgrades
  buyRod(rodId) → boolean
  buyLure(lureId) → boolean
  buyNet(netId) → boolean

  // Rendering data
  getFishToDraw() → RenderFish[]
  getBoatPosition() → {x, y}
  getLineState() → {hooked, depth, angle}
  getCanvasSize() → {width, height}
}
```

**Design principles:**
- Extracted from `fishing.txt` with minimal refactoring
- All constants (fish data, upgrades, canvas dimensions) kept as module exports
- Game state is queried via `getState()`, never mutated externally
- Callbacks/events for catching fish, buying upgrades, etc.

---

### 2. Custom Hook: useGameState

**File:** `src/hooks/useGameState.js`

Wraps `FishingGameEngine` and provides React integration:

```javascript
function useGameState() {
  const [engine] = useState(() => new FishingGameEngine());
  const [state, setState] = useState(engine.getState());

  // Game loop
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
```

Returns `{ engine, state }` — engine for calling methods, state for rendering.

---

### 3. React Components (Dumb UI)

Each component receives engine and state, renders accordingly, calls engine methods on user interaction.

#### GameCanvas.jsx
- Renders canvas with fishing scene
- Draws fish, boat, line, animations
- Handles canvas click/drag for casting line
- **Input:** `{ engine, state }`
- **Calls:** `engine.castLine()`, `engine.reel()`, `engine.catchFish()`

#### Inventory.jsx
- Displays caught fish in a grid/list
- Shows fish name, weight, rarity
- **Input:** `{ state.inventory.fish }`

#### Shop.jsx
- Lists available rods, lures, nets with prices
- "Buy" buttons call engine
- Disables buttons if player can't afford
- **Input:** `{ engine, state }`
- **Calls:** `engine.buyRod()`, `engine.buyLure()`, `engine.buyNet()`

#### Stats.jsx
- Displays money, current rod/lure/net
- Game timer, fish caught count
- **Input:** `{ state }`

---

### 4. App.jsx (Orchestrator)

```javascript
function App() {
  const { engine, state } = useGameState();

  return (
    <div className="game-container">
      <GameCanvas engine={engine} state={state} />
      <div className="sidebar">
        <Stats state={state} />
        <Inventory state={state} />
        <Shop engine={engine} state={state} />
      </div>
    </div>
  );
}
```

Simple orchestration — fetch hook, pass data down.

---

## Docker & Development

### Dockerfile
Multi-stage build (per design doc):

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

### package.json
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

### vite.config.js
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

---

## Development Workflow

### Local Setup
```bash
cd games/fishing
npm install
npm run dev
# Game hot-reloads at http://localhost:3000
```

### With Docker Compose
```bash
# From project root
docker-compose up
# Fishing game at http://localhost:3000
```

### Code Changes
- **Game logic:** Edit `src/engine/FishingGameEngine.js`
- **UI:** Edit components in `src/components/`
- **Hot reload:** Automatic with Vite dev server
- **No rebuild needed** (docker-compose volume mounts handle this)

---

## Data Flow

```
useGameState (hook)
    ↓ engine.update()
FishingGameEngine (pure JS)
    ↓ getState()
setState in hook
    ↓ { engine, state }
App.jsx
    ├→ GameCanvas (reads state, calls engine methods)
    ├→ Inventory (reads state)
    ├→ Shop (calls engine.buy* methods)
    └→ Stats (reads state)
```

---

## Testing Strategy (Post-Conversion)

**Game logic (FishingGameEngine):**
- Unit tests can run without React
- Test fish spawning, movement, catching mechanics
- Test upgrade purchases and money logic

**React components:**
- Shallow render tests
- Verify they call engine methods correctly
- Verify they render state correctly

**Integration:**
- E2E tests with canvas interaction

---

## Migration Path from fishing.txt

1. Copy game logic (fish data, constants, mechanics) into `FishingGameEngine`
2. Extract rendering code into `GameCanvas.jsx`
3. Extract inventory UI into `Inventory.jsx`
4. Extract shop UI into `Shop.jsx`
5. Extract stats UI into `Stats.jsx`
6. Create `useGameState` hook to wire it all together
7. Test locally
8. Commit to git

**Note:** Bugs and new features are fixed/added AFTER conversion is complete.

---

## Success Criteria

✅ Game runs at `http://localhost:3000`
✅ Game logic is in `FishingGameEngine`, no React imports
✅ Components are dumb (render state, call engine methods)
✅ Hot reload works during development
✅ Docker build succeeds and runs
✅ Code is ready for future bug fixes and features

---

## Benefits of This Architecture

| Benefit | Why It Matters |
|---------|---|
| **Separation of concerns** | Logic and UI don't interfere with each other |
| **Testability** | Game engine can be tested without React |
| **Maintainability** | Bugs are in engine or UI, never mixed |
| **Reusability** | Engine could be ported to other frameworks |
| **Scalability** | Same pattern works for all 10 games |
| **Feature-friendly** | New features are added cleanly to engine or UI |

---

## Constraints & Assumptions

- Node 18+ and npm available
- Docker and Docker Compose for local dev (optional)
- Vite handles all bundling and hot-reload
- Game is stateless, client-side only (no backend)
- Canvas-based rendering (no WebGL initially)

---

## Next Steps (Implementation)

After this design is approved:
1. **Create docker-compose.yml** with fishing service
2. **Set up games/fishing/ directory structure**
3. **Extract game logic → FishingGameEngine.js**
4. **Build React components**
5. **Create useGameState hook**
6. **Test locally: npm run dev**
7. **Test with Docker: docker-compose up**
8. **Post-conversion: Fix bugs and add features**
