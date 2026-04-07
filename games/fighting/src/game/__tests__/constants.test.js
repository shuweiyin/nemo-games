// games/fighting/src/game/__tests__/constants.test.js
import { describe, it, expect } from 'vitest';
import { getStatTier, MAX_HP_BY_TIER, POWER_DAMAGE, CHARACTERS, ROSTER } from '../constants.js';

describe('getStatTier', () => {
  it('returns 0 for stats 1-4', () => {
    expect(getStatTier(1)).toBe(0);
    expect(getStatTier(4)).toBe(0);
  });
  it('returns 1 for stats 5-7', () => {
    expect(getStatTier(5)).toBe(1);
    expect(getStatTier(7)).toBe(1);
  });
  it('returns 2 for stats 8-10', () => {
    expect(getStatTier(8)).toBe(2);
    expect(getStatTier(10)).toBe(2);
  });
});

describe('ROSTER', () => {
  it('has 12 characters', () => expect(ROSTER).toHaveLength(12));
  it('all roster ids exist in CHARACTERS', () => {
    ROSTER.forEach(id => expect(CHARACTERS[id]).toBeDefined());
  });
});
