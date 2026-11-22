// alarm.js — the alarm meter: how fast it climbs, how fast it cools,
// and what happens when it tops out.

import { ALARM } from './config.js';
import { cameraDetectRate } from './camera.js';
import { guardDetectRate } from './guard.js';

export function updateAlarm(game, dt) {
  let rise = 0;
  for (const g of game.guards) rise += guardDetectRate(g, game.player, game);
  for (const cam of game.cameras) rise += cameraDetectRate(cam, game.player, game);
  game.alarmRising = rise > 0;
  if (rise > 0) {
    game.alarm = Math.min(ALARM.max, game.alarm + rise * dt);
    game.lastSeenAt = game.time;
  } else {
    game.alarm = Math.max(0, game.alarm - ALARM.decayPerSecond * dt);
  }
  if (game.alarm >= ALARM.max && game.mode === 'play') {
    game.mode = 'busted';
    game.audio.busted();
  }
}

export function addAlarm(game, amount) {
  game.alarm = Math.min(ALARM.max, game.alarm + amount);
  if (game.alarm >= ALARM.max && game.mode === 'play') {
    game.mode = 'busted';
    game.audio.busted();
  }
}
