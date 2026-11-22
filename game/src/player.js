// player.js — the thief: movement, sneaking, loot pickup and tools.
// Movement is axis-separated so the thief slides along walls instead of
// sticking to them. Tools cost charges and are spent with Q (smoke) and F (EMP).

import { PLAYER, TOOLS } from './config.js';
import { dist, moveCircle } from './level.js';

export function createPlayer(spawn) {
  return {
    x: spawn.x,
    y: spawn.y,
    radius: PLAYER.radius,
    angle: -Math.PI / 2, // facing up, into the bank
    moving: false,
    sneaking: false,
    smokeLeft: TOOLS.smokeCharges,
    empLeft: TOOLS.empCharges,
  };
}

export function updatePlayer(p, input, dt, game) {
  let mx = 0;
  let my = 0;
  if (input.left) mx -= 1;
  if (input.right) mx += 1;
  if (input.up) my -= 1;
  if (input.down) my += 1;
  p.sneaking = input.sneak;
  p.moving = mx !== 0 || my !== 0;
  if (!p.moving) return;
  const len = Math.hypot(mx, my);
  const speed = p.sneaking ? PLAYER.sneakSpeed : PLAYER.walkSpeed;
  const step = speed * dt;
  const pos = moveCircle(p.x, p.y, p.radius, (mx / len) * step, (my / len) * step, game.solids);
  p.x = pos.x;
  p.y = pos.y;
  p.angle = Math.atan2(my, mx);
}

export function tryPickup(p, game) {
  for (const item of game.loot) {
    if (item.taken) continue;
    if (dist(p.x, p.y, item.x, item.y) < p.radius + 26) {
      item.taken = true;
      game.lootValue += item.value;
      game.message = `Grabbed ${item.label} (+$${item.value})`;
      game.messageUntil = game.time + 2.2;
      game.audio.pickup();
      if (item.required) {
        game.message = 'Meridian Diamond secured — get to the van!';
        game.hasDiamond = true;
      }
      return item;
    }
  }
  return null;
}

export function nearVaultDoor(p, game) {
  const d = game.vaultDoor;
  return Math.abs(p.x - (d.x + d.w / 2)) < 90 && Math.abs(p.y - (d.y + d.h / 2)) < 70;
}

export function nearTerminal(p, game) {
  const t = game.terminal;
  return dist(p.x, p.y, t.x + t.w / 2, t.y + t.h / 2) < 85;
}

export function nearVan(p, game) {
  const v = game.van;
  return p.x > v.x - 10 && p.x < v.x + v.w + 10 && p.y > v.y - 30 && p.y < v.y + v.h + 10;
}

export function useSmoke(p, game) {
  if (p.smokeLeft <= 0) {
    game.message = 'No smoke bombs left';
    game.messageUntil = game.time + 1.5;
    return false;
  }
  p.smokeLeft -= 1;
  game.smoke.push({ x: p.x, y: p.y, until: game.time + TOOLS.smokeSeconds });
  game.message = 'Smoke out — their cones cannot see through it';
  game.messageUntil = game.time + 2;
  game.audio.smoke();
  return true;
}

export function useEmp(p, game) {
  if (p.empLeft <= 0) {
    game.message = 'EMP already spent';
    game.messageUntil = game.time + 1.5;
    return false;
  }
  p.empLeft -= 1;
  for (const cam of game.cameras) {
    cam.disabledUntil = Math.max(cam.disabledUntil, game.time + TOOLS.empSeconds);
  }
  game.message = `EMP burst — cameras dark for ${TOOLS.empSeconds}s`;
  game.messageUntil = game.time + 2;
  game.audio.emp();
  return true;
}
