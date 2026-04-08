// games/fighting/src/screens/MainMenu.jsx
import React from 'react';

const S = {
  container: { width: '100vw', height: '100vh', background: '#0a0a1a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Impact, sans-serif' },
  title:     { fontSize: 80, color: '#e74c3c', textShadow: '4px 4px 0 #7f1e0e, 0 0 40px #e74c3c', letterSpacing: 8, marginBottom: 20 },
  subtitle:  { fontSize: 28, color: '#f39c12', letterSpacing: 4, marginBottom: 60 },
  btn:       { padding: '18px 60px', fontSize: 28, background: '#e74c3c', color: '#fff', border: 'none', cursor: 'pointer', letterSpacing: 3, fontFamily: 'Impact, sans-serif', boxShadow: '4px 4px 0 #7f1e0e' },
};

export default function MainMenu({ onStart }) {
  return (
    <div style={S.container}>
      <div style={S.title}>STREET FIGHTER</div>
      <div style={S.subtitle}>TEAM BATTLE</div>
      <button style={S.btn} onClick={onStart}>PRESS START</button>
    </div>
  );
}
