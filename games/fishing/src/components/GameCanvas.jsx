import { useRef, useEffect } from 'react';
import {
  CW,
  VH,
  WATER_SY,
  OCEAN_D,
  BOAT_SX,
  BOAT_SY,
  BOAT_W,
  BOAT_H,
  ROD_SX,
  ROD_SY,
  d2s,
  FISH,
} from '../engine/FishingGameEngine';
import styles from '../styles/GameCanvas.module.css';

/**
 * Draw a fish at the given position with animation
 * Handles special cases: kraken, jellyfish, manta, sunfish, oarfish, anglerfish,
 * swordfish, whale, shark, eel/gulper/viperfish, colossal/nautilus, flounder, generic fish
 */
function drawFish(ctx, f, sx, sy, dir, alpha, sc, t) {
  alpha = alpha ?? 1;
  sc = sc ?? 1;
  t = t ?? 0;
  dir = dir ?? 1;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(sx, sy);
  ctx.scale(dir * sc, sc);
  const L = f.L;
  const H2 = f.H / 2;
  const wb = Math.sin(t * 0.003) * 0.06;

  // kraken
  if (f.id === 'kraken') {
    ctx.fillStyle = '#5a0080';
    ctx.beginPath();
    ctx.ellipse(0, -L * 0.15, L * 0.28, L * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const wob = Math.sin(t * 0.004 + i) * 0.18;
      ctx.strokeStyle = `hsl(${280 + i * 5},70%,${30 + i * 2}%)`;
      ctx.lineWidth = L * 0.045;
      ctx.lineCap = 'round';
      const bx = Math.cos(a) * L * 0.22;
      const by = Math.sin(a) * L * 0.22 + L * 0.1;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.bezierCurveTo(
        bx + Math.cos(a + wob) * L * 0.35,
        by + Math.sin(a + wob) * L * 0.35,
        bx + Math.cos(a + wob + 0.3) * L * 0.6,
        by + Math.sin(a + wob + 0.3) * L * 0.6,
        bx + Math.cos(a + wob + 0.5) * L * 0.85,
        by + Math.sin(a + wob + 0.5) * L * 0.85
      );
      ctx.stroke();
    }
    ctx.fillStyle = '#ff00ff';
    ctx.beginPath();
    ctx.ellipse(-L * 0.08, -L * 0.18, L * 0.06, L * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(-L * 0.08, -L * 0.18, L * 0.03, L * 0.035, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  // jellyfish
  if (f.id === 'jellyfish') {
    ctx.fillStyle = f.c + 'aa';
    ctx.beginPath();
    ctx.ellipse(0, -H2 * 0.1, L * 0.42, H2 * 0.72, 0, Math.PI, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    for (let i = 0; i < 7; i++) {
      const tx = (i - 3) * L * 0.13;
      const len = H2 * (1.4 + Math.sin(t * 0.003 + i) * 0.35);
      ctx.strokeStyle = f.fc + (i % 2 === 0 ? 'cc' : '88');
      ctx.beginPath();
      ctx.moveTo(tx, H2 * 0.55);
      ctx.bezierCurveTo(
        tx + Math.sin(t * 0.004 + i) * 8,
        H2 * 1,
        tx + Math.sin(t * 0.003 + i) * 7,
        H2 * 1.4,
        tx,
        H2 * 0.55 + len
      );
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  // manta
  if (f.id === 'manta') {
    ctx.fillStyle = f.c;
    ctx.beginPath();
    ctx.moveTo(L * 0.35, 0);
    ctx.bezierCurveTo(L * 0.25, -H2 * 2.2, -L * 0.25, -H2 * 2.2, -L * 0.4, 0);
    ctx.bezierCurveTo(-L * 0.25, H2 * 2.2, L * 0.25, H2 * 2.2, L * 0.35, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = f.fc;
    ctx.beginPath();
    ctx.moveTo(L * 0.35, 0);
    ctx.lineTo(L * 0.55, -H2 * 0.5);
    ctx.lineTo(L * 0.42, -H2 * 0.15);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(L * 0.35, 0);
    ctx.lineTo(L * 0.55, H2 * 0.5);
    ctx.lineTo(L * 0.42, H2 * 0.15);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(L * 0.28, -H2 * 0.18, H2 * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(L * 0.28, -H2 * 0.18, H2 * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  // sunfish
  if (f.id === 'sunfish') {
    ctx.fillStyle = f.c;
    ctx.beginPath();
    ctx.ellipse(0, 0, L * 0.32, H2 * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = f.fc;
    ctx.beginPath();
    ctx.moveTo(L * 0.05, -H2 * 0.85);
    ctx.quadraticCurveTo(0, -H2 * 2.8, -L * 0.05, -H2 * 0.85);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(L * 0.05, H2 * 0.85);
    ctx.quadraticCurveTo(0, H2 * 2.8, -L * 0.05, H2 * 0.85);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(L * 0.16, -H2 * 0.2, H2 * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(L * 0.16, -H2 * 0.2, H2 * 0.11, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  // oarfish
  if (f.id === 'oarfish') {
    ctx.lineWidth = H2 * 1.8;
    ctx.strokeStyle = f.c;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i <= 20; i++) {
      const px = L * (0.5 - i / 20);
      const py = Math.sin(i * 0.5 + wb * 3) * H2 * (0.4 + i * 0.03);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.strokeStyle = '#ff1828';
    ctx.lineWidth = H2 * 0.55;
    ctx.beginPath();
    for (let i = 0; i <= 20; i++) {
      const px = L * (0.5 - i / 20);
      const py = Math.sin(i * 0.5 + wb * 3) * H2 * (0.4 + i * 0.03) - H2 * 1.1;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.fillStyle = f.c;
    ctx.beginPath();
    ctx.ellipse(L * 0.5, 0, H2 * 1.4, H2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(L * 0.48, -H2 * 0.3, H2 * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(L * 0.48, -H2 * 0.3, H2 * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  // anglerfish
  if (f.id === 'anglerfish') {
    ctx.fillStyle = f.c;
    ctx.beginPath();
    ctx.ellipse(-L * 0.05, H2 * 0.15, L * 0.38, H2 * 0.88, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#060010';
    ctx.beginPath();
    ctx.moveTo(L * 0.32, 0);
    ctx.bezierCurveTo(L * 0.28, H2 * 1.1, -L * 0.3, H2 * 1.1, -L * 0.3, H2 * 0.5);
    ctx.bezierCurveTo(-L * 0.3, -H2 * 0.1, L * 0.25, -H2 * 0.05, L * 0.32, 0);
    ctx.fill();
    ctx.fillStyle = '#d8d8c0';
    for (let i = 0; i < 8; i++) {
      const tx = L * 0.28 - i * L * 0.068;
      ctx.beginPath();
      ctx.moveTo(tx, H2 * 0.12);
      ctx.lineTo(tx + L * 0.02, H2 * 0.6);
      ctx.lineTo(tx - L * 0.02, H2 * 0.6);
      ctx.closePath();
      ctx.fill();
    }
    ctx.strokeStyle = '#60c090';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(L * 0.15, -H2 * 0.9);
    ctx.bezierCurveTo(L * 0.45, -H2 * 2.2, L * 0.6, -H2 * 1.5, L * 0.55, -H2 * 1.1);
    ctx.stroke();
    const lg = 0.6 + 0.4 * Math.sin(t * 0.05);
    ctx.fillStyle = `rgba(0,255,180,${lg})`;
    ctx.beginPath();
    ctx.arc(L * 0.55, -H2 * 1.1, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e0e000';
    ctx.beginPath();
    ctx.arc(L * 0.12, -H2 * 0.15, H2 * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(L * 0.12, -H2 * 0.15, H2 * 0.13, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  // swordfish
  if (f.id === 'swordfish') {
    ctx.fillStyle = f.c;
    ctx.beginPath();
    ctx.moveTo(L * 0.4, 0);
    ctx.bezierCurveTo(L * 0.25, -H2, -L * 0.35, -H2 * 0.7, -L * 0.45, 0);
    ctx.bezierCurveTo(-L * 0.35, H2 * 0.7, L * 0.25, H2, L * 0.4, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e8e8e0';
    ctx.beginPath();
    ctx.moveTo(L * 0.4, -H2 * 0.18);
    ctx.lineTo(L * 1.35, 0);
    ctx.lineTo(L * 0.4, H2 * 0.18);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = f.fc;
    ctx.beginPath();
    ctx.moveTo(L * 0.2, -H2);
    ctx.quadraticCurveTo(0, -H2 * 3.2, -L * 0.15, -H2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-L * 0.42, 0);
    ctx.lineTo(-L * 0.62, -H2 * 1.3);
    ctx.lineTo(-L * 0.5, -H2 * 0.15);
    ctx.lineTo(-L * 0.62, H2 * 1.3);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(L * 0.3, -H2 * 0.28, H2 * 0.38, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#001888';
    ctx.beginPath();
    ctx.arc(L * 0.3, -H2 * 0.28, H2 * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  // whale
  if (f.id === 'whale') {
    ctx.fillStyle = f.c;
    ctx.beginPath();
    ctx.moveTo(L * 0.48, -H2 * 0.05);
    ctx.bezierCurveTo(L * 0.42, -H2 * 0.75, -L * 0.28, -H2 * 0.88, -L * 0.42, -H2 * 0.4);
    ctx.bezierCurveTo(-L * 0.5, 0, -L * 0.42, H2 * 0.4, -L * 0.28, H2 * 0.88);
    ctx.bezierCurveTo(L * 0.42, H2 * 0.75, L * 0.42, H2 * 0.75, L * 0.48, H2 * 0.05);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(200,230,255,0.25)';
    ctx.beginPath();
    ctx.ellipse(L * 0.05, H2 * 0.45, L * 0.32, H2 * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = f.fc;
    ctx.beginPath();
    ctx.moveTo(L * 0.15, H2 * 0.55);
    ctx.bezierCurveTo(L * 0.2, H2 * 1.6, L * 0.05, H2 * 2.2, -L * 0.08, H2 * 2);
    ctx.bezierCurveTo(-L * 0.18, H2 * 1.7, 0, H2 * 0.85, L * 0.15, H2 * 0.55);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = f.c;
    ctx.beginPath();
    ctx.moveTo(-L * 0.44, -H2 * 0.12);
    ctx.lineTo(-L * 0.56, -H2 * 0.7);
    ctx.bezierCurveTo(-L * 0.65, -H2 * 1.1, -L * 0.7, -H2 * 0.9, -L * 0.56, -H2 * 0.4);
    ctx.lineTo(-L * 0.44, 0);
    ctx.lineTo(-L * 0.56, H2 * 0.4);
    ctx.bezierCurveTo(-L * 0.7, H2 * 0.9, -L * 0.65, H2 * 1.1, -L * 0.56, H2 * 0.7);
    ctx.lineTo(-L * 0.44, H2 * 0.12);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(L * 0.32, -H2 * 0.15, H2 * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(L * 0.32, -H2 * 0.15, H2 * 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  // shark
  if (f.id === 'shark') {
    ctx.fillStyle = f.c;
    ctx.beginPath();
    ctx.moveTo(L * 0.5, H2 * 0.1);
    ctx.bezierCurveTo(L * 0.38, -H2, -L * 0.3, -H2 * 0.6, -L * 0.4, 0);
    ctx.bezierCurveTo(-L * 0.3, H2 * 0.5, L * 0.38, H2, L * 0.5, H2 * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(240,245,250,0.5)';
    ctx.beginPath();
    ctx.ellipse(L * 0.1, H2 * 0.5, L * 0.3, H2 * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = f.fc;
    ctx.beginPath();
    ctx.moveTo(-L * 0.05, -H2);
    ctx.lineTo(-L * 0.2, -H2 * 3);
    ctx.lineTo(-L * 0.36, -H2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(L * 0.12, H2 * 0.38);
    ctx.lineTo(L * 0.32, H2 * 2.5);
    ctx.lineTo(-L * 0.12, H2 * 0.8);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-L * 0.42, 0);
    ctx.lineTo(-L * 0.6, -H2 * 1.5);
    ctx.lineTo(-L * 0.5, -H2 * 0.1);
    ctx.lineTo(-L * 0.6, H2 * 1.5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(L * 0.3, -H2 * 0.25, H2 * 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  // eel / gulper / viperfish — serpentine
  if (f.id === 'eel' || f.id === 'gulper' || f.id === 'viperfish') {
    ctx.lineWidth = H2 * 1.6;
    ctx.strokeStyle = f.c;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i <= 24; i++) {
      const px = L * (0.5 - i / 24);
      const py = Math.sin(i * 0.45 + wb * 4) * H2 * (1 + i * 0.04);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();
    if (f.id === 'viperfish') {
      ctx.fillStyle = '#d0f0d0';
      for (let i = 0; i < 5; i++) {
        const tx = L * (0.38 - i * 0.1);
        ctx.beginPath();
        ctx.moveTo(tx, H2 * 0.2);
        ctx.lineTo(tx - L * 0.02, H2 * 1.5);
        ctx.lineTo(tx + L * 0.02, H2 * 0.2);
        ctx.closePath();
        ctx.fill();
      }
      for (let i = 0; i < 8; i++) {
        const px = L * (0.3 - i * 0.1);
        const gl = 0.4 + 0.6 * Math.sin(t * 0.005 + i * 0.8);
        ctx.fillStyle = `rgba(0,255,150,${gl})`;
        ctx.beginPath();
        ctx.arc(px, H2 * 0.55, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.fillStyle = f.c;
    ctx.beginPath();
    ctx.ellipse(L * 0.48, 0, H2 * 1.3, H2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(L * 0.44, -H2 * 0.28, H2 * 0.38, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(L * 0.44, -H2 * 0.28, H2 * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  // colossal squid / nautilus
  if (f.id === 'colossal' || f.id === 'nautilus') {
    ctx.fillStyle = f.c;
    ctx.beginPath();
    ctx.ellipse(0, 0, L * 0.42, H2 * 0.88, 0, 0, Math.PI * 2);
    ctx.fill();
    if (f.id === 'nautilus') {
      ctx.strokeStyle = f.fc;
      ctx.lineWidth = 3;
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * H2 * 0.85, Math.sin(a) * H2 * 0.85);
        ctx.stroke();
      }
      ctx.fillStyle = f.fc;
      ctx.beginPath();
      ctx.arc(0, 0, H2 * 0.25, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = f.c + 'cc';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const wo = Math.sin(t * 0.003 + i) * 0.2;
      ctx.beginPath();
      ctx.moveTo(L * 0.4, 0);
      ctx.bezierCurveTo(
        L * 0.65 + Math.cos(a) * L * 0.15,
        Math.sin(a) * H2,
        L * 0.85 + Math.cos(a + wo) * L * 0.2,
        Math.sin(a + wo) * H2 * 1.3,
        L * 0.95 + Math.cos(a + wo) * L * 0.2,
        Math.sin(a + wo) * H2 * 1.5
      );
      ctx.stroke();
    }
    ctx.fillStyle = f.id === 'colossal' ? '#ff2000' : '#fff';
    ctx.beginPath();
    ctx.ellipse(L * 0.3, -H2 * 0.28, H2 * 0.28, H2 * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(L * 0.3, -H2 * 0.28, H2 * 0.13, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  // flounder
  if (f.id === 'flounder') {
    ctx.fillStyle = f.c;
    ctx.beginPath();
    ctx.ellipse(0, 0, L * 0.44, H2 * 0.92, 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = f.fc;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(L * 0.42, 0);
    for (let i = 0; i <= 10; i++) ctx.lineTo(L * (0.42 - i * 0.08), -H2 * (0.9 + Math.sin(i * 0.5) * 0.12));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(L * 0.42, 0);
    for (let i = 0; i <= 10; i++) ctx.lineTo(L * (0.42 - i * 0.08), H2 * (0.9 + Math.sin(i * 0.5) * 0.12));
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(L * 0.18, -H2 * 0.42, H2 * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(L * 0.18, -H2 * 0.42, H2 * 0.11, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  // generic fish
  const fat = f.id === 'grouper' ? 1.1 : f.id === 'cod' ? 0.95 : f.id === 'barracuda' || f.id === 'pike' ? 0.55 : 0.8;
  ctx.fillStyle = f.c;
  ctx.beginPath();
  ctx.moveTo(L * 0.5, 0);
  ctx.bezierCurveTo(L * 0.36, -H2 * fat, -L * 0.26, -H2 * fat, -L * 0.36, 0);
  ctx.bezierCurveTo(-L * 0.26, H2 * fat, L * 0.36, H2 * fat, L * 0.5, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath();
  ctx.ellipse(L * 0.1, -H2 * 0.25, L * 0.22, H2 * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = f.fc;
  const tf = f.id === 'tuna' ? 1.6 : f.id === 'mackerel' ? 1.4 : 1.1;
  ctx.beginPath();
  ctx.moveTo(-L * 0.34, 0);
  ctx.lineTo(-L * 0.56, -H2 * tf);
  ctx.lineTo(-L * 0.48, -H2 * 0.08);
  ctx.lineTo(-L * 0.56, H2 * tf);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(L * 0.1, -H2);
  ctx.quadraticCurveTo(0, -H2 * 2, -L * 0.2, -H2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = f.fc + 'aa';
  ctx.beginPath();
  ctx.moveTo(L * 0.1, H2 * 0.45);
  ctx.lineTo(L * 0.2, H2 * 1.7);
  ctx.lineTo(-L * 0.06, H2 * 0.7);
  ctx.closePath();
  ctx.fill();
  if (f.id === 'salmon' || f.id === 'trout') {
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      ctx.arc(-L * 0.1 + i * L * 0.09, (i % 2 - 0.5) * H2 * 0.5, H2 * 0.15, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const er = Math.max(4, H2 * 0.35);
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(L * 0.27, -H2 * 0.25, er, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = f.id === 'pike' ? '#ff8000' : f.id === 'barracuda' ? '#00ccff' : '#111';
  ctx.beginPath();
  ctx.arc(L * 0.27, -H2 * 0.25, er * 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export default function GameCanvas({ engine, state }) {
  const canvasRef = useRef(null);

  // Set up canvas and drawing loop
  useEffect(() => {
    if (!canvasRef.current || !engine || !state) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw the game scene
    drawScene(ctx, state, engine);
  }, [state, engine]);

  function drawScene(ctx, r, engine) {
    ctx.clearRect(0, 0, CW, VH);

    // Fill entire canvas
    ctx.fillStyle = '#4a96d0';
    ctx.fillRect(0, 0, CW, VH);

    // SKY — fixed 0..WATER_SY
    const sky = ctx.createLinearGradient(0, 0, 0, WATER_SY);
    sky.addColorStop(0, '#4a96d0');
    sky.addColorStop(1, '#a0d4f0');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, CW, WATER_SY);

    // sun
    ctx.fillStyle = '#fff8c0';
    ctx.beginPath();
    ctx.arc(CW - 120, 50, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,240,100,0.12)';
    ctx.beginPath();
    ctx.arc(CW - 120, 50, 52, 0, Math.PI * 2);
    ctx.fill();

    // clouds
    [
      [200, 80, 60, 20],
      [550, 60, 80, 24],
      [850, 75, 55, 18],
    ].forEach(([cx, cy, cw2, ch2]) => {
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.beginPath();
      ctx.ellipse(cx, cy, cw2, ch2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx - cw2 * 0.4, cy + ch2 * 0.3, cw2 * 0.55, ch2 * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + cw2 * 0.4, cy + ch2 * 0.3, cw2 * 0.55, ch2 * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // OCEAN — WATER_SY to VH
    const df = Math.min(1, r.hookDepth / OCEAN_D);
    const oc = ctx.createLinearGradient(0, WATER_SY, 0, VH);
    oc.addColorStop(0, '#1a90d4');
    oc.addColorStop(0.3, df < 0.4 ? '#0d60a0' : '#063060');
    oc.addColorStop(0.7, df < 0.6 ? '#063368' : '#021428');
    oc.addColorStop(1, df < 0.8 ? '#042050' : '#010510');
    ctx.fillStyle = oc;
    ctx.fillRect(0, WATER_SY, CW, VH - WATER_SY);

    // surface shimmer + waves
    ctx.fillStyle = 'rgba(100,200,255,0.05)';
    const t = Date.now();
    for (let i = 0; i < 20; i++) {
      const sx = (i * 117 + t * 0.025) % CW;
      ctx.fillRect(sx, WATER_SY, 28 + Math.sin(t * 0.003 + i) * 12, 3);
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.28)';
    ctx.lineWidth = 1.8;
    for (let w = 0; w < 3; w++) {
      ctx.beginPath();
      for (let i = 0; i <= CW; i += 6) {
        const sy = WATER_SY + Math.sin(i * 0.015 + r.waveOff + w * 1.1) * 5;
        i === 0 ? ctx.moveTo(i, sy) : ctx.lineTo(i, sy);
      }
      ctx.stroke();
    }

    // depth zones
    [
      { d: OCEAN_D * 0.08, l: 'Sunlight' },
      { d: OCEAN_D * 0.28, l: 'Twilight' },
      { d: OCEAN_D * 0.52, l: 'Midnight' },
      { d: OCEAN_D * 0.74, l: 'Abyssal' },
      { d: OCEAN_D * 0.9, l: 'Hadal' },
    ].forEach((z) => {
      const sy = d2s(z.d);
      if (sy < WATER_SY || sy > VH) return;
      ctx.fillStyle = 'rgba(160,210,255,0.25)';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(z.l + ' Zone', 12, sy - 3);
      ctx.strokeStyle = 'rgba(160,210,255,0.1)';
      ctx.lineWidth = 0.5;
      ctx.setLineDash([5, 6]);
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(CW, sy);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // bubbles
    r.bubbles.forEach((b) => {
      const sy = d2s(b.depth);
      if (sy < WATER_SY || sy > VH) return;
      ctx.strokeStyle = 'rgba(160,220,255,0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(b.x, sy, b.r, 0, Math.PI * 2);
      ctx.stroke();
    });

    // swimmers (fish)
    r.swimmers.forEach((s) => {
      if (!s) return;
      const sy = d2s(s.depth);
      if (sy < WATER_SY - s.fish.H || sy > VH + s.fish.H * 2) return;
      drawFish(ctx, s.fish, s.x, sy, s.dir, 1, 1, t);
    });

    // BOAT
    const bx = BOAT_SX;
    const by = BOAT_SY;
    ctx.fillStyle = 'rgba(8,60,130,0.18)';
    ctx.beginPath();
    ctx.ellipse(bx, by + 38, BOAT_W * 0.45, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7a3a14';
    ctx.beginPath();
    ctx.moveTo(bx - BOAT_W / 2, by + 4);
    ctx.lineTo(bx - BOAT_W / 2 + 20, by + BOAT_H * 0.24);
    ctx.lineTo(bx + BOAT_W / 2 - 20, by + BOAT_H * 0.24);
    ctx.lineTo(bx + BOAT_W / 2, by + 4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#3d1806';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#c89040';
    ctx.fillRect(bx - BOAT_W / 2, by, BOAT_W, 6);
    const cw2 = BOAT_W * 0.5;
    const ch2 = BOAT_H * 0.48;
    ctx.fillStyle = '#e0b860';
    ctx.fillRect(bx - cw2 / 2, by - ch2, cw2, ch2);
    ctx.strokeStyle = '#906020';
    ctx.lineWidth = 1.8;
    ctx.strokeRect(bx - cw2 / 2, by - ch2, cw2, ch2);
    [
      [bx - cw2 * 0.31, by - ch2 * 0.76],
      [bx + cw2 * 0.09, by - ch2 * 0.76],
    ].forEach(([wx, wy]) => {
      const ww = cw2 * 0.21;
      const wh = ch2 * 0.31;
      ctx.fillStyle = '#a0d0f8aa';
      ctx.fillRect(wx, wy, ww, wh);
      ctx.strokeStyle = '#806020';
      ctx.lineWidth = 1;
      ctx.strokeRect(wx, wy, ww, wh);
    });
    ctx.fillStyle = '#7a3010';
    ctx.fillRect(bx - cw2 * 0.09, by - ch2 * 0.54, cw2 * 0.19, ch2 * 0.54);
    ctx.fillStyle = '#962e0e';
    ctx.beginPath();
    ctx.moveTo(bx - cw2 / 2 - 7, by - ch2);
    ctx.lineTo(bx, by - ch2 - ch2 * 0.3);
    ctx.lineTo(bx + cw2 / 2 + 7, by - ch2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#8a5a28';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(bx - BOAT_W * 0.07, by - ch2);
    ctx.lineTo(bx - BOAT_W * 0.07, by - ch2 - BOAT_H * 0.76);
    ctx.stroke();
    ctx.fillStyle = '#ee3333';
    ctx.beginPath();
    ctx.moveTo(bx - BOAT_W * 0.07, by - ch2 - BOAT_H * 0.76);
    ctx.lineTo(bx + BOAT_W * 0.11, by - ch2 - BOAT_H * 0.63 + Math.sin(t * 0.0022) * 6);
    ctx.lineTo(bx - BOAT_W * 0.07, by - ch2 - BOAT_H * 0.5);
    ctx.closePath();
    ctx.fill();
    const rmx = bx + BOAT_W * 0.37;
    const rmy = by - 22;
    ctx.fillStyle = '#555';
    ctx.fillRect(rmx - 7, rmy, 14, 26);
    ctx.fillStyle = '#888';
    ctx.fillRect(rmx - 12, rmy - 8, 24, 9);
    ctx.strokeStyle = '#bbb';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(rmx, rmy - 6);
    ctx.lineTo(ROD_SX, ROD_SY);
    ctx.stroke();
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ROD_SX, ROD_SY);
    ctx.lineTo(ROD_SX + 12, ROD_SY - 4);
    ctx.stroke();
    ctx.fillStyle = '#404040';
    ctx.beginPath();
    ctx.arc(rmx, rmy, 7, 0, Math.PI * 2);
    ctx.fill();

    // fishing lines
    if (r.phase !== 'idle') {
      r.lines.forEach((l) => {
        if (l.state === 'done') return;
        const hsy = l.state === 'flying' ? ROD_SY + l.arcY * 12 : d2s(l.depth);
        const hsx = l.sx;
        const stress = l.state === 'reeling' ? l.hooked.res / 80 : 0;
        ctx.strokeStyle = stress > 0.5 ? `rgba(255,${Math.floor(160 - stress * 160)},50,0.95)` : 'rgba(220,240,255,0.9)';
        ctx.lineWidth = 2;
        const mx = (ROD_SX + hsx) / 2;
        const my = (ROD_SY + hsy) / 2 + (l.state === 'flying' ? -30 : 35 + stress * 20);
        ctx.beginPath();
        ctx.moveTo(ROD_SX, ROD_SY);
        ctx.quadraticCurveTo(mx, my, hsx, hsy);
        ctx.stroke();
        if (l.state === 'drifting') {
          ctx.fillStyle = '#ffee88';
          ctx.beginPath();
          ctx.arc(hsx, hsy, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = 'rgba(255,240,100,0.35)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(hsx, hsy, 13 + Math.sin(t * 0.05) * 3, 0, Math.PI * 2);
          ctx.stroke();
        }
        if (l.hooked && l.state === 'reeling') {
          drawFish(ctx, l.hooked, hsx, hsy, 1, 0.95, 1, t);
          const bw = Math.min(90, l.hooked.L * 1.3);
          const pct = l.prog / 100;
          const by2 = hsy - l.hooked.H - 26;
          ctx.fillStyle = 'rgba(0,0,0,0.45)';
          ctx.beginPath();
          ctx.roundRect(hsx - bw / 2, by2, bw, 9, 4);
          ctx.fill();
          ctx.fillStyle = pct < 0.4 ? '#ff5533' : pct < 0.75 ? '#ffaa22' : '#44ee66';
          ctx.beginPath();
          ctx.roundRect(hsx - bw / 2, by2, bw * pct, 9, 4);
          ctx.fill();
        }
      });
    }

    // aim guide
    if (r.phase === 'idle') {
      const a = r.castAngle;
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,155,0.78)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 7]);
      ctx.lineDashOffset = -t * 0.04;
      ctx.beginPath();
      ctx.moveTo(ROD_SX, ROD_SY);
      ctx.lineTo(ROD_SX + Math.cos(a) * 220, ROD_SY + Math.sin(a) * 220);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255,255,120,0.85)';
      const ax = ROD_SX + Math.cos(a) * 220;
      const ay = ROD_SY + Math.sin(a) * 220;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax + Math.cos(a + 2.4) * 12, ay + Math.sin(a + 2.4) * 12);
      ctx.lineTo(ax + Math.cos(a - 2.4) * 12, ay + Math.sin(a - 2.4) * 12);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // popups
    r.popups.forEach((p) => {
      ctx.globalAlpha = Math.min(1, p.life / 15);
      ctx.fillStyle = p.color || '#ffe066';
      ctx.font = `bold ${p.size || 13}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(p.text, p.x, p.sy - (80 - p.life) * 0.5);
      ctx.globalAlpha = 1;
    });

    // HUD
    ctx.fillStyle = 'rgba(0,0,0,0.32)';
    ctx.beginPath();
    ctx.roundRect(10, 10, 180, 70, 8);
    ctx.fill();
    ctx.fillStyle = '#ffe066';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`🪙 ${r.coins}`, 20, 33);
    ctx.fillStyle = 'rgba(255,255,255,0.78)';
    ctx.font = '12px sans-serif';
    ctx.fillText(`Caught: ${Object.values(r.log).reduce((a, b) => a + b, 0)}`, 20, 52);
    ctx.fillText(`Species: ${Object.keys(r.log).length}/${FISH.length}`, 20, 68);
    const dm = Math.round(r.hookDepth * 0.45);
    ctx.fillStyle = 'rgba(0,0,0,0.32)';
    ctx.beginPath();
    ctx.roundRect(CW - 112, 10, 102, 32, 7);
    ctx.fill();
    ctx.fillStyle = '#88ddff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`⬇ ${dm}m`, CW - 61, 30);
    const hints = {
      idle: 'SPACE to cast',
      flying: 'Line in air…',
      drifting: 'Move mouse up/down · guide bait to a fish',
      reeling: 'MASH  R  to reel in!',
    };
    const hint = hints[r.phase];
    if (hint) {
      ctx.fillStyle = 'rgba(0,0,0,0.38)';
      ctx.beginPath();
      ctx.roundRect(CW / 2 - 160, VH - 46, 320, 34, 8);
      ctx.fill();
      ctx.fillStyle = r.phase === 'reeling' ? '#00dd44' : 'rgba(255,255,255,0.88)';
      ctx.font = r.phase === 'reeling' ? 'bold 14px sans-serif' : '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(hint, CW / 2, VH - 22);
    }
  }

  const handleMouseMove = (e) => {
    if (!engine) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    engine.setMousePosition(x, y);
  };

  const handleClick = () => {
    if (!engine) return;
    if (engine.getPhase() === 'idle') {
      engine.castLine();
    } else if (engine.getPhase() === 'reeling') {
      engine.reel();
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={CW}
      height={VH}
      className={styles.gameCanvas}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    />
  );
}
