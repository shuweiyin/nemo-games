// games/fighting/src/game/__tests__/input.test.js
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { InputHandler } from '../input.js';

describe('InputHandler — keyboard state', () => {
  let handler;
  beforeEach(() => { handler = new InputHandler(); });
  afterEach(() => { handler.destroy(); });

  it('getInput returns all false initially', () => {
    const inp = handler.getInput();
    expect(inp.left).toBe(false);
    expect(inp.LP).toBe(false);
  });
});

describe('InputHandler — motion detection', () => {
  let handler;
  beforeEach(() => { handler = new InputHandler(); });
  afterEach(() => { handler.destroy(); });

  function pushDirs(h, dirs) {
    dirs.forEach(d => h._pushDir(d));
  }

  it('detects QCF motion', () => {
    pushDirs(handler, ['down', 'downRight', 'right']);
    expect(handler.checkMotion('QCF')).toBe(true);
  });

  it('detects QCB motion', () => {
    pushDirs(handler, ['down', 'downLeft', 'left']);
    expect(handler.checkMotion('QCB')).toBe(true);
  });

  it('detects DP motion', () => {
    pushDirs(handler, ['right', 'down', 'downRight']);
    expect(handler.checkMotion('DP')).toBe(true);
  });

  it('does not detect QCF if buffer is empty', () => {
    expect(handler.checkMotion('QCF')).toBe(false);
  });

  it('detects rapid tap after 5+ presses', () => {
    for (let i = 0; i < 5; i++) handler._registerTap('punch');
    expect(handler.checkMotion('RAPID_PUNCH')).toBe(true);
  });

  it('does not detect rapid tap with only 4 presses', () => {
    for (let i = 0; i < 4; i++) handler._registerTap('punch');
    expect(handler.checkMotion('RAPID_PUNCH')).toBe(false);
  });

  it('detects charge right after holding left 30 frames then pressing right', () => {
    handler._setChargeFrames('left', 30);
    handler._pushDir('right');
    expect(handler.checkMotion('CHARGE_RIGHT')).toBe(true);
  });

  it('does not detect charge right if held for only 20 frames', () => {
    handler._setChargeFrames('left', 20);
    handler._pushDir('right');
    expect(handler.checkMotion('CHARGE_RIGHT')).toBe(false);
  });
});
