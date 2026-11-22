// minigame.js — the lockpick and the camera hack.
// Both are the same timing test: a needle sweeps a bar, and the thief must
// stop it inside the green window. Three clean stops pick the vault lock;
// two stop the cameras. A miss resets the streak and feeds the alarm.

import { ALARM, TOOLS } from './config.js';
import { addAlarm } from './alarm.js';

export function startMinigame(game, kind) {
  game.minigame = {
    kind, // 'lockpick' | 'hack'
    needle: 0,
    speed: 1.9,
    hits: 0,
    needed: kind === 'lockpick' ? 3 : 2,
    zoneStart: 0.3,
    zoneEnd: 0.62,
  };
  rollZone(game.minigame);
  game.mode = 'minigame';
  game.audio.tick();
}

export function rollZone(mg) {
  const width = 0.24 + Math.random() * 0.1;
  mg.zoneStart = 0.08 + Math.random() * (0.92 - width);
  mg.zoneEnd = mg.zoneStart + width;
}

export function updateMinigame(game, dt) {
  const mg = game.minigame;
  if (!mg) return;
  mg.needle += mg.speed * dt;
  if (mg.needle > 1) {
    mg.needle = 1;
    mg.speed = -Math.abs(mg.speed);
  } else if (mg.needle < 0) {
    mg.needle = 0;
    mg.speed = Math.abs(mg.speed);
  }
}

export function minigameAttempt(game) {
  const mg = game.minigame;
  if (!mg) return;
  const inZone = mg.needle >= mg.zoneStart && mg.needle <= mg.zoneEnd;
  if (inZone) {
    mg.hits += 1;
    game.audio.pick();
    if (mg.hits >= mg.needed) {
      finishMinigame(game);
    } else {
      mg.speed = mg.speed > 0 ? mg.speed + 0.55 : mg.speed - 0.55;
      rollZone(mg);
    }
  } else {
    mg.hits = 0;
    mg.speed = mg.speed > 0 ? 1.9 : -1.9;
    addAlarm(game, mg.kind === 'lockpick' ? ALARM.lockpickFail : ALARM.hackFail);
    game.message = mg.kind === 'lockpick' ? 'Pick slipped — the lock rattles' : 'Hack trace — cameras notice';
    game.messageUntil = game.time + 2;
    game.audio.fail();
    rollZone(mg);
  }
}

function finishMinigame(game) {
  const mg = game.minigame;
  if (mg.kind === 'lockpick') {
    game.vaultDoor.locked = false;
    game.vaultDoor.open = true;
    game.message = 'Vault door open — the Diamond is inside';
  } else {
    for (const cam of game.cameras) {
      cam.disabledUntil = Math.max(cam.disabledUntil, game.time + TOOLS.hackDisableSeconds);
    }
    game.message = `Cameras hacked — dark for ${TOOLS.hackDisableSeconds}s`;
  }
  game.messageUntil = game.time + 2.5;
  game.minigame = null;
  game.mode = 'play';
  game.audio.unlock();
}

export function cancelMinigame(game) {
  game.minigame = null;
  game.mode = 'play';
}
