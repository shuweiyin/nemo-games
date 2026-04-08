// games/fighting/src/components/GameCanvas.jsx
import React, { useEffect, useRef } from 'react';
import { createEngine } from '../game/engine.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../game/constants.js';

export default function GameCanvas({ config, gameStateRef, onMatchOver }) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);

  useEffect(() => {
    const engine = createEngine();
    engineRef.current = engine;
    engine.start(canvasRef.current, gameStateRef, config, onMatchOver);
    return () => engine.stop();
  }, [config]); // re-init when config changes (rematch)

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      style={{ display: 'block' }}
    />
  );
}
