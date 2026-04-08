// games/fighting/src/game/ai/__tests__/cpu.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CpuAI } from '../cpu.js';

function makeFighter(overrides) {
  return { x: 600, y: 500, health: 100, maxHealth: 200, state: 'idle', airborne: false, charId: 'ryu', ...overrides };
}

describe('CpuAI — easy', () => {
  it('returns a valid input object', () => {
    const ai = new CpuAI('easy', 'ryu');
    const inp = ai.getInput(makeFighter({ x: 600 }), makeFighter({ x: 300 }), [], 60);
    expect(inp).toHaveProperty('left');
    expect(inp).toHaveProperty('LP');
  });
});

describe('CpuAI — medium', () => {
  it('walks toward player when far away', () => {
    const ai = new CpuAI('medium', 'ryu');
    // cpu at 900, player at 100 — cpu should move left (toward player)
    ai._lastDecisionFrame = -999; // force decision
    const inp = ai.getInput(makeFighter({ x: 900 }), makeFighter({ x: 100 }), [], 200);
    expect(inp.left).toBe(true);
  });

  it('attacks when close to player', () => {
    const ai = new CpuAI('medium', 'ryu');
    ai._lastDecisionFrame = -999;
    // close distance: cpu at 400, player at 350
    const inp = ai.getInput(makeFighter({ x: 400 }), makeFighter({ x: 350 }), [], 200);
    const anyAttack = inp.LP || inp.MP || inp.HP || inp.LK || inp.MK || inp.HK;
    expect(anyAttack).toBe(true);
  });
});

describe('CpuAI — hard', () => {
  it('attacks immediately when player is recovering', () => {
    const ai = new CpuAI('hard', 'ryu');
    ai._lastDecisionFrame = -999;
    const cpu    = makeFighter({ x: 400 });
    const player = makeFighter({ x: 350, state: 'recovering' });
    const inp = ai.getInput(cpu, player, [], 600);
    const anyAttack = inp.LP || inp.MP || inp.HP || inp.LK || inp.MK || inp.HK;
    expect(anyAttack).toBe(true);
  });
});
