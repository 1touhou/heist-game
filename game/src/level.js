// level.js — the Meridian Bank floor plan and geometry helpers.
// The bank has three zones: the lobby (bottom), the hall (middle) and the
// vault room (top, behind a locked vault door). The getaway van waits in
// the street strip along the bottom edge.

import { LOOT_VALUES } from './config.js';

// A wall is {x, y, w, h}. A door is a wall segment that can open.
export function buildLevel() {
  const walls = [
    // Outer shell (bottom edge leaves the entrance gap x 600..680).
    { x: 0, y: 0, w: 1280, h: 16 },
    { x: 0, y: 0, w: 16, h: 660 },
    { x: 1264, y: 0, w: 16, h: 660 },
    { x: 0, y: 660, w: 600, h: 16 },
    { x: 680, y: 660, w: 600, h: 16 },
    // Vault room: x 400..880, y 16..266.
    { x: 400, y: 250, w: 200, h: 16 },
    { x: 680, y: 250, w: 200, h: 16 },
    { x: 400, y: 16, w: 16, h: 250 },
    { x: 864, y: 16, w: 16, h: 250 },
    // Hall pillars and lobby desks (cover).
    { x: 300, y: 350, w: 42, h: 42 },
    { x: 938, y: 350, w: 42, h: 42 },
    { x: 200, y: 560, w: 160, h: 30 },
    { x: 920, y: 560, w: 160, h: 30 },
    // Vault display plinths (cover inside the vault).
    { x: 470, y: 60, w: 60, h: 26 },
    { x: 750, y: 60, w: 60, h: 26 },
  ];

  const vaultDoor = { x: 600, y: 250, w: 80, h: 16, locked: true, open: false };

  const loot = [
    { id: 'diamond', kind: 'diamond', label: 'Meridian Diamond', x: 640, y: 130, value: LOOT_VALUES.diamond, taken: false, required: true },
    { id: 'gold1', kind: 'gold', label: 'Gold bar', x: 500, y: 130, value: LOOT_VALUES.goldBar, taken: false },
    { id: 'gold2', kind: 'gold', label: 'Gold bar', x: 780, y: 130, value: LOOT_VALUES.goldBar, taken: false },
    { id: 'gold3', kind: 'gold', label: 'Gold bar', x: 640, y: 205, value: LOOT_VALUES.goldBar, taken: false },
    { id: 'gem', kind: 'gem', label: 'Sapphire', x: 830, y: 60, value: LOOT_VALUES.gem, taken: false },
    { id: 'paint1', kind: 'painting', label: 'Oil painting', x: 250, y: 300, value: LOOT_VALUES.painting, taken: false },
    { id: 'paint2', kind: 'painting', label: 'Oil painting', x: 1030, y: 300, value: LOOT_VALUES.painting, taken: false },
    { id: 'cash', kind: 'cash', label: 'Cash stack', x: 250, y: 545, value: LOOT_VALUES.cash, taken: false },
  ];

  const guards = [
    { id: 'lobby', name: 'Lobby guard', x: 200, y: 500, angle: 0, waypoints: [{ x: 180, y: 500 }, { x: 1100, y: 500 }], wp: 1, mode: 'patrol', seenX: 0, seenY: 0 },
    { id: 'hall', name: 'Hall guard', x: 980, y: 360, angle: Math.PI, waypoints: [{ x: 980, y: 360 }, { x: 300, y: 360 }], wp: 1, mode: 'patrol', seenX: 0, seenY: 0 },
    { id: 'vault', name: 'Vault guard', x: 460, y: 150, angle: 0, waypoints: [{ x: 460, y: 150 }, { x: 820, y: 150 }], wp: 1, mode: 'patrol', seenX: 0, seenY: 0 },
  ];

  const cameras = [
    { id: 'cam-hall', x: 640, y: 272, baseAngle: Math.PI / 2, sweep: 0.85, phase: 0, disabledUntil: 0 },
    { id: 'cam-lobby', x: 1252, y: 330, baseAngle: Math.PI, sweep: 0.7, phase: 1.6, disabledUntil: 0 },
  ];

  const terminal = { x: 60, y: 470, w: 46, h: 34, label: 'Camera terminal' };
  const van = { x: 600, y: 676, w: 80, h: 44 };
  const spawn = { x: 640, y: 640 };

  return { walls, vaultDoor, loot, guards, cameras, terminal, van, spawn };
}

// Circle-vs-rectangle test used for movement and pickups.
export function circleHitsRect(cx, cy, r, rect) {
  const nx = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
  const ny = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
  const dx = cx - nx;
  const dy = cy - ny;
  return dx * dx + dy * dy < r * r;
}

// True when any wall blocks the straight line from (x1,y1) to (x2,y2).
export function lineBlocked(x1, y1, x2, y2, walls) {
  for (const w of walls) {
    if (segmentHitsRect(x1, y1, x2, y2, w)) return true;
  }
  return false;
}

function segmentHitsRect(x1, y1, x2, y2, r) {
  // Slab test: parametric segment against the rectangle's bounds.
  let tMin = 0;
  let tMax = 1;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const axes = [
    [x1, dx, r.x, r.x + r.w],
    [y1, dy, r.y, r.y + r.h],
  ];
  for (const [p, d, lo, hi] of axes) {
    if (Math.abs(d) < 1e-9) {
      if (p < lo || p > hi) return false;
    } else {
      let t1 = (lo - p) / d;
      let t2 = (hi - p) / d;
      if (t1 > t2) [t1, t2] = [t2, t1];
      tMin = Math.max(tMin, t1);
      tMax = Math.min(tMax, t2);
      if (tMin > tMax) return false;
    }
  }
  return true;
}

// Move a circle by (dx, dy) one axis at a time so it slides along walls.
export function moveCircle(x, y, r, dx, dy, solids) {
  let nx = x + dx;
  for (const s of solids) {
    if (circleHitsRect(nx, y, r, s)) {
      nx = dx > 0 ? s.x - r : dx < 0 ? s.x + s.w + r : nx;
      if (circleHitsRect(nx, y, r, s)) nx = x;
    }
  }
  let ny = y + dy;
  for (const s of solids) {
    if (circleHitsRect(nx, ny, r, s)) {
      ny = dy > 0 ? s.y - r : dy < 0 ? s.y + s.h + r : ny;
      if (circleHitsRect(nx, ny, r, s)) ny = y;
    }
  }
  return { x: nx, y: ny };
}

export function angleTo(ax, ay, bx, by) {
  return Math.atan2(by - ay, bx - ax);
}

export function angleDiff(a, b) {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function dist(ax, ay, bx, by) {
  return Math.hypot(bx - ax, by - ay);
}
