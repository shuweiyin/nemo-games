// games/fighting/src/game/engine.js
import { Fighter } from './fighter.js';
import { InputHandler } from './input.js';
import { updateProjectiles, renderProjectiles } from './projectiles.js';
import { checkAABB, getHurtbox } from './physics.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, FPS, ROUND_TIMER, POWER_DAMAGE, SPECIAL_DMG_MULT } from './constants.js';
import { STAGES } from './stages.js';
import { SPECIALS } from './moves.js';

export function createEngine() {
  let rafHandle = null;
  let canvas, ctx, gameStateRef, config, onMatchOver;
  let player, cpu, projectiles, inputHandler;
  let timer, timerAccum, frameCount;
  let stageImg;

  function start(_canvas, _gameStateRef, _config, _onMatchOver) {
    canvas       = _canvas;
    ctx          = canvas.getContext('2d');
    gameStateRef = _gameStateRef;
    config       = _config;
    onMatchOver  = _onMatchOver;

    const stage = STAGES[config.cpuTeam[0].charId] || STAGES['ryu'];
    stageImg = new Image();
    stageImg.src = stage.bg;

    _initRound();
    rafHandle = requestAnimationFrame(_loop);
  }

  function stop() {
    if (rafHandle) cancelAnimationFrame(rafHandle);
    rafHandle = null;
    if (inputHandler) inputHandler.destroy();
  }

  function _initRound() {
    const pSlot  = config.playerTeam[config.playerTeam.findIndex(s => s.alive)];
    const cSlot  = config.cpuTeam[config.cpuTeam.findIndex(s => s.alive)];
    const stage  = STAGES[config.cpuTeam[0].charId] || STAGES['ryu'];

    if (inputHandler) inputHandler.destroy();
    inputHandler = new InputHandler();

    player = new Fighter({ charId: pSlot.charId, isPlayer: true,  floorY: stage.floorY, stageWidth: stage.width });
    cpu    = new Fighter({ charId: cSlot.charId, isPlayer: false, floorY: stage.floorY, stageWidth: stage.width });

    player.reset(pSlot.health);
    cpu.reset(cSlot.health);

    projectiles  = [];
    timer        = ROUND_TIMER;
    timerAccum   = 0;
    frameCount   = 0;

    gameStateRef.current.phase      = 'fighting';
    gameStateRef.current.timer      = timer;
    gameStateRef.current.playerTeam = config.playerTeam;
    gameStateRef.current.cpuTeam    = config.cpuTeam;
  }

  let lastTime = 0;
  function _loop(ts) {
    const dt = Math.min((ts - lastTime) / 1000, 0.05);
    lastTime = ts;

    _update(dt);
    _render();

    if (gameStateRef.current.phase !== 'matchOver') {
      rafHandle = requestAnimationFrame(_loop);
    }
  }

  function _update(dt) {
    if (gameStateRef.current.phase !== 'fighting') return;

    frameCount++;
    inputHandler.tick();

    const input    = inputHandler.getInput();
    const cpuInput = config.cpuAI.getInput(cpu, player, projectiles, frameCount);

    player.update(input,    inputHandler,       cpu,    projectiles);
    cpu.update(cpuInput,    config.cpuAI.inputHandler, player, projectiles);

    // Resolve melee hits
    _resolveMeleeHit(player, cpu);
    _resolveMeleeHit(cpu, player);

    // Projectile update
    const projHits = updateProjectiles(projectiles, [player, cpu]);
    projHits.forEach(({ fighter, damage, isBlocking }) => {
      fighter.takeDamage(damage, isBlocking, false);
    });

    // Timer
    timerAccum += dt;
    if (timerAccum >= 1) {
      timerAccum -= 1;
      timer = Math.max(0, timer - 1);
      gameStateRef.current.timer = timer;
    }

    // Sync health to gameStateRef
    _syncHealth();

    // Round-end check
    if (player.isKO() || cpu.isKO() || timer === 0) {
      _endRound();
    }
  }

  function _resolveMeleeHit(attacker, defender) {
    const hitbox  = attacker.getActiveHitbox();
    if (!hitbox) return;
    if (attacker.hitConfirmed) return;

    const hurtbox = getHurtbox(defender);
    if (!checkAABB(hitbox, hurtbox)) return;

    const isSpecial  = attacker.activeSpecialIdx >= 0;
    const isTravel   = isSpecial && (SPECIALS?.[attacker.charId]?.[attacker.activeSpecialIdx]?.isTravel ?? false);
    const isBlocking = defender.state === 'blockHigh' || defender.state === 'blockLow';

    let damage;
    if (isSpecial) {
      const baseDmg = POWER_DAMAGE[attacker.powerTier][1];
      damage = baseDmg * SPECIAL_DMG_MULT[attacker.specialTier];
    } else {
      const normalKey = attacker.state.replace('attack','');
      const idx = ['LP','LK'].includes(normalKey) ? 0 : ['MP','MK'].includes(normalKey) ? 1 : 2;
      damage = POWER_DAMAGE[attacker.powerTier][idx];
    }

    defender.takeDamage(damage, isBlocking, isTravel);

    // Multi-hit specials
    const specDef = isSpecial ? SPECIALS[attacker.charId]?.[attacker.activeSpecialIdx] : null;
    const maxHits  = specDef?.multiHit ?? 1;
    attacker.hitCount = (attacker.hitCount || 0) + 1;
    if (attacker.hitCount >= maxHits) attacker.hitConfirmed = true;
  }

  function _syncHealth() {
    const pSlotIdx = config.playerTeam.findIndex(s => s.alive);
    const cSlotIdx = config.cpuTeam.findIndex(s => s.alive);
    if (pSlotIdx >= 0) config.playerTeam[pSlotIdx].health = player.health;
    if (cSlotIdx >= 0) config.cpuTeam[cSlotIdx].health    = cpu.health;
  }

  function _endRound() {
    gameStateRef.current.phase = 'roundOver';
    inputHandler.destroy();

    const playerHP = player.health;
    const cpuHP    = cpu.health;
    const pSlotIdx = config.playerTeam.findIndex(s => s.alive);
    const cSlotIdx = config.cpuTeam.findIndex(s => s.alive);
    const pSlot    = config.playerTeam[pSlotIdx];
    const cSlot    = config.cpuTeam[cSlotIdx];
    const pMaxHP   = player.maxHealth;
    const cMaxHP   = cpu.maxHealth;

    const HP_FLOOR = 0.30;

    if (playerHP === cpuHP && timer === 0) {
      // Exact tie: both eliminated
      pSlot.alive = false;
      cSlot.alive = false;
    } else {
      const playerWon = playerHP > cpuHP || cpu.isKO();
      if (playerWon) {
        cSlot.alive     = false;
        pSlot.health    = Math.max(playerHP, pMaxHP * HP_FLOOR);
      } else {
        pSlot.alive     = false;
        cSlot.health    = Math.max(cpuHP, cMaxHP * HP_FLOOR);
      }
    }

    const playerElim = config.playerTeam.every(s => !s.alive);
    const cpuElim    = config.cpuTeam.every(s => !s.alive);

    if (playerElim || cpuElim) {
      gameStateRef.current.phase  = 'matchOver';
      gameStateRef.current.winner = cpuElim ? 'player' : 'cpu';
      setTimeout(() => onMatchOver(gameStateRef.current.winner), 2500);
    } else {
      // Next round after delay
      setTimeout(() => {
        gameStateRef.current.phase = 'fighting';
        _initRound();
      }, 2500);
    }
  }

  function _render() {
    const gs = gameStateRef.current;
    const stage = STAGES[config.cpuTeam[0].charId] || STAGES['ryu'];

    // Camera
    const midX   = (player.x + cpu.x) / 2;
    const cameraX = Math.max(0, Math.min(midX - CANVAS_WIDTH / 2, stage.width - CANVAS_WIDTH));

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Background
    if (stageImg.complete && stageImg.naturalWidth > 0) {
      ctx.drawImage(stageImg, cameraX, 0, CANVAS_WIDTH, CANVAS_HEIGHT, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    } else {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      // Floor line
      ctx.fillStyle = '#333';
      ctx.fillRect(0, stage.floorY, CANVAS_WIDTH, CANVAS_HEIGHT - stage.floorY);
    }

    // Projectiles
    renderProjectiles(ctx, projectiles, cameraX);

    // Fighters (far first)
    const farFirst  = player.x < cpu.x ? [player, cpu] : [cpu, player];
    farFirst.forEach(f => f.render(ctx, cameraX));

    // Round overlay
    if (gs.phase === 'roundOver' || gs.phase === 'matchOver') {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 72px Impact, sans-serif';
      ctx.textAlign = 'center';
      if (gs.phase === 'matchOver') {
        ctx.fillText(gs.winner === 'player' ? 'YOU WIN!' : 'GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      } else {
        ctx.fillText(timer === 0 ? 'TIME OUT' : 'KO!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      }
    }
  }

  return { start, stop };
}
