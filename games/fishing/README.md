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
