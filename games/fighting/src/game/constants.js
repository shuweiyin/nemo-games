// games/fighting/src/game/constants.js

export const CANVAS_WIDTH = 1200;
export const CANVAS_HEIGHT = 600;
export const STAGE_WIDTH = 2400;
export const FPS = 60;

export const CHARACTERS = {
  ryu:     { name: 'Ryu',      health: 7, power: 7,  speed: 6,  defense: 6, special: 9,  color: '#e74c3c' },
  ken:     { name: 'Ken',      health: 7, power: 8,  speed: 7,  defense: 5, special: 7,  color: '#e67e22' },
  chunli:  { name: 'Chun-Li',  health: 6, power: 6,  speed: 10, defense: 6, special: 7,  color: '#9b59b6' },
  guile:   { name: 'Guile',    health: 8, power: 7,  speed: 5,  defense: 8, special: 8,  color: '#27ae60' },
  blanka:  { name: 'Blanka',   health: 8, power: 8,  speed: 6,  defense: 5, special: 6,  color: '#2ecc71' },
  zangief: { name: 'Zangief',  health: 10, power: 10, speed: 3, defense: 7, special: 4,  color: '#c0392b' },
  dhalsim: { name: 'Dhalsim',  health: 6, power: 6,  speed: 4,  defense: 5, special: 10, color: '#f39c12' },
  honda:   { name: 'E. Honda', health: 9, power: 8,  speed: 4,  defense: 7, special: 6,  color: '#16a085' },
  balrog:  { name: 'Balrog',   health: 8, power: 9,  speed: 6,  defense: 6, special: 5,  color: '#2980b9' },
  vega:    { name: 'Vega',     health: 6, power: 7,  speed: 10, defense: 4, special: 6,  color: '#8e44ad' },
  sagat:   { name: 'Sagat',    health: 9, power: 9,  speed: 5,  defense: 7, special: 9,  color: '#d35400' },
  bison:   { name: 'M. Bison', health: 8, power: 8,  speed: 7,  defense: 7, special: 8,  color: '#2c3e50' },
};

export const ROSTER = ['ryu','ken','chunli','guile','blanka','zangief','dhalsim','honda','balrog','vega','sagat','bison'];

// Tier 0 = stats 1-4, Tier 1 = stats 5-7, Tier 2 = stats 8-10
export function getStatTier(stat) {
  if (stat <= 4) return 0;
  if (stat <= 7) return 1;
  return 2;
}

export const MAX_HP_BY_TIER      = [150, 175, 200];
// [LP/LK, MP/MK, HP/HK] damage per power tier
export const POWER_DAMAGE        = [[5,6,8],[9,10,12],[13,14,16]];
export const MOVEMENT_SPEED      = [2, 3.5, 5];
export const ATTACK_FRAMES       = [
  { startup: 8, active: 4, recovery: 10 },
  { startup: 5, active: 3, recovery: 7  },
  { startup: 3, active: 2, recovery: 4  },
];
export const SPECIAL_HBW         = [60, 90, 130];   // hitbox width by special tier
export const SPECIAL_DMG_MULT    = [0.8, 1.0, 1.3];
export const DEFENSE_REDUCTION   = [0.10, 0.20, 0.30];

export const SPRITE_FRAME_SIZE = 128;
export const SPRITE_ROWS = {
  idle: 0, walkForward: 1, walkBackward: 2, jumping: 3, crouching: 4,
  attackLP: 5, attackMP: 6, attackHP: 7,
  attackLK: 8, attackMK: 9, attackHK: 10,
  special1: 11, special2: 12, special3: 13,
  hitstun: 14, blockHigh: 15, blockLow: 16, ko: 17,
};
export const SPRITE_FRAME_COUNTS = {
  idle: 4, walkForward: 6, walkBackward: 6, jumping: 5, crouching: 2,
  attackLP: 3, attackMP: 3, attackHP: 3,
  attackLK: 3, attackMK: 3, attackHK: 3,
  special1: 5, special2: 5, special3: 5,
  hitstun: 2, blockHigh: 2, blockLow: 2, ko: 6,
};

export const KNOCKBACK_HIT    = 20;
export const KNOCKBACK_BLOCK  = 8;
export const KNOCKBACK_TRAVEL = 35;
export const CHIP_DAMAGE_RATE = 0.25;

export const ROUND_TIMER      = 99;
export const HP_FLOOR_PCT     = 0.30;
export const TEAM_SIZE        = 3;

export const P1_START_X  = 300;
export const CPU_START_X = 900;
