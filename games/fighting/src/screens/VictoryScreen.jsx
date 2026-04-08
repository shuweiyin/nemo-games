// games/fighting/src/screens/VictoryScreen.jsx
import React from 'react';
import { CHARACTERS } from '../game/constants.js';

const S = {
  wrap:  { width: '100vw', minHeight: '100vh', background: '#0a0a1a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Impact', color: '#fff' },
  title: (winner) => ({ fontSize: 72, color: winner === 'player' ? '#f1c40f' : '#e74c3c', textShadow: '4px 4px 0 #000', marginBottom: 32 }),
  team:  { display: 'flex', gap: 20, marginBottom: 32 },
  card:  (alive) => ({ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: alive ? 1 : 0.4 }),
  dot:   (color) => ({ width: 60, height: 60, background: color, border: '3px solid #fff', marginBottom: 8 }),
  hp:    { width: 80, height: 10, background: '#333', border: '1px solid #888' },
  hpFill:(pct, color) => ({ width: `${pct * 100}%`, height: '100%', background: color }),
  btn:   { padding: '14px 40px', fontSize: 22, background: '#e74c3c', color: '#fff', border: 'none', cursor: 'pointer', letterSpacing: 2, fontFamily: 'Impact', margin: 8, boxShadow: '3px 3px 0 #7f1e0e' },
};

export default function VictoryScreen({ result, onRematch, onSelect, onMenu }) {
  if (!result) return null;
  const { winner, finalPlayerTeam, finalCpuTeam } = result;

  return (
    <div style={S.wrap}>
      <div style={S.title(winner)}>{winner === 'player' ? 'PLAYER WINS!' : 'CPU WINS!'}</div>

      <div style={{ display: 'flex', gap: 80, marginBottom: 32 }}>
        {[{ team: finalPlayerTeam, label: 'YOUR TEAM', color: '#e74c3c' }, { team: finalCpuTeam, label: 'CPU TEAM', color: '#3498db' }].map(({ team, label, color }) => (
          <div key={label}>
            <div style={{ fontSize: 20, color: '#f39c12', marginBottom: 12, letterSpacing: 2 }}>{label}</div>
            <div style={S.team}>
              {team.map((slot, i) => (
                <div key={i} style={S.card(slot.alive)}>
                  <div style={S.dot(CHARACTERS[slot.charId].color)}>
                    {!slot.alive && <div style={{ color: '#fff', fontSize: 32, textAlign: 'center', lineHeight: '54px' }}>✕</div>}
                  </div>
                  <div style={{ fontSize: 12, marginBottom: 4 }}>{CHARACTERS[slot.charId].name}</div>
                  <div style={S.hp}>
                    <div style={S.hpFill(slot.alive ? slot.health / slot.maxHealth : 0, color)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div>
        <button style={S.btn} onClick={onRematch}>REMATCH</button>
        <button style={S.btn} onClick={onSelect}>CHARACTER SELECT</button>
        <button style={S.btn} onClick={onMenu}>MAIN MENU</button>
      </div>
    </div>
  );
}
