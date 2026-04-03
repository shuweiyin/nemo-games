# Fishing Game Setup & Docker Integration

**Date:** 2026-04-03
**Status:** Design Approved
**Component:** Standalone Vite + React app for fishing game

---

## Overview

Convert the existing `fishing.txt` React component into a self-contained, Docker-ready fishing game that runs as a standalone page. The game will live in the Nemo's Games monorepo at `/games/fishing/` with its own build process, dependencies, and containerization.

---

## Architecture

The fishing game is a **self-contained Vite + React application**:

- **Development Mode:** Local Vite dev server with hot reload (`npm run dev`) on `http://localhost:5173`
- **Production Mode:** Optimized static build (`npm run build`) → `dist/` folder
- **Containerization:** Multi-stage Docker build for production-ready deployment
- **Deployment:** Runs as a standalone page/app, not embedded via iframe
- **Integration:** Nemo's Games site can link to the fishing game URL when deployed

---

## Project Structure

```
nemo-game/
├── games/
│   └── fishing/
│       ├── src/
│       │   ├── components/
│       │   │   └── FishingGame.jsx          (converted from fishing.txt)
│       │   ├── App.jsx                       (root wrapper component)
│       │   ├── main.jsx                      (React entry point)
│       │   └── index.css                     (global styles)
│       ├── public/                           (static assets if needed)
│       ├── index.html                        (HTML template for Vite)
│       ├── vite.config.js                    (Vite configuration)
│       ├── package.json                      (dependencies & scripts)
│       ├── Dockerfile                        (multi-stage production build)
│       ├── .dockerignore                     (Docker build optimization)
│       └── README.md                         (project documentation)
```

Each game folder is fully autonomous with its own build process, allowing independent development and deployment.

---

## Tech Stack

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Framework | React 18 | Already used in component; declarative UI |
| Build Tool | Vite | Fast dev server, optimized builds, modern standard |
| Runtime | Node 18+ | LTS version, widely available |
| Containerization | Docker | Portable, reproducible environments |
| Server (Prod) | `serve` (npm package) | Minimal, purpose-built for static files |

**Dependencies kept minimal:**
- Only React + React DOM (the fishing game is canvas-based, not heavy on UI libraries)
- No additional frameworks or large dependencies

---

## Development Workflow

### Local Setup
```bash
cd games/fishing
npm install
npm run dev
```
Opens `http://localhost:5173` with hot reload enabled.

### Building for Production
```bash
npm run build       # Optimized production build → dist/
npm run preview     # Preview production build locally
```

### Git Workflow
- Changes to fishing game stay in `games/fishing/`
- Commit messages use `feat(fishing):` prefix for clarity
- Isolated from main Nemo's Games commits

---

## Docker Setup

### Multi-Stage Build (Dockerfile)

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

**Why multi-stage:**
- Build stage compiles React + Vite artifacts
- Production stage is lightweight (only `dist/` + serve binary)
- Minimal final image size (~150MB with Node)

### Running Locally with Docker
```bash
docker build -t fishing-game .
docker run -p 3000:3000 fishing-game
```
Game runs on `http://localhost:3000`.

### Environment Variables (if needed in future)
Add `.env` support in `vite.config.js` for future config (e.g., API endpoints).

---

## Integration with Nemo's Games

The fishing game runs independently. When ready for broader access:

1. **Deploy** the Docker container to hosting (cloud provider, VPS, etc.)
2. **Link** from Nemo's Games homepage to the fishing game URL
3. **Optional:** Embed via iframe if needed (the standalone HTML works either way)

No changes required to the main Nemo's Games site for the game to function.

---

## Component Conversion (fishing.txt → FishingGame.jsx)

The existing `fishing.txt` contains a complete React component with:
- Game logic (fish spawning, movement, catching)
- Canvas rendering
- UI tabs (game, shop, logbook, inventory)
- State management via `useRef` + `useState`

**Conversion plan:**
1. Copy `fishing.txt` content to `src/components/FishingGame.jsx`
2. Wrap in minimal `App.jsx` component
3. Add CSS for layout (Vite will handle bundling)
4. No logic changes needed — the component is already self-contained

---

## Success Criteria

✅ Fishing game runs locally: `npm run dev` works
✅ Production build succeeds: `npm run build` creates `dist/`
✅ Docker image builds and runs: `docker run -p 3000:3000 fishing-game`
✅ Game is playable in browser at `http://localhost:3000`
✅ All game features work (fishing, inventory, shop, logbook)
✅ No console errors or warnings

---

## Dependencies

### package.json (Minimal)
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

---

## Next Steps

1. **Create project structure** — Set up `/games/fishing/` with files
2. **Convert fishing.txt** — Move component to `FishingGame.jsx`
3. **Create App.jsx wrapper** — Minimal root component
4. **Configure Vite** — `vite.config.js` with React plugin
5. **Add Dockerfile** — Multi-stage build for production
6. **Test locally** — `npm run dev` and Docker build
7. **Verify gameplay** — All game features work in browser

---

## Assumptions & Constraints

- Node 18+ available locally and in Docker
- No external API calls (game is fully client-side)
- Canvas rendering works in target browsers (modern Chrome, Firefox, Safari, Edge)
- Static game (no backend needed for initial version)

---

## Future Enhancements (Out of Scope)

- Leaderboard/backend persistence
- Multiplayer
- Mobile optimization
- Additional game modes
- Integration with Nemo's Games grid (can add link later)
