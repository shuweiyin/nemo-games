// games/fighting/src/App.jsx
import React, { useState } from 'react';
import MainMenu from './screens/MainMenu.jsx';
import CharacterSelect from './screens/CharacterSelect.jsx';
import FightScreen from './screens/FightScreen.jsx';
import VictoryScreen from './screens/VictoryScreen.jsx';

export default function App() {
  const [screen, setScreen] = useState('menu');
  const [gameConfig, setGameConfig] = useState(null);
  const [matchResult, setMatchResult] = useState(null);

  function startGame(config) {
    setGameConfig(config);
    setScreen('fight');
  }

  function onMatchOver(winner, finalPlayerTeam, finalCpuTeam) {
    setMatchResult({ winner, finalPlayerTeam, finalCpuTeam, config: gameConfig });
    setScreen('victory');
  }

  function rematch() {
    setScreen('fight');
  }

  if (screen === 'menu')    return <MainMenu onStart={() => setScreen('select')} />;
  if (screen === 'select')  return <CharacterSelect onStart={startGame} onBack={() => setScreen('menu')} />;
  if (screen === 'fight')   return <FightScreen config={gameConfig} onMatchOver={onMatchOver} />;
  if (screen === 'victory') return <VictoryScreen result={matchResult} onRematch={rematch} onSelect={() => setScreen('select')} onMenu={() => setScreen('menu')} />;
  return null;
}
