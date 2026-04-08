// games/fighting/src/game/fighter.js
import {
  CHARACTERS, getStatTier, MAX_HP_BY_TIER, POWER_DAMAGE, MOVEMENT_SPEED,
  ATTACK_FRAMES, SPECIAL_HBW, SPECIAL_DMG_MULT, DEFENSE_REDUCTION,
  SPRITE_ROWS, SPRITE_FRAME_COUNTS, SPRITE_FRAME_SIZE,
  KNOCKBACK_HIT, KNOCKBACK_BLOCK, KNOCKBACK_TRAVEL, CHIP_DAMAGE_RATE,
  P1_START_X, CPU_START_X,
} from './constants.js';
import { JUMP_VELOCITY, applyGravity, applyMovement, checkAABB, getHurtbox } from './physics.js';
import { NORMAL_HITBOXES, SPECIALS } from './moves.js';

const ATTACK_STATES = ['attackLP','attackMP','attackHP','attackLK','attackMK','attackHK'];
const NORMAL_KEYS   = ['LP','MP','HP','LK','MK','HK'];

export class Fighter {
  constructor({ charId, isPlayer, floorY, stageWidth }) {
    const stats = CHARACTERS[charId];

    this.charId     = charId;
    this.isPlayer   = isPlayer;
    this.floorY     = floorY;
    this.stageWidth = stageWidth;

    // Stat tiers
    this.healthTier  = getStatTier(stats.health);
    this.powerTier   = getStatTier(stats.power);
    this.speedTier   = getStatTier(stats.speed);
    this.defenseTier = getStatTier(stats.defense);
    this.specialTier = getStatTier(stats.special);

    this.maxHealth = MAX_HP_BY_TIER[this.healthTier];
    this.health    = this.maxHealth;
    this.moveSpeed = MOVEMENT_SPEED[this.speedTier];
    this.atkFrames = ATTACK_FRAMES[this.speedTier];
    this.color     = stats.color;

    // Position
    this.x        = isPlayer ? P1_START_X : CPU_START_X;
    this.y        = floorY;
    this.vx       = 0;
    this.vy       = 0;
    this.airborne = false;
    this.facingRight = isPlayer;

    // State machine
    this.state      = 'idle';
    this.animFrame  = 0;
    this.animTimer  = 0;  // frames spent in current attack phase
    this.attackPhase = null; // 'startup' | 'active' | 'recovery'
    this.activeSpecialIdx = -1;
    this.hitConfirmed = false;
    this.hitCount   = 0;

    // Air attack
    this.airAttackUsed = false;
    this.airAttackFrame = 0;

    // Sprite
    this.spriteSheet = null;
    this._loadSprite();
  }

  _loadSprite() {
    const img = new Image();
    img.src = `/sprites/characters/${this.charId}.png`;
    img.onload = () => { this.spriteSheet = img; };
  }

  reset(health) {
    this.health    = health !== undefined ? health : this.maxHealth;
    this.x         = this.isPlayer ? P1_START_X : CPU_START_X;
    this.y         = this.floorY;
    this.vx        = 0;
    this.vy        = 0;
    this.airborne  = false;
    this.facingRight = this.isPlayer;
    this.state     = 'idle';
    this.animFrame = 0;
    this.animTimer = 0;
    this.attackPhase     = null;
    this.activeSpecialIdx = -1;
    this.hitConfirmed    = false;
    this.hitCount        = 0;
    this.airAttackUsed   = false;
    this.airAttackFrame  = 0;
  }

  isInAttack() {
    return ATTACK_STATES.includes(this.state) || this.state.startsWith('special');
  }

  isRecovering() {
    return this.attackPhase === 'recovery';
  }

  // --- update ---

  update(input, inputHandler, opponent, projectiles) {
    this._updateFacing(opponent);
    applyGravity(this);

    if (this.state === 'ko') {
      this._advanceAnim();
      applyMovement(this, this.floorY, this.stageWidth);
      return;
    }

    if (this.state === 'hitstun') {
      this.animTimer--;
      if (this.animTimer <= 0) this.state = 'idle';
      this._advanceAnim();
      applyMovement(this, this.floorY, this.stageWidth);
      return;
    }

    if (this.isInAttack()) {
      this._tickAttack(projectiles, opponent);
      applyMovement(this, this.floorY, this.stageWidth);
      return;
    }

    // Normal input processing
    const isBlocking = this._isBlockingInput(input, opponent);
    if (isBlocking && !this.airborne) {
      this.state = input.down ? 'blockLow' : 'blockHigh';
      this._advanceAnim();
      return;
    }

    // Check specials
    const special = this._checkSpecialInput(input, inputHandler);
    if (special !== null) {
      this._startSpecial(special, projectiles, opponent);
      return;
    }

    // Check normals
    for (const key of NORMAL_KEYS) {
      if (input[key]) {
        if (this.airborne && !this.airAttackUsed) {
          this._startAirAttack();
        } else if (!this.airborne) {
          this._startNormal(key);
        }
        break;
      }
    }

    // Movement
    if (!this.isInAttack()) {
      this._handleMovement(input);
    }

    this._advanceAnim();
    applyMovement(this, this.floorY, this.stageWidth);
  }

  _updateFacing(opponent) {
    this.facingRight = this.x < opponent.x;
  }

  _isBlockingInput(input, opponent) {
    const awayFromOpponent = this.facingRight ? input.left : input.right;
    return awayFromOpponent;
  }

  _handleMovement(input) {
    const forward  = this.facingRight ? input.right : input.left;
    const backward = this.facingRight ? input.left  : input.right;

    if (input.up && !this.airborne) {
      this.airborne = true;
      this.vy = JUMP_VELOCITY;
      this.vx = forward ? this.moveSpeed * 0.6 : backward ? -this.moveSpeed * 0.4 : 0;
      this.state = 'jumping';
      this.animFrame = 0;
      this.airAttackUsed = false;
    } else if (!this.airborne) {
      if (input.down) {
        this.state = 'crouching';
        this.vx = 0;
      } else if (forward) {
        this.state = 'walkForward';
        this.vx = this.moveSpeed;
      } else if (backward) {
        this.state = 'walkBackward';
        this.vx = -this.moveSpeed;
      } else {
        this.state = 'idle';
        this.vx = 0;
      }
    }
  }

  _startNormal(key) {
    const stateMap = { LP:'attackLP', MP:'attackMP', HP:'attackHP', LK:'attackLK', MK:'attackMK', HK:'attackHK' };
    this.state       = stateMap[key];
    this.animTimer   = 0;
    this.attackPhase = 'startup';
    this.hitConfirmed = false;
  }

  _startAirAttack() {
    this.airAttackUsed  = true;
    this.airAttackFrame = 0;
    this.state = 'attackLP'; // use LP hitbox for air attack
    this.animTimer = 0;
    this.attackPhase = 'startup';
    this.hitConfirmed = false;
  }

  _startSpecial(idx, projectiles, opponent) {
    const special = SPECIALS[this.charId][idx];
    if (special.isTeleport) {
      this._doTeleport(special, opponent);
      return;
    }
    if (special.isProjectile) {
      this._spawnProjectile(special, projectiles);
    }
    this.state = `special${idx + 1}`;
    this.activeSpecialIdx = idx;
    this.animTimer   = 0;
    this.attackPhase = 'startup';
    this.hitConfirmed = false;
    this.hitCount     = 0;
    if (special.isTravel) {
      this.vx = (this.facingRight ? 1 : -1) * this.moveSpeed * 2;
    }
  }

  _doTeleport(special, opponent) {
    const behind = this.x < opponent.x ? opponent.x + 150 : opponent.x - 150;
    this.x = Math.max(50, Math.min(this.stageWidth - 50, behind));
    this.state = 'special3';
    this.animTimer = 8;
    this.attackPhase = 'recovery';
  }

  _spawnProjectile(special, projectiles) {
    const spd = SPECIAL_DMG_MULT[this.specialTier];
    projectiles.push({
      owner: this.isPlayer ? 'player' : 'cpu',
      x: this.x + (this.facingRight ? 60 : -60),
      y: this.y - 80,
      vx: (this.facingRight ? 1 : -1) * (3 + (this.specialTier / 2) * 4),
      hitbox: { w: 30, h: 20 },
      damage: POWER_DAMAGE[this.powerTier][1] * spd,
      active: true,
    });
  }

  _tickAttack(projectiles, opponent) {
    const total = this.atkFrames.startup + this.atkFrames.active + this.atkFrames.recovery;
    this.animTimer++;
    if (this.animTimer < this.atkFrames.startup) {
      this.attackPhase = 'startup';
    } else if (this.animTimer < this.atkFrames.startup + this.atkFrames.active) {
      this.attackPhase = 'active';
    } else if (this.animTimer < total) {
      this.attackPhase = 'recovery';
    } else {
      this.attackPhase = null;
      this.state = 'idle';
      this.animTimer = 0;
      this.activeSpecialIdx = -1;
      this.vx = 0;
    }
    this._advanceAnim();
  }

  getActiveHitbox() {
    if (this.attackPhase !== 'active') return null;
    const isSpecial = this.activeSpecialIdx >= 0;
    let raw;
    if (isSpecial) {
      const w = SPECIAL_HBW[this.specialTier];
      raw = { x: 20, y: -80, w, h: 60 };
    } else {
      const normalKey = this.state.replace('attack', '');
      raw = NORMAL_HITBOXES[normalKey] || NORMAL_HITBOXES['LP'];
    }
    const flip = !this.facingRight;
    return {
      x: this.x + (flip ? -raw.x - raw.w : raw.x),
      y: this.y + raw.y,
      w: raw.w,
      h: raw.h,
    };
  }

  takeDamage(amount, isBlocking, isTravel) {
    const reduction = isBlocking ? DEFENSE_REDUCTION[this.defenseTier] : 0;
    const effective = isBlocking ? amount * CHIP_DAMAGE_RATE * (1 - reduction) : amount * (1 - reduction);
    this.health = Math.max(0, this.health - effective);
    if (!isBlocking) {
      const kb = isTravel ? KNOCKBACK_TRAVEL : KNOCKBACK_HIT;
      this.x += this.facingRight ? -kb : kb;
      this.x = Math.max(50, Math.min(this.stageWidth - 50, this.x));
      this.state = 'hitstun';
      this.animTimer = 15;
    } else {
      this.x += this.facingRight ? KNOCKBACK_BLOCK : -KNOCKBACK_BLOCK;
    }
    if (this.health <= 0) this.state = 'ko';
  }

  isKO() { return this.health <= 0; }

  // --- animation ---

  _advanceAnim() {
    const row        = SPRITE_ROWS[this.state] ?? 0;
    const totalFrames = SPRITE_FRAME_COUNTS[this.state] ?? 4;
    if (this.isInAttack() || this.attackPhase) {
      const total = this.atkFrames.startup + this.atkFrames.active + this.atkFrames.recovery;
      this.animFrame = Math.min(
        Math.floor((this.animTimer / Math.max(total, 1)) * totalFrames),
        totalFrames - 1
      );
    } else {
      this.animTimer = (this.animTimer || 0) + 1;
      this.animFrame = Math.floor(this.animTimer / 8) % totalFrames;
    }
  }

  _checkSpecialInput(input, inputHandler) {
    const specials = SPECIALS[this.charId] || [];
    for (let i = 0; i < specials.length; i++) {
      const s = specials[i];
      const mt = s.motionType;
      const btnPressed = s.button === 'punch' ? (input.LP || input.MP || input.HP)
        : s.button === 'kick' ? (input.LK || input.MK || input.HK)
        : s.button === 'any3' ? (input.LP && input.MP && input.HP) || (input.LK && input.MK && input.HK)
        : false;
      if (!btnPressed) continue;
      if (inputHandler.consumeMotion(mt)) return i;
      if (mt === 'HOLD_PUNCH' && inputHandler.getHeldFrames('LP') >= 20) return i;
      if (mt === 'HOLD_3PUNCH' && inputHandler.getHeldFrames('LP') >= 60 && inputHandler.getHeldFrames('MP') >= 60 && inputHandler.getHeldFrames('HP') >= 60) return i;
    }
    return null;
  }

  // --- render ---

  render(ctx, cameraX) {
    const sx = this.x - cameraX;
    const row = SPRITE_ROWS[this.state] ?? 0;
    const col = this.animFrame;
    const flip = !this.facingRight;

    if (this.spriteSheet && this.spriteSheet.complete && this.spriteSheet.naturalWidth > 0) {
      ctx.save();
      if (flip) {
        ctx.translate(sx, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(
          this.spriteSheet,
          col * SPRITE_FRAME_SIZE, row * SPRITE_FRAME_SIZE,
          SPRITE_FRAME_SIZE, SPRITE_FRAME_SIZE,
          -SPRITE_FRAME_SIZE / 2, this.y - SPRITE_FRAME_SIZE, SPRITE_FRAME_SIZE, SPRITE_FRAME_SIZE
        );
      } else {
        ctx.drawImage(
          this.spriteSheet,
          col * SPRITE_FRAME_SIZE, row * SPRITE_FRAME_SIZE,
          SPRITE_FRAME_SIZE, SPRITE_FRAME_SIZE,
          sx - SPRITE_FRAME_SIZE / 2, this.y - SPRITE_FRAME_SIZE, SPRITE_FRAME_SIZE, SPRITE_FRAME_SIZE
        );
      }
      ctx.restore();
    } else {
      // Placeholder rectangle
      ctx.fillStyle = this.color;
      ctx.fillRect(sx - 30, this.y - 120, 60, 120);
      // Name label
      ctx.fillStyle = '#fff';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(this.charId, sx, this.y - 125);
    }
  }
}
