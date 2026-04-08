// games/fighting/src/components/HUD.jsx
import React, { useEffect, useRef, useState } from 'react';
import { CHARACTERS, CANVAS_WIDTH } from '../game/constants.js';

export default function HUD({ gameStateRef }) {
  const [tick, setTick] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    function loop() {
      setTick(t => t + 1);
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const gs = gameStateRef.current;
  if (!gs || !gs.playerTeam) return null;

  const pSlot = gs.playerTeam.find(s => s.alive);
  const cSlot = gs.cpuTeam.find(s => s.alive);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: CANVAS_WIDTH, pointerEvents: 'none', fontFamily: 'Impact, sans-serif', color: '#fff' }}>
      {/* Timer */}
      <div style={{ textAlign: 'center', fontSize: 48, marginTop: 8, textShadow: '2px 2px 0 #000' }}>
        {gs.timer ?? 99}
      </div>

      {/* Health bars row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', marginTop: -10 }}>
        {/* Player side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {pSlot && (
            <div style={{ width: 40, height: 40, background: CHARACTERS[pSlot.charId].color, border: '2px solid #fff' }} />
          )}
          <div style={{ width: 350, height: 24, background: '#333', border: '2px solid #fff' }}>
            {pSlot && (
              <div style={{ width: `${(pSlot.health / pSlot.maxHealth) * 100}%`, height: '100%', background: '#e74c3c', transition: 'width 0.1s' }} />
            )}
          </div>
        </div>

        {/* CPU side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexDirection: 'row-reverse' }}>
          {cSlot && (
            <div style={{ width: 40, height: 40, background: CHARACTERS[cSlot.charId].color, border: '2px solid #fff' }} />
          )}
          <div style={{ width: 350, height: 24, background: '#333', border: '2px solid #fff' }}>
            {cSlot && (
              <div style={{ width: `${(cSlot.health / cSlot.maxHealth) * 100}%`, height: '100%', background: '#3498db', transition: 'width 0.1s', marginLeft: 'auto' }} />
            )}
          </div>
        </div>
      </div>

      {/* Team slots */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 20px' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {gs.playerTeam.map((s, i) => (
            <div key={i} style={{ width: 20, height: 20, borderRadius: '50%', background: s.alive ? CHARACTERS[s.charId].color : '#333', border: '2px solid #888' }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {gs.cpuTeam.map((s, i) => (
            <div key={i} style={{ width: 20, height: 20, borderRadius: '50%', background: s.alive ? CHARACTERS[s.charId].color : '#333', border: '2px solid #888' }} />
          ))}
        </div>
      </div>
    </div>
  );
}
