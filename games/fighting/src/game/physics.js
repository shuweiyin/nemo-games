// games/fighting/src/game/physics.js

export const GRAVITY           = 0.6;
export const JUMP_VELOCITY     = -16;
export const TERMINAL_VELOCITY = 18;

export function applyGravity(fighter) {
  if (!fighter.airborne) return;
  fighter.vy = Math.min(fighter.vy + GRAVITY, TERMINAL_VELOCITY);
}

export function applyMovement(fighter, floorY, stageWidth) {
  fighter.x += fighter.vx;
  fighter.y += fighter.vy;

  if (fighter.y >= floorY) {
    fighter.y    = floorY;
    fighter.vy   = 0;
    fighter.vx   = 0;
    fighter.airborne = false;
    if (fighter.state === 'jumping') fighter.state = 'idle';
  }

  fighter.x = Math.max(50, Math.min(stageWidth - 50, fighter.x));
}

export function checkAABB(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

export function getHurtbox(fighter) {
  let w, h;
  if (fighter.airborne) {
    w = 50; h = 120;
  } else if (fighter.state === 'crouching' || fighter.state === 'blockLow') {
    w = 60; h = 90;
  } else {
    w = 60; h = 140;
  }
  return { x: fighter.x - w / 2, y: fighter.y - h, w, h };
}
