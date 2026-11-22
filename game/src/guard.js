// guard.js — patrol routes, vision cones and the chase.
// A guard walks its waypoints, looks where it walks, and remembers the last
// place it saw the thief. When the alarm is high it hunts instead.

import { GUARD, PLAYER } from './config.js';
import { angleDiff, angleTo, dist, lineBlocked, moveCircle } from './level.js';

export function updateGuard(g, dt, game) {
  const solids = game.solids;
  const p = game.player;
  const seen = guardSees(g, p, game);

  if (seen) {
    g.seenX = p.x;
    g.seenY = p.y;
    g.mode = game.alarm >= GUARD.chaseAlarm ? 'chase' : 'suspicious';
  } else if (g.mode === 'chase' && game.alarm < GUARD.chaseAlarm - 15) {
    g.mode = 'patrol';
  } else if (g.mode === 'suspicious' && game.alarm < 10) {
    g.mode = 'patrol';
  }

  if (g.mode === 'chase') {
    chaseTarget(g, dt, p.x, p.y, solids);
  } else if (g.mode === 'suspicious') {
    const d = dist(g.x, g.y, g.seenX, g.seenY);
    if (d > 24) chaseTarget(g, dt, g.seenX, g.seenY, solids);
    else g.angle += dt * 1.4; // arrived: scan the room
  } else {
    patrolStep(g, dt, solids);
  }

  // Caught outright: a guard that touches the thief ends the run.
  if (dist(g.x, g.y, p.x, p.y) < PLAYER.catchRadius + GUARD.radius * 0.4) {
    game.caughtBy = g.name;
    game.alarm = 100;
  }
}

function patrolStep(g, dt, solids) {
  const target = g.waypoints[g.wp];
  const d = dist(g.x, g.y, target.x, target.y);
  if (d < 8) {
    g.wp = (g.wp + 1) % g.waypoints.length;
    return;
  }
  const want = angleTo(g.x, g.y, target.x, target.y);
  g.angle += angleDiff(g.angle, want) * Math.min(1, dt * 6);
  const step = GUARD.patrolSpeed * dt;
  const pos = moveCircle(g.x, g.y, GUARD.radius, Math.cos(g.angle) * step, Math.sin(g.angle) * step, solids);
  g.x = pos.x;
  g.y = pos.y;
}

function chaseTarget(g, dt, tx, ty, solids) {
  const want = angleTo(g.x, g.y, tx, ty);
  g.angle += angleDiff(g.angle, want) * Math.min(1, dt * 8);
  const step = GUARD.chaseSpeed * dt;
  const pos = moveCircle(g.x, g.y, GUARD.radius, Math.cos(g.angle) * step, Math.sin(g.angle) * step, solids);
  g.x = pos.x;
  g.y = pos.y;
}

// True when the thief is inside the guard's cone with a clear line of sight.
export function guardSees(g, p, game) {
  if (game.smokeCovers(p.x, p.y)) return false;
  const d = dist(g.x, g.y, p.x, p.y);
  if (d > GUARD.coneLength) return false;
  const want = angleTo(g.x, g.y, p.x, p.y);
  if (Math.abs(angleDiff(g.angle, want)) > GUARD.coneHalfAngle) return false;
  if (lineBlocked(g.x, g.y, p.x, p.y, game.walls)) return false;
  return true;
}

// How fast the alarm climbs while this guard watches the thief (0 when blind).
export function guardDetectRate(g, p, game) {
  if (!guardSees(g, p, game)) return 0;
  const d = dist(g.x, g.y, p.x, p.y);
  const closeness = 1 - d / (GUARD.coneLength + 40);
  let rate = GUARD.detectRate * (0.35 + 0.65 * Math.max(0, closeness));
  if (p.sneaking) rate *= 0.5;
  if (g.mode === 'chase') rate *= 1.4;
  return rate;
}
