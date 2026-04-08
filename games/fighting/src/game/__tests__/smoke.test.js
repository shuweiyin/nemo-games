// games/fighting/src/game/__tests__/smoke.test.js
import { describe, it, expect } from 'vitest';
import { ROSTER, CHARACTERS, getStatTier, MAX_HP_BY_TIER } from '../constants.js';
import { createTeam, isMatchOver, resolveRoundEnd, getActiveSlot } from '../teamBattle.js';
import { SPECIALS } from '../moves.js';
import { STAGES } from '../stages.js';

describe('Smoke: all characters have valid data', () => {
  it('all roster characters have complete stats', () => {
    ROSTER.forEach(id => {
      const c = CHARACTERS[id];
      expect(c.health).toBeGreaterThanOrEqual(1);
      expect(c.power).toBeGreaterThanOrEqual(1);
      expect(c.speed).toBeGreaterThanOrEqual(1);
      expect(c.defense).toBeGreaterThanOrEqual(1);
      expect(c.special).toBeGreaterThanOrEqual(1);
    });
  });

  it('all roster characters have exactly 3 specials', () => {
    ROSTER.forEach(id => {
      expect(SPECIALS[id]).toHaveLength(3);
    });
  });

  it('all roster characters have a stage', () => {
    ROSTER.forEach(id => {
      expect(STAGES[id]).toBeDefined();
    });
  });
});

describe('Smoke: full match simulation', () => {
  it('simulates a match to completion without errors', () => {
    const pTeam = createTeam(['ryu','ken','chunli']);
    const cTeam = createTeam(['bison','sagat','guile']);

    let rounds = 0;
    while (!isMatchOver(pTeam, cTeam) && rounds < 20) {
      const pSlot = getActiveSlot(pTeam);
      const cSlot = getActiveSlot(cTeam);
      // Simulate cpu wins each round
      pSlot.health = 0;
      resolveRoundEnd(pTeam, cTeam, false);
      rounds++;
    }
    expect(isMatchOver(pTeam, cTeam)).toBe('cpu');
    expect(rounds).toBeLessThanOrEqual(3);
  });
});
