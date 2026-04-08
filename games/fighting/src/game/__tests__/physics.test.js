// games/fighting/src/game/__tests__/physics.test.js
import { describe, it, expect } from 'vitest';
import { applyGravity, applyMovement, checkAABB, getHurtbox, GRAVITY } from '../physics.js';

describe('applyGravity', () => {
  it('increases vy by GRAVITY each frame when airborne', () => {
    const f = { vy: 0, airborne: true };
    applyGravity(f);
    expect(f.vy).toBeCloseTo(GRAVITY);
  });
  it('does not change vy when not airborne', () => {
    const f = { vy: 0, airborne: false };
    applyGravity(f);
    expect(f.vy).toBe(0);
  });
  it('clamps vy to TERMINAL_VELOCITY', () => {
    const f = { vy: 100, airborne: true };
    applyGravity(f);
    expect(f.vy).toBeLessThanOrEqual(18);
  });
});

describe('applyMovement', () => {
  it('moves fighter by vx and vy', () => {
    const f = { x: 100, y: 200, vx: 5, vy: 3, airborne: true, state: 'jumping' };
    applyMovement(f, 500, 2400);
    expect(f.x).toBe(105);
    expect(f.y).toBe(203);
  });
  it('clamps to floor and resets when y >= floorY', () => {
    const f = { x: 300, y: 498, vx: 2, vy: 5, airborne: true, state: 'jumping' };
    applyMovement(f, 500, 2400);
    expect(f.y).toBe(500);
    expect(f.vy).toBe(0);
    expect(f.vx).toBe(0);
    expect(f.airborne).toBe(false);
    expect(f.state).toBe('idle');
  });
  it('clamps x to stage left bound', () => {
    const f = { x: 10, y: 300, vx: -100, vy: 0, airborne: false, state: 'idle' };
    applyMovement(f, 500, 2400);
    expect(f.x).toBeGreaterThanOrEqual(50);
  });
  it('clamps x to stage right bound', () => {
    const f = { x: 2390, y: 300, vx: 100, vy: 0, airborne: false, state: 'idle' };
    applyMovement(f, 500, 2400);
    expect(f.x).toBeLessThanOrEqual(2350);
  });
});

describe('checkAABB', () => {
  it('returns true for overlapping boxes', () => {
    const a = { x: 0, y: 0, w: 50, h: 50 };
    const b = { x: 25, y: 25, w: 50, h: 50 };
    expect(checkAABB(a, b)).toBe(true);
  });
  it('returns false for non-overlapping boxes', () => {
    const a = { x: 0, y: 0, w: 50, h: 50 };
    const b = { x: 100, y: 100, w: 50, h: 50 };
    expect(checkAABB(a, b)).toBe(false);
  });
  it('returns false for touching-but-not-overlapping boxes', () => {
    const a = { x: 0, y: 0, w: 50, h: 50 };
    const b = { x: 50, y: 0, w: 50, h: 50 };
    expect(checkAABB(a, b)).toBe(false);
  });
});

describe('getHurtbox', () => {
  it('returns standing hurtbox for idle state', () => {
    const f = { x: 300, y: 500, state: 'idle', airborne: false };
    const hb = getHurtbox(f);
    expect(hb.w).toBe(60);
    expect(hb.h).toBe(140);
    expect(hb.x).toBe(270);
    expect(hb.y).toBe(360);
  });
  it('returns crouch hurtbox for crouching state', () => {
    const f = { x: 300, y: 500, state: 'crouching', airborne: false };
    const hb = getHurtbox(f);
    expect(hb.h).toBe(90);
  });
  it('returns air hurtbox when airborne', () => {
    const f = { x: 300, y: 300, state: 'jumping', airborne: true };
    const hb = getHurtbox(f);
    expect(hb.h).toBe(120);
    expect(hb.w).toBe(50);
  });
});
