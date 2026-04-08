// games/fighting/src/game/projectiles.js
import { checkAABB, getHurtbox } from './physics.js';
import { STAGE_WIDTH, CHIP_DAMAGE_RATE } from './constants.js';

/**
 * Update all projectiles: move, check collisions, destroy on exit/impact.
 * projectiles: array of projectile objects (mutated in place)
 * fighters: [playerFighter, cpuFighter]
 * Returns: array of { fighter, damage, isBlocking } hit events
 */
export function updateProjectiles(projectiles, fighters) {
  const hits = [];

  for (const proj of projectiles) {
    if (!proj.active) continue;

    proj.x += proj.vx;

    // Out of bounds
    if (proj.x < 0 || proj.x > STAGE_WIDTH) {
      proj.active = false;
      continue;
    }

    const projBox = { x: proj.x - proj.hitbox.w / 2, y: proj.y - proj.hitbox.h / 2, ...proj.hitbox };

    // Projectile vs projectile
    for (const other of projectiles) {
      if (!other.active || other === proj || other.owner === proj.owner) continue;
      const otherBox = { x: other.x - other.hitbox.w / 2, y: other.y - other.hitbox.h / 2, ...other.hitbox };
      if (checkAABB(projBox, otherBox)) {
        proj.active   = false;
        other.active  = false;
        break;
      }
    }
    if (!proj.active) continue;

    // Projectile vs fighter
    for (const fighter of fighters) {
      if (fighter.isPlayer === (proj.owner === 'player')) continue; // same side
      const hurtbox = getHurtbox(fighter);
      if (checkAABB(projBox, hurtbox)) {
        const isBlocking = fighter.state === 'blockHigh' || fighter.state === 'blockLow';
        hits.push({ fighter, damage: proj.damage, isBlocking, isTravel: false });
        proj.active = false;
        break;
      }
    }
  }

  // Remove inactive projectiles
  for (let i = projectiles.length - 1; i >= 0; i--) {
    if (!projectiles[i].active) projectiles.splice(i, 1);
  }

  return hits;
}

export function renderProjectiles(ctx, projectiles, cameraX) {
  for (const proj of projectiles) {
    if (!proj.active) continue;
    const sx = proj.x - cameraX;
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.arc(sx, proj.y, 12, 0, Math.PI * 2);
    ctx.fill();
  }
}
