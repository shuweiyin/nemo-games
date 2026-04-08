// games/fighting/src/game/ai/cpu.js
import { InputHandler } from '../input.js';

const REACTION_DELAY = { easy: 18, medium: 12, hard: 6 }; // frames (60fps)
const BLOCK_CHANCE   = { easy: 0.15, medium: 0.35, hard: 0.60 };
const SPECIAL_CHANCE = { easy: 0.20, medium: 0.50, hard: 1.00 };
const CLOSE_DIST     = 180;

export class CpuAI {
  constructor(difficulty, charId) {
    this.difficulty = difficulty;
    this.charId     = charId;
    this.inputHandler = new InputHandler(); // synthetic — no real keyboard
    this._lastDecisionFrame = -999;
    this._currentAction     = null;
    this._actionFrames      = 0;
  }

  /** Returns a synthetic input object for the CPU fighter */
  getInput(cpuFighter, playerFighter, projectiles, frameCount) {
    const delay = REACTION_DELAY[this.difficulty];
    const inp   = _emptyInput();
    const dist  = Math.abs(cpuFighter.x - playerFighter.x);
    const facingPlayer = cpuFighter.x > playerFighter.x ? 'left' : 'right';

    // Check if we should block incoming attack
    const playerAttacking = playerFighter.state.startsWith('attack') || playerFighter.state.startsWith('special');
    if (playerAttacking && dist < CLOSE_DIST) {
      if (Math.random() < BLOCK_CHANCE[this.difficulty]) {
        inp[facingPlayer === 'left' ? 'left' : 'right'] = false; // hold away
        inp[facingPlayer === 'left' ? 'right' : 'left'] = true;
        return inp;
      }
    }

    // Hard: immediate punish on player recovery
    if (this.difficulty === 'hard' && playerFighter.state === 'recovering' && dist < CLOSE_DIST * 1.5) {
      if (Math.random() < 0.8) {
        inp.HP = true;
        return inp;
      }
    }

    // Throttle decisions by reaction delay
    if (frameCount - this._lastDecisionFrame < delay) {
      return this._currentAction || inp;
    }
    this._lastDecisionFrame = frameCount;

    // Decision tree
    const action = _emptyInput();

    if (this.difficulty === 'easy') {
      // Random
      const roll = Math.random();
      if (roll < 0.3) {
        action[facingPlayer === 'left' ? 'left' : 'right'] = true; // walk toward
      } else if (roll < 0.45 && Math.random() < SPECIAL_CHANCE['easy']) {
        action.HP = true;
      } else if (roll < 0.6) {
        action.LP = true;
      }
    } else if (this.difficulty === 'medium') {
      if (dist > 250) {
        // Walk toward player
        action[facingPlayer === 'left' ? 'left' : 'right'] = true;
      } else if (dist < CLOSE_DIST) {
        // Attack
        if (Math.random() < SPECIAL_CHANCE['medium']) {
          // Inject a QCF motion for specials
          this.inputHandler._pushDir('down');
          this.inputHandler._pushDir('right');
          action.HP = true;
        } else {
          const attacks = ['LP','MP','HP','LK','MK','HK'];
          action[attacks[Math.floor(Math.random() * attacks.length)]] = true;
        }
      } else {
        action[facingPlayer === 'left' ? 'left' : 'right'] = true;
      }
    } else {
      // Hard
      if (dist > 300) {
        action[facingPlayer === 'left' ? 'left' : 'right'] = true;
        if (Math.random() < 0.3) action.HP = true; // try projectile
      } else if (dist < CLOSE_DIST) {
        const useSpecial = Math.random() < SPECIAL_CHANCE['hard'];
        if (useSpecial) {
          this.inputHandler._pushDir('down');
          this.inputHandler._pushDir('right');
          action.HP = true;
        } else {
          const attacks = ['LP','MP','HP','HK','MK'];
          action[attacks[Math.floor(Math.random() * attacks.length)]] = true;
        }
      } else {
        action[facingPlayer === 'left' ? 'left' : 'right'] = true;
        if (Math.random() < 0.2) action.MK = true;
      }
    }

    this._currentAction = action;
    return action;
  }

  destroy() {
    this.inputHandler.destroy();
  }
}

function _emptyInput() {
  return { left:false, right:false, up:false, down:false, LP:false, MP:false, HP:false, LK:false, MK:false, HK:false };
}
