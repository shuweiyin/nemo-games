// games/fighting/src/game/moves.js
// Normal hitboxes: offset from fighter origin (bottom-center)
// Specials: motion type, button, flags

export const NORMAL_HITBOXES = {
  LP: { x: 20,  y: -90, w: 55, h: 30 },
  MP: { x: 25,  y: -80, w: 65, h: 35 },
  HP: { x: 30,  y: -80, w: 75, h: 40 },
  LK: { x: 25,  y: -50, w: 55, h: 35 },
  MK: { x: 30,  y: -55, w: 65, h: 40 },
  HK: { x: 35,  y: -60, w: 80, h: 45 },
};

// Each special: { name, motionType, button, isProjectile, multiHit, spriteRow }
// spriteRow: 11 = special1, 12 = special2, 13 = special3
export const SPECIALS = {
  ryu: [
    { name: 'Hadouken',   motionType: 'QCF',         button: 'punch', isProjectile: true,  multiHit: 1, spriteRow: 11 },
    { name: 'Shoryuken',  motionType: 'DP',           button: 'punch', isProjectile: false, multiHit: 1, spriteRow: 12 },
    { name: 'Tatsumaki',  motionType: 'QCB',          button: 'kick',  isProjectile: false, multiHit: 1, spriteRow: 13 },
  ],
  ken: [
    { name: 'Hadouken',   motionType: 'QCF',         button: 'punch', isProjectile: true,  multiHit: 1, spriteRow: 11 },
    { name: 'Shoryuken',  motionType: 'DP',           button: 'punch', isProjectile: false, multiHit: 1, spriteRow: 12 },
    { name: 'Tatsumaki',  motionType: 'QCB',          button: 'kick',  isProjectile: false, multiHit: 1, spriteRow: 13 },
  ],
  chunli: [
    { name: 'Kikoken',        motionType: 'QCF',        button: 'punch', isProjectile: true,  multiHit: 1, spriteRow: 11 },
    { name: 'SpinBirdKick',   motionType: 'CHARGE_UP',  button: 'kick',  isProjectile: false, multiHit: 1, spriteRow: 12 },
    { name: 'Hyakuretsu',     motionType: 'RAPID_KICK', button: 'kick',  isProjectile: false, multiHit: 5, spriteRow: 13 },
  ],
  guile: [
    { name: 'SonicBoom',    motionType: 'CHARGE_RIGHT', button: 'punch', isProjectile: true,  multiHit: 1, spriteRow: 11 },
    { name: 'FlashKick',    motionType: 'CHARGE_UP',    button: 'kick',  isProjectile: false, multiHit: 1, spriteRow: 12 },
    { name: 'SpinKick',     motionType: 'CHARGE_RIGHT', button: 'kick',  isProjectile: false, multiHit: 1, spriteRow: 13 },
  ],
  blanka: [
    { name: 'RollingAttack',   motionType: 'CHARGE_RIGHT', button: 'punch', isProjectile: false, multiHit: 1, spriteRow: 11, isTravel: true },
    { name: 'ElectricThunder', motionType: 'HOLD_PUNCH',   button: 'punch', isProjectile: false, multiHit: 1, spriteRow: 12 },
    { name: 'VerticalRoll',    motionType: 'CHARGE_UP',    button: 'punch', isProjectile: false, multiHit: 1, spriteRow: 13 },
  ],
  zangief: [
    { name: 'SPD',          motionType: '360',          button: 'punch', isProjectile: false, multiHit: 1, spriteRow: 11, isGrab: true },
    { name: 'DoubleLariat', motionType: 'RAPID_PUNCH',  button: 'punch', isProjectile: false, multiHit: 3, spriteRow: 12 },
    { name: 'BanishingFlat',motionType: 'QCF',          button: 'punch', isProjectile: false, multiHit: 1, spriteRow: 13 },
  ],
  dhalsim: [
    { name: 'YogaFire',    motionType: 'QCF', button: 'punch', isProjectile: true,  multiHit: 1, spriteRow: 11 },
    { name: 'YogaFlame',   motionType: 'QCB', button: 'punch', isProjectile: false, multiHit: 1, spriteRow: 12 },
    { name: 'YogaTeleport',motionType: 'QCF', button: 'any3',  isProjectile: false, multiHit: 0, spriteRow: 13, isTeleport: true },
  ],
  honda: [
    { name: 'HundredHands', motionType: 'RAPID_PUNCH',   button: 'punch', isProjectile: false, multiHit: 5, spriteRow: 11 },
    { name: 'Headbutt',     motionType: 'CHARGE_RIGHT',  button: 'punch', isProjectile: false, multiHit: 1, spriteRow: 12, isTravel: true },
    { name: 'SumoSmash',    motionType: 'CHARGE_UP',     button: 'kick',  isProjectile: false, multiHit: 1, spriteRow: 13 },
  ],
  balrog: [
    { name: 'DashPunch',  motionType: 'CHARGE_RIGHT', button: 'punch', isProjectile: false, multiHit: 1, spriteRow: 11, isTravel: true },
    { name: 'DashUpper',  motionType: 'CHARGE_RIGHT', button: 'kick',  isProjectile: false, multiHit: 1, spriteRow: 12, isTravel: true },
    { name: 'TurnPunch',  motionType: 'HOLD_3PUNCH',  button: 'punch', isProjectile: false, multiHit: 1, spriteRow: 13 },
  ],
  vega: [
    { name: 'RollingCrystal', motionType: 'CHARGE_RIGHT', button: 'punch', isProjectile: false, multiHit: 1, spriteRow: 11, isTravel: true },
    { name: 'SkyHighClaw',    motionType: 'CHARGE_UP',    button: 'punch', isProjectile: false, multiHit: 1, spriteRow: 12 },
    { name: 'ScarletTerror',  motionType: 'CHARGE_UP',    button: 'kick',  isProjectile: false, multiHit: 1, spriteRow: 13 },
  ],
  sagat: [
    { name: 'TigerShotHigh', motionType: 'QCF', button: 'punch', isProjectile: true,  multiHit: 1, spriteRow: 11 },
    { name: 'TigerShotLow',  motionType: 'QCF', button: 'kick',  isProjectile: true,  multiHit: 1, spriteRow: 12 },
    { name: 'TigerKnee',     motionType: 'QCF_UP', button: 'kick', isProjectile: false, multiHit: 1, spriteRow: 13 },
  ],
  bison: [
    { name: 'PsychoCrusher', motionType: 'CHARGE_RIGHT', button: 'punch', isProjectile: false, multiHit: 1, spriteRow: 11, isTravel: true },
    { name: 'HeadPress',     motionType: 'CHARGE_UP',    button: 'kick',  isProjectile: false, multiHit: 1, spriteRow: 12 },
    { name: 'ScissorKick',   motionType: 'CHARGE_RIGHT', button: 'kick',  isProjectile: false, multiHit: 1, spriteRow: 13 },
  ],
};

export function getSpecialIndex(charId, motionType, button) {
  return (SPECIALS[charId] || []).findIndex(s => s.motionType === motionType && (s.button === button || s.button === 'any3'));
}
