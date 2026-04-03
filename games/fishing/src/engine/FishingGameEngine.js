// ─── constants ───────────────────────────────────────────────────────────────
const CW = 1100;
const VH = 780;
const WATER_SY = 260;
const OCEAN_D = VH - WATER_SY;
const BOAT_SX = CW / 2;
const BOAT_SY = WATER_SY;
const BOAT_W = 420;
const BOAT_H = 160;
const ROD_SX = BOAT_SX + 162;
const ROD_SY = BOAT_SY - 105;

function d2s(depth) {
  return WATER_SY + depth;
}

function s2d(sy) {
  return sy - WATER_SY;
}

// ─── fish data ───────────────────────────────────────────────────────────────
const FISH = [
  { id: "minnow", name: "Minnow", w: 0.1, v: 4, L: 28, H: 10, c: "#a8d8f0", fc: "#5a9ec0", res: 2, mn: 0.00, mx: 0.06 },
  { id: "herring", name: "Herring", w: 0.3, v: 8, L: 38, H: 12, c: "#c8e0f0", fc: "#88b0d0", res: 4, mn: 0.01, mx: 0.08 },
  { id: "perch", name: "Perch", w: 0.3, v: 10, L: 44, H: 20, c: "#f0c030", fc: "#b07800", res: 5, mn: 0.01, mx: 0.09 },
  { id: "mackerel", name: "Mackerel", w: 0.5, v: 14, L: 58, H: 16, c: "#50a8d8", fc: "#1868a0", res: 7, mn: 0.02, mx: 0.11 },
  { id: "trout", name: "Trout", w: 0.8, v: 20, L: 70, H: 24, c: "#88cc68", fc: "#408030", res: 10, mn: 0.03, mx: 0.14 },
  { id: "flounder", name: "Flounder", w: 1.5, v: 28, L: 72, H: 52, c: "#d4b870", fc: "#a08030", res: 11, mn: 0.05, mx: 0.17 },
  { id: "salmon", name: "Salmon", w: 2.5, v: 38, L: 90, H: 30, c: "#e87858", fc: "#a03818", res: 12, mn: 0.05, mx: 0.16 },
  { id: "cod", name: "Cod", w: 3, v: 45, L: 96, H: 40, c: "#c0a870", fc: "#786028", res: 14, mn: 0.07, mx: 0.19 },
  { id: "bass", name: "Bass", w: 4, v: 55, L: 100, H: 38, c: "#70b858", fc: "#387018", res: 15, mn: 0.06, mx: 0.17 },
  { id: "pike", name: "Pike", w: 6, v: 80, L: 130, H: 28, c: "#68a850", fc: "#305820", res: 18, mn: 0.10, mx: 0.24 },
  { id: "jellyfish", name: "Jellyfish", w: 0.8, v: 22, L: 48, H: 60, c: "#e8a8f8", fc: "#b060d0", res: 6, mn: 0.10, mx: 0.32 },
  { id: "eel", name: "Moray Eel", w: 5, v: 70, L: 220, H: 22, c: "#60885a", fc: "#385028", res: 18, mn: 0.10, mx: 0.24 },
  { id: "barracuda", name: "Barracuda", w: 8, v: 95, L: 150, H: 24, c: "#6888a0", fc: "#384860", res: 20, mn: 0.14, mx: 0.30 },
  { id: "grouper", name: "Grouper", w: 12, v: 110, L: 110, H: 70, c: "#c06830", fc: "#783010", res: 22, mn: 0.18, mx: 0.36 },
  { id: "nautilus", name: "Nautilus", w: 3, v: 85, L: 70, H: 70, c: "#f0c890", fc: "#c07830", res: 16, mn: 0.22, mx: 0.44 },
  { id: "tuna", name: "Tuna", w: 15, v: 140, L: 150, H: 52, c: "#1858a8", fc: "#082868", res: 25, mn: 0.20, mx: 0.38 },
  { id: "manta", name: "Manta Ray", w: 20, v: 165, L: 180, H: 110, c: "#203848", fc: "#101828", res: 28, mn: 0.24, mx: 0.44 },
  { id: "swordfish", name: "Swordfish", w: 25, v: 220, L: 170, H: 32, c: "#184088", fc: "#081848", res: 30, mn: 0.28, mx: 0.48 },
  { id: "oarfish", name: "Oarfish", w: 35, v: 300, L: 340, H: 22, c: "#b890c0", fc: "#705880", res: 35, mn: 0.36, mx: 0.56 },
  { id: "sunfish", name: "Ocean Sunfish", w: 50, v: 380, L: 140, H: 170, c: "#888898", fc: "#505060", res: 38, mn: 0.32, mx: 0.54 },
  { id: "shark", name: "Great White", w: 80, v: 450, L: 220, H: 64, c: "#607080", fc: "#303840", res: 42, mn: 0.44, mx: 0.64 },
  { id: "colossal", name: "Colossal Squid", w: 45, v: 420, L: 200, H: 80, c: "#c03828", fc: "#801818", res: 40, mn: 0.48, mx: 0.68 },
  { id: "gulper", name: "Gulper Eel", w: 8, v: 160, L: 260, H: 28, c: "#181828", fc: "#080818", res: 26, mn: 0.55, mx: 0.74 },
  { id: "anglerfish", name: "Anglerfish", w: 10, v: 200, L: 100, H: 88, c: "#281430", fc: "#180828", res: 28, mn: 0.60, mx: 0.80 },
  { id: "viperfish", name: "Viperfish", w: 6, v: 180, L: 140, H: 30, c: "#102830", fc: "#081820", res: 24, mn: 0.62, mx: 0.82 },
  { id: "whale", name: "Blue Whale", w: 200, v: 850, L: 580, H: 170, c: "#284868", fc: "#101e30", res: 55, mn: 0.65, mx: 0.84 },
  { id: "kraken", name: "Kraken", w: 999, v: 2000, L: 340, H: 340, c: "#380050", fc: "#180020", res: 80, mn: 0.84, mx: 0.98 },
];

const RODS = [
  { id: "r1", name: "Beginner Rod", cost: 0, spd: 1 },
  { id: "r2", name: "Carbon Rod", cost: 200, spd: 1.5 },
  { id: "r3", name: "Pro Spinner", cost: 600, spd: 2.2 },
  { id: "r4", name: "Master's Rod", cost: 1500, spd: 3.2 },
];

const LURES = [
  { id: "l1", name: "Basic Lure", cost: 0, boost: 0 },
  { id: "l2", name: "Silver Spoon", cost: 150, boost: 15 },
  { id: "l3", name: "Magic Fly", cost: 450, boost: 35 },
  { id: "l4", name: "Legend Lure", cost: 1200, boost: 60 },
];

const NETS = [
  { id: "n1", name: "Single Hook", cost: 0, max: 1 },
  { id: "n2", name: "Double Hook", cost: 300, max: 2 },
  { id: "n3", name: "Triple Rig", cost: 800, max: 3 },
  { id: "n4", name: "Net Cast", cost: 2000, max: 6 },
];

function mkSwimmer(f) {
  return {
    fish: f,
    x: 20 + Math.random() * (CW - 40),
    depth: (f.mn + Math.random() * (f.mx - f.mn)) * OCEAN_D,
    vx: (Math.random() - 0.5) * 0.7,
    dir: Math.random() < 0.5 ? 1 : -1,
    wobble: Math.random() * Math.PI * 2,
  };
}

// ─── FishingGameEngine class ─────────────────────────────────────────────────
class FishingGameEngine {
  constructor() {
    this.state = {
      coins: 30,
      screen: "game",
      prevScreen: "game",
      phase: "idle", // idle, flying, drifting, reeling
      hookDepth: 0,
      hookSX: ROD_SX,
      mouseSX: CW / 2,
      mouseDepth: 200,
      aimT: 0,
      castAngle: Math.PI * 0.62,
      lines: [],
      popups: [],
      swimmers: [],
      bubbles: [],
      waveOff: 0,
      rod: "r1",
      lure: "l1",
      net: "n1",
      owned: ["r1", "l1", "n1"],
      log: {}, // catch counts by fish id
      inv: {}, // inventory counts by fish id
      lastR: 0, // last reel time
      pending: 0, // pending fish to respawn
    };
    this.elapsedTime = 0;
  }

  /**
   * Returns an immutable snapshot of the current game state
   */
  getState() {
    return JSON.parse(JSON.stringify(this.state));
  }

  /**
   * Start a new game - Initialize fish population, reset money
   */
  startGame() {
    this.state = {
      coins: 30,
      screen: "game",
      prevScreen: "game",
      phase: "idle",
      hookDepth: 0,
      hookSX: ROD_SX,
      mouseSX: CW / 2,
      mouseDepth: 200,
      aimT: 0,
      castAngle: Math.PI * 0.62,
      lines: [],
      popups: [],
      swimmers: [],
      bubbles: [],
      waveOff: 0,
      rod: "r1",
      lure: "l1",
      net: "n1",
      owned: ["r1", "l1", "n1"],
      log: {},
      inv: {},
      lastR: 0,
      pending: 0,
    };
    this.elapsedTime = 0;
    this.spawnInitialFish();
  }

  /**
   * Spawn initial swimmers (one of each fish type)
   */
  spawnInitialFish() {
    this.state.swimmers = FISH.map((f) => mkSwimmer(f));
  }

  /**
   * Pause the game
   */
  pauseGame() {
    this.state.isPaused = true;
  }

  /**
   * Resume the game
   */
  resumeGame() {
    this.state.isPaused = false;
  }

  /**
   * Set mouse position for lure guidance during drifting phase
   */
  setMousePosition(x, y) {
    // Convert screen coordinates to game coordinates
    this.state.mouseSX = x;
    this.state.mouseDepth = s2d(y);
  }

  /**
   * Update game state by deltaTime (in frame units, ~16.67ms per frame)
   * Main game loop handling:
   * - Fish movement and wobble animation
   * - Line physics (flying, drifting, reeling)
   * - Hit detection for fish catching
   * - Aim oscillation
   * - Bubble and popup animation
   */
  update(dt) {
    // Clamp deltaTime to prevent huge jumps
    dt = Math.min(dt, 3);

    // Update aim angle oscillation (only during idle)
    this.state.aimT += 0.016 * dt;
    this.state.castAngle = Math.PI * 0.55 + Math.sin(this.state.aimT) * Math.PI * 0.38;

    // Update wave animation
    this.state.waveOff += 0.018 * dt;

    // Update bubbles
    this.state.bubbles = this.state.bubbles.filter((b) => b.life > 0);
    this.state.bubbles.forEach((b) => {
      b.depth -= 0.5 * dt;
      b.life -= dt;
    });

    // Update popups
    this.state.popups = this.state.popups.filter((p) => p.life > 0);
    this.state.popups.forEach((p) => {
      p.life -= dt;
    });

    // Update fish swimming
    this.state.swimmers.forEach((s) => {
      if (!s) return;

      // Wobble animation
      s.wobble += 0.06 * dt;

      // Update position
      s.x += s.vx * dt;

      // Wrap around screen edges
      if (s.x < -s.fish.L) s.x = CW + s.fish.L;
      if (s.x > CW + s.fish.L) s.x = -s.fish.L;

      // Keep within depth zone
      const minD = s.fish.mn * OCEAN_D;
      const maxD = s.fish.mx * OCEAN_D;
      s.depth = Math.max(minD, Math.min(maxD, s.depth));

      // Random direction changes
      if (Math.random() < 0.004 * dt) {
        s.vx = (Math.random() - 0.5) * 0.8;
        s.dir = s.vx > 0 ? 1 : -1;
      }
    });

    // Respawn one pending swimmer per frame when idle
    if (this.state.phase === "idle" && this.state.pending > 0) {
      const idx = this.state.swimmers.findIndex((s) => s === null);
      const slot = idx !== -1 ? idx : this.state.swimmers.length;
      this.state.swimmers[slot] = mkSwimmer(FISH[slot % FISH.length]);
      this.state.pending--;
    }

    // If idle, don't process line physics
    if (this.state.phase === "idle") return;

    // Process each fishing line
    this.state.lines.forEach((l) => {
      if (l.state === "done") return;

      if (l.state === "flying") {
        // Line is in the air, affected by gravity
        l.vy += 0.25 * dt;
        l.sx += l.vx * dt;
        l.arcY += l.vy * dt;

        if (l.arcY > 0) {
          // Line hit water surface
          l.state = "drifting";
          l.depth = 0;
          l.vx = 0;
          l.vy = 0;
          this.state.phase = "drifting";

          // Create splash bubbles
          for (let i = 0; i < 6; i++) {
            this.state.bubbles.push({
              x: l.sx,
              depth: 0,
              r: 2 + Math.random() * 4,
              life: 14,
            });
          }
        }
      }

      if (l.state === "drifting") {
        // Line is drifting underwater, controlled by mouse
        const td = Math.max(2, this.state.mouseDepth);
        const tx = Math.max(10, Math.min(CW - 10, this.state.mouseSX));

        // Smoothly move toward target
        l.depth += (td - l.depth) * 0.025 * dt;
        l.sx += (tx - l.sx) * 0.025 * dt;

        const hookSY = d2s(l.depth);

        // Hit detection against visible swimmers
        const hitIdx = this.state.swimmers.findIndex((s) => {
          if (!s) return false;
          const fsy = d2s(s.depth);

          // Check if fish is visible on screen
          if (fsy < WATER_SY - s.fish.H || fsy > VH + s.fish.H) return false;

          // Check collision with hook
          return (
            Math.hypot(s.x - l.sx, fsy - hookSY) <
            22 + s.fish.L * 0.28
          );
        });

        if (hitIdx !== -1) {
          // Fish hooked!
          const hit = this.state.swimmers[hitIdx];
          l.hooked = { ...hit.fish, sx: l.sx, sd: l.depth };
          l.state = "reeling";
          l.prog = 0;
          this.state.phase = "reeling";

          // Mark fish for respawn
          this.state.swimmers[hitIdx] = null;
          this.state.pending++;
        }
      }

      if (l.state === "reeling") {
        // Line is reeling in with resistance from fish
        l.prog = Math.max(0, l.prog - l.hooked.res * 0.0012 * dt);

        const pct = l.prog / 100;
        l.sx = l.hooked.sx + (ROD_SX - l.hooked.sx) * pct;
        l.depth = l.hooked.sd * (1 - pct);

        if (l.prog >= 100) {
          // Fish caught!
          const f = l.hooked;
          this.state.log[f.id] = (this.state.log[f.id] || 0) + 1;
          this.state.inv[f.id] = (this.state.inv[f.id] || 0) + 1;

          // Add popup notification
          this.state.popups.push({
            x: ROD_SX,
            sy: ROD_SY - 30,
            text: `+1 ${f.name}`,
            life: 80,
            color: f.id === "kraken" ? "#cc00ff" : "#ffe066",
            size: f.L > 100 ? 17 : 13,
          });

          l.state = "done";
        }
      }
    });

    // Update hook position to active line
    const activeLine = this.state.lines.find((l) => l.state !== "done");
    if (activeLine) {
      this.state.hookDepth = activeLine.depth;
      this.state.hookSX = activeLine.sx;
    }

    // Check if all lines are done
    if (
      this.state.lines.length > 0 &&
      this.state.lines.every((l) => l.state === "done")
    ) {
      this.state.phase = "idle";
      this.state.lines = [];
      this.state.hookDepth = 0;
    }
  }

  /**
   * Cast the fishing line - initiates fishing
   * Creates line(s) based on net selection with spread pattern
   */
  castLine() {
    if (this.state.phase !== "idle") return;

    const netItem = NETS.find((x) => x.id === this.state.net);
    const numLines = netItem?.max || 1;
    const angle = this.state.castAngle;

    // Create fishing lines with slight spread based on net type
    this.state.lines = Array.from({ length: numLines }, (_, i) => {
      const spread = (i - (numLines - 1) / 2) * 0.09;
      return {
        sx: ROD_SX,
        arcY: 0,
        depth: 0,
        vx: Math.cos(angle + spread) * 17,
        vy: Math.sin(angle + spread) * 17,
        inWater: false,
        state: "flying",
        hooked: null,
        prog: 0,
      };
    });

    this.state.hookDepth = 0;
    this.state.hookSX = ROD_SX;
    this.state.phase = "flying";
  }

  /**
   * Reel in the fishing line
   * Called when player presses R key
   * Applies rod speed boost to catch progress
   */
  reel() {
    if (this.state.phase !== "reeling") return;

    const now = Date.now();
    if (now - this.state.lastR < 65) return; // Throttle to ~15 reels per second
    this.state.lastR = now;

    const rodItem = RODS.find((x) => x.id === this.state.rod);
    const reelSpeed = rodItem?.spd || 1;

    // Increase progress on each hooked line
    this.state.lines.forEach((l) => {
      if (l.state === "reeling" && l.hooked) {
        l.prog += Math.max(0.2, reelSpeed * 2.4 - l.hooked.res * 0.003);
      }
    });
  }

  /**
   * Catch a fish by ID and add to inventory
   * (This is called internally when reeling completes)
   */
  catchFish(fishId) {
    const fish = FISH.find((f) => f.id === fishId);
    if (!fish) return;

    this.state.log[fishId] = (this.state.log[fishId] || 0) + 1;
    this.state.inv[fishId] = (this.state.inv[fishId] || 0) + 1;
  }

  /**
   * Sell a caught fish by ID (remove 1 from inventory, add money)
   */
  sellFish(fishId) {
    const fish = FISH.find((f) => f.id === fishId);
    if (!fish || !this.state.inv[fishId]) return false;

    this.state.coins += fish.v;
    this.state.inv[fishId]--;
    if (this.state.inv[fishId] <= 0) delete this.state.inv[fishId];
    return true;
  }

  /**
   * Sell all of a specific caught fish by ID
   */
  sellAllFish(fishId) {
    const fish = FISH.find((f) => f.id === fishId);
    if (!fish || !this.state.inv[fishId]) return false;

    const count = this.state.inv[fishId];
    this.state.coins += fish.v * count;
    delete this.state.inv[fishId];
    return true;
  }

  /**
   * Buy a rod upgrade
   * Checks if player can afford and hasn't already owned
   */
  buyRod(rodId) {
    const rod = RODS.find((x) => x.id === rodId);
    if (!rod) return false;

    if (this.state.coins < rod.cost || this.state.owned.includes(rod.id)) {
      return false;
    }

    this.state.coins -= rod.cost;
    this.state.owned.push(rod.id);
    this.state.rod = rod.id;
    return true;
  }

  /**
   * Equip a rod (must be already owned)
   */
  equipRod(rodId) {
    if (!this.state.owned.includes(rodId)) return false;
    this.state.rod = rodId;
    return true;
  }

  /**
   * Buy a lure upgrade
   * Checks if player can afford and hasn't already owned
   */
  buyLure(lureId) {
    const lure = LURES.find((x) => x.id === lureId);
    if (!lure) return false;

    if (
      this.state.coins < lure.cost ||
      this.state.owned.includes(lure.id)
    ) {
      return false;
    }

    this.state.coins -= lure.cost;
    this.state.owned.push(lure.id);
    this.state.lure = lure.id;
    return true;
  }

  /**
   * Equip a lure (must be already owned)
   */
  equipLure(lureId) {
    if (!this.state.owned.includes(lureId)) return false;
    this.state.lure = lureId;
    return true;
  }

  /**
   * Buy a net upgrade
   * Checks if player can afford and hasn't already owned
   */
  buyNet(netId) {
    const net = NETS.find((x) => x.id === netId);
    if (!net) return false;

    if (this.state.coins < net.cost || this.state.owned.includes(net.id)) {
      return false;
    }

    this.state.coins -= net.cost;
    this.state.owned.push(net.id);
    this.state.net = net.id;
    return true;
  }

  /**
   * Equip a net (must be already owned)
   */
  equipNet(netId) {
    if (!this.state.owned.includes(netId)) return false;
    this.state.net = netId;
    return true;
  }

  /**
   * Get array of swimmers for rendering
   */
  getSwimmers() {
    return this.state.swimmers;
  }

  /**
   * Get fishing lines for rendering
   */
  getLines() {
    return this.state.lines;
  }

  /**
   * Get bubbles for rendering
   */
  getBubbles() {
    return this.state.bubbles;
  }

  /**
   * Get popups for rendering
   */
  getPopups() {
    return this.state.popups;
  }

  /**
   * Get boat position
   */
  getBoatPosition() {
    return { x: BOAT_SX, y: BOAT_SY };
  }

  /**
   * Get line state (hooked, depth, position)
   */
  getLineState() {
    const activeLine = this.state.lines.find((l) => l.state !== "done");
    if (!activeLine)
      return { hooked: null, depth: this.state.hookDepth, sx: this.state.hookSX };

    return {
      hooked: activeLine.hooked,
      depth: activeLine.depth,
      sx: activeLine.sx,
      state: activeLine.state,
      prog: activeLine.prog,
    };
  }

  /**
   * Get current phase
   */
  getPhase() {
    return this.state.phase;
  }

  /**
   * Get canvas size
   */
  getCanvasSize() {
    return { width: CW, height: VH };
  }

  /**
   * Get water constants
   */
  getWaterLevel() {
    return WATER_SY;
  }

  /**
   * Get cast angle
   */
  getCastAngle() {
    return this.state.castAngle;
  }

  /**
   * Get wave offset for animation
   */
  getWaveOffset() {
    return this.state.waveOff;
  }

  /**
   * Get money
   */
  getMoney() {
    return this.state.coins;
  }

  /**
   * Get log (catch statistics)
   */
  getLog() {
    return { ...this.state.log };
  }

  /**
   * Get inventory
   */
  getInventory() {
    return { ...this.state.inv };
  }

  /**
   * Get owned items
   */
  getOwned() {
    return [...this.state.owned];
  }

  /**
   * Get equipped items
   */
  getEquipped() {
    return {
      rod: this.state.rod,
      lure: this.state.lure,
      net: this.state.net,
    };
  }
}

// ─── exports ─────────────────────────────────────────────────────────────────
export {
  CW,
  VH,
  WATER_SY,
  OCEAN_D,
  BOAT_SX,
  BOAT_SY,
  BOAT_W,
  BOAT_H,
  ROD_SX,
  ROD_SY,
  d2s,
  s2d,
  FISH,
  RODS,
  LURES,
  NETS,
  mkSwimmer,
};

export default FishingGameEngine;
