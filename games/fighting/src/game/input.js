// games/fighting/src/game/input.js

const BUFFER_WINDOW = 10; // frames
const CHARGE_FRAMES = 30;
const RAPID_TAP_COUNT = 5;
const RAPID_TAP_WINDOW = 20; // frames

const KEY_MAP = {
  ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
  a: 'LP', s: 'MP', d: 'HP',
  z: 'LK', x: 'MK', c: 'HK',
};

export class InputHandler {
  constructor() {
    this._keys    = {};
    this._dirBuffer  = [];   // [{ dir, frame }]
    this._tapBuffer  = { punch: [], kick: [] }; // [frame]
    this._holdFrames = {};   // { 'left': N, 'down': N }
    this._heldButtons = {};  // { 'LP': N (frames held) }
    this._frame   = 0;
    this._onKeyDown = (e) => this._handleDown(e.key);
    this._onKeyUp   = (e) => this._handleUp(e.key);
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup',   this._onKeyUp);
  }

  _handleDown(key) {
    if (this._keys[key]) return; // already held
    this._keys[key] = true;
    const mapped = KEY_MAP[key];
    if (!mapped) return;
    if (['left','right','up','down'].includes(mapped)) {
      this._pushDir(mapped);
    } else if (['LP','MP','HP'].includes(mapped)) {
      this._registerTap('punch');
    } else if (['LK','MK','HK'].includes(mapped)) {
      this._registerTap('kick');
    }
  }

  _handleUp(key) {
    this._keys[key] = false;
  }

  /** Called each frame by the engine to update charge counters */
  tick() {
    this._frame++;
    const dirs = ['left','right','up','down'];
    dirs.forEach(dir => {
      const key = { left:'ArrowLeft', right:'ArrowRight', up:'ArrowUp', down:'ArrowDown' }[dir];
      if (this._keys[key]) {
        this._holdFrames[dir] = (this._holdFrames[dir] || 0) + 1;
      } else {
        this._holdFrames[dir] = 0;
      }
    });
    // Track held attack buttons
    ['a','s','d','z','x','c'].forEach(k => {
      const mapped = KEY_MAP[k];
      if (this._keys[k]) {
        this._heldButtons[mapped] = (this._heldButtons[mapped] || 0) + 1;
      } else {
        this._heldButtons[mapped] = 0;
      }
    });
    // Prune old dir buffer entries
    this._dirBuffer = this._dirBuffer.filter(e => this._frame - e.frame <= BUFFER_WINDOW);
    // Prune tap buffers
    ['punch','kick'].forEach(t => {
      this._tapBuffer[t] = this._tapBuffer[t].filter(f => this._frame - f <= RAPID_TAP_WINDOW);
    });
  }

  getInput() {
    const k = this._keys;
    return {
      left:  !!k['ArrowLeft'],
      right: !!k['ArrowRight'],
      up:    !!k['ArrowUp'],
      down:  !!k['ArrowDown'],
      LP: !!k['a'], MP: !!k['s'], HP: !!k['d'],
      LK: !!k['z'], MK: !!k['x'], HK: !!k['c'],
    };
  }

  getHeldFrames(button) {
    return this._heldButtons[button] || 0;
  }

  // --- motion checking ---

  checkMotion(type) {
    switch (type) {
      case 'QCF':          return this._hasSeq(['down','right']) || this._hasSeq(['down','downRight','right']);
      case 'QCB':          return this._hasSeq(['down','left'])  || this._hasSeq(['down','downLeft','left']);
      case 'DP':           return this._hasSeq(['right','down','downRight']);
      case 'QCF_UP':       return this._hasSeq(['down','right','up']) || this._hasSeq(['down','downRight','right','up']);
      case 'CHARGE_RIGHT': return (this._holdFrames['left'] || 0) >= CHARGE_FRAMES && this._recentDir('right', 8);
      case 'CHARGE_UP':    return (this._holdFrames['down'] || 0) >= CHARGE_FRAMES && this._recentDir('up', 8);
      case 'RAPID_PUNCH':  return this._tapBuffer['punch'].length >= RAPID_TAP_COUNT;
      case 'RAPID_KICK':   return this._tapBuffer['kick'].length  >= RAPID_TAP_COUNT;
      case '360': {
        const needed = ['up','down','left','right'];
        const recentDirs = new Set(this._dirBuffer.filter(e => this._frame - e.frame <= 20).map(e => e.dir));
        return needed.every(d => recentDirs.has(d));
      }
      default: return false;
    }
  }

  consumeMotion(type) {
    if (!this.checkMotion(type)) return false;
    this._dirBuffer = [];
    if (type === 'RAPID_PUNCH') this._tapBuffer['punch'] = [];
    if (type === 'RAPID_KICK')  this._tapBuffer['kick']  = [];
    return true;
  }

  _hasSeq(seq) {
    const recent = this._dirBuffer.map(e => e.dir);
    let si = 0;
    for (const d of recent) {
      if (d === seq[si]) si++;
      if (si === seq.length) return true;
    }
    return false;
  }

  _recentDir(dir, withinFrames) {
    return this._dirBuffer.some(e => e.dir === dir && this._frame - e.frame <= withinFrames);
  }

  // --- test helpers (also used by CPU AI to inject synthetic input) ---
  _pushDir(dir) {
    this._dirBuffer.push({ dir, frame: this._frame });
  }
  _registerTap(type) {
    this._tapBuffer[type].push(this._frame);
  }
  _setChargeFrames(dir, frames) {
    this._holdFrames[dir] = frames;
  }

  destroy() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup',   this._onKeyUp);
  }
}
