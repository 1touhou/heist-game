// main.js — Midnight Vault: The Meridian Job. Game bootstrap and loop.
// Owns the game state, steps it on a fixed clock, and hands it to render.js.
// The loop runs at requestAnimationFrame; a ?shot= URL poses the game for
// screenshots and freezes the simulation so the frame is stable.

import { VIEW_W, VIEW_H, WIN_BONUS_BASE, WIN_BONUS_PER_SECOND } from './config.js';
import { buildLevel } from './level.js';
import { createPlayer, updatePlayer, tryPickup, nearVaultDoor, nearTerminal, nearVan, useSmoke, useEmp } from './player.js';
import { updateGuard } from './guard.js';
import { updateAlarm } from './alarm.js';
import { startMinigame, updateMinigame, minigameAttempt, cancelMinigame } from './minigame.js';
import { createInput, attachInput, takePress, clearPresses } from './input.js';
import { createAudio } from './audio.js';
import { drawGame } from './render.js';
import { applyShot } from './shots.js';
import { dist } from './level.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = VIEW_W;
canvas.height = VIEW_H;

const params = new URLSearchParams(location.search);
const shotName = params.get('shot');

function newGame() {
  const level = buildLevel();
  const game = {
    mode: 'title',
    time: 0,
    alarm: 0,
    alarmRising: false,
    lastSeenAt: -99,
    lootValue: 0,
    hasDiamond: false,
    caughtBy: null,
    winBonus: 0,
    alarmPenalty: 0,
    finalScore: 0,
    message: '',
    messageUntil: 0,
    minigame: null,
    smoke: [],
    frozen: false,
    walls: level.walls,
    vaultDoor: level.vaultDoor,
    loot: level.loot,
    guards: level.guards,
    cameras: level.cameras,
    terminal: level.terminal,
    van: level.van,
    player: createPlayer(level.spawn),
    audio: createAudio(),
    input: createInput(),
    // Solid shapes the thief and guards collide with: walls plus the
    // locked vault door (open, it stops blocking).
    get solids() {
      const list = [...this.walls];
      if (!this.vaultDoor.open) list.push(this.vaultDoor);
      return list;
    },
    smokeCovers(x, y) {
      for (const s of this.smoke) {
        if (this.time < s.until && dist(x, y, s.x, s.y) < 95) return true;
      }
      return false;
    },
    get nearVaultDoor() {
      return nearVaultDoor(this.player, this);
    },
    get nearTerminal() {
      return nearTerminal(this.player, this);
    },
    get nearLoot() {
      for (const item of this.loot) {
        if (!item.taken && dist(this.player.x, this.player.y, item.x, item.y) < 48) return true;
      }
      return false;
    },
  };
  return game;
}

let game = newGame();
attachInput(game.input, window);

// Debug handle used by the play-test driver (not part of the game).
window.__heist = game;

if (shotName) {
  applyShot(game, shotName);
  window.__heist = game;
}

function reset() {
  const audio = game.audio;
  const muted = audio.muted;
  game = newGame();
  game.audio.muted = muted;
  attachInput(game.input, window);
  window.__heist = game;
}

function step(dt) {
  const input = game.input;
  game.audio.ensure();

  if (takePress(input, 'KeyM')) {
    const muted = game.audio.toggleMute();
    game.message = muted ? 'Sound off' : 'Sound on';
    game.messageUntil = game.time + 1.5;
  }

  if (game.mode === 'title') {
    if (takePress(input, 'Enter')) {
      game.mode = 'play';
      game.audio.ensure();
    }
    clearPresses(input);
    return;
  }

  if (game.mode === 'busted' || game.mode === 'win') {
    if (takePress(input, 'KeyR') || takePress(input, 'Enter')) reset();
    clearPresses(input);
    return;
  }

  if (game.mode === 'minigame') {
    updateMinigame(game, dt);
    if (takePress(input, 'Space')) minigameAttempt(game);
    if (takePress(input, 'Escape')) cancelMinigame(game);
    clearPresses(input);
    return;
  }

  // mode === 'play'
  game.time += dt;
  updatePlayer(game.player, input, dt, game);
  for (const g of game.guards) updateGuard(g, dt, game);
  updateAlarm(game, dt);
  if (game.mode !== 'play') {
    clearPresses(input);
    return;
  }
  tryPickup(game.player, game);

  if (takePress(input, 'KeyE')) {
    if (!game.vaultDoor.open && game.nearVaultDoor) startMinigame(game, 'lockpick');
    else if (game.nearTerminal) startMinigame(game, 'hack');
  }
  if (takePress(input, 'KeyQ')) useSmoke(game.player, game);
  if (takePress(input, 'KeyF')) useEmp(game.player, game);

  if (game.hasDiamond && nearVan(game.player, game)) {
    game.winBonus = Math.max(0, WIN_BONUS_BASE - Math.floor(game.time * WIN_BONUS_PER_SECOND));
    game.alarmPenalty = Math.floor(game.alarm * 2);
    game.finalScore = game.lootValue + game.winBonus - game.alarmPenalty;
    game.mode = 'win';
    game.audio.win();
  }
  clearPresses(input);
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!game.frozen) step(dt);
  drawGame(ctx, game);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
