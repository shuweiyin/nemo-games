import React, { useState } from 'react';

export default function App() {
  const [screen, setScreen] = useState('menu');
  const [gameConfig, setGameConfig] = useState(null);

  if (screen === 'menu') return <div style={{ color: '#fff', fontSize: 32, textAlign: 'center', paddingTop: 200 }}>Loading...</div>;
  return null;
}
