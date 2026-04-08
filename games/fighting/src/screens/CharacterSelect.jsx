// games/fighting/src/screens/CharacterSelect.jsx
import React, { useState } from 'react';
import { ROSTER, CHARACTERS } from '../game/constants.js';
import { createTeam } from '../game/teamBattle.js';
import { CpuAI } from '../game/ai/cpu.js';
import { STAGES } from '../game/stages.js';

const DIFFICULTIES = ['easy', 'medium', 'hard'];

const S = {
  wrap:     { width: '100vw', minHeight: '100vh', background: '#0a0a1a', color: '#fff', fontFamily: 'Impact, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 20 },
  title:    { fontSize: 40, color: '#f39c12', letterSpacing: 4, marginBottom: 10 },
  grid:     { display: 'grid', gridTemplateColumns: 'repeat(6,100px)', gap: 8, margin: '16px 0' },
  card:     (selected, disabled, picked) => ({
    width: 90, height: 90, background: disabled ? '#222' : selected ? '#e74c3c' : picked ? '#7f1e0e' : '#1a1a2e',
    border: selected ? '3px solid #fff' : '2px solid #444', cursor: disabled ? 'default' : 'pointer',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    opacity: disabled ? 0.4 : 1, fontSize: 11, textAlign: 'center', color: '#fff',
  }),
  btn:      (disabled) => ({ padding: '12px 40px', fontSize: 22, background: disabled ? '#555' : '#e74c3c', color: '#fff', border: 'none', cursor: disabled ? 'default' : 'pointer', letterSpacing: 2, margin: 8, fontFamily: 'Impact' }),
  diff:     (active) => ({ padding: '10px 24px', background: active ? '#e74c3c' : '#1a1a2e', color: '#fff', border: '2px solid #e74c3c', cursor: 'pointer', fontFamily: 'Impact', fontSize: 18, letterSpacing: 2, margin: 4 }),
};

export default function CharacterSelect({ onStart, onBack }) {
  const [picked, setPicked]       = useState([]);   // up to 3 char ids
  const [cursor, setCursor]       = useState(0);    // which slot we're picking for (0,1,2)
  const [difficulty, setDifficulty] = useState('medium');

  function selectChar(charId) {
    if (picked.includes(charId)) return; // no duplicates
    if (cursor >= 3) return;
    const next = [...picked, charId];
    setPicked(next);
    setCursor(cursor + 1);
  }

  function removeSlot(i) {
    const next = picked.filter((_, idx) => idx !== i);
    setPicked(next);
    setCursor(i);
  }

  function handleStart() {
    if (picked.length < 3) return;
    const playerTeam = createTeam(picked);

    // CPU picks 3 highest-stat characters not in player team (Hard) or random (Easy/Med)
    const available = ROSTER.filter(id => !picked.includes(id));
    let cpuCharIds;
    if (difficulty === 'hard') {
      cpuCharIds = available
        .map(id => ({ id, total: Object.values(CHARACTERS[id]).filter(v => typeof v === 'number').reduce((a,b) => a+b, 0) }))
        .sort((a, b) => b.total - a.total || CHARACTERS[b.id].power - CHARACTERS[a.id].power)
        .slice(0, 3)
        .map(x => x.id);
    } else {
      cpuCharIds = available.sort(() => Math.random() - 0.5).slice(0, 3);
    }
    const cpuTeam = createTeam(cpuCharIds);
    const cpuAI   = new CpuAI(difficulty, cpuCharIds[0]);

    onStart({ playerTeam, cpuTeam, cpuAI, difficulty, stageKey: cpuCharIds[0] });
  }

  return (
    <div style={S.wrap}>
      <div style={S.title}>SELECT YOUR TEAM</div>

      {/* Difficulty */}
      <div style={{ marginBottom: 12 }}>
        {DIFFICULTIES.map(d => (
          <button key={d} style={S.diff(difficulty === d)} onClick={() => setDifficulty(d)}>
            {d.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Team slots */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        {[0,1,2].map(i => (
          <div key={i} onClick={() => picked[i] && removeSlot(i)}
            style={{ width: 100, height: 100, background: picked[i] ? CHARACTERS[picked[i]].color : '#111', border: i === cursor ? '3px solid #fff' : '2px solid #444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: picked[i] ? 'pointer' : 'default', fontSize: 13, color: '#fff', textAlign: 'center' }}>
            {picked[i] ? CHARACTERS[picked[i]].name : `SLOT ${i+1}`}
          </div>
        ))}
      </div>

      {/* Character grid */}
      <div style={S.grid}>
        {ROSTER.map(id => {
          const char     = CHARACTERS[id];
          const isPickedByMe = picked.includes(id);
          const isActive = cursor < 3 && !isPickedByMe;
          return (
            <div key={id} style={S.card(false, !isActive, isPickedByMe)} onClick={() => isActive && selectChar(id)}>
              <div style={{ width: 50, height: 50, background: char.color, marginBottom: 4 }} />
              <span>{char.name}</span>
            </div>
          );
        })}
      </div>

      <div>
        <button style={S.btn(false)} onClick={onBack}>BACK</button>
        <button style={S.btn(picked.length < 3)} onClick={handleStart} disabled={picked.length < 3}>FIGHT!</button>
      </div>
    </div>
  );
}
