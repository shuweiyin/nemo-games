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
          <Inventory state={state} engine={engine} />
          <Shop engine={engine} state={state} />
        </div>
      </div>
    </div>
  );
}

export default App;
