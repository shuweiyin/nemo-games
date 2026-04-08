// games/fighting/src/screens/FightScreen.jsx
import React, { useRef } from 'react';
import GameCanvas from '../components/GameCanvas.jsx';
import HUD from '../components/HUD.jsx';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../game/constants.js';

export default function FightScreen({ config, onMatchOver }) {
  const gameStateRef = useRef({
    phase: 'fighting',
    timer: 99,
    playerTeam: config.playerTeam,
    cpuTeam: config.cpuTeam,
    winner: null,
  });

  function handleMatchOver(winner) {
    onMatchOver(winner, gameStateRef.current.playerTeam, gameStateRef.current.cpuTeam);
  }

  return (
    <div style={{ position: 'relative', width: CANVAS_WIDTH, height: CANVAS_HEIGHT, background: '#000' }}>
      <GameCanvas config={config} gameStateRef={gameStateRef} onMatchOver={handleMatchOver} />
      <HUD gameStateRef={gameStateRef} />
    </div>
  );
}
