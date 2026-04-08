// games/fighting/src/game/teamBattle.js
import { CHARACTERS, getStatTier, MAX_HP_BY_TIER, HP_FLOOR_PCT } from './constants.js';

export function createTeam(charIds) {
  return charIds.map(charId => {
    const stats = CHARACTERS[charId];
    const maxHealth = MAX_HP_BY_TIER[getStatTier(stats.health)];
    return { charId, maxHealth, health: maxHealth, alive: true };
  });
}

export function getActiveSlot(team) {
  return team.find(s => s.alive) || null;
}

export function resolveRoundEnd(playerTeam, cpuTeam, timerExpired) {
  const pSlot = getActiveSlot(playerTeam);
  const cSlot = getActiveSlot(cpuTeam);
  if (!pSlot || !cSlot) return;

  // Tie check first (only on timer expiry)
  if (timerExpired && pSlot.health === cSlot.health) {
    pSlot.alive = false;
    cSlot.alive = false;
    return;
  }

  const playerWon = pSlot.health > cSlot.health || cSlot.health <= 0;
  if (playerWon) {
    cSlot.alive  = false;
    pSlot.health = Math.max(pSlot.health, pSlot.maxHealth * HP_FLOOR_PCT);
  } else {
    pSlot.alive  = false;
    cSlot.health = Math.max(cSlot.health, cSlot.maxHealth * HP_FLOOR_PCT);
  }
}

export function isMatchOver(playerTeam, cpuTeam) {
  const pDead = playerTeam.every(s => !s.alive);
  const cDead = cpuTeam.every(s => !s.alive);
  if (pDead && cDead) return 'cpu'; // cpu wins tiebreaker (both eliminated)
  if (pDead) return 'cpu';
  if (cDead) return 'player';
  return null;
}
