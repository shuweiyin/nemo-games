// games/fighting/src/game/__tests__/teamBattle.test.js
import { describe, it, expect } from 'vitest';
import { createTeam, resolveRoundEnd, isMatchOver, getActiveSlot } from '../teamBattle.js';
import { CHARACTERS, MAX_HP_BY_TIER, getStatTier, HP_FLOOR_PCT } from '../constants.js';

function makeTeam(charIds) { return createTeam(charIds); }

describe('createTeam', () => {
  it('creates 3 slots all alive at max HP', () => {
    const team = makeTeam(['ryu','ken','chunli']);
    expect(team).toHaveLength(3);
    team.forEach(slot => {
      expect(slot.alive).toBe(true);
      expect(slot.health).toBe(slot.maxHealth);
    });
  });
  it('sets maxHealth based on health stat tier', () => {
    const team = makeTeam(['zangief']); // health stat 10 → tier 2 → 200
    expect(team[0].maxHealth).toBe(200);
  });
});

describe('resolveRoundEnd', () => {
  it('eliminates loser on KO, winner keeps health (above floor)', () => {
    const pTeam = makeTeam(['ryu','ken','chunli']);
    const cTeam = makeTeam(['bison','sagat','guile']);
    pTeam[0].health = 80;
    cTeam[0].health = 0; // cpu KO'd
    resolveRoundEnd(pTeam, cTeam, false);
    expect(cTeam[0].alive).toBe(false);
    expect(pTeam[0].alive).toBe(true);
    expect(pTeam[0].health).toBe(80);
  });

  it('regenerates winner HP to floor if below 30%', () => {
    const pTeam = makeTeam(['ryu','ken','chunli']);
    const cTeam = makeTeam(['bison','sagat','guile']);
    pTeam[0].health = 10; // below 30% of 175 = 52.5
    cTeam[0].health = 0;
    resolveRoundEnd(pTeam, cTeam, false);
    expect(pTeam[0].health).toBeGreaterThanOrEqual(pTeam[0].maxHealth * HP_FLOOR_PCT);
  });

  it('eliminates both on exact HP tie with timer expiry', () => {
    const pTeam = makeTeam(['ryu','ken','chunli']);
    const cTeam = makeTeam(['bison','sagat','guile']);
    pTeam[0].health = 50;
    cTeam[0].health = 50;
    resolveRoundEnd(pTeam, cTeam, true); // timerExpired = true
    expect(pTeam[0].alive).toBe(false);
    expect(cTeam[0].alive).toBe(false);
  });

  it('does not eliminate both on timer expiry if HP differ', () => {
    const pTeam = makeTeam(['ryu','ken','chunli']);
    const cTeam = makeTeam(['bison','sagat','guile']);
    pTeam[0].health = 80;
    cTeam[0].health = 40;
    resolveRoundEnd(pTeam, cTeam, true);
    expect(pTeam[0].alive).toBe(true);
    expect(cTeam[0].alive).toBe(false);
  });
});

describe('isMatchOver', () => {
  it('returns player win when all cpu slots dead', () => {
    const pTeam = makeTeam(['ryu','ken','chunli']);
    const cTeam = makeTeam(['bison','sagat','guile']);
    cTeam.forEach(s => s.alive = false);
    expect(isMatchOver(pTeam, cTeam)).toBe('player');
  });
  it('returns cpu win when all player slots dead', () => {
    const pTeam = makeTeam(['ryu','ken','chunli']);
    const cTeam = makeTeam(['bison','sagat','guile']);
    pTeam.forEach(s => s.alive = false);
    expect(isMatchOver(pTeam, cTeam)).toBe('cpu');
  });
  it('returns null when match ongoing', () => {
    const pTeam = makeTeam(['ryu','ken','chunli']);
    const cTeam = makeTeam(['bison','sagat','guile']);
    expect(isMatchOver(pTeam, cTeam)).toBeNull();
  });
});

describe('getActiveSlot', () => {
  it('returns first alive slot', () => {
    const team = makeTeam(['ryu','ken','chunli']);
    team[0].alive = false;
    expect(getActiveSlot(team).charId).toBe('ken');
  });
});
