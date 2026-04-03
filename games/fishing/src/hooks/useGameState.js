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
